const express = require('express');
const router = express.Router();
const { 
  getAdminStats, 
  getAllUsers, 
  toggleUserFreeze, 
  getPendingCertificates, 
  verifyCertificate,
  manageUser, 
  getReports, 
  resolveReport 
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

router.use(protect);
router.use(adminOnly);

/**
 * @swagger
 * tags:
 *   - name: Admin Authority
 *     description: Platform Governance, Risk Management & Superuser Controls
 */

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     summary: Platform Analytics Dashboard
 *     tags: [Admin Authority]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Platform statistics
 *       403:
 *         description: Access denied
 */
router.get('/stats', getAdminStats);

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: List all users
 *     tags: [Admin Authority]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User list
 */
router.get('/users', getAllUsers);

/**
 * @swagger
 * /admin/user/{id}/freeze:
 *   put:
 *     summary: Freeze or unfreeze user
 *     tags: [Admin Authority]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Freeze toggled
 */
router.put('/user/:id/freeze', toggleUserFreeze);

/**
 * @swagger
 * /admin/users/{id}/action:
 *   patch:
 *     summary: Perform admin action
 *     tags: [Admin Authority]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [ban, unban, verify_identity, verify_company]
 *     responses:
 *       200:
 *         description: Action executed
 */
router.patch('/users/:id/action', manageUser);

/**
 * @swagger
 * /admin/certificates/pending:
 *   get:
 *     summary: Pending certificate approvals
 *     tags: [Admin Authority]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pending certificates
 */
router.get('/certificates/pending', getPendingCertificates);

/**
 * @swagger
 * /admin/certificate/{id}/verify:
 *   put:
 *     summary: Verify certificate
 *     tags: [Admin Authority]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *     responses:
 *       200:
 *         description: Certificate verified
 */
router.put('/certificate/:id/verify', verifyCertificate);

/**
 * @swagger
 * /admin/reports:
 *   get:
 *     summary: Trust & safety reports
 *     tags: [Admin Authority]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reports list
 */
router.get('/reports', getReports);

/**
 * @swagger
 * /admin/reports/{id}/resolve:
 *   patch:
 *     summary: Resolve report
 *     tags: [Admin Authority]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [resolved, dismissed]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Report resolved
 */
router.patch('/reports/:id/resolve', resolveReport);

module.exports = router;
