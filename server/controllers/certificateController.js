const Certificate = require('../models/Certificate');
const cloudinary = require('../config/cloudinary');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

// @desc    Add a Certificate (Hardened)
exports.addCertificate = async (req, res) => {
  try {
    if (req.user.isFrozen) {
      return res.status(403).json({ message: 'Account frozen.' });
    }

    // LOCK-IN 1: Limit Total Certificates (50 Max)
    const count = await Certificate.countDocuments({ user: req.user.id });
    if (count >= 50) {
      return res.status(403).json({ message: 'Certificate limit reached (50 max).' });
    }

    const { title, issuingOrganization, issueDate, credentialUrl } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Certificate image is required' });
    }

    const verificationId = uuidv4();

    const certificate = await Certificate.create({
      user: req.user.id,
      title,
      issuingOrganization,
      issueDate,
      credentialUrl,
      imageUrl: req.file.path,
      verificationId
    });

    logger.info(`Certificate Added: ${title} by ${req.user.id}`);
    res.status(201).json(certificate);

  } catch (error) {
    logger.error(`Add Certificate Error: ${error.message}`);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get My Certificates
exports.getMyCertificates = async (req, res) => {
  try {
    const certs = await Certificate.find({ user: req.user.id }).sort({ issueDate: -1 });
    res.json(certs);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Verify Certificate (Hardened Public Route)
exports.verifyCertificatePublic = async (req, res) => {
  try {
    // LOCK-IN 4: UUID Brute-Force Protection
    if (!/^[0-9a-fA-F-]{36}$/.test(req.params.id)) {
        return res.status(400).json({ valid: false, message: 'Invalid verification ID format' });
    }

    const cert = await Certificate.findOne({ verificationId: req.params.id })
      .populate('user', 'name email');

    if (!cert) {
      return res.status(404).json({ valid: false, message: 'Certificate not found or invalid' });
    }

    res.json({
      valid: true,
      title: cert.title,
      issuedTo: cert.user.name,
      organization: cert.issuingOrganization,
      date: cert.issueDate,
      image: cert.imageUrl,
      verifiedByAdmin: cert.isVerified
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete Certificate (Hardened)
exports.deleteCertificate = async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.id);

    if (!cert) return res.status(404).json({ message: 'Certificate not found' });
    if (cert.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

    // LOCK-IN 3: Fix Cloudinary Cleanup Path
    if (cert.imageUrl) {
        try {
            const urlParts = cert.imageUrl.split('/');
            const fileNameWithExt = urlParts.pop();
            const publicId = fileNameWithExt.split('.')[0];
            // Correct Folder: academicverse_certificates
            await cloudinary.uploader.destroy(`academicverse_certificates/${publicId}`);
        } catch (err) {
            logger.error(`Failed to delete cert image: ${err.message}`);
        }
    }

    await cert.deleteOne();
    res.json({ message: 'Certificate removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};