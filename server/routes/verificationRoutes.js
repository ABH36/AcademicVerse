const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { initiateVerification, confirmVerification } = require('../controllers/verificationController');

router.post('/initiate', protect, initiateVerification);
router.post('/confirm', protect, confirmVerification);

module.exports = router;