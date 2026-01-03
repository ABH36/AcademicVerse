const Profile = require('../models/Profile');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const logger = require('../utils/logger');

// @desc    Get current user's profile
// @route   GET /api/profile/me
// @access  Private
exports.getCurrentProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id })
      .populate('user', ['name', 'email', 'role', 'isVerified']); // Join data from User model

    if (!profile) {
      return res.status(404).json({ message: 'There is no profile for this user' });
    }

    res.json(profile);
  } catch (error) {
    logger.error(`Get Profile Error: ${error.message}`);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update Theme & UI Preferences (Hardened)
// @route   PUT /api/profile/theme
exports.updateThemeSettings = async (req, res) => {
  try {
    const { currentTheme, accentColor, enableAnimations, enableSounds, reducedMotion } = req.body;

    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    // Update Theme Selection
    if (currentTheme) {
        // Optional: Validate against enum list here if strictness needed
        profile.themeSettings.currentTheme = currentTheme;
    }

    // LOCK-IN 1: Hex Color Validation (Security & UI Integrity)
    if (accentColor) {
        if (!/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test(accentColor)) {
            return res.status(400).json({ message: 'Invalid accent color format. Use Hex (e.g., #3B82F6).' });
        }
        profile.themeSettings.accentColor = accentColor;
    }
    
    // Update Booleans
    if (enableAnimations !== undefined) profile.themeSettings.enableAnimations = enableAnimations;
    if (enableSounds !== undefined) profile.themeSettings.enableSounds = enableSounds;
    if (reducedMotion !== undefined) profile.themeSettings.reducedMotion = reducedMotion;

    // LOCK-IN 2: Accessibility Override (Legal Compliance)
    // If user requests reduced motion, we MUST disable animations/sounds
    if (profile.themeSettings.reducedMotion === true) {
        profile.themeSettings.enableAnimations = false;
        profile.themeSettings.enableSounds = false;
    }

    await profile.save();
    
    // Return settings
    res.json(profile.themeSettings);

  } catch (error) {
    logger.error(`Theme Update Error: ${error.message}`);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create or Update user profile
// @route   POST /api/profile
// @access  Private
exports.createOrUpdateProfile = async (req, res) => {
  try {
    const {
      bio,
      collegeName,
      branch,
      batchYear,
      rollNumber,
      linkedin,
      github,
      website,
      instagram
    } = req.body;

    // 1. Build Profile Object
    const profileFields = {
      user: req.user.id,
      bio,
      academicDetails: {
        collegeName,
        branch,
        batchYear,
        rollNumber,
      },
      socialLinks: {
        linkedin,
        github,
        website,
        instagram
      }
    };

    // 2. Handle Profile Photo Upload (If a file exists)
    if (req.file) {
      // Check if user already has a profile with an old image
      const existingProfile = await Profile.findOne({ user: req.user.id });

      if (existingProfile && existingProfile.avatarPublicId) {
        // CLEANUP: Delete old image from Cloudinary to save space
        await cloudinary.uploader.destroy(existingProfile.avatarPublicId);
      }

      // Add new image data
      profileFields.avatar = req.file.path; // Cloudinary URL
      profileFields.avatarPublicId = req.file.filename; // Cloudinary ID
    }

    // 3. Update or Create (Upsert)
    let profile = await Profile.findOne({ user: req.user.id });

    if (profile) {
      // Update
      profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true }
      );
      logger.info(`Profile Updated: ${req.user.id}`);
      return res.json(profile);
    }

    // Create
    profile = new Profile(profileFields);
    await profile.save();
    logger.info(`Profile Created: ${req.user.id}`);
    res.json(profile);

  } catch (error) {
    logger.error(`Profile Save Error: ${error.message}`);
    res.status(500).json({ message: 'Server Error' });
  }
};