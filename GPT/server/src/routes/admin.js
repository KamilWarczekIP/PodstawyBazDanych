const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Admin authentication middleware
const adminAuth = (req, res, next) => {
    const adminSecret = req.headers['x-admin-secret'];
    if (adminSecret !== process.env.ADMIN_SECRET) {
        return res.status(403).json({ error: 'Unauthorized admin access' });
    }
    next();
};

// Get storage statistics
router.get('/stats/storage', authenticateToken, adminAuth, async (req, res) => {
    try {
        const stats = await query(
            `SELECT 
                COUNT(DISTINCT user_id) as total_users,
                SUM(total_size_bytes) as total_storage_bytes,
                AVG(total_size_bytes) as avg_storage_per_user,
                MAX(total_size_bytes) as max_user_storage,
                SUM(photo_count) as total_photos
             FROM storage_info`
        );

        const [userStats] = await query(
            `SELECT 
                COUNT(*) as total_users,
                SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) as active_users,
                SUM(CASE WHEN is_active = FALSE THEN 1 ELSE 0 END) as inactive_users
             FROM users`
        );

        res.json({
            ...stats[0],
            ...userStats
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch storage stats' });
    }
});

// Get user statistics
router.get('/stats/users', authenticateToken, adminAuth, async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const users = await query(
            `SELECT 
                u.id,
                u.username,
                u.email,
                u.created_at,
                u.is_active,
                si.total_size_bytes,
                si.photo_count,
                (SELECT COUNT(*) FROM friendships WHERE (requester_id = u.id OR receiver_id = u.id) AND status = "accepted") as friend_count,
                (SELECT COUNT(*) FROM follows WHERE follower_id = u.id) as following_count,
                (SELECT COUNT(*) FROM follows WHERE following_id = u.id) as follower_count
             FROM users u
             LEFT JOIN storage_info si ON u.id = si.user_id
             ORDER BY u.created_at DESC
             LIMIT ? OFFSET ?`,
            [parseInt(limit), offset]
        );

        const [totalCount] = await query('SELECT COUNT(*) as count FROM users');

        res.json({
            users,
            total: totalCount[0].count,
            page: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch user stats' });
    }
});

// Get friendship graph
router.get('/graph/friendships', authenticateToken, adminAuth, async (req, res) => {
    try {
        const nodes = await query(
            'SELECT id, username FROM users WHERE is_active = TRUE LIMIT 100'
        );

        const edges = await query(
            `SELECT 
                CASE WHEN requester_id < receiver_id THEN requester_id ELSE receiver_id END as source,
                CASE WHEN requester_id < receiver_id THEN receiver_id ELSE requester_id END as target,
                COUNT(*) as weight
             FROM friendships
             WHERE status = "accepted"
             GROUP BY source, target`
        );

        const stats = await query(
            `SELECT 
                COUNT(*) as total_connections,
                AVG(friend_count) as avg_friends_per_user,
                MAX(friend_count) as most_connected_user
             FROM (
                 SELECT 
                     CASE WHEN requester_id < receiver_id THEN requester_id ELSE receiver_id END as user_id,
                     COUNT(*) as friend_count
                 FROM friendships
                 WHERE status = "accepted"
                 GROUP BY user_id
             ) as friendship_stats`
        );

        res.json({
            nodes: nodes.map(node => ({ id: node.id, label: node.username })),
            edges: edges.map(edge => ({ source: edge.source, target: edge.target })),
            stats: stats[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch friendship graph' });
    }
});

// Get system activity log
router.get('/logs/activity', authenticateToken, adminAuth, async (req, res) => {
    try {
        const { days = 7, limit = 50, page = 1 } = req.query;
        const offset = (page - 1) * limit;

        const logs = await query(
            `SELECT * FROM admin_logs
             WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
             ORDER BY created_at DESC
             LIMIT ? OFFSET ?`,
            [parseInt(days), parseInt(limit), offset]
        );

        const [totalCount] = await query(
            'SELECT COUNT(*) as count FROM admin_logs WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)',
            [parseInt(days)]
        );

        res.json({
            logs,
            total: totalCount[0].count,
            page: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch activity logs' });
    }
});

// Get top content (most liked, most commented)
router.get('/content/popular', authenticateToken, adminAuth, async (req, res) => {
    try {
        const topPhotos = await query(
            `SELECT 
                p.id,
                p.title,
                u.username,
                COUNT(DISTINCT l.id) as like_count,
                COUNT(DISTINCT c.id) as comment_count
             FROM photos p
             JOIN users u ON p.user_id = u.id
             LEFT JOIN likes l ON p.id = l.photo_id
             LEFT JOIN comments c ON p.id = c.photo_id AND c.is_deleted = FALSE
             WHERE p.is_deleted = FALSE
             GROUP BY p.id
             ORDER BY like_count DESC
             LIMIT 10`
        );

        const topUsers = await query(
            `SELECT 
                u.id,
                u.username,
                COUNT(DISTINCT p.id) as photo_count,
                COUNT(DISTINCT f.id) as follower_count
             FROM users u
             LEFT JOIN photos p ON u.id = p.user_id AND p.is_deleted = FALSE
             LEFT JOIN follows f ON u.id = f.following_id
             WHERE u.is_active = TRUE
             GROUP BY u.id
             ORDER BY follower_count DESC
             LIMIT 10`
        );

        res.json({
            topPhotos,
            topUsers
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch popular content' });
    }
});

// Log admin action
router.post('/logs/action', authenticateToken, adminAuth, async (req, res) => {
    try {
        const { action, target_table, target_id, description } = req.body;

        const result = await query(
            'INSERT INTO admin_logs (admin_id, action, target_table, target_id, description) VALUES (?, ?, ?, ?, ?)',
            [req.user.id, action, target_table || null, target_id || null, description || null]
        );

        res.status(201).json({
            message: 'Action logged',
            logId: result.insertId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to log action' });
    }
});

module.exports = router;
