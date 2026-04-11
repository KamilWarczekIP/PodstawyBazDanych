const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Block user
router.post('/', authenticateToken, [
    body('blocked_id').isInt(),
    body('reason').optional().trim().escape()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { blocked_id, reason } = req.body;
        const userId = req.user.id;

        if (userId === blocked_id) {
            return res.status(400).json({ error: 'Cannot block yourself' });
        }

        // Check if user exists
        const users = await query(
            'SELECT id FROM users WHERE id = ? AND is_active = TRUE',
            [blocked_id]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if already blocked
        const existingBlock = await query(
            'SELECT id FROM blocks WHERE blocker_id = ? AND blocked_id = ?',
            [userId, blocked_id]
        );

        if (existingBlock.length > 0) {
            return res.status(409).json({ error: 'User already blocked' });
        }

        const result = await query(
            'INSERT INTO blocks (blocker_id, blocked_id, reason) VALUES (?, ?, ?)',
            [userId, blocked_id, reason || null]
        );

        // Remove from friends if they are friends
        await query(
            'DELETE FROM friendships WHERE ((requester_id = ? AND receiver_id = ?) OR (requester_id = ? AND receiver_id = ?))',
            [userId, blocked_id, blocked_id, userId]
        );

        // Remove from follows
        await query(
            'DELETE FROM follows WHERE (follower_id = ? AND following_id = ?) OR (follower_id = ? AND following_id = ?)',
            [userId, blocked_id, blocked_id, userId]
        );

        res.status(201).json({
            message: 'User blocked successfully',
            blockId: result.insertId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to block user' });
    }
});

// Unblock user
router.delete('/:blockedId', authenticateToken, async (req, res) => {
    try {
        const { blockedId } = req.params;
        const userId = req.user.id;

        const result = await query(
            'DELETE FROM blocks WHERE blocker_id = ? AND blocked_id = ?',
            [userId, blockedId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Block not found' });
        }

        res.json({ message: 'User unblocked' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to unblock user' });
    }
});

// Get blocked users list
router.get('/list', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 10 } = req.query;

        const offset = (page - 1) * limit;

        const blockedUsers = await query(
            `SELECT b.id, b.blocked_id, b.reason, b.created_at, u.username, u.profile_image_url
             FROM blocks b
             JOIN users u ON b.blocked_id = u.id
             WHERE b.blocker_id = ?
             LIMIT ? OFFSET ?`,
            [userId, parseInt(limit), offset]
        );

        const [totalCount] = await query(
            'SELECT COUNT(*) as count FROM blocks WHERE blocker_id = ?',
            [userId]
        );

        res.json({
            blockedUsers,
            total: totalCount[0].count,
            page: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch blocked users' });
    }
});

// Check if user is blocked
router.get('/check/:blockedId', authenticateToken, async (req, res) => {
    try {
        const { blockedId } = req.params;
        const userId = req.user.id;

        const blocks = await query(
            'SELECT id FROM blocks WHERE (blocker_id = ? AND blocked_id = ?) OR (blocker_id = ? AND blocked_id = ?)',
            [userId, blockedId, blockedId, userId]
        );

        res.json({ isBlocked: blocks.length > 0 });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to check block status' });
    }
});

module.exports = router;
