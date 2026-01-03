const mongoose = require('mongoose');

const skillItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  level: { 
    type: String, 
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Beginner'
  },
  endorsements: { type: Number, default: 0 },
}, { _id: false });

const badgeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  icon: { type: String, required: true },
  issuedBy: { type: String, default: 'AcademicVerse System' },
  issuedDate: { type: Date, default: Date.now },
  description: { type: String }
}, { _id: false });

const skillProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  technicalSkills: [skillItemSchema],
  softSkills: [skillItemSchema],
  badges: [badgeSchema],
  
  // Verification Request Status (Admin System)
  verificationRequest: {
    status: { type: String, enum: ['none', 'pending', 'approved', 'rejected'], default: 'none' },
    requestDate: { type: Date },
    lastRequestedAt: { type: Date }, // LOCK-IN 4: Anti-Spam Tracking
    adminComments: { type: String }
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Skill', skillProfileSchema);