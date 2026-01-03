const User = require('../models/User');
const Profile = require('../models/Profile');
const AcademicRecord = require('../models/AcademicRecord');
const Skill = require('../models/Skill');
const Project = require('../models/Project');
const Certificate = require('../models/Certificate');
const logger = require('../utils/logger');
const calculateTrustScore = require('../utils/trustEngine'); // Phase-13B: Trust Engine

// @desc    Get Public Profile by Username (Aggregator Engine)
// @route   GET /api/public/u/:username
// @access  Public
exports.getPublicProfile = async (req, res) => {
  try {
    const { username } = req.params;

    // 1. Find User (Lightweight check)
    const user = await User.findOne({ username }).select('name email role isFrozen createdAt');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isFrozen) {
      return res.status(403).json({ message: 'This profile is currently unavailable.' });
    }

    // 2. Fetch All Data in Parallel (High Performance)
    // We fetch EVERYTHING, then filter based on privacy settings below
    const [profile, academic, skills, projects, certificates] = await Promise.all([
      Profile.findOne({ user: user._id }),
      AcademicRecord.findOne({ user: user._id }),
      Skill.findOne({ user: user._id }),
      Project.find({ user: user._id, isPublic: true }).sort({ createdAt: -1 }), // Only Public Projects
      Certificate.find({ user: user._id, isVerified: true }).sort({ issueDate: -1 }) // Only Verified Certs (Trust Layer)
    ]);

    // 3. Master Privacy Check
    if (!profile || !profile.privacySettings.publicProfileEnabled) {
      return res.status(404).json({ message: 'Profile is private or not set up.' });
    }

    // 4. ANALYTICS ENGINE (Phase-11D)
    try {
        profile.analytics.profileViews = (profile.analytics.profileViews || 0) + 1;
        profile.analytics.lastViewed = new Date();
        await profile.save({ validateBeforeSave: false }); // Lightweight save
    } catch (analyticsErr) {
        logger.warn(`Analytics update failed for ${username}: ${analyticsErr.message}`);
    }

    // 5. TRUST & CREDIBILITY ENGINE (Phase-13B) [New Integration]
    // We convert Mongoose docs to Objects to ensure clean data passage
    const fullProfileForCalc = {
        ...profile.toObject(),
        skills: skills ? skills.toObject() : {},
        academicDetails: academic ? academic.toObject() : {},
        projects: projects || [],
        certificates: certificates || []
    };
    
    // Calculate Score dynamically
    const trustData = calculateTrustScore(fullProfileForCalc);

    // 6. Construct Public View (The Recruiter JSON)
    const publicView = {
      identity: {
        name: user.name,
        avatar: profile.avatar,
        bio: profile.bio,
        joinedAt: user.createdAt,
        role: user.role,
        // Verified Trust Badge Data
        verification: {
            isVerified: profile.verification?.isVerified || false,
            trustScore: trustData.score,
            trustTier: trustData.tier
        }
      },
      // Theme Data (Sanitized - Phase-7 Lock-in)
      theme: {
        currentTheme: profile.themeSettings.currentTheme,
        accentColor: profile.themeSettings.accentColor,
        enableAnimations: profile.themeSettings.enableAnimations
      },
      socials: profile.socialLinks,
      academic: null, // Populated below based on privacy
      skills: skills || { technicalSkills: [], softSkills: [], badges: [] },
      projects: projects || [],
      certificates: certificates || []
    };

    // 7. Apply Granular Privacy Filters
    if (academic) {
      if (profile.privacySettings.showCGPA) {
        // Case A: Full Transparency
        publicView.academic = academic;
      } else {
        // Case B: Privacy Mode (Strip Grades & Proofs)
        const sanitizedSemesters = academic.semesters.map(sem => ({
            semesterNumber: sem.semesterNumber,
            status: sem.status,
            subjects: sem.subjects.map(sub => ({ name: sub.name, code: sub.code })) // Grades hidden
        }));
        
        // Hide Timeline Proofs if CGPA is hidden (Privacy Lock-in)
        const sanitizedTimeline = academic.timeline.map(ev => ({
            title: ev.title,
            description: ev.description,
            category: ev.category,
            date: ev.date,
            icon: ev.icon
            // proofUrl EXCLUDED intentionally
        }));

        publicView.academic = {
            ...academic.toObject(),
            currentCgpa: null, // HIDDEN
            totalBacklogs: null, // HIDDEN
            semesters: sanitizedSemesters,
            timeline: sanitizedTimeline 
        };
      }
    }

    // Privacy: Contact Info
    if (profile.privacySettings.showContactInfo) {
      publicView.identity.email = user.email;
    }

    res.json(publicView);

  } catch (error) {
    logger.error(`Public Profile Error: ${error.message}`);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update Privacy Settings
// @route   PUT /api/public/privacy
// @access  Private
exports.updatePrivacy = async (req, res) => {
  try {
    const { showCGPA, showContactInfo, publicProfileEnabled } = req.body;

    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    if (showCGPA !== undefined) profile.privacySettings.showCGPA = showCGPA;
    if (showContactInfo !== undefined) profile.privacySettings.showContactInfo = showContactInfo;
    if (publicProfileEnabled !== undefined) profile.privacySettings.publicProfileEnabled = publicProfileEnabled;

    await profile.save();
    res.json(profile.privacySettings);

  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Set Username (Hardened - Phase-6 Lock-in)
// @route   PUT /api/public/username
// @access  Private
exports.setUsername = async (req, res) => {
    try {
        const { username } = req.body;
        
        // Regex Validation (Alphanumeric + Underscore, 3-20 chars)
        if (!/^[a-z0-9_]{3,20}$/.test(username)) {
            return res.status(400).json({ message: 'Invalid username format (3-20 chars, lowercase letters, numbers, _)' });
        }

        const user = await User.findById(req.user.id);
        const profile = await Profile.findOne({ user: req.user.id });

        // LOCK-IN: Username Takeover Protection
        // If username is already set AND profile is publicly live, prevent change.
        if (user.username && profile && profile.privacySettings.publicProfileEnabled) {
            return res.status(403).json({ message: 'Username is locked because your public profile is live. Disable public profile to change it.' });
        }

        // Check availability
        const exists = await User.findOne({ username });
        if (exists && exists._id.toString() !== req.user.id) {
            return res.status(400).json({ message: 'Username is already taken' });
        }

        user.username = username;
        await user.save();

        res.json({ message: 'Username updated', username });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};