const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true, // One profile per user
    index: true,
  },
  avatar: {
    type: String, // Cloudinary URL
    default: '',
  },
  avatarPublicId: {
    type: String, // Needed to delete image from Cloudinary later
    default: '',
  },
  bio: {
    type: String,
    maxlength: [300, 'Bio cannot exceed 300 characters'],
    trim: true,
  },
  skills: {
    technical: [String],
    soft: [String]
  },
  // Social Identity
  socialLinks: {
    linkedin: { type: String, default: '' },
    github: { type: String, default: '' },
    website: { type: String, default: '' },
    instagram: { type: String, default: '' },
  },
  // NEW FIELD: Phase-6 Privacy Controls
  privacySettings: {
    showCGPA: { type: Boolean, default: true },
    showContactInfo: { type: Boolean, default: false }, // Email/Phone hidden by default
    showBadges: { type: Boolean, default: true },
    publicProfileEnabled: { type: Boolean, default: true }, // Master toggle
  },
  // NEW: Phase-7 Theme Engine Data
  themeSettings: {
    currentTheme: { 
      type: String, 
      enum: ['modern-dark', 'cyber-future', 'professional-light', 'glassmorphism'], 
      default: 'modern-dark' 
    },
    analytics: {
    profileViews: { type: Number, default: 0 },
    lastViewed: { type: Date },
    searchAppearances: { type: Number, default: 0 } // Future use
  },
    accentColor: { type: String, default: '#3B82F6' }, // Default Blue
    enableAnimations: { type: Boolean, default: true }, // Motion Engine toggle
    enableSounds: { type: Boolean, default: true }, // UI Sound effects
    reducedMotion: { type: Boolean, default: false } // Accessibility override
  },
  // Academic Identity (Foundation)
  academicDetails: {
    collegeName: { type: String }, 
    branch: { type: String },      
    batchYear: { type: String },
    rollNumber: { type: String },  
    cgpa: { type: Number },
    currentSemester: { type: Number }
  },
  // Verification System (Phase 1 Requirement)
  verification: {
    isVerified: { type: Boolean, default: false }, // The "Blue Tick" status
    status: { 
      type: String, 
      enum: ['unverified', 'pending', 'verified', 'rejected'], 
      default: 'unverified' 
    },
    academicEmail: { type: String }, // The .edu / .ac.in email
    otp: { type: String }, // Hashed or plain (Plain for simplicity in MVP)
    otpExpires: { type: Date }
  },
  adminComments: {
    type: String, // If verification rejected, admin explains why
    default: '',
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Profile', profileSchema);