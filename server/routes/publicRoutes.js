const express = require('express');
const router = express.Router();
const { getPublicProfile, updatePrivacy, setUsername } = require('../controllers/publicController');
const { protect } = require('../middleware/authMiddleware');
const publicLimiter = require('../middleware/publicLimiter'); // Import Limiter

// Public Endpoint (Rate Limited)
router.get('/u/:username', publicLimiter, getPublicProfile);

// Private Settings Endpoints
router.put('/privacy', protect, updatePrivacy);
router.put('/username', protect, setUsername);

module.exports = router;