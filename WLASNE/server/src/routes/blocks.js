const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Block user
router.put('/', authenticateToken, [
    body('blocked_id').exists().isInt()
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
router.delete('/', authenticateToken,
     [
        body('blocked_id').isInt()
     ], 
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const { blockedId } = req.body;
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
router.post('/list', authenticateToken, [
    body('page').exists().isInt(),
    body('limit').exists().isInt(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        
        const userId = req.user.id;
        const { page = 1, limit = 10 } = req.body;
        const offset = (page - 1) * limit;

        const blockedUsers = await query(
            `SELECT u.id, u.username
             FROM users u
             WHERE u.id IN (
                 SELECT blocked_id FROM blocks WHERE blocker_id = ?
             )
             LIMIT ? OFFSET ?`,
            [userId, limit, offset]
        );

        const [totalCount] = await query(
            'SELECT COUNT(*) as count FROM blocks WHERE blocker_id = ?',
            [userId]
        );

        res.json({
            blockedUsers: blockedUsers,
            total: totalCount[0].count,
            page: page
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch blocked users' });
    }
});

module.exports = router;
