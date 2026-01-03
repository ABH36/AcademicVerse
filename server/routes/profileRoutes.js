const express = require('express');
const router = express.Router();
const {
  getCurrentProfile,
  createOrUpdateProfile,
  updateThemeSettings
} = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

/**
 * @swagger
 * tags:
 *   - name: Profile
 *     description: Student Identity, Academic Portfolio & Theme Customization
 */

/**
 * @swagger
 * /profile/me:
 *   get:
 *     summary: Get Current User Profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile data returned
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Profile not found
 */
router.get('/me', protect, getCurrentProfile);

/**
 * @swagger
 * /profile:
 *   post:
 *     summary: Create / Update Profile (Avatar Upload)
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *               bio:
 *                 type: string
 *               collegeName:
 *                 type: string
 *               branch:
 *                 type: string
 *               batchYear:
 *                 type: string
 *               rollNumber:
 *                 type: string
 *               linkedin:
 *                 type: string
 *                 format: uri
 *               github:
 *                 type: string
 *                 format: uri
 *               website:
 *                 type: string
 *                 format: uri
 *               instagram:
 *                 type: string
 *                 format: uri
 *     responses:
 *       200:
 *         description: Profile updated
 *       500:
 *         description: Upload failed
 */
router.post('/', protect, upload.single('avatar'), createOrUpdateProfile);

/**
 * @swagger
 * /profile/theme:
 *   put:
 *     summary: Update Profile Theme
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               accentColor:
 *                 type: string
 *                 example: "#3B82F6"
 *               mode:
 *                 type: string
 *                 enum: [light, dark, system]
 *     responses:
 *       200:
 *         description: Theme updated
 */
router.put('/theme', protect, updateThemeSettings);

module.exports = router;
