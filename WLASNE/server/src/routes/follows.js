const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Follow user
router.put('/', authenticateToken, [
    body('followed_id').exists().isInt()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { followed_id } = req.body;
        const userId = req.user.id;

        if (userId === followed_id) {
            return res.status(409).json({ error: 'Cannot follow yourself' });
        }

        const users = await query(
            'SELECT id FROM users WHERE id = ?',
            [followed_id]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const existingFollow = await query(
            'SELECT follower_id FROM follows WHERE follower_id = ? AND followed_id = ?',
            [userId, followed_id]
        );

        if (existingFollow.length > 0) {
            return res.status(409).json({ error: 'Already following this user' });
        }

        await query(
            'INSERT INTO follows (follower_id, followed_id) VALUES (?, ?)',
            [userId, followed_id]
        );

        res.status(201).json({
            message: 'User followed successfully'
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to follow user' });
    }
});

// Unfollow user
router.delete('/',[
    body('followed_id').exists().isInt()
], authenticateToken, async (req, res) => {
    try {
        const { followed_id } = req.body;
        const userId = req.user.id;

        const result = await query(
            'DELETE FROM follows WHERE follower_id = ? AND followed_id = ?',
            [userId, followed_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Follow relationship not found' });
        }

        res.status(200).json({ message: 'User unfollowed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to unfollow user' });
    }
});

// Get followers
router.post('/followers/:userId', [
    body('page').exists().isInt(),
    body('limit').exists().isInt(),
], authenticateToken, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { userId } = req.params;
        const { page = 1, limit = 10 } = req.body;
        const offset = (page - 1) * limit;

        const followers = await query(
            `SELECT u.id, u.username FROM users u
             WHERE u.id IN (
                 SELECT follower_id FROM follows WHERE followed_id = ?
             ) LIMIT ? OFFSET ?`,
            [userId, limit, offset]
        );

        const [totalCount] = await query(
            'SELECT COUNT(*) as count FROM follows WHERE followed_id = ?',
            [userId]
        );

        res.json({
            followers: followers.map(user => ({
                ...user
            })),
            total: totalCount.count,
            page: page,
            limit: limit,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch followers' });
    }
});

// Get following
router.post('/following/:userId', [
    body('page').exists().isInt(),
    body('limit').exists().isInt(),
], authenticateToken, async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
    try {
        

        const { userId } = req.params;
        const { page = 1, limit = 10 } = req.body;
        const offset = (page - 1) * limit;

        const following = await query(
            `SELECT u.id, u.username FROM users u
             WHERE u.id IN (
                 SELECT followed_id FROM follows WHERE follower_id = ?
             ) LIMIT ? OFFSET ?`,
            [userId, limit, offset]
        );

        const [totalCount] = await query(
            'SELECT COUNT(*) as count FROM follows WHERE follower_id = ?',
            [userId]
        );

        res.json({
            following: following.map(user => ({
                ...user
            })),
            total: totalCount.count,
            page: page,
            limit: limit,
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch following' });
    }
});

// Get feed (photos from followed users)
router.post('/feed', authenticateToken, [
    body('page').exists().isInt(),
    body('limit').exists().isInt(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {

        const userId = req.user.id;
        const { page, limit} = req.body;
        const offset = (page - 1) * limit;

        const photos = await query(
            `SELECT p.id, p.owner_id, p.description, u.username
             FROM photos p
             JOIN users u ON p.owner_id = u.id
             WHERE p.owner_id IN (
                 SELECT followed_id FROM follows WHERE follower_id = ?
             )
             ORDER BY p.id DESC
             LIMIT ? OFFSET ?`,
            [userId, limit, offset]
        );

        const [totalCount] = await query(
            `SELECT COUNT(*) as count
             FROM photos p
             WHERE p.owner_id IN (
                 SELECT followed_id FROM follows WHERE follower_id = ?
             )`,
            [userId]
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
                photo: {
                    id: photo.id,
                    user_id: photo.owner_id,
                    username: photo.username,
                    description: photo.description || '',
                },
                likeCount: likeCount.count,
                commentCount: commentCount.count,
                userLiked: userLike.length > 0
            };
        }));
        res.json({
            photos: enhancedPhotos,
            total: totalCount.count,
            page: page,
            limit: limit,
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch feed' });
    }
});

module.exports = router;
