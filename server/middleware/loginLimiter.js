const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // Limit each IP to 5 login requests per window
  message: {
    message: 'Too many login attempts from this IP, please try again after 10 minutes',
  },
  handler: (req, res, next, options) => {
    logger.warn(`Too many login attempts from IP: ${req.ip}`);
    res.status(options.statusCode).send(options.message);
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = loginLimiter;