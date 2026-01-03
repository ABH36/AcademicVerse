const Profile = require('../models/Profile');
const User = require('../models/User'); // Required for Registry
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const logger = require('../utils/logger'); // Unified Logger

// --- PHASE-20 NEW IMPORTS ---
const KYCRequest = require('../models/KYCRequest');
const AbuseReport = require('../models/AbuseReport');
const calculateTrustScore = require('../utils/trustEngine');
// ----------------------------

// ============================================
// 🎓 PART 1: STUDENT VERIFICATION (EXISTING)
// ============================================

// @desc    Initiate Verification (Send OTP)
// @route   POST /api/verify/initiate
exports.initiateVerification = async (req, res) => {
  try {
    const { academicEmail } = req.body;
    
    // 1. Validate Email Format (Simple check for standard student domains)
    // You can remove this regex if you want to allow ANY email for testing
    // const eduRegex = /(\.edu|\.ac\.in|\.org)$/; 
    // if (!eduRegex.test(academicEmail)) {
    //   return res.status(400).json({ message: 'Must be a valid academic email (.edu, .ac.in)' });
    // }

    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    // --- PHASE-13B: ANTI-FRAUD GUARD ---
    // If the user is already Verified, but tries to verify a NEW email, 
    // we immediately revoke the existing badge to prevent identity swapping.
    if (profile.verification.isVerified && profile.verification.academicEmail !== academicEmail) {
        profile.verification.isVerified = false;
        profile.verification.status = 'pending';
    }
    // -----------------------------------

    // 2. Generate OTP (6 digits)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 3. Save to DB (Expires in 10 mins)
    profile.verification.academicEmail = academicEmail;
    profile.verification.otp = otp;
    profile.verification.otpExpires = Date.now() + 10 * 60 * 1000;
    profile.verification.status = 'pending';
    
    await profile.save();

    // 4. Send Email
    const message = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background: #f4f4f4;">
        <div style="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
          <h2 style="color: #3B82F6;">Verify Student Status</h2>
          <p>You requested to verify your student status on AcademicVerse.</p>
          <p>Your Verification Code is:</p>
          <h1 style="letter-spacing: 5px; background: #eee; padding: 10px; text-align: center;">${otp}</h1>
          <p>This code expires in 10 minutes.</p>
          <p style="font-size: 12px; color: #666; margin-top: 20px;">If you did not request this, please ignore this email.</p>
        </div>
      </div>
    `;

    try {
      await sendEmail({
        email: academicEmail,
        subject: 'AcademicVerse Verification Code',
        message,
        otp // Passed for Mock Logger
      });
      res.status(200).json({ message: 'OTP sent to academic email' });
    } catch (err) {
      profile.verification.otp = undefined;
      profile.verification.otpExpires = undefined;
      await profile.save();
      return res.status(500).json({ message: 'Email could not be sent. check console for Mock OTP.' });
    }

  } catch (error) {
    logger.error(`Verification Init Error: ${error.message}`);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Confirm OTP
// @route   POST /api/verify/confirm
exports.confirmVerification = async (req, res) => {
  try {
    const { otp } = req.body;
    const profile = await Profile.findOne({ user: req.user.id });

    // 1. Check validity
    if (
      !profile.verification.otp ||
      profile.verification.otp !== otp ||
      profile.verification.otpExpires < Date.now()
    ) {
      return res.status(400).json({ message: 'Invalid or Expired OTP' });
    }

    // 2. Verify Success
    profile.verification.isVerified = true;
    profile.verification.status = 'verified';
    profile.verification.otp = undefined; // Clear OTP
    profile.verification.otpExpires = undefined;

    // --- PHASE-20: AUTO TRUST SCORE UPDATE ---
    // User verify ho gaya, turant Trust Score badhao
    const newScore = await calculateTrustScore(req.user.id);
    profile.trustScore = newScore;
    // -----------------------------------------

    await profile.save();
    
    // Also update User Model for global flag
    await User.findByIdAndUpdate(req.user.id, { isVerified: true });

    res.status(200).json({ message: 'Student Verified Successfully!', isVerified: true });

  } catch (error) {
    logger.error(`Verification Confirm Error: ${error.message}`);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ============================================
// 🏢 PART 2: RECRUITER KYC & TRUST (NEW PHASE-20)
// ============================================

// @desc    Submit Recruiter KYC
// @route   POST /api/verify/kyc
exports.submitKYC = async (req, res) => {
  try {
    const { companyName, businessRegNumber } = req.body;
    
    // Check if file uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'Document proof is required' });
    }

    const newKYC = await KYCRequest.create({
      user: req.user._id,
      companyName,
      businessRegNumber,
      documentUrl: `/uploads/${req.file.filename}` 
    });

    res.status(201).json({ message: 'KYC Submitted. Admin will review.', kyc: newKYC });
  } catch (error) {
    logger.error(`KYC Error: ${error.message}`);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Report a User (Fraud Engine)
// @route   POST /api/verify/report
exports.reportUser = async (req, res) => {
  try {
    const { reportedUserId, reason, description } = req.body;

    await AbuseReport.create({
      reporter: req.user._id,
      reportedUser: reportedUserId,
      reason,
      description
    });

    // AUTO-DOWNGRADE TRIGGER
    // Recalculate Trust Score of the reported user immediately
    const newScore = await calculateTrustScore(reportedUserId);
    await Profile.findOneAndUpdate({ user: reportedUserId }, { trustScore: newScore });

    logger.info(`Fraud Engine: User ${reportedUserId} score dropped due to report.`);

    res.status(201).json({ message: 'Report submitted. Trust score updated.' });
  } catch (error) {
    logger.error(`Report Error: ${error.message}`);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get Trust Registry (Public Search)
// @route   GET /api/verify/registry?q=ID
exports.searchRegistry = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: 'Query required' });

    // Search by User ID or Username
    const user = await User.findOne({ 
        $or: [{ _id: q.match(/^[0-9a-fA-F]{24}$/) ? q : null }, { username: q }] 
    }).select('name username isVerified role avatar createdAt');

    if (!user) return res.status(404).json({ message: 'Entity not found in Registry' });

    const profile = await Profile.findOne({ user: user._id }).select('trustScore identity');

    res.json({
      user,
      trustScore: profile ? profile.trustScore : 0,
      joinedAt: user.createdAt,
      status: user.isVerified ? 'VERIFIED' : 'UNVERIFIED'
    });
  } catch (error) {
    logger.error(`Registry Search Error: ${error.message}`);
    res.status(500).json({ message: 'Server Error' });
  }
};