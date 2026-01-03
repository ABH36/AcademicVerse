const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Student
  recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Recruiter being reported
  
  reason: { 
    type: String, 
    enum: ['scam', 'spam', 'abusive', 'fake_company', 'asking_money', 'other'],
    required: true 
  },
  description: { type: String },
  
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Report', reportSchema);