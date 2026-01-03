const Application = require('../models/Application');

/**
 * Analyzes an application attempt for fraud signals.
 * @param {string} userId - The applicant's ID
 * @param {number} trustScore - The applicant's current trust score
 * @param {boolean} isVerified - Is the applicant identity verified
 */
const analyzeApplicationRisk = async (userId, trustScore, isVerified) => {
    const flags = [];
    let riskScore = 0;

    // 1. VELOCITY CHECK (Rapid Apply Abuse)
    // Check how many apps in the last 1 hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentApps = await Application.countDocuments({
        applicant: userId,
        createdAt: { $gte: oneHourAgo }
    });

    if (recentApps > 10) {
        flags.push('RAPID_APPLY_ABUSE'); // Applying to >10 jobs/hr
        riskScore += 50;
    } else if (recentApps > 5) {
        flags.push('HIGH_VELOCITY'); // Applying quickly
        riskScore += 20;
    }

    // 2. TRUST & QUALITY CHECK
    if (!isVerified) {
        // Unverified accounts are slightly riskier
        riskScore += 10;
    }

    if (trustScore < 20) {
        flags.push('LOW_QUALITY_PROFILE');
        riskScore += 40;
    } else if (trustScore < 40) {
        flags.push('UNVERIFIED_HISTORY');
        riskScore += 15;
    }

    // 3. CAP RISK
    if (riskScore > 100) riskScore = 100;

    return {
        riskScore,
        flags,
        isSuspicious: riskScore >= 50
    };
};

module.exports = { analyzeApplicationRisk };