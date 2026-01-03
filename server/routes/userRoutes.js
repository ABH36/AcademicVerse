const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Test Route: Only logged in users
router.get('/profile', protect, (req, res) => {
    res.json({
        success: true,
        message: `Welcome ${req.user.name}, your role is ${req.user.role}`,
        data: req.user
    });
});

// Test Route: Only Admins
router.get('/admin-dashboard', protect, authorize('admin'), (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to the Admin Control Center',
    });
});

module.exports = router;