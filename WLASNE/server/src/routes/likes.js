const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Like photo
router.post('/', authenticateToken, [
    body('photo_id').isInt()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { photo_id } = req.body;
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
            return res.status(403).json({ error: 'Cannot like this photo' });
        }

        const existingLike = await query(
            'SELECT id FROM likes WHERE photo_id = ? AND user_id = ?',
            [photo_id, userId]
        );

        if (existingLike.length > 0) {
            return res.status(409).json({ error: 'Photo already liked' });
        }

        const result = await query(
            'INSERT INTO likes (photo_id, user_id) VALUES (?, ?)',
            [photo_id, userId]
        );

        res.status(201).json({
            message: 'Photo liked successfully',
            likeId: result.insertId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to like photo' });
    }
});

// Unlike photo
router.delete('/:photoId', authenticateToken, async (req, res) => {
    try {
        const { photoId } = req.params;
        const userId = req.user.id;

        const likes = await query(
            'SELECT id FROM likes WHERE photo_id = ? AND user_id = ?',
            [photoId, userId]
        );

        if (likes.length === 0) {
            return res.status(409).json({ error: 'Photo already unliked' });
        }

        await query(
            'DELETE FROM likes WHERE photo_id = ? AND user_id = ?',
            [photoId, userId]
        );

        res.json({ message: 'Photo unliked successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to unlike photo' });
    }
});

// Get photo likes count
router.get('/:photoId', async (req, res) => {
    try {
        const { photoId } = req.params;

        const [result] = await query(
            'SELECT COUNT(*) as count FROM likes WHERE photo_id = ?',
            [photoId]
        );

        res.json({ count: result.count });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch likes count' });
    }
});

module.exports = router;
