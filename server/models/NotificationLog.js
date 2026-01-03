const mongoose = require('mongoose');

const notificationLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['interview', 'offer', 'rejection', 'hired', 'system'],
    required: true
  },
  emailTo: { type: String, required: true },
  subject: { type: String, required: true },
  status: {
    type: String,
    enum: ['sent', 'failed'],
    default: 'sent'
  },
  error: { type: String }, // If failed, store why
  metadata: { type: Object } // Store Job ID or Interview Details
}, {
  timestamps: true
});

module.exports = mongoose.model('NotificationLog', notificationLogSchema);