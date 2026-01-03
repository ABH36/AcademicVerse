const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { verifyRecruiter } = require('../middleware/roleMiddleware');
// ... existing imports
const { 
  createJob, getJobs, applyForJob, getJobApplications, 
  getMyPostedJobs, updateApplicationStatus, getMyApplications, respondToOffer, reportJob
} = require('../controllers/jobController');

// Public
router.get('/', getJobs);

// Recruiter Protected
router.get('/my-jobs', protect, verifyRecruiter, getMyPostedJobs); 
router.post('/', protect, verifyRecruiter, createJob);
router.get('/:id/applications', protect, verifyRecruiter, getJobApplications);
router.patch('/application/:id/status', protect, verifyRecruiter, updateApplicationStatus); 

// Student Protected
router.get('/applications/my', protect, getMyApplications); 
router.post('/:id/apply', protect, applyForJob);
router.patch('/application/:id/respond', protect, respondToOffer);
router.post('/:id/report', protect, reportJob); // <--- NEW ROUTE

module.exports = router;