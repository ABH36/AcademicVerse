const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Certificate title is required'],
    trim: true,
  },
  issuingOrganization: {
    type: String,
    required: [true, 'Issuing organization is required'],
  },
  issueDate: {
    type: Date,
    required: true,
  },
  credentialUrl: {
    type: String, // Link to the original cert (e.g., Coursera/Udemy link)
    default: ''
  },
  imageUrl: {
    type: String, // Cloudinary URL of the uploaded image
    required: true,
  },
  verificationId: {
    type: String, // Unique UUID for QR generation
    required: true,
    unique: true,
  },
  isVerified: {
    type: Boolean,
    default: false, // Only true if Admin manually verifies
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Certificate', certificateSchema);