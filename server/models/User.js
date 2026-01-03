const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true, // HARDENING: Always lowercase
    trim: true,      // HARDENING: Remove whitespace
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  username: {
    type: String,
    required: [true, 'Please add a username'],
    unique: true,
    lowercase: true,
    trim: true,
    minlength: 3,
    match: [/^[a-z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'],
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 8,
    select: false,
  },
  role: {
    type: String,
    enum: ['student', 'admin', 'recruiter'],
    default: 'student',
  },
  
  // PHASE-16: MONETIZATION LAYER
  subscription: {
    plan: { 
      type: String, 
      enum: ['FREE', 'PRO', 'ENTERPRISE'], 
      default: 'FREE' 
    },
    status: { type: String, enum: ['active', 'expired'], default: 'active' },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date }, // Null for FREE
    
    // Usage Tracking (Resets monthly)
    usage: {
      jobsPosted: { type: Number, default: 0 },
      interviewsScheduled: { type: Number, default: 0 }
    }
  },

  // PHASE-19B: ACCOUNT SECURITY FIELDS (Account Lockout)
  failedLoginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },

  collegeId: { type: String, default: null },
  isVerified: { type: Boolean, default: false },
  isFrozen: { type: Boolean, default: false },
  refreshToken: { type: String, select: false }
}, {
  timestamps: true,
});

// Helper method to validate password (Phase-0 Logic preserved)
// Note: Usually defined here or in controller. Assuming controller handles bcrypt compare.
// If you had methods here, keep them. If not, this schema is complete.

module.exports = mongoose.model('User', userSchema);