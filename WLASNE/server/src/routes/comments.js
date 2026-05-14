const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const DEFAULT_AVATAR = 'https://via.placeholder.com/40';

// Get photo comments
router.get('/photo/:photoId', optionalAuth, async (req, res) => {
    try {
        const { photoId } = req.params;
        const currentUserId = req.user?.id;
        const { page = 1, limit = 10 } = req.query;

        const photos = await query(
            'SELECT owner_id FROM photos WHERE id = ?',
            [photoId]
        );

        if (photos.length === 0) {
            return res.status(404).json({ error: 'Photo not found' });
        }

        if (currentUserId) {
            const blockCheck = await query(
                'SELECT id FROM blocks WHERE (blocker_id = ? AND blocked_id = ?) OR (blocker_id = ? AND blocked_id = ?)',
                [currentUserId, photos[0].owner_id, photos[0].owner_id, currentUserId]
            );

            if (blockCheck.length > 0) {
                return res.status(403).json({ error: 'Cannot view these comments' });
            }
        }

        const offset = (page - 1) * limit;

        const comments = await query(
            `SELECT c.id, c.photo_id, c.user_id, c.content, u.username
             FROM comments c
             JOIN users u ON c.user_id = u.id
             WHERE c.photo_id = ?
             ORDER BY c.id DESC
             LIMIT ? OFFSET ?`,
            [photoId, parseInt(limit, 10), offset]
        );

        const [totalCount] = await query(
            'SELECT COUNT(*) as count FROM comments WHERE photo_id = ?',
            [photoId]
        );

        const formattedComments = comments.map(comment => ({
            ...comment,
            created_at: new Date().toISOString(),
            user_avatar_url: DEFAULT_AVATAR
        }));

        res.json({
            comments: formattedComments,
            total: totalCount[0].count,
            page: parseInt(page, 10),
            limit: parseInt(limit, 10)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
});

// Create comment
router.post('/', authenticateToken, [
    body('photo_id').isInt(),
    body('content').trim().isLength({ min: 1, max: 1000 }).escape()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { photo_id, content } = req.body;
        const userId = req.user.id;

        const photos = await query(
            'SELECT owner_id FROM photos WHERE id = ?',
            [photo_id]
        );

        if (photos.length === 0) {
            return res.status(404).json({ error: 'Photo not found' });
        }

        const blockCheck = await query(
            'SELECT id FROM blocks WHERE (blocker_id = ? AND blocked_id = ?) OR (blocker_id = ? AND blocked_id = ?)',
            [userId, photos[0].owner_id, photos[0].owner_id, userId]
        );

        if (blockCheck.length > 0) {
            return res.status(403).json({ error: 'Cannot comment on this photo' });
        }

        const result = await query(
            'INSERT INTO comments (photo_id, user_id, content) VALUES (?, ?, ?)',
            [photo_id, userId, content]
        );

        res.status(201).json({
            message: 'Comment created successfully',
            commentId: result.insertId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create comment' });
    }
});

// Delete comment
router.delete('/:commentId', authenticateToken, async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user.id;

        const comments = await query(
            'SELECT user_id FROM comments WHERE id = ?',
            [commentId]
        );

        if (comments.length === 0) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        if (comments[0].user_id !== userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        await query(
            'DELETE FROM comments WHERE id = ?',
            [commentId]
        );

        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete comment' });
    }
});

module.exports = router;
