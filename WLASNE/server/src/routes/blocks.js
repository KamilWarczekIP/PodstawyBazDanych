const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const DEFAULT_AVATAR_URL = 'https://via.placeholder.com/40';

// Block user
router.post('/', authenticateToken, [
    body('blocked_id').isInt()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { blocked_id } = req.body;
        const userId = req.user.id;

        if (userId === blocked_id) {
            return res.status(400).json({ error: 'Cannot block yourself' });
        }

        const users = await query(
            'SELECT id FROM users WHERE id = ?',
            [blocked_id]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const existingBlock = await query(
            'SELECT blocker_id FROM blocks WHERE blocker_id = ? AND blocked_id = ?',
            [userId, blocked_id]
        );

        if (existingBlock.length > 0) {
            return res.status(409).json({ error: 'User already blocked' });
        }

        await query(
            'INSERT INTO blocks (blocker_id, blocked_id) VALUES (?, ?)',
            [userId, blocked_id]
        );

        await query(
            'DELETE FROM follows WHERE (follower_id = ? AND followed_id = ?) OR (follower_id = ? AND followed_id = ?)',
            [userId, blocked_id, blocked_id, userId]
        );

        res.status(201).json({
            message: 'User blocked successfully'
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
            `SELECT u.id, u.username
             FROM users u
             WHERE u.id IN (
                 SELECT blocked_id FROM blocks WHERE blocker_id = ?
             )
             LIMIT ? OFFSET ?`,
            [userId, parseInt(limit, 10), offset]
        );

        const [totalCount] = await query(
            'SELECT COUNT(*) as count FROM blocks WHERE blocker_id = ?',
            [userId]
        );

        res.json({
            blockedUsers: blockedUsers.map(user => ({
                ...user,
                profile_image_url: DEFAULT_AVATAR_URL
            })),
            total: totalCount.count || totalCount[0].count,
            page: parseInt(page, 10),
            limit: parseInt(limit, 10)
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
            'SELECT blocker_id FROM blocks WHERE (blocker_id = ? AND blocked_id = ?) OR (blocker_id = ? AND blocked_id = ?)',
            [userId, blockedId, blockedId, userId]
        );

        res.json({ isBlocked: blocks.length > 0 });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to check block status' });
    }
});

module.exports = router;
