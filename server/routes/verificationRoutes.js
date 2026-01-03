const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/certificateUploadMiddleware');
const { verifyLimiter } = require('../middleware/verifyLimiter');

const { 
  initiateVerification, 
  confirmVerification,
  submitKYC, 
  reportUser, 
  searchRegistry 
} = require('../controllers/verificationController');

/**
 * @swagger
 * tags:
 *   - name: Trust & Verification
 *     description: KYC, Identity Verification, Fraud Reporting & Public Trust Registry
 */

/**
 * @swagger
 * /verify/registry:
 *   get:
 *     summary: Public Trust Registry Search
 *     tags: [Trust & Verification]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID or Username
 *     responses:
 *       200:
 *         description: Trust status returned
 *       404:
 *         description: Entity not found
 *       429:
 *         description: Too many requests
 */
router.get('/registry', verifyLimiter, searchRegistry);

/**
 * @swagger
 * /verify/initiate:
 *   post:
 *     summary: Initiate student email verification
 *     tags: [Trust & Verification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - academicEmail
 *             properties:
 *               academicEmail:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: OTP sent
 *       400:
 *         description: Invalid academic email
 */
router.post('/initiate', protect, initiateVerification);

/**
 * @swagger
 * /verify/confirm:
 *   post:
 *     summary: Confirm OTP & verify student
 *     tags: [Trust & Verification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otp
 *             properties:
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: Student verified
 *       400:
 *         description: Invalid OTP
 */
router.post('/confirm', protect, confirmVerification);

/**
 * @swagger
 * /verify/kyc:
 *   post:
 *     summary: Submit recruiter KYC documents
 *     tags: [Trust & Verification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - companyName
 *               - businessRegNumber
 *               - document
 *             properties:
 *               companyName:
 *                 type: string
 *               businessRegNumber:
 *                 type: string
 *               document:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: KYC submitted
 */
router.post('/kyc', protect, upload.single('document'), submitKYC);

/**
 * @swagger
 * /verify/report:
 *   post:
 *     summary: Report a user for fraud
 *     tags: [Trust & Verification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reportedUserId
 *               - reason
 *             properties:
 *               reportedUserId:
 *                 type: string
 *               reason:
 *                 type: string
 *                 enum: [Spam, FakeProfile, Scam, Harassment, Other]
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Report submitted
 */
router.post('/report', protect, reportUser);

module.exports = router;
