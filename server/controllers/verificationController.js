const Profile = require('../models/Profile');
const User = require('../models/User'); 
const crypto = require('crypto');
const logger = require('../utils/logger'); 
const sgMail = require('@sendgrid/mail'); 
const { generateEmailHtml } = require('../utils/emailTemplates'); 

if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const KYCRequest = require('../models/KYCRequest');
const AbuseReport = require('../models/AbuseReport');
const calculateTrustScore = require('../utils/trustEngine');

// ============================================
// 🎓 PART 1: STUDENT VERIFICATION
// ============================================

// @desc    Initiate Verification
// @route   POST /api/verify/initiate
exports.initiateVerification = async (req, res) => {
  try {
    const { academicEmail } = req.body;
    
    if (!academicEmail) {
       return res.status(400).json({ message: 'Academic email is required' });
    }

    // --- FIX: BLOCK PUBLIC DOMAINS (LOOPHOLE CLOSED) ---
    // List of common public email providers to BLOCK
    const publicDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com', 'icloud.com', 'aol.com', 'protonmail.com'];
    
    const emailDomain = academicEmail.split('@')[1];
    if (!emailDomain || publicDomains.includes(emailDomain.toLowerCase())) {
        return res.status(400).json({ 
            message: 'Public emails (Gmail, Yahoo, etc.) are not allowed. Please use your Institute/College issued email.' 
        });
    }
    // ----------------------------------------------------

    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    // Anti-Fraud Guard
    if (profile.verification.isVerified && profile.verification.academicEmail !== academicEmail) {
        profile.verification.isVerified = false;
        profile.verification.status = 'pending';
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save to DB
    profile.verification.academicEmail = academicEmail;
    profile.verification.otp = otp;
    profile.verification.otpExpires = Date.now() + 10 * 60 * 1000;
    profile.verification.status = 'pending';
    
    await profile.save();

    // Send Email
    const emailContent = generateEmailHtml('verification', { 
        otp: otp,
        name: profile.identity?.name || 'Student'
    });

    const msg = {
      to: academicEmail,
      from: process.env.EMAIL_FROM || 'support@academicverse.com',
      subject: 'AcademicVerse: Verify Student Identity',
      html: emailContent 
    };

    try {
      await sgMail.send(msg);
      logger.info(`Verification OTP sent to ${academicEmail}`);
      res.status(200).json({ message: `Verification code sent to ${academicEmail}` });
    } catch (err) {
      profile.verification.otp = undefined;
      profile.verification.otpExpires = undefined;
      await profile.save();
      console.error("SendGrid Error:", err);
      return res.status(500).json({ message: 'Failed to send email. Ensure valid address.' });
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

    if (
      !profile.verification.otp ||
      profile.verification.otp !== otp ||
      profile.verification.otpExpires < Date.now()
    ) {
      return res.status(400).json({ message: 'Invalid or Expired OTP' });
    }

    // Mark as Verified
    profile.verification.isVerified = true;
    profile.verification.status = 'verified';
    profile.verification.otp = undefined; 
    profile.verification.otpExpires = undefined;

    // --- SYNC: TRUST SCORE UPDATE ---
    // User verify hote hi Trust Score jump karega (+200 points)
    const newScore = await calculateTrustScore(req.user.id);
    profile.trustScore = newScore;
    // --------------------------------

    await profile.save();
    
    // Update User Model (Global Flag)
    await User.findByIdAndUpdate(req.user.id, { isVerified: true });

    res.status(200).json({ 
        message: 'Student Verified Successfully!', 
        isVerified: true,
        newTrustScore: newScore // Frontend can update UI immediately
    });

  } catch (error) {
    logger.error(`Verification Confirm Error: ${error.message}`);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ... (Baaki Recruiter KYC & Report logic same rahega jo last working file mein tha)
// ... (Main bas upar ka part replace karne ko bol raha hu)

// Paste Recruiter KYC, Report, SearchRegistry, GetKYCStatus functions below exactly as they were.
// (Agar chahiye to main puri file wapas de sakta hu, par logic change sirf upar hua hai).
exports.submitKYC = async (req, res) => {
  try {
    const { companyName, businessRegNumber } = req.body;
    if (!req.file) return res.status(400).json({ message: 'Document proof is required' });

    const existing = await KYCRequest.findOne({ user: req.user._id, status: { $in: ['pending', 'Pending'] } });
    if(existing) return res.status(400).json({ message: 'Verification request already pending.' });

    const newKYC = await KYCRequest.create({
      user: req.user._id,
      companyName,
      businessRegNumber,
      documentUrl: req.file.path,
      status: 'pending' 
    });
    res.status(201).json({ message: 'KYC Submitted.', kyc: newKYC });
  } catch (error) {
    console.error(`KYC Error: ${error.message}`);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.reportUser = async (req, res) => {
  try {
    const { reportedUserId, reason, description } = req.body;
    await AbuseReport.create({ reporter: req.user._id, reportedUser: reportedUserId, reason, description });
    
    // SYNC: Recalculate score of reported user
    const newScore = await calculateTrustScore(reportedUserId);
    await Profile.findOneAndUpdate({ user: reportedUserId }, { trustScore: newScore });
    
    res.status(201).json({ message: 'Report submitted.' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.searchRegistry = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: 'Query required' });
    const user = await User.findOne({ $or: [{ _id: q.match(/^[0-9a-fA-F]{24}$/) ? q : null }, { username: q }] }).select('name username isVerified role avatar createdAt');
    if (!user) return res.status(404).json({ message: 'Entity not found' });
    const profile = await Profile.findOne({ user: user._id }).select('trustScore identity');
    res.json({ user, trustScore: profile ? profile.trustScore : 0, joinedAt: user.createdAt, status: user.isVerified ? 'VERIFIED' : 'UNVERIFIED' });
  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

exports.getKYCStatus = async (req, res) => {
  try {
    const kyc = await KYCRequest.findOne({ user: req.user.id }).sort({ createdAt: -1 });
    if (!kyc) return res.json({ status: 'not_submitted' });
    res.json({ status: kyc.status, adminComments: kyc.adminComments, submittedAt: kyc.createdAt });
  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};