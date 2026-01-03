const express = require('express');
const router = express.Router();
const { 
  getAdminStats,        // Updated from getSystemStats
  getAllUsers, 
  toggleUserFreeze, 
  getPendingCertificates, 
  verifyCertificate,
  manageUser,           // Phase-17: Advanced User Management
  getReports,           // Phase-17: Trust Center
  resolveReport         // Phase-17: Resolve Disputes
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

// GLOBAL SECURITY: All routes require Login + Admin Role
router.use(protect);
router.use(adminOnly);

// --- DASHBOARD ---
router.get('/stats', getAdminStats);

// --- USER MANAGEMENT ---
router.get('/users', getAllUsers);
router.put('/user/:id/freeze', toggleUserFreeze); // Legacy (Keep for safety)
router.patch('/users/:id/action', manageUser);    // New (Ban, Verify Identity, Verify Company)

// --- CERTIFICATES ---
router.get('/certificates/pending', getPendingCertificates);
router.put('/certificate/:id/verify', verifyCertificate);

// --- TRUST & SAFETY CENTER (Phase-17) ---
router.get('/reports', getReports);
router.patch('/reports/:id/resolve', resolveReport);

module.exports = router;