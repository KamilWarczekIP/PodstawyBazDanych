const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Get user profile
router.get('/:userId', optionalAuth, async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user?.id;

        // Check if requested user is blocked by current user or vice versa
        let isBlocked = false;
        if (currentUserId) {
            const blockCheck = await query(
                'SELECT id FROM blocks WHERE (blocker_id = ? AND blocked_id = ?) OR (blocker_id = ? AND blocked_id = ?)',
                [currentUserId, userId, userId, currentUserId]
            );
            isBlocked = blockCheck.length > 0;
        }

        const users = await query(
            'SELECT id, username, email, first_name, last_name, bio, profile_image_url, created_at FROM users WHERE id = ? AND is_active = TRUE',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = users[0];

        // Get stats
        const [photoCount] = await query(
            'SELECT COUNT(*) as count FROM photos WHERE user_id = ? AND is_deleted = FALSE',
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
                'SELECT id FROM friendships WHERE ((requester_id = ? AND receiver_id = ?) OR (requester_id = ? AND receiver_id = ?)) AND status = "accepted"',
                [currentUserId, userId, userId, currentUserId]
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
    body('first_name').optional().trim().escape(),
    body('last_name').optional().trim().escape(),
    body('bio').optional().trim().escape()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { userId } = req.params;
        const currentUserId = req.user.id;

        // Verify user is updating their own profile
        if (parseInt(userId) !== currentUserId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const { first_name, last_name, bio, profile_image_url } = req.body;

        await query(
            'UPDATE users SET first_name = COALESCE(?, first_name), last_name = COALESCE(?, last_name), bio = COALESCE(?, bio), profile_image_url = COALESCE(?, profile_image_url) WHERE id = ?',
            [first_name || null, last_name || null, bio || null, profile_image_url || null, userId]
        );

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Get user stats (for dashboard)
router.get('/:userId/stats', optionalAuth, async (req, res) => {
    try {
        const { userId } = req.params;

        const [stats] = await query(
            `SELECT 
                si.total_size_bytes,
                si.photo_count,
                (SELECT COUNT(*) FROM comments WHERE user_id = ?) as comment_count,
                (SELECT COUNT(*) FROM likes WHERE user_id = ?) as like_count
            FROM storage_info si WHERE si.user_id = ?`,
            [userId, userId, userId]
        );

        if (!stats) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(stats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

module.exports = router;
