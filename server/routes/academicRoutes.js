const express = require('express');
const router = express.Router();
const { getAcademicRecord, addSemester, addTimelineEvent } = require('../controllers/academicController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // Import Upload Middleware

// Base Route: /api/academic

router.get('/me', protect, getAcademicRecord);

// Semester data is JSON only (no file needed usually)
router.post('/semester', protect, addSemester);

// Timeline now supports 'proof' image upload
router.post(
    '/timeline', 
    protect, 
    upload.single('proof'), // Expects form-data field: 'proof'
    addTimelineEvent
);

module.exports = router;