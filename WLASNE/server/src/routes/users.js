const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const DEFAULT_AVATAR = 'https://via.placeholder.com/80';

// Get user profile
router.get('/:userId', optionalAuth, async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user?.id;

        let isBlocked = false;
        if (currentUserId) {
            const blockCheck = await query(
                'SELECT id FROM blocks WHERE (blocker_id = ? AND blocked_id = ?) OR (blocker_id = ? AND blocked_id = ?)',
                [currentUserId, userId, userId, currentUserId]
            );
            isBlocked = blockCheck.length > 0;
        }

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
            'SELECT COUNT(*) as count FROM follows WHERE following_id = ?',
            [userId]
        );

        const [followingCount] = await query(
            'SELECT COUNT(*) as count FROM follows WHERE follower_id = ?',
            [userId]
        );

        let isFriend = false;
        let isFollowing = false;

        if (currentUserId) {
            const friendCheck = await query(
                `SELECT f1.id
                 FROM follows f1
                 JOIN follows f2 ON f1.follower_id = f2.following_id AND f1.following_id = f2.follower_id
                 WHERE f1.follower_id = ? AND f1.following_id = ?`,
                [currentUserId, userId]
            );
            isFriend = friendCheck.length > 0;

            const followCheck = await query(
                'SELECT id FROM follows WHERE follower_id = ? AND following_id = ?',
                [currentUserId, userId]
            );
            isFollowing = followCheck.length > 0;
        }

        res.json({
            ...user,
            profile_image_url: DEFAULT_AVATAR,
            photoCount: photoCount.count,
            followerCount: followerCount.count,
            followingCount: followingCount.count,
            isFriend,
            isFollowing,
            isBlocked
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Update user profile
router.put('/:userId', authenticateToken, [
    body('username').optional().trim().escape(),
    body('bio').optional().trim().escape()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { userId } = req.params;
        const currentUserId = req.user.id;

        if (parseInt(userId, 10) !== currentUserId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const { username, bio } = req.body;

        await query(
            'UPDATE users SET username = COALESCE(?, username), bio = COALESCE(?, bio) WHERE id = ?',
            [username || null, bio || null, userId]
        );

        const [updatedUser] = await query(
            'SELECT id, username, email, bio FROM users WHERE id = ?',
            [userId]
        );

        res.json({ user: { ...updatedUser, profile_image_url: DEFAULT_AVATAR } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Get user stats
router.get('/:userId/stats', optionalAuth, async (req, res) => {
    try {
        const { userId } = req.params;

        const [photoCount] = await query(
            'SELECT COUNT(*) as count FROM photos WHERE owner_id = ?',
            [userId]
        );

        const [commentCount] = await query(
            'SELECT COUNT(*) as count FROM comments WHERE commenter_id = ?',
            [userId]
        );

        const [likeCount] = await query(
            'SELECT COUNT(*) as count FROM likes WHERE user_id = ?',
            [userId]
        );

        const [followerCount] = await query(
            'SELECT COUNT(*) as count FROM follows WHERE following_id = ?',
            [userId]
        );

        const [followingCount] = await query(
            'SELECT COUNT(*) as count FROM follows WHERE follower_id = ?',
            [userId]
        );

        const [friendCount] = await query(
            `SELECT COUNT(*) as count
             FROM follows f1
             JOIN follows f2 ON f1.follower_id = f2.following_id AND f1.following_id = f2.follower_id
             WHERE f1.follower_id = ?`,
            [userId]
        );

        res.json({
            photoCount: photoCount.count,
            commentCount: commentCount.count,
            likeCount: likeCount.count,
            followerCount: followerCount.count,
            followingCount: followingCount.count,
            friendCount: friendCount.count
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

module.exports = router;
