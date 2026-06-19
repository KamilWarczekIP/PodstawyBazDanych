const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const fsp = require('fs/promises');
const path = require('path');

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

//Update user photo
router.put('/photo', authenticateToken, [
    body('profile_photo_id').optional().trim().escape().isInt(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const userId = req.user.id;
        const { profile_photo_id } = req.body;

        if(profile_photo_id != null) {
            const photoOwnershipCheck = await query(
            'SELECT id FROM photos WHERE owner_id = ? AND id = ?',
            [userId, profile_photo_id]
            );
            if(photoOwnershipCheck.length != 1) {
                return res.status(402).json({ error: "Zdjęcie o tym id nie należy do tego użytkownika" });
            }
            await fsp.copyFile(
                path.join(process.cwd(), 'uploads', userId + "", profile_photo_id + ".jpg"),
                path.join(process.cwd(), 'uploads', userId + "", "user.jpg")
                )
                    
        } else {
            await fsp.copyFile(
                path.join(process.cwd(), 'uploads', "user.jpg"),
                path.join(process.cwd(), 'uploads', userId + "", "user.jpg")
                )
        }
        res.status(200).json({message: "Photo changed"})
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed change user photo' });
    }
});

// Update user profile
router.put('/', authenticateToken, [
    body('username').optional().trim().escape(),
    body('bio').optional().trim().escape(),
    body('password').optional().trim().escape(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const userId = req.user.id;

        let { username, bio, password } = req.body;
        
        const hashedPassword = (password == undefined ? null : await bcrypt.hash(password, 10));
        
        if(username == undefined)
            username = null;
        if(bio == undefined)
            bio = null;

        await query(
            'UPDATE users SET username = COALESCE(?, username), bio = COALESCE(?, bio) \
            , password = COALESCE(?, password) WHERE id = ?',
            [   username, 
                bio, 
                hashedPassword,
                userId
            ]
        );

        const [updatedUser] = await query(
            'SELECT id, username, email, bio FROM users WHERE id = ?',
            [userId]
        );
        

        res.json({ message: "User profile updated" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// // Get user info - only name
// router.get('/name/:userId', authenticateToken, async (req, res) => {
//     try {
//         const { userId } = req.params;
//         const currentUserId = req.user.id;

//         const users = await query(
//             'SELECT username FROM users WHERE id = ?',
//             [userId]
//         );

//         res.json({
//             username: users[0].username
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Failed to fetch user info' });
//     }
// });

module.exports = router;
