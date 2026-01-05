const Profile = require('../models/Profile');
const User = require('../models/User');
const AbuseReport = require('../models/AbuseReport');
const Certificate = require('../models/Certificate');
const KYCRequest = require('../models/KYCRequest');

/**
 * Calculates Trust Score (0-1000)
 * SYNC STRATEGY: Call this function whenever:
 * 1. User Verifies Email
 * 2. User Adds Certificate
 * 3. User Completes Profile
 * 4. User is Reported
 */
const calculateTrustScore = async (userId) => {
  try {
    let score = 300; // Base Score

    // 1. FETCH DATA
    const user = await User.findById(userId);
    const profile = await Profile.findOne({ user: userId });
    const certCount = await Certificate.countDocuments({ user: userId, isVerified: true }); // Only Verified Certs count? (Optional logic)
    // Note: If you want ALL certs to count, remove isVerified: true. Currently counting all for now:
    const totalCertCount = await Certificate.countDocuments({ user: userId });
    
    const reportCount = await AbuseReport.countDocuments({ reportedUser: userId, status: 'Resolved' });
    const approvedKYC = await KYCRequest.findOne({ user: userId, status: 'approved' });

    if (!user || !profile) return 0;

    // 2. EXTRACT SAFELY (Using Optional Chaining ?.)
    const identity = profile.identity || {};
    const academicDetails = profile.academicDetails || {};
    const socialLinks = profile.socialLinks || {};
    const skills = profile.skills || {};

    // --- POSITIVE FACTORS ---

    // A. Verification (+200)
    if (user.isVerified) score += 200;
    if (approvedKYC) score += 300; // Recruiter Boost

    // B. Identity Completeness
    if (identity.avatar) score += 30;
    if (identity.bio && identity.bio.length > 50) score += 30;
    if (socialLinks.linkedin) score += 50;
    
    // C. Academic Data
    if (academicDetails.collegeName) score += 50;
    if (academicDetails.rollNumber) score += 50;

    // D. Skills
    if (skills.technical && skills.technical.length > 3) score += 50;

    // E. Certificates (Sync Logic)
    // 50 Points per Certificate (Max 250)
    score += Math.min(totalCertCount * 50, 250);

    // F. Account Age
    const daysOld = (Date.now() - user.createdAt) / (1000 * 60 * 60 * 24);
    if (daysOld > 365) score += 50;

    // --- NEGATIVE FACTORS ---

    // G. Abuse Reports
    score -= (reportCount * 150);

    // H. Suspicious History
    if (user.failedLoginAttempts > 10) score -= 50;
    if (user.isFrozen) score -= 500;

    // 3. CLAMPING
    if (score > 1000) score = 1000;
    if (score < 0) score = 0;

    return Math.round(score);

  } catch (error) {
    console.error("Trust Calculation Error:", error);
    return 300; // Return Base Score on error to prevent blocking
  }
};

module.exports = calculateTrustScore;