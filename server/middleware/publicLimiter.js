const rateLimit = require('express-rate-limit');

const publicLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, // Limit each IP to 100 profile views per window
  message: {
    message: 'Too many profile views. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = publicLimiter;