const mongoose = require('mongoose');

const emailOtpSchema = new mongoose.Schema({
  email: { 
      type: String, 
      required: true, 
      lowercase: true 
  },
  otp: { 
      type: String, 
      required: true 
  },
  expiresAt: { 
      type: Date, 
      required: true 
  }
});

// TTL Index: Automatically delete document when expiresAt is reached
emailOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('EmailOTP', emailOtpSchema);