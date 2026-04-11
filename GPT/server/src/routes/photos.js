const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Get user photos
router.get('/user/:userId', optionalAuth, async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user?.id;
        const { page = 1, limit = 10 } = req.query;

        // Check if current user has blocked the requested user or vice versa
        let isBlocked = false;
        if (currentUserId) {
            const blockCheck = await query(
                'SELECT id FROM blocks WHERE (blocker_id = ? AND blocked_id = ?) OR (blocker_id = ? AND blocked_id = ?)',
                [currentUserId, userId, userId, currentUserId]
            );
            isBlocked = blockCheck.length > 0;

            if (isBlocked) {
                return res.status(403).json({ error: 'Cannot view this user\'s photos' });
            }
        }

        const offset = (page - 1) * limit;

        const photos = await query(
            'SELECT id, user_id, title, description, image_url, created_at FROM photos WHERE user_id = ? AND is_deleted = FALSE ORDER BY created_at DESC LIMIT ? OFFSET ?',
            [userId, parseInt(limit), offset]
        );

        const [totalCount] = await query(
            'SELECT COUNT(*) as count FROM photos WHERE user_id = ? AND is_deleted = FALSE',
            [userId]
        );

        // Enhance photos with stats
        const enhancedPhotos = await Promise.all(photos.map(async (photo) => {
            const [likeCount] = await query(
                'SELECT COUNT(*) as count FROM likes WHERE photo_id = ?',
                [photo.id]
            );

            const [commentCount] = await query(
                'SELECT COUNT(*) as count FROM comments WHERE photo_id = ? AND is_deleted = FALSE',
                [photo.id]
            );

            let userLiked = false;
            if (currentUserId) {
                const userLike = await query(
                    'SELECT id FROM likes WHERE photo_id = ? AND user_id = ?',
                    [photo.id, currentUserId]
                );
                userLiked = userLike.length > 0;
            }

            return {
                ...photo,
                likeCount: likeCount.count,
                commentCount: commentCount.count,
                userLiked
            };
        }));

        res.json({
            photos: enhancedPhotos,
            total: totalCount[0].count,
            page: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch photos' });
    }
});

// Get single photo
router.get('/:photoId', optionalAuth, async (req, res) => {
    try {
        const { photoId } = req.params;
        const currentUserId = req.user?.id;

        const photos = await query(
            'SELECT p.id, p.user_id, p.title, p.description, p.image_url, p.created_at FROM photos p WHERE p.id = ? AND p.is_deleted = FALSE',
            [photoId]
        );

        if (photos.length === 0) {
            return res.status(404).json({ error: 'Photo not found' });
        }

        const photo = photos[0];

        // Check if current user is blocked
        if (currentUserId) {
            const blockCheck = await query(
                'SELECT id FROM blocks WHERE (blocker_id = ? AND blocked_id = ?) OR (blocker_id = ? AND blocked_id = ?)',
                [currentUserId, photo.user_id, photo.user_id, currentUserId]
            );

            if (blockCheck.length > 0) {
                return res.status(403).json({ error: 'Cannot view this photo' });
            }
        }

        const [likeCount] = await query(
            'SELECT COUNT(*) as count FROM likes WHERE photo_id = ?',
            [photoId]
        );

        const [commentCount] = await query(
            'SELECT COUNT(*) as count FROM comments WHERE photo_id = ? AND is_deleted = FALSE',
            [photoId]
        );

        const tags = await query(
            'SELECT t.id, t.name FROM tags t JOIN photo_tags pt ON t.id = pt.tag_id WHERE pt.photo_id = ?',
            [photoId]
        );

        let userLiked = false;
        if (currentUserId) {
            const userLike = await query(
                'SELECT id FROM likes WHERE photo_id = ? AND user_id = ?',
                [photoId, currentUserId]
            );
            userLiked = userLike.length > 0;
        }

        res.json({
            ...photo,
            likeCount: likeCount.count,
            commentCount: commentCount.count,
            userLiked,
            tags
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch photo' });
    }
});

// Create photo
router.post('/', authenticateToken, [
    body('title').trim().isLength({ min: 1, max: 200 }).escape(),
    body('description').optional().trim().escape(),
    body('image_url').isURL()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { title, description, image_url, file_size, tags } = req.body;
        const userId = req.user.id;

        // Insert photo
        const result = await query(
            'INSERT INTO photos (user_id, title, description, image_url, file_size) VALUES (?, ?, ?, ?, ?)',
            [userId, title, description || null, image_url, file_size || 0]
        );

        const photoId = result.insertId;

        // Handle tags
        if (tags && Array.isArray(tags)) {
            for (const tagName of tags) {
                let tagResult = await query(
                    'SELECT id FROM tags WHERE name = ?',
                    [tagName]
                );

                let tagId;
                if (tagResult.length === 0) {
                    const newTag = await query(
                        'INSERT INTO tags (name) VALUES (?)',
                        [tagName]
                    );
                    tagId = newTag.insertId;
                } else {
                    tagId = tagResult[0].id;
                }

                await query(
                    'INSERT INTO photo_tags (photo_id, tag_id) VALUES (?, ?)',
                    [photoId, tagId]
                );
            }
        }

        // Update storage info
        await query(
            'UPDATE storage_info SET total_size_bytes = total_size_bytes + ?, photo_count = photo_count + 1 WHERE user_id = ?',
            [file_size || 0, userId]
        );

        res.status(201).json({
            message: 'Photo created successfully',
            photoId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create photo' });
    }
});

// Delete photo
router.delete('/:photoId', authenticateToken, async (req, res) => {
    try {
        const { photoId } = req.params;
        const userId = req.user.id;

        const photos = await query(
            'SELECT user_id, file_size FROM photos WHERE id = ?',
            [photoId]
        );

        if (photos.length === 0) {
            return res.status(404).json({ error: 'Photo not found' });
        }

        if (photos[0].user_id !== userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        await query(
            'UPDATE photos SET is_deleted = TRUE WHERE id = ?',
            [photoId]
        );

        // Update storage info
        await query(
            'UPDATE storage_info SET total_size_bytes = total_size_bytes - ?, photo_count = photo_count - 1 WHERE user_id = ?',
            [photos[0].file_size || 0, userId]
        );

        res.json({ message: 'Photo deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete photo' });
    }
});

module.exports = router;
