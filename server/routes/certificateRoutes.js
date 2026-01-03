const express = require('express');
const router = express.Router();
const { addCertificate, getMyCertificates, deleteCertificate, verifyCertificatePublic } = require('../controllers/certificateController');
const { protect } = require('../middleware/authMiddleware');

// Import Hardened Middlewares
const uploadCert = require('../middleware/certificateUploadMiddleware'); 

// FIX: Curly braces { } lagaye hain taaki object me se function nikle
// Note: File ka naam wahi rakha hai jo aapne bataya 'verifyLimiter'
const { verifyLimiter } = require('../middleware/verifyLimiter'); 

// Private Routes
router.get('/me', protect, getMyCertificates);

// Use uploadCert (academicverse_certificates folder)
router.post('/', protect, uploadCert.single('certificate'), addCertificate);

router.delete('/:id', protect, deleteCertificate);

// Public Route (Rate Limited)
router.get('/verify/:id', verifyLimiter, verifyCertificatePublic);

module.exports = router;