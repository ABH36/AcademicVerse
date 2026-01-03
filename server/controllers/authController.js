const crypto = require('crypto'); 
const jwt = require('jsonwebtoken');
const argon2 = require('argon2');
const User = require('../models/User');
const Profile = require('../models/Profile');
const generateToken = require('../utils/generateToken'); 
const logger = require('../utils/logger');

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Days
};

// @desc    Register a new user
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, username } = req.body;

    // 1. Input Validation
    if (!name || !email || !password || !username) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // 2. Uniqueness Check
    const [userExists, usernameExists] = await Promise.all([
      User.findOne({ email }),
      User.findOne({ username })
    ]);

    if (userExists) return res.status(400).json({ message: 'Email already registered' });
    if (usernameExists) return res.status(400).json({ message: 'Username is taken' });

    // 🔥 FIX IS HERE: Hash password before saving
    const hashedPassword = await argon2.hash(password);

    // 3. Create User
    const user = await User.create({
      name,
      email,
      password: hashedPassword, // Save the HASH, not plain text
      username: username.toLowerCase()
    });

    if (user) {
      // 4. Create Profile Shell
      await Profile.create({
        user: user._id,
        identity: { name: user.name, role: 'student' },
        privacySettings: { publicProfileEnabled: true }
      });

      // 5. Generate Tokens
      const { accessToken, refreshToken } = generateToken(req, user._id);

      // 6. Persist Refresh Token to DB
      user.refreshToken = refreshToken;
      await user.save();

      // 7. Set Cookie
      res.cookie('jwt', refreshToken, cookieOptions);

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        accessToken
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    logger.error(`Register Error: ${error.message}`);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Login user & get token
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    // Note: We need password field which might be selected: false by default in model
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    if (user.isFrozen) {
      return res.status(403).json({ message: 'Account is frozen. Contact Admin.' });
    }

    // Verify Password
    // Ab ye chalega kyunki DB mein hash stored hoga (start with $)
    const isMatch = await argon2.verify(user.password, password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    // 1. Generate Tokens
    const { accessToken, refreshToken } = generateToken(req, user._id);

    // 2. Persist to DB
    user.refreshToken = refreshToken;
    await user.save();

    // 3. Set Cookie
    res.cookie('jwt', refreshToken, cookieOptions);

    logger.info(`User Login: ${email}`);

    res.json({
      success: true,
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    });

  } catch (error) {
    logger.error(`Login Error: ${error.message}`);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Logout user
exports.logoutUser = async (req, res) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204);

    const refreshToken = cookies.jwt;
    const user = await User.findOne({ refreshToken });

    if (user) {
      user.refreshToken = null; 
      await user.save();
    }

    res.clearCookie('jwt', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error(`Logout Error: ${error.message}`);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Refresh Token Rotation
exports.refreshAccessToken = async (req, res) => {
    try {
        const cookies = req.cookies;
        if (!cookies?.jwt) return res.status(401).json({ message: 'Unauthorized' });

        const incomingRefreshToken = cookies.jwt;
        res.clearCookie('jwt', { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' });

        const user = await User.findOne({ refreshToken: incomingRefreshToken });

        if (!user) {
            try {
                const decoded = jwt.verify(incomingRefreshToken, process.env.JWT_REFRESH_SECRET);
                const hackedUser = await User.findById(decoded.id);
                if (hackedUser) {
                    hackedUser.refreshToken = null;
                    await hackedUser.save();
                    logger.warn(`Token Reuse Detected! Session killed for ${hackedUser.email}`);
                }
            } catch (err) {}
            return res.sendStatus(403);
        }

        jwt.verify(incomingRefreshToken, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
            if (err || user._id.toString() !== decoded.id) return res.sendStatus(403);

            const userAgent = req.headers['user-agent'] || 'unknown';
            const currentUaHash = crypto.createHash('sha256').update(userAgent).digest('hex');
            
            if (decoded.ua && decoded.ua !== currentUaHash) {
                 logger.warn(`Session Hijack: UA Mismatch for ${user.email}`);
                 return res.sendStatus(403);
            }

            const { accessToken, refreshToken: newRefreshToken } = generateToken(req, user._id);

            user.refreshToken = newRefreshToken;
            await user.save();

            res.cookie('jwt', newRefreshToken, cookieOptions);
            res.json({ accessToken });
        });
    } catch (error) {
        logger.error(`Refresh Error: ${error.message}`);
        res.status(401).json({ message: 'Not authorized' });
    }
};