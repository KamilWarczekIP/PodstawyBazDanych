const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Follow user
router.post('/', authenticateToken, [
    body('following_id').isInt()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { following_id } = req.body;
        const userId = req.user.id;

        if (userId === following_id) {
            return res.status(400).json({ error: 'Cannot follow yourself' });
        }

        // Check if target user exists
        const users = await query(
            'SELECT id FROM users WHERE id = ? AND is_active = TRUE',
            [following_id]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if already following
        const existingFollow = await query(
            'SELECT id FROM follows WHERE follower_id = ? AND following_id = ?',
            [userId, following_id]
        );

        if (existingFollow.length > 0) {
            return res.status(409).json({ error: 'Already following this user' });
        }

        const result = await query(
            'INSERT INTO follows (follower_id, following_id) VALUES (?, ?)',
            [userId, following_id]
        );

        // Create notification
        await query(
            'INSERT INTO notifications (user_id, type, related_user_id, message) VALUES (?, ?, ?, ?)',
            [following_id, 'follow', userId, `${req.user.username} started following you`]
        );

        res.status(201).json({
            message: 'User followed successfully',
            followId: result.insertId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to follow user' });
    }
});

// Unfollow user
router.delete('/:followingId', authenticateToken, async (req, res) => {
    try {
        const { followingId } = req.params;
        const userId = req.user.id;

        const result = await query(
            'DELETE FROM follows WHERE follower_id = ? AND following_id = ?',
            [userId, followingId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Follow relationship not found' });
        }

        res.json({ message: 'User unfollowed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to unfollow user' });
    }
});

// Get followers
router.get('/:userId/followers', optionalAuth, async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const offset = (page - 1) * limit;

        const followers = await query(
            `SELECT u.id, u.username, u.profile_image_url FROM users u
             WHERE u.id IN (
                 SELECT follower_id FROM follows WHERE following_id = ?
             ) LIMIT ? OFFSET ?`,
            [userId, parseInt(limit), offset]
        );

        const [totalCount] = await query(
            'SELECT COUNT(*) as count FROM follows WHERE following_id = ?',
            [userId]
        );

        res.json({
            followers,
            total: totalCount[0].count,
            page: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch followers' });
    }
});

// Get following
router.get('/:userId/following', optionalAuth, async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const offset = (page - 1) * limit;

        const following = await query(
            `SELECT u.id, u.username, u.profile_image_url FROM users u
             WHERE u.id IN (
                 SELECT following_id FROM follows WHERE follower_id = ?
             ) LIMIT ? OFFSET ?`,
            [userId, parseInt(limit), offset]
        );

        const [totalCount] = await query(
            'SELECT COUNT(*) as count FROM follows WHERE follower_id = ?',
            [userId]
        );

        res.json({
            following,
            total: totalCount[0].count,
            page: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch following' });
    }
});

// Get feed (photos from followed users)
router.get('/feed', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 10 } = req.query;

        const offset = (page - 1) * limit;

        // Get photos from followed users, excluding blocked users
        const photos = await query(
            `SELECT p.id, p.user_id, p.title, p.description, p.image_url, p.created_at, u.username, u.profile_image_url
             FROM photos p
             JOIN users u ON p.user_id = u.id
             WHERE p.user_id IN (
                 SELECT following_id FROM follows WHERE follower_id = ?
             )
             AND p.is_deleted = FALSE
             AND p.user_id NOT IN (
                 SELECT blocked_id FROM blocks WHERE blocker_id = ?
                 UNION
                 SELECT blocker_id FROM blocks WHERE blocked_id = ?
             )
             ORDER BY p.created_at DESC
             LIMIT ? OFFSET ?`,
            [userId, userId, userId, parseInt(limit), offset]
        );

        const [totalCount] = await query(
            `SELECT COUNT(*) as count FROM photos p
             WHERE p.user_id IN (
                 SELECT following_id FROM follows WHERE follower_id = ?
             )
             AND p.is_deleted = FALSE
             AND p.user_id NOT IN (
                 SELECT blocked_id FROM blocks WHERE blocker_id = ?
                 UNION
                 SELECT blocker_id FROM blocks WHERE blocked_id = ?
             )`,
            [userId, userId, userId]
        );

        // Enhance photos with stats
        const enhancedPhotos = await Promise.all(photos.map(async (photo) => {
            const [likeCount] = await query(
                'SELECT COUNT(*) as count FROM likes WHERE photo_id = ?',
                [photo.id]
            );

            const [commentCount] = await query(
                'SELECT COUNT(*) as count FROM comments WHERE photo_id = ? AND is_deleted = FALSE',
                [photo.id]
            );

            const userLike = await query(
                'SELECT id FROM likes WHERE photo_id = ? AND user_id = ?',
                [photo.id, userId]
            );

            return {
                ...photo,
                likeCount: likeCount.count,
                commentCount: commentCount.count,
                userLiked: userLike.length > 0
            };
        }));

        res.json({
            photos: enhancedPhotos,
            total: totalCount[0].count,
            page: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch feed' });
    }
});

module.exports = router;
