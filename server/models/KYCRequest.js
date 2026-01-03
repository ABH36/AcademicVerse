const mongoose = require('mongoose');

const kycSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyName: { type: String, required: true },
  businessRegNumber: { type: String, required: true },
  documentUrl: { type: String, required: true }, // URL to uploaded file
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  adminComments: { type: String },
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('KYCRequest', kycSchema);