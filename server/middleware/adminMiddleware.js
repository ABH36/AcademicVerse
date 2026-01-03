const logger = require('../utils/logger');

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    logger.warn(`Unauthorized Admin Access Attempt by User: ${req.user.id}`);
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

module.exports = { adminOnly };