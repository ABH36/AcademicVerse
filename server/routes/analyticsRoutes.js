const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { verifyRecruiter } = require('../middleware/roleMiddleware');
const { getRecruiterStats } = require('../controllers/analyticsController');

// All analytics routes are protected
router.get('/recruiter', protect, verifyRecruiter, getRecruiterStats);

module.exports = router;