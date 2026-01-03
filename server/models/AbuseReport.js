const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    enum: ['Spam', 'Fake Profile', 'Scam', 'Harassment', 'Other'],
    required: true
  },
  description: { type: String },
  status: {
    type: String,
    enum: ['Open', 'Resolved', 'Dismissed'],
    default: 'Open'
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AbuseReport', reportSchema);