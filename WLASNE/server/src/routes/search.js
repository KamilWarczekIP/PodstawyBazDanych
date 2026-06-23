const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Search photos by description or tags
router.post('/photos', authenticateToken, [
    body('queryTerm').exists().trim().isLength({ min: 3 }),
    body('page').exists().isInt(),
    body('limit').exists().isInt(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { queryTerm, page, limit } = req.body;
        const currentUserId = req.user.id;

        const offset = (page - 1) * limit;
        const searchQuery = `%${queryTerm}%`;


        const photos = await query(
            `SELECT DISTINCT p.id, p.owner_id, u.username
             FROM photos p
             JOIN users u ON p.owner_id = u.id
             JOIN photo_tags pt ON p.id = pt.photo_id
             JOIN tags t ON pt.tag_id = t.id
             WHERE ((p.description LIKE ?) OR (t.name LIKE ?))
             AND p.owner_id NOT IN (
                SELECT blocked_id AS id FROM blocks WHERE blocker_id = ?
                UNION
                SELECT blocker_id AS id FROM blocks WHERE blocked_id = ?
            )
             ORDER BY p.id DESC
             LIMIT ? OFFSET ? `,
            [searchQuery, searchQuery, currentUserId, currentUserId, limit, offset]
        );

         const [photosCount] = await query(
            `SELECT COUNT(DISTINCT p.id) AS count
             FROM photos p
             JOIN users u ON p.owner_id = u.id
             JOIN photo_tags pt ON p.id = pt.photo_id
             JOIN tags t ON pt.tag_id = t.id
             WHERE ((p.description LIKE ?) OR (t.name LIKE ?))
             AND p.owner_id NOT IN (
                SELECT blocked_id FROM blocks WHERE blocker_id = ?
                UNION
                SELECT blocker_id FROM blocks WHERE blocked_id = ?
            )`,
            [searchQuery, currentUserId, currentUserId, offset, limit]
        );
        console.log(1)

        res.json({
            photos: photos,
            total: photosCount.count,
            page: page,
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Search failed' });
    }
});

// Search users by username
router.post('/users', authenticateToken, [
    body('queryTerm').exists().trim().isLength({ min: 3 }),
    body('page').exists().isInt(),
    body('limit').exists().isInt(),
], async (req, res) => {
    try {
        const { queryTerm, page, limit } = req.body;
        const currentUserId = req.user.id;

        const offset = (page - 1) * limit;
        const searchQuery = `%${queryTerm}%`;

        const users = await query(
            `SELECT u.id, u.username
             FROM users u
             WHERE u.username LIKE ?
             AND u.id NOT IN (
                SELECT blocked_id FROM blocks WHERE blocker_id = ${currentUserId}
                UNION
                SELECT blocker_id FROM blocks WHERE blocked_id = ${currentUserId}
            )
             ORDER BY u.username ASC
             LIMIT ? OFFSET ?`,
            [searchQuery, limit, offset]
        );

        const [totalCount] = await query(
            `SELECT COUNT(*) as count FROM users u
             WHERE u.username LIKE ?
             AND u.id NOT IN (
                SELECT blocked_id FROM blocks WHERE blocker_id = ${currentUserId}
                UNION
                SELECT blocker_id FROM blocks WHERE blocked_id = ${currentUserId}
            )`,
            [searchQuery]
        );

        res.json({
            users: users,
            total: totalCount.count,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Search failed' });
    }
});

// // Search by tags
// router.post('/tags', authenticateToken, async (req, res) => {
//     try {
//         const { q, page = 1, limit = 10 } = req.query;

//         if (!q || q.trim().length === 0) {
//             return res.status(400).json({ error: 'Search query required' });
//         }

//         const offset = (page - 1) * limit;
//         const searchQuery = `%${q}%`;

//         const tags = await query(
//             `SELECT id, name
//              FROM tags
//              WHERE name LIKE ?
//              ORDER BY name ASC
//              LIMIT ? OFFSET ?`,
//             [searchQuery, parseInt(limit), offset]
//         );

//         const [totalCount] = await query(
//             'SELECT COUNT(*) as count FROM tags WHERE name LIKE ?',
//             [searchQuery]
//         );

//         res.json({
//             tags,
//             total: totalCount[0].count,
//             page,
//             limit,
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Search failed' });
//     }
// });

module.exports = router;
