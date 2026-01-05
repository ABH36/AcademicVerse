const mongoose = require('mongoose');

const kycSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyName: { type: String, required: true },
  businessRegNumber: { type: String, required: true },
  documentUrl: { type: String, required: true }, 
  
  // FIX: Sab kuch lowercase kar diya
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending'
  },
  
  adminComments: { type: String },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('KYCRequest', kycSchema);