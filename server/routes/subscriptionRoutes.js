const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { verifyRecruiter } = require('../middleware/roleMiddleware');
const { getMySubscription, upgradePlan } = require('../controllers/subscriptionController');

router.get('/my', protect, verifyRecruiter, getMySubscription);
router.post('/upgrade', protect, verifyRecruiter, upgradePlan);

module.exports = router;