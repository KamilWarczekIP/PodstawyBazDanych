const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Search photos by title, description, or tags
router.post('/photos', authenticateToken, [
    body('queryTerm').exists().trim().isLength({ min: 3 }),
    body('tags').optional().isArray(),
    body('page').exists().isInt(),
    body('limit').exists().isInt(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { queryTerm, page, limit, tags = [] } = req.body;
        const currentUserId = req.user.id;

        const offset = (page - 1) * limit;
        const searchQuery = `%${queryTerm}%`;


        const photos = await query(
            `SELECT p.id, p.owner_id, p.description, u.username
             FROM photos p
             JOIN users u ON p.owner_id = u.id
             WHERE (p.description LIKE ?)
             AND p.owner_id NOT IN (
                SELECT blocked_id FROM blocks WHERE blocker_id = ${currentUserId}
                UNION
                SELECT blocker_id FROM blocks WHERE blocked_id = ${currentUserId}
            )
             ORDER BY p.id DESC
             OFFSET ? LIMIT ?`,
            [searchQuery, offset, limit]
        );

        // Also search by tags
        const tagPhotos = await query(
            `SELECT DISTINCT p.id, p.owner_id, p.description, u.username
             FROM photos p
             JOIN users u ON p.owner_id = u.id
             JOIN photo_tags pt ON p.id = pt.photo_id
             JOIN tags t ON pt.tag_id = t.id
             WHERE t.name LIKE ?
             AND p.owner_id NOT IN (
                SELECT blocked_id FROM blocks WHERE blocker_id = ${currentUserId}
                UNION
                SELECT blocker_id FROM blocks WHERE blocked_id = ${currentUserId}
            )
             ORDER BY p.id DESC
             OFFSET ? LIMIT ?`,
            [searchQuery, offset, limit]
        );

        // Combine and deduplicate results
        const allPhotos = [...photos];
        const photoIds = new Set(photos.map(p => p.id));
        tagPhotos.forEach(p => {
            if (!photoIds.has(p.id)) {
                allPhotos.push(p);
            }
        });

        res.json({
            photos: allPhotos.slice(offset, offset + limit),
            page: page,
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Search failed' });
    }
});

// Search users by username
router.post('/users', authenticateToken, async (req, res) => {
    try {
        const { q, page = 1, limit = 10 } = req.query;
        const currentUserId = req.user?.id;

        if (!q || q.trim().length === 0) {
            return res.status(400).json({ error: 'Search query required' });
        }

        const offset = (page - 1) * limit;
        const searchQuery = `%${q}%`;

        // Build blocked users subquery
        let blockedSubquery = '1=1';
        if (currentUserId) {
            blockedSubquery = `u.id NOT IN (
                SELECT blocked_id FROM blocks WHERE blocker_id = ${currentUserId}
                UNION
                SELECT blocker_id FROM blocks WHERE blocked_id = ${currentUserId}
            )`;
        }

        const users = await query(
            `SELECT u.id, u.username, u.profile_image_url, u.bio
             FROM users u
             WHERE u.is_active = TRUE
             AND u.username LIKE ?
             AND ${blockedSubquery}
             ORDER BY u.username ASC
             LIMIT ? OFFSET ?`,
            [searchQuery, parseInt(limit), offset]
        );

        const [totalCount] = await query(
            `SELECT COUNT(*) as count FROM users u
             WHERE u.is_active = TRUE
             AND u.username LIKE ?
             AND ${blockedSubquery}`,
            [searchQuery]
        );

        // Add stats to users
        const enhancedUsers = await Promise.all(users.map(async (user) => {
            const [photoCount] = await query(
                'SELECT COUNT(*) as count FROM photos WHERE user_id = ? AND is_deleted = FALSE',
                [user.id]
            );

            const [followerCount] = await query(
                'SELECT COUNT(*) as count FROM follows WHERE following_id = ?',
                [user.id]
            );

            let isFriend = false;
            let isFollowing = false;

            if (currentUserId) {
                const friendCheck = await query(
                    'SELECT id FROM friendships WHERE ((requester_id = ? AND receiver_id = ?) OR (requester_id = ? AND receiver_id = ?)) AND status = "accepted"',
                    [currentUserId, user.id, user.id, currentUserId]
                );
                isFriend = friendCheck.length > 0;

                const followCheck = await query(
                    'SELECT id FROM follows WHERE follower_id = ? AND following_id = ?',
                    [currentUserId, user.id]
                );
                isFollowing = followCheck.length > 0;
            }

            return {
                ...user,
                photoCount: photoCount.count,
                followerCount: followerCount.count,
                isFriend,
                isFollowing
            };
        }));

        res.json({
            users: enhancedUsers,
            query: q,
            total: totalCount[0].count,
            page: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Search failed' });
    }
});

// Search by tags
router.post('/tags', authenticateToken, async (req, res) => {
    try {
        const { q, page = 1, limit = 10 } = req.query;

        if (!q || q.trim().length === 0) {
            return res.status(400).json({ error: 'Search query required' });
        }

        const offset = (page - 1) * limit;
        const searchQuery = `%${q}%`;

        const tags = await query(
            `SELECT id, name
             FROM tags
             WHERE name LIKE ?
             ORDER BY name ASC
             LIMIT ? OFFSET ?`,
            [searchQuery, parseInt(limit), offset]
        );

        const [totalCount] = await query(
            'SELECT COUNT(*) as count FROM tags WHERE name LIKE ?',
            [searchQuery]
        );

        res.json({
            tags,
            total: totalCount[0].count,
            page,
            limit,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Search failed' });
    }
});

module.exports = router;
