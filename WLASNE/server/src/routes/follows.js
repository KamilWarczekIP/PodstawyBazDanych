const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const DEFAULT_IMAGE_URL = 'https://via.placeholder.com/800x600?text=Photo';
const DEFAULT_AVATAR_URL = 'https://via.placeholder.com/40';

function formatPhoto(photo) {
    return {
        id: photo.id,
        user_id: photo.owner_id,
        username: photo.username,
        title: (photo.description || '').split('\n\n')[0] || `Post #${photo.id}`,
        description: photo.description || '',
        image_url: `${DEFAULT_IMAGE_URL}&id=${photo.id}`,
        created_at: photo.created_at || new Date().toISOString(),
        user_avatar_url: photo.user_avatar_url || DEFAULT_AVATAR_URL
    };
}

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

        const users = await query(
            'SELECT id FROM users WHERE id = ?',
            [following_id]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const existingFollow = await query(
            'SELECT follower_id FROM follows WHERE follower_id = ? AND followed_id = ?',
            [userId, following_id]
        );

        if (existingFollow.length > 0) {
            return res.status(409).json({ error: 'Already following this user' });
        }

        await query(
            'INSERT INTO follows (follower_id, followed_id) VALUES (?, ?)',
            [userId, following_id]
        );

        res.status(201).json({
            message: 'User followed successfully'
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
            'DELETE FROM follows WHERE follower_id = ? AND followed_id = ?',
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
            `SELECT u.id, u.username FROM users u
             WHERE u.id IN (
                 SELECT follower_id FROM follows WHERE followed_id = ?
             ) LIMIT ? OFFSET ?`,
            [userId, parseInt(limit, 10), offset]
        );

        const [totalCount] = await query(
            'SELECT COUNT(*) as count FROM follows WHERE followed_id = ?',
            [userId]
        );

        res.json({
            followers: followers.map(user => ({
                ...user,
                profile_image_url: DEFAULT_AVATAR_URL
            })),
            total: totalCount.count || totalCount[0].count,
            page: parseInt(page, 10),
            limit: parseInt(limit, 10)
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
            `SELECT u.id, u.username FROM users u
             WHERE u.id IN (
                 SELECT followed_id FROM follows WHERE follower_id = ?
             ) LIMIT ? OFFSET ?`,
            [userId, parseInt(limit, 10), offset]
        );

        const [totalCount] = await query(
            'SELECT COUNT(*) as count FROM follows WHERE follower_id = ?',
            [userId]
        );

        res.json({
            following: following.map(user => ({
                ...user,
                profile_image_url: DEFAULT_AVATAR_URL
            })),
            total: totalCount.count || totalCount[0].count,
            page: parseInt(page, 10),
            limit: parseInt(limit, 10)
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

        const photos = await query(
            `SELECT p.id, p.owner_id, p.description, u.username
             FROM photos p
             JOIN users u ON p.owner_id = u.id
             WHERE p.owner_id IN (
                 SELECT followed_id FROM follows WHERE follower_id = ?
             )
             AND p.owner_id NOT IN (
                 SELECT blocked_id FROM blocks WHERE blocker_id = ?
                 UNION
                 SELECT blocker_id FROM blocks WHERE blocked_id = ?
             )
             ORDER BY p.id DESC
             LIMIT ? OFFSET ?`,
            [userId, userId, userId, parseInt(limit, 10), offset]
        );

        const [totalCount] = await query(
            `SELECT COUNT(*) as count
             FROM photos p
             WHERE p.owner_id IN (
                 SELECT followed_id FROM follows WHERE follower_id = ?
             )
             AND p.owner_id NOT IN (
                 SELECT blocked_id FROM blocks WHERE blocker_id = ?
                 UNION
                 SELECT blocker_id FROM blocks WHERE blocked_id = ?
             )`,
            [userId, userId, userId]
        );

        const enhancedPhotos = await Promise.all(photos.map(async (photo) => {
            const [likeCount] = await query(
                'SELECT COUNT(*) as count FROM likes WHERE photo_id = ?',
                [photo.id]
            );

            const [commentCount] = await query(
                'SELECT COUNT(*) as count FROM comments WHERE photo_id = ?',
                [photo.id]
            );

            const userLike = await query(
                'SELECT id FROM likes WHERE photo_id = ? AND user_id = ?',
                [photo.id, userId]
            );

            return {
                ...formatPhoto(photo),
                likeCount: likeCount.count,
                commentCount: commentCount.count,
                userLiked: userLike.length > 0
            };
        }));

        res.json({
            photos: enhancedPhotos,
            total: totalCount.count || totalCount[0].count,
            page: parseInt(page, 10),
            limit: parseInt(limit, 10)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch feed' });
    }
});

module.exports = router;
