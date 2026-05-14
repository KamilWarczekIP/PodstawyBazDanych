const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const DEFAULT_IMAGE_URL = 'https://via.placeholder.com/800x600?text=Photo';
const DEFAULT_AVATAR_URL = 'https://via.placeholder.com/40';

function parsePhotoRow(photo) {
    const descriptionText = photo.description || '';
    const [firstLine, ...rest] = descriptionText.split('\n\n');
    const title = firstLine || `Post #${photo.id}`;
    const description = rest.join('\n\n').trim();

    return {
        id: photo.id,
        user_id: photo.owner_id,
        username: photo.username,
        title,
        description,
        image_url: photo.image_url || `${DEFAULT_IMAGE_URL}+${photo.id}`,
        created_at: photo.created_at || new Date().toISOString(),
        user_avatar_url: photo.user_avatar_url || DEFAULT_AVATAR_URL
    };
}

// Get user posts
router.get('/user/:userId', optionalAuth, async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user?.id;
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        if (currentUserId) {
            const blockCheck = await query(
                'SELECT id FROM blocks WHERE (blocker_id = ? AND blocked_id = ?) OR (blocker_id = ? AND blocked_id = ?)',
                [currentUserId, userId, userId, currentUserId]
            );
            if (blockCheck.length > 0) {
                return res.status(403).json({ error: 'Cannot view this user\'s posts' });
            }
        }

        const photos = await query(
            `SELECT p.id, p.owner_id, p.description, u.username
             FROM photos p
             JOIN users u ON p.owner_id = u.id
             WHERE p.owner_id = ?
             ORDER BY p.id DESC
             LIMIT ? OFFSET ?`,
            [userId, parseInt(limit, 10), offset]
        );

        const [totalCount] = await query(
            'SELECT COUNT(*) as count FROM photos WHERE owner_id = ?',
            [userId]
        );

        const enhancedPhotos = await Promise.all(photos.map(async (photo) => {
            const [likeCount] = await query(
                'SELECT COUNT(*) as count FROM likes WHERE photo_id = ?',
                [photo.id]
            );

            const [commentCount] = await query(
                'SELECT COUNT(*) as count FROM comments WHERE photo_id = ?',
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
                ...parsePhotoRow(photo),
                likeCount: likeCount.count,
                commentCount: commentCount.count,
                userLiked
            };
        }));

        res.json({
            photos: enhancedPhotos,
            total: totalCount[0].count,
            page: parseInt(page, 10),
            limit: parseInt(limit, 10)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

// Get single post
router.get('/:photoId', optionalAuth, async (req, res) => {
    try {
        const { photoId } = req.params;
        const currentUserId = req.user?.id;

        const photos = await query(
            `SELECT p.id, p.owner_id, p.description, u.username
             FROM photos p
             JOIN users u ON p.owner_id = u.id
             WHERE p.id = ?`,
            [photoId]
        );

        if (photos.length === 0) {
            return res.status(404).json({ error: 'Photo not found' });
        }

        const photo = photos[0];

        if (currentUserId) {
            const blockCheck = await query(
                'SELECT id FROM blocks WHERE (blocker_id = ? AND blocked_id = ?) OR (blocker_id = ? AND blocked_id = ?)',
                [currentUserId, photo.owner_id, photo.owner_id, currentUserId]
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
            'SELECT COUNT(*) as count FROM comments WHERE photo_id = ?',
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
            ...parsePhotoRow(photo),
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

// Create post
router.post('/', authenticateToken, [
    body('title').optional().trim().escape(),
    body('description').optional().trim().escape(),
    body('tags').optional()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { title, description, tags } = req.body;
        const userId = req.user.id;

        const bodyText = [title || '', description || '']
            .filter(Boolean)
            .join('\n\n')
            .trim();

        if (!bodyText) {
            return res.status(400).json({ error: 'Title or description is required' });
        }

        const result = await query(
            'INSERT INTO photos (owner_id, description) VALUES (?, ?)',
            [userId, bodyText]
        );

        const photoId = result.insertId;
        const tagList = Array.isArray(tags)
            ? tags.map(tag => tag.trim()).filter(Boolean)
            : typeof tags === 'string'
                ? tags.split(',').map(tag => tag.trim()).filter(Boolean)
                : [];

        for (const tagName of tagList) {
            const [tagResult] = await query('SELECT id FROM tags WHERE name = ?', [tagName]);
            let tagId;
            if (!tagResult) {
                const newTag = await query('INSERT INTO tags (name) VALUES (?)', [tagName]);
                tagId = newTag.insertId;
            } else {
                tagId = tagResult.id;
            }
            await query('INSERT INTO photo_tags (photo_id, tag_id) VALUES (?, ?)', [photoId, tagId]);
        }

        res.status(201).json({
            message: 'Post created successfully',
            photoId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create post' });
    }
});

// Delete post
router.delete('/:photoId', authenticateToken, async (req, res) => {
    try {
        const { photoId } = req.params;
        const userId = req.user.id;

        const photos = await query('SELECT owner_id FROM photos WHERE id = ?', [photoId]);
        if (photos.length === 0) {
            return res.status(404).json({ error: 'Photo not found' });
        }

        if (photos[0].owner_id !== userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        await query('DELETE FROM photos WHERE id = ?', [photoId]);

        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete post' });
    }
});

module.exports = router;
