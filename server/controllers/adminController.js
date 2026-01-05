const User = require('../models/User');
const Profile = require('../models/Profile');
const Certificate = require('../models/Certificate');
const Job = require('../models/Job');       
const Report = require('../models/Report'); 
const Invoice = require('../models/Invoice');
// FIX 1: Import KYC Model
const KYCRequest = require('../models/KYCRequest'); 
const logger = require('../utils/logger');

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/stats
exports.getAdminStats = async (req, res) => {
  try {
    // 1. User Stats
    const totalUsers = await User.countDocuments();
    const students = await User.countDocuments({ role: 'student' });
    const recruiters = await User.countDocuments({ role: 'recruiter' });

    // 2. Pending Work Items
    const pendingCertificates = await Certificate.countDocuments({ isVerified: false });
    const pendingProfiles = await Profile.countDocuments({ verificationStatus: 'pending' });
    const pendingReports = await Report.countDocuments({ status: 'pending' });
    
    // FIX 2: Add Pending KYC Count
    const pendingKYC = await KYCRequest.countDocuments({ status: 'pending' });

    // 3. Platform Stats
    const totalJobs = await Job.countDocuments(); 
    
    // 4. Financial Stats
    const revenueAgg = await Invoice.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    res.json({
      users: { total: totalUsers, students, recruiters },
      workItems: { pendingCertificates, pendingProfiles, pendingReports, pendingKYC }, // Added pendingKYC
      platform: { totalJobs, totalRevenue },
      // Flattened for backward compatibility
      totalUsers, students, pendingCertificates, pendingProfiles 
    });

  } catch (error) {
    console.error("Admin Stats Error:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get All Users
// @route   GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const pageSize = 20;
    const page = Number(req.query.pageNumber) || 1;

    const count = await User.countDocuments({});
    const users = await User.find({})
      .select('-password') 
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({ users, page, pages: Math.ceil(count / pageSize) });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Advanced User Management
// @route   PATCH /api/admin/users/:id/action
exports.manageUser = async (req, res) => {
    try {
        const { action } = req.body; 
        const user = await User.findById(req.params.id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.role === 'admin') {
            return res.status(403).json({ message: 'Cannot modify Super Admin accounts.' });
        }

        switch (action) {
            case 'ban':
            case 'freeze':
                user.isFrozen = true; 
                break;
            case 'unban':
            case 'unfreeze':
                user.isFrozen = false;
                break;
            case 'verify_identity':
                const profile = await Profile.findOne({ user: user._id });
                if (profile) {
                    profile.verificationStatus = 'verified';
                    profile.verification.isVerified = true;
                    await profile.save();
                }
                user.isVerified = true; // Also update User model
                break;
            case 'verify_company':
                // Manual override for VIP recruiters
                if (user.role === 'recruiter') {
                    user.isVerified = true;
                    // user.subscription logic if needed
                }
                break;
            default:
                return res.status(400).json({ message: 'Invalid Action' });
        }

        await user.save();
        logger.info(`Admin ${req.user.id} performed ${action} on user ${user.email}`);
        
        res.json({ message: `Action ${action} successful`, user });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Action Failed' });
    }
};

// @desc    Legacy Toggle Freeze
// @route   PUT /api/admin/user/:id/freeze
exports.toggleUserFreeze = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Cannot freeze an Admin.' });

    user.isFrozen = !user.isFrozen;
    await user.save();

    logger.info(`Admin ${req.user.id} toggled freeze for user ${user.email} to ${user.isFrozen}`);
    res.json({ message: `User ${user.isFrozen ? 'Frozen' : 'Active'}`, isFrozen: user.isFrozen });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get Pending Certificates
// @route   GET /api/admin/certificates/pending
exports.getPendingCertificates = async (req, res) => {
  try {
    const certs = await Certificate.find({ isVerified: false })
      .populate('user', 'name email')
      .sort({ createdAt: 1 }); 
    res.json(certs);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Approve or Reject Certificate
// @route   PUT /api/admin/certificate/:id/verify
exports.verifyCertificate = async (req, res) => {
  try {
    const { status } = req.body; 
    const cert = await Certificate.findById(req.params.id);

    if (!cert) return res.status(404).json({ message: 'Certificate not found' });

    if (status === 'approved') {
      cert.isVerified = true;
      await cert.save();
      logger.info(`Certificate Approved: ${cert.title} for User ${cert.user}`);
      res.json({ message: 'Certificate Approved', cert });
    } else {
      await cert.deleteOne(); 
      logger.info(`Certificate Rejected/Deleted: ${cert.title}`);
      res.json({ message: 'Certificate Rejected and Removed' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// ============================================
// 🏢 NEW: KYC MANAGEMENT (RECRUITER APPROVAL)
// ============================================

// @desc    Get Pending KYC Requests
exports.getPendingKYC = async (req, res) => {
    try {
        console.log("Admin checking for pending KYCs..."); // Debug Log
        
        // FIX: Query for lowercase 'pending'
        const kycs = await KYCRequest.find({ status: 'pending' })
            .populate('user', 'name email role')
            .sort({ createdAt: 1 });
            
        console.log(`Found ${kycs.length} pending requests.`); // Debug Log
        res.json(kycs);
    } catch (error) {
        console.error("KYC Fetch Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Evaluate KYC (Approve/Reject)
exports.evaluateKYC = async (req, res) => {
    try {
        const { status, adminComments } = req.body; 
        const kyc = await KYCRequest.findById(req.params.id);

        if (!kyc) return res.status(404).json({ message: 'KYC Request not found' });

        // FIX: Status update bhi lowercase mein
        if (status === 'approved') {
            kyc.status = 'approved';
            kyc.reviewedBy = req.user._id;
            kyc.reviewedAt = Date.now();
            await kyc.save();

            // User ko Blue Tick do
            await User.findByIdAndUpdate(kyc.user, { isVerified: true });

            // Profile update (Optional safety)
            const Profile = require('../models/Profile');
            await Profile.findOneAndUpdate({ user: kyc.user }, { 
                'verification.isVerified': true,
                'verification.status': 'verified'
            });

            res.json({ message: 'KYC Approved.', kyc });

        } else if (status === 'rejected') {
            kyc.status = 'rejected';
            kyc.adminComments = adminComments || 'Documents invalid';
            kyc.reviewedBy = req.user._id;
            kyc.reviewedAt = Date.now();
            await kyc.save();

            res.json({ message: 'KYC Rejected.' });
        } else {
            res.status(400).json({ message: 'Invalid status' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
// @desc    Get Reports
// @route   GET /api/admin/reports
exports.getReports = async (req, res) => {
    try {
        const reports = await Report.find()
            .populate('reporter', 'name email')
            .populate('job', 'title company')
            .sort({ createdAt: -1 });
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Resolve Report
// @route   PATCH /api/admin/reports/:id/resolve
exports.resolveReport = async (req, res) => {
    try {
        const { action } = req.body; 
        const report = await Report.findById(req.params.id);
        
        if (!report) return res.status(404).json({ message: 'Report not found' });

        if (action === 'remove_job') {
            await Job.findByIdAndUpdate(report.job, { status: 'closed' });
        } else if (action === 'ban_recruiter') {
            await User.findByIdAndUpdate(report.recruiter, { isFrozen: true });
        }
        
        report.status = 'resolved';
        await report.save();

        res.json({ message: 'Report Resolved successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};