const Profile = require('../models/Profile');
const User = require('../models/User');
const AbuseReport = require('../models/AbuseReport');
const Certificate = require('../models/Certificate');
const KYCRequest = require('../models/KYCRequest'); // For Recruiters

/**
 * Calculates the Trust Score (0-1000) based on verified data points & behavioral history.
 * UPGRADED: Merges old profile logic with new DB-level intelligence.
 * @param {String} userId - The user ID to analyze
 * @returns {Number} score - Final Trust Score (0-1000)
 */
const calculateTrustScore = async (userId) => {
  try {
    let score = 300; // Base Score (New Baseline)

    // 1. FETCH DATA (Async Database Calls)
    const user = await User.findById(userId);
    const profile = await Profile.findOne({ user: userId });
    const certCount = await Certificate.countDocuments({ user: userId });
    const reportCount = await AbuseReport.countDocuments({ reportedUser: userId, status: 'Resolved' });
    const approvedKYC = await KYCRequest.findOne({ user: userId, status: 'Approved' });

    // SAFEGUARD: Agar user/profile nahi mila
    if (!user || !profile) return 0;

    // 2. EXTRACT SAFELY (Your Existing Logic Preserved)
    const identity = profile.identity || {};
    const academicDetails = profile.academicDetails || {};
    const socialLinks = profile.socialLinks || {};
    const skills = profile.skills || {};

    // --- POSITIVE FACTORS (Growth) ---

    // A. User Verification (Major Boost)
    if (user.isVerified) score += 200; // Old: 40 pts -> New: 200 pts
    if (approvedKYC) score += 300;     // Recruiter/Company Verified

    // B. Identity Completeness (Your Old Logic - Scaled x10)
    if (identity.avatar) score += 30;  // Old: 5
    if (identity.bio && identity.bio.length > 50) score += 30; // Old: 5
    if (socialLinks.linkedin) score += 50; // Old: 10
    
    // C. Academic Data (Your Old Logic - Scaled x10)
    if (academicDetails.collegeName) score += 50; // Old: 10
    if (academicDetails.rollNumber) score += 50;  // Old: 10

    // D. Skills & Projects (Your Old Logic - Scaled x10)
    if (skills.technical && skills.technical.length > 3) score += 50; // Old: 10

    // E. Certificates (New Intelligence)
    // Har certificate ke 50 points (Max 250)
    score += Math.min(certCount * 50, 250);

    // F. Account Age (Loyalty Bonus)
    const daysOld = (Date.now() - user.createdAt) / (1000 * 60 * 60 * 24);
    if (daysOld > 365) score += 50; // >1 Year old

    // --- NEGATIVE FACTORS (Fraud Engine) ---

    // G. Abuse Reports (Severe Penalty)
    score -= (reportCount * 150);

    // H. Suspicious History
    if (user.failedLoginAttempts > 10) score -= 50;
    if (user.isFrozen) score -= 500; // Account frozen means untrustworthy

    // 3. CLAMPING (Limit between 0 and 1000)
    if (score > 1000) score = 1000;
    if (score < 0) score = 0;

    return Math.round(score);

  } catch (error) {
    console.error("Trust Calculation Error:", error);
    return 0; // Fail safe
  }
};

module.exports = calculateTrustScore;