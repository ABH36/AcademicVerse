const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const generateToken = (req, userId) => {
  // 1. Create Access Token (Short Lived: 15m)
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });

  // 2. Create Refresh Token (Long Lived: 7d) + UA Fingerprint
  const userAgent = req.headers['user-agent'] || 'unknown';
  const uaHash = crypto.createHash('sha256').update(userAgent).digest('hex');

  const refreshToken = jwt.sign(
    { id: userId, ua: uaHash }, 
    process.env.JWT_REFRESH_SECRET, 
    { expiresIn: '7d' }
  );

  // Return raw strings only
  return { accessToken, refreshToken };
};

module.exports = generateToken;