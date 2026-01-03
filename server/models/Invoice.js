const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  plan: { type: String, required: true },
  status: { type: String, enum: ['paid', 'failed', 'pending'], default: 'paid' },
  transactionId: { type: String }, // Stripe/Razorpay ID
  invoiceDate: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('Invoice', invoiceSchema);