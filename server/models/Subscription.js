const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  plan: { 
    type: String, 
    enum: ['free', 'pro', 'academic_plus'], 
    default: 'free' 
  },
  status: { type: String, enum: ['active', 'past_due', 'canceled'], default: 'active' },
  validUntil: { type: Date },
  stripeCustomerId: { type: String }, // Placeholder for Stripe
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);