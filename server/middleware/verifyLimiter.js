const rateLimit = require('express-rate-limit');

// 1. GLOBAL LIMITER (General API protection - DDoS prevent)
// Har IP ko 15 minute mein max 100 requests allow karega
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});

// 2. AUTH LIMITER (Strict Protection for Login/Register)
// 1 ghante mein max 10 attempts (Brute force rokne ke liye)
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many login attempts, please try again after an hour'
  }
});

// 3. VERIFICATION LIMITER (Aapka purana wala)
// OTP/Email verification ke liye medium limit
const verifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, 
  max: 60, 
  message: {
    valid: false,
    message: 'Too many verification requests. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Sabko export kar dein
module.exports = {
  globalLimiter,
  authLimiter,
  verifyLimiter
};