/**
 * Calculates the Credibility Score (0-100) based on verified data points.
 * @param {Object} profile - The user profile object
 * @returns {Object} { score, tier, breakdown }
 */
const calculateTrustScore = (profile) => {
  let score = 0;
  const breakdown = [];

  // 1. SAFEGUARD: Agar profile null/undefined hai to turant return karo
  if (!profile) {
    return { score: 0, tier: 'Unverified', breakdown: [] };
  }

  // 2. EXTRACT SAFELY: Har object ke liye fallback {} lagaya hai
  // Isse 'Cannot read properties of undefined' wala error kabhi nahi aayega
  const identity = profile.identity || {};
  const verification = profile.verification || {};
  const academicDetails = profile.academicDetails || {};
  const socialLinks = profile.socialLinks || {};
  const skills = profile.skills || {};

  // --- SCORING LOGIC (Same as before) ---

  // 1. Core Verification (The Blue Tick) - 40 Points
  if (verification.isVerified) {
    score += 40;
    breakdown.push({ label: 'Academic Identity Verified', points: 40 });
  }

  // 2. Identity Completeness - 20 Points
  if (identity.avatar) score += 5;
  if (identity.bio && identity.bio.length > 50) score += 5;
  if (socialLinks.linkedin) score += 10;

  // 3. Academic Data - 20 Points
  if (academicDetails.collegeName) score += 10;
  if (academicDetails.rollNumber) score += 10; // Private but indicates seriousness

  // 4. Skills & Projects - 20 Points
  // Check if skills.technical exists AND has length
  if (skills.technical && skills.technical.length > 3) score += 10;
  
  // We assume projects array length is passed or populated in profile
  // For MVP, if skills exist, we give points.

  // Cap at 100
  if (score > 100) score = 100;

  // Determine Tier
  let tier = 'Unverified';
  if (score >= 90) tier = 'Elite';
  else if (score >= 70) tier = 'Gold';
  else if (score >= 40) tier = 'Verified';

  return { score, tier, breakdown };
};

module.exports = calculateTrustScore;