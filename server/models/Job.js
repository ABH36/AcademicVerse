const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  recruiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: {
    name: { type: String, required: true },
    logo: { type: String }, // URL
    website: { type: String }
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  requirements: { type: [String] }, 
  type: {
    type: String,
    enum: ['Full-Time', 'Part-Time', 'Contract', 'Internship', 'Remote'],
    required: true
  },
  location: { type: String, required: true },
  salary: {
    min: { type: Number },
    max: { type: Number },
    currency: { type: String, default: 'INR' }
  },
  applicantsCount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['active', 'closed', 'paused', 'flagged'], // Added 'flagged'
    default: 'active'
  },
  
  // Filtering Criteria
  minTrustScore: { type: Number, default: 0 },
  verifiedOnly: { type: Boolean, default: false },

  // PHASE-15C: TRUST AUTHORITY LAYER
  trustProfile: {
    riskScore: { type: Number, default: 0 },
    flags: [{ type: String }],
    isVerifiedCompany: { type: Boolean, default: false } // Admin verified
  },
  
  reports: { type: Number, default: 0 } // Count of student reports

}, {
  timestamps: true
});

module.exports = mongoose.model('Job', jobSchema);