const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { verifyRecruiter } = require('../middleware/roleMiddleware');
const {
  createJob, getJobs, applyForJob, getJobApplications,
  getMyPostedJobs, updateApplicationStatus, getMyApplications, respondToOffer, reportJob
} = require('../controllers/jobController');

/**
 * @swagger
 * tags:
 *   - name: Jobs
 *     description: Job Marketplace, Applications & Hiring Authority
 */

/**
 * @swagger
 * /jobs:
 *   get:
 *     summary: Public Job Search
 *     tags: [Jobs]
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: minSalary
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Job list
 */
router.get('/', getJobs);

/**
 * @swagger
 * /jobs:
 *   post:
 *     summary: Post New Job (Recruiter)
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, company, location]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               location: { type: string }
 *               type: { type: string }
 *               minTrustScore: { type: number }
 *     responses:
 *       201: { description: Job created }
 */
router.post('/', protect, verifyRecruiter, createJob);

/**
 * @swagger
 * /jobs/my-jobs:
 *   get:
 *     summary: Recruiter Job List
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: My Jobs }
 */
router.get('/my-jobs', protect, verifyRecruiter, getMyPostedJobs);

/**
 * @swagger
 * /jobs/{id}/applications:
 *   get:
 *     summary: Applicants for Job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Applications }
 */
router.get('/:id/applications', protect, verifyRecruiter, getJobApplications);

/**
 * @swagger
 * /jobs/application/{id}/status:
 *   patch:
 *     summary: Update Application Status
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: string }
 *     responses:
 *       200: { description: Status updated }
 */
router.patch('/application/:id/status', protect, verifyRecruiter, updateApplicationStatus);

/**
 * @swagger
 * /jobs/applications/my:
 *   get:
 *     summary: Student Applications
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: My applications }
 */
router.get('/applications/my', protect, getMyApplications);

/**
 * @swagger
 * /jobs/{id}/apply:
 *   post:
 *     summary: Apply for Job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       201: { description: Applied }
 */
router.post('/:id/apply', protect, applyForJob);

/**
 * @swagger
 * /jobs/application/{id}/respond:
 *   patch:
 *     summary: Respond to Offer
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Response saved }
 */
router.patch('/application/:id/respond', protect, respondToOffer);

/**
 * @swagger
 * /jobs/{id}/report:
 *   post:
 *     summary: Report Job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Reported }
 */
router.post('/:id/report', protect, reportJob);

module.exports = router;
