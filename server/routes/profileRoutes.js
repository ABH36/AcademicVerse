const express = require('express');
const router = express.Router();
const { 
  getCurrentProfile, 
  createOrUpdateProfile, 
  updateThemeSettings // Import new controller
} = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/me', protect, getCurrentProfile);

router.post(
  '/', 
  protect, 
  upload.single('avatar'), 
  createOrUpdateProfile
);

// NEW: Phase-7 Theme Route
router.put('/theme', protect, updateThemeSettings);

module.exports = router;