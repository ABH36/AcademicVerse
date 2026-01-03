const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resume: { type: String }, 
  coverLetter: { type: String },
  
  // SNAPSHOT DATA
  trustSnapshot: {
    score: Number,
    tier: String,
    isVerified: Boolean
  },

  // PHASE-14B-II: EXTENDED LIFECYCLE (Updated with 'flagged')
  status: {
    type: String,
    enum: ['applied', 'shortlisted', 'interview', 'offered', 'hired', 'rejected', 'withdrawn', 'flagged'],
    default: 'applied'
  },

  // PHASE-14B-II: INTERVIEW ENGINE
  interview: {
    type: { type: String, enum: ['online', 'offline'] },
    link: { type: String },       // Zoom/Meet URL
    venue: { type: String },      // Physical Address
    datetime: { type: Date },
    message: { type: String },    // Instructions
    scheduledAt: { type: Date }
  },
  
  recruiterNotes: { type: String },

  // PHASE-15B: FRAUD & INTELLIGENCE LAYER (NEW)
  riskProfile: {
    riskScore: { type: Number, default: 0 }, // 0 (Safe) to 100 (High Risk)
    flags: [{ type: String }], // e.g., ["RAPID_APPLY", "LOW_TRUST"]
    isSuspicious: { type: Boolean, default: false }
  }

}, {
  timestamps: true
});

// Prevent double application (Existing)
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

// Velocity Check Index (NEW for Phase-15B)
// Helps find how many jobs a user applied to recently
applicationSchema.index({ applicant: 1, createdAt: -1 });

module.exports = mongoose.model('Application', applicationSchema);