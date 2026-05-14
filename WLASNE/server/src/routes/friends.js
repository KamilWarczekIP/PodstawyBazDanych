const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Send friend request
router.post('/request', authenticateToken, [
    body('receiver_id').isInt()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { receiver_id } = req.body;
        const userId = req.user.id;

        if (userId === receiver_id) {
            return res.status(400).json({ error: 'Cannot add yourself as friend' });
        }

        // Check if user exists
        const users = await query(
            'SELECT id FROM users WHERE id = ? AND is_active = TRUE',
            [receiver_id]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check existing friendship
        const existingFriendship = await query(
            'SELECT id, status FROM friendships WHERE ((requester_id = ? AND receiver_id = ?) OR (requester_id = ? AND receiver_id = ?))',
            [userId, receiver_id, receiver_id, userId]
        );

        if (existingFriendship.length > 0) {
            return res.status(409).json({ error: 'Friendship already exists or request pending' });
        }

        const result = await query(
            'INSERT INTO friendships (requester_id, receiver_id, status) VALUES (?, ?, "pending")',
            [userId, receiver_id]
        );

        // Create notification
        await query(
            'INSERT INTO notifications (user_id, type, related_user_id, message) VALUES (?, ?, ?, ?)',
            [receiver_id, 'friend_request', userId, `${req.user.username} sent you a friend request`]
        );

        res.status(201).json({
            message: 'Friend request sent',
            requestId: result.insertId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to send friend request' });
    }
});

// Accept friend request
router.post('/accept/:requestId', authenticateToken, async (req, res) => {
    try {
        const { requestId } = req.params;
        const userId = req.user.id;

        const friendships = await query(
            'SELECT requester_id, receiver_id FROM friendships WHERE id = ? AND status = "pending"',
            [requestId]
        );

        if (friendships.length === 0) {
            return res.status(404).json({ error: 'Request not found' });
        }

        const friendship = friendships[0];
        if (friendship.receiver_id !== userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        await query(
            'UPDATE friendships SET status = "accepted" WHERE id = ?',
            [requestId]
        );

        res.json({ message: 'Friend request accepted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to accept request' });
    }
});

// Reject friend request
router.post('/reject/:requestId', authenticateToken, async (req, res) => {
    try {
        const { requestId } = req.params;
        const userId = req.user.id;

        const friendships = await query(
            'SELECT requester_id, receiver_id FROM friendships WHERE id = ? AND status = "pending"',
            [requestId]
        );

        if (friendships.length === 0) {
            return res.status(404).json({ error: 'Request not found' });
        }

        const friendship = friendships[0];
        if (friendship.receiver_id !== userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        await query(
            'UPDATE friendships SET status = "rejected" WHERE id = ?',
            [requestId]
        );

        res.json({ message: 'Friend request rejected' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to reject request' });
    }
});

// Remove friend
router.delete('/:friendId', authenticateToken, async (req, res) => {
    try {
        const { friendId } = req.params;
        const userId = req.user.id;

        const result = await query(
            'DELETE FROM friendships WHERE ((requester_id = ? AND receiver_id = ?) OR (requester_id = ? AND receiver_id = ?)) AND status = "accepted"',
            [userId, friendId, friendId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Friendship not found' });
        }

        res.json({ message: 'Friend removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to remove friend' });
    }
});

// Get friends list
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const offset = (page - 1) * limit;

        const friends = await query(
            `SELECT u.id, u.username, u.profile_image_url FROM users u
             WHERE u.id IN (
                 SELECT CASE 
                     WHEN requester_id = ? THEN receiver_id 
                     ELSE requester_id 
                 END as friend_id
                 FROM friendships 
                 WHERE (requester_id = ? OR receiver_id = ?) AND status = "accepted"
             ) LIMIT ? OFFSET ?`,
            [userId, userId, userId, parseInt(limit), offset]
        );

        const [totalCount] = await query(
            `SELECT COUNT(*) as count FROM friendships 
             WHERE (requester_id = ? OR receiver_id = ?) AND status = "accepted"`,
            [userId, userId]
        );

        res.json({
            friends,
            total: totalCount[0].count,
            page: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch friends' });
    }
});

module.exports = router;
