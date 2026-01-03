const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'academicverse-core' },
  transports: [
    // Error logs
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    // Combined logs
    new winston.transports.File({ filename: 'logs/audit.log' }),
  ],
});

// If not in production, log to console as well
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

module.exports = logger;