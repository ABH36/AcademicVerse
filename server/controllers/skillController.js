const Skill = require('../models/Skill');
const Profile = require('../models/Profile'); // Need Profile to update score
const logger = require('../utils/logger');

// --- SYNC FIX: Import Trust Engine ---
const calculateTrustScore = require('../utils/trustEngine'); 
// -------------------------------------

// @desc    Get My Skills
exports.getMySkills = async (req, res) => {
  try {
    let skillProfile = await Skill.findOne({ user: req.user.id });
    if (!skillProfile) {
      skillProfile = await Skill.create({ user: req.user.id, technicalSkills: [], softSkills: [] });
    }
    res.json(skillProfile);
  } catch (error) {
    logger.error(`Get Skills Error: ${error.message}`);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Add/Update Skills (Hardened + Synced)
// @route   POST /api/skills/update
exports.updateSkills = async (req, res) => {
  try {
    // Freeze Check
    if (req.user.isFrozen) {
      return res.status(403).json({ message: 'Account frozen.' });
    }

    const { type, name, level } = req.body;

    // LOCK-IN 1: Prevent Fake "Expert" Inflation
    if (level === 'Expert') {
      return res.status(403).json({ message: 'Expert level can only be assigned by Admin verification.' });
    }

    if (!['technical', 'soft'].includes(type)) {
      return res.status(400).json({ message: 'Invalid skill type' });
    }

    let skillProfile = await Skill.findOne({ user: req.user.id });
    if (!skillProfile) skillProfile = new Skill({ user: req.user.id });

    // LOCK-IN 3: Global Limit Check (Max 30 Skills Total)
    const totalSkills = skillProfile.technicalSkills.length + skillProfile.softSkills.length;
    
    const targetArray = type === 'technical' ? skillProfile.technicalSkills : skillProfile.softSkills;

    // LOCK-IN 2: Normalize Name (Avoid duplicates like "Python" vs " python ")
    const cleanName = name.trim(); 
    
    // Check if skill exists (Case Insensitive comparison)
    const existingIndex = targetArray.findIndex(
        s => s.name.toLowerCase() === cleanName.toLowerCase()
    );

    if (existingIndex > -1) {
      // Update Level
      targetArray[existingIndex].level = level;
      targetArray[existingIndex].name = cleanName; // Update casing if changed
    } else {
      // Add New Skill
      if (totalSkills >= 30) {
        return res.status(403).json({ message: 'Total skill limit reached (30 max).' });
      }
      targetArray.push({ name: cleanName, level });
    }

    await skillProfile.save();

    // ==================================================
    // 🔄 TRUST SYNC START: Recalculate Score
    // ==================================================
    // Skill Count affects Profile Completeness Score
    const newScore = await calculateTrustScore(req.user.id);
    await Profile.findOneAndUpdate({ user: req.user.id }, { trustScore: newScore });
    // ==================================================

    logger.info(`Skill Updated: ${cleanName} (${level}) for User ${req.user.id}`);
    res.json(skillProfile);

  } catch (error) {
    logger.error(`Update Skill Error: ${error.message}`);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Remove a Skill (Synced)
exports.deleteSkill = async (req, res) => {
  try {
    const { type, name } = req.params;
    
    let skillProfile = await Skill.findOne({ user: req.user.id });
    if (!skillProfile) return res.status(404).json({ message: 'Profile not found' });

    // LOCK-IN 2: Normalize for deletion lookup
    const cleanName = name.trim().toLowerCase();

    if (type === 'technical') {
      skillProfile.technicalSkills = skillProfile.technicalSkills.filter(
          s => s.name.toLowerCase() !== cleanName
      );
    } else if (type === 'soft') {
      skillProfile.softSkills = skillProfile.softSkills.filter(
          s => s.name.toLowerCase() !== cleanName
      );
    } else {
      return res.status(400).json({ message: 'Invalid type' });
    }

    await skillProfile.save();

    // ==================================================
    // 🔄 TRUST SYNC START: Recalculate Score
    // ==================================================
    // Skill removed -> Score adjust
    const newScore = await calculateTrustScore(req.user.id);
    await Profile.findOneAndUpdate({ user: req.user.id }, { trustScore: newScore });
    // ==================================================

    res.json(skillProfile);

  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};