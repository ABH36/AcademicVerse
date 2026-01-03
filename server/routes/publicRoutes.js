const express = require('express');
const router = express.Router();
const { getPublicProfile, updatePrivacy, setUsername } = require('../controllers/publicController');
const { protect } = require('../middleware/authMiddleware');
const publicLimiter = require('../middleware/publicLimiter');

/**
 * @swagger
 * tags:
 *   - name: Public & Privacy
 *     description: Public Profiles, SEO Links, Custom Handles & Privacy Controls
 */

/**
 * @swagger
 * /public/u/{username}:
 *   get:
 *     summary: Get Public Profile (SEO Friendly)
 *     description: Public facing profile view (Rate Limited)
 *     tags: [Public & Privacy]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique public handle
 *     responses:
 *       200:
 *         description: Public profile returned
 *       404:
 *         description: User not found / Private profile
 *       429:
 *         description: Rate limit exceeded
 */
router.get('/u/:username', publicLimiter, getPublicProfile);

/**
 * @swagger
 * /public/privacy:
 *   put:
 *     summary: Update Privacy Settings
 *     tags: [Public & Privacy]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               showAcademic:
 *                 type: boolean
 *               showProjects:
 *                 type: boolean
 *               showContact:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Privacy updated
 */
router.put('/privacy', protect, updatePrivacy);

/**
 * @swagger
 * /public/username:
 *   put:
 *     summary: Claim Public Username
 *     tags: [Public & Privacy]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *             properties:
 *               username:
 *                 type: string
 *                 description: Unique public handle
 *     responses:
 *       200:
 *         description: Username saved
 *       400:
 *         description: Username invalid or already taken
 */
router.put('/username', protect, setUsername);

module.exports = router;
