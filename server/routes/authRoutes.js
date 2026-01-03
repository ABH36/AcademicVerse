const express = require('express');
const router = express.Router();
const { authLimiter } = require('../middleware/verifyLimiter'); // <--- SECURITY IMPORT

// Import Controller Functions
const { 
    registerUser, 
    loginUser, 
    logoutUser, 
    refreshAccessToken 
} = require('../controllers/authController');

// Define Routes with Security Hardening
// Phase-19A: Added authLimiter to prevent Brute Force Attacks
router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);

// Standard Routes (Global Limiter applies here)
router.post('/logout', logoutUser);
router.get('/refresh', refreshAccessToken);

module.exports = router;