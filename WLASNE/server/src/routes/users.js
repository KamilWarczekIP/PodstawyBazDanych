const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const DEFAULT_AVATAR = 'https://via.placeholder.com/80';

// Get user profile
router.get('/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user?.id;

        const users = await query(
            'SELECT id, username, email, bio FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = users[0];

        const [photoCount] = await query(
            'SELECT COUNT(*) as count FROM photos WHERE owner_id = ?',
            [userId]
        );

        const [followerCount] = await query(
            'SELECT COUNT(*) as count FROM follows WHERE followed_id = ?',
            [userId]
        );

        const [followingCount] = await query(
            'SELECT COUNT(*) as count FROM follows WHERE follower_id = ?',
            [userId]
        );

        let isFollowed = false;
        let isFollowing = false;

        if (currentUserId) {
            const followedCheck = await query(
                'SELECT follower_id FROM follows WHERE follower_id = ? AND followed_id = ?',
                [userId, currentUserId]
            );
            isFollowed = followedCheck.length > 0;

            const followCheck = await query(
                'SELECT followed_id FROM follows WHERE follower_id = ? AND followed_id = ?',
                [currentUserId, userId]
            );
            isFollowing = followCheck.length > 0;
        }

        res.json({
            ...user,
            photoCount: photoCount.count,
            followerCount: followerCount.count,
            followingCount: followingCount.count,
            isFollowed,
            isFollowing
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Update user profile
router.put('/:userId', authenticateToken, [
    body('username').optional().trim().escape(),
    body('bio').optional().trim().escape(),
    body('password').optional().trim().escape(),
    body('email').optional().trim().escape()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { userId } = req.params;
        const currentUserId = req.user.id;

        if (parseInt(userId, 10) !== currentUserId) {
            return res.status(403).json({ error: 'Unauthorized to change this user account' });
        }

        const { username, bio, password, email } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        await query(
            'UPDATE users SET username = COALESCE(?, username), bio = COALESCE(?, bio) \
            , email = COALESCE(?, email), password = COALESCE(?, password) WHERE id = ?',
            [   username || null, 
                bio || null, 
                email || null,
                hashedPassword || null,
                userId
            ]
        );

        const [updatedUser] = await query(
            'SELECT id, username, email, bio FROM users WHERE id = ?',
            [userId]
        );

        res.json({ user: { ...updatedUser } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Get user info - only name
router.get('/name/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user.id;

        const users = await query(
            'SELECT username FROM users WHERE id = ?',
            [userId]
        );

        res.json({
            username: users[0].username
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch user info' });
    }
});

module.exports = router;
