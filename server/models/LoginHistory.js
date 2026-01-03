const mongoose = require('mongoose');

const loginHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ipAddress: { type: String },
  browser: { type: String },
  os: { type: String },
  device: { type: String }, // Mobile, Tablet, Console, SmartTV, Wearable, Embedded
  city: { type: String },
  country: { type: String },
  loginStatus: { 
    type: String, 
    enum: ['Success', 'Failed'], 
    required: true 
  },
  failureReason: { type: String }, // Wrong Password, Account Locked, etc.
  timestamp: {
    type: Date,
    default: Date.now,
    expires: 60 * 60 * 24 * 30 // Auto-delete logs after 30 days (Data Management)
  }
});

module.exports = mongoose.model('LoginHistory', loginHistorySchema);