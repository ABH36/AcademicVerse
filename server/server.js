const express = require('express');
const dotenv = require('dotenv');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const logger = require('./utils/logger');

// --- SECURITY PACKAGES (Phase-19A) ---
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const { globalLimiter } = require('./middleware/verifyLimiter'); // Centralized Limiter

// Route Imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const profileRoutes = require('./routes/profileRoutes');
const academicRoutes = require('./routes/academicRoutes');
const projectRoutes = require('./routes/projectRoutes');
const skillRoutes = require('./routes/skillRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const publicRoutes = require('./routes/publicRoutes');
const adminRoutes = require('./routes/adminRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
// Phase-16: Subscription Import
const subscriptionRoutes = require('./routes/subscriptionRoutes'); 

// Load env vars
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// PRODUCTION HARDENING: Trust Proxy
// Required for Rate Limiting & Cookies to work behind Render/Vercel Load Balancers
app.set('trust proxy', 1);

// ============================================
// 🛡️ SECURITY MIDDLEWARE STACK (Phase-19A)
// ============================================

// 1. Set Security HTTP Headers
app.use(helmet());

// 2. Body Parser with Size Limit (Prevent DoS)
app.use(express.json({ limit: '10kb' })); 
app.use(cookieParser());

// 3. Data Sanitization against NoSQL Query Injection
app.use(mongoSanitize());

// 4. Data Sanitization against XSS (Cross-Site Scripting)
app.use(xss());

// 5. Prevent HTTP Parameter Pollution
app.use(hpp());

// 6. Global Rate Limiter (Applied to all API routes)
// Replaces the old inline limiter code
app.use('/api', globalLimiter);

// ============================================

// PRODUCTION CORS SETUP (Phase-10 Requirement)
const allowedOrigins = [
  'http://localhost:5173',      // Vite Local Dev (Port 5173)
  'http://localhost:5174',      // Vite Local Dev (Port 5174 - Backup)
  process.env.CLIENT_URL,       // Production Vercel URL
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true, // Vital for HttpOnly Cookies (Refresh Token)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));

// MOUNT ROUTES
app.use('/api/auth', authRoutes);         // Phase-0
app.use('/api/users', userRoutes);        // Phase-0
app.use('/api/profile', profileRoutes);   // Phase-1 & 7
app.use('/api/academic', academicRoutes); // Phase-2
app.use('/api/projects', projectRoutes);  // Phase-3
app.use('/api/skills', skillRoutes);      // Phase-4
app.use('/api/certificates', certificateRoutes); // Phase-5
app.use('/api/public', publicRoutes);     // Phase-6
app.use('/api/admin', adminRoutes);       // Phase-9
app.use('/api/verify', require('./routes/verificationRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/analytics', analyticsRoutes);
app.use('/api/subscription', subscriptionRoutes); // Phase-16: Monetization Layer

// Base Route (Health Check)
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'AcademicVerse Core API Online', 
    environment: process.env.NODE_ENV,
    security: 'Phase-19A Hardened',
    timestamp: new Date()
  });
});

// Global Error Handling
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ success: false, error: 'Server Error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});