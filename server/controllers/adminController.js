const User = require('../models/User');
const Profile = require('../models/Profile');
const Certificate = require('../models/Certificate');
const Job = require('../models/Job');       // Phase-17
const Report = require('../models/Report'); // Phase-17
const Invoice = require('../models/Invoice'); // Phase-17
const logger = require('../utils/logger');

// @desc    Get Admin Dashboard Stats (Combined Phase-1 & Phase-17)
// @route   GET /api/admin/stats
exports.getAdminStats = async (req, res) => {
  try {
    // 1. User Stats
    const totalUsers = await User.countDocuments();
    const students = await User.countDocuments({ role: 'student' });
    const recruiters = await User.countDocuments({ role: 'recruiter' }); // Phase-17

    // 2. Pending Work Items
    const pendingCertificates = await Certificate.countDocuments({ isVerified: false });
    const pendingProfiles = await Profile.countDocuments({ verificationStatus: 'pending' });
    const pendingReports = await Report.countDocuments({ status: 'pending' }); // Phase-17

    // 3. Platform Stats
    const totalJobs = await Job.countDocuments(); // Phase-17
    
    // 4. Financial Stats (Revenue Calculation)
    const revenueAgg = await Invoice.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    res.json({
      users: { total: totalUsers, students, recruiters },
      workItems: { pendingCertificates, pendingProfiles, pendingReports },
      platform: { totalJobs, totalRevenue },
      // Flattened for backward compatibility if needed
      totalUsers, students, pendingCertificates, pendingProfiles 
    });

  } catch (error) {
    console.error("Admin Stats Error:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get All Users (Paginated & Filtered)
// @route   GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const pageSize = 20;
    const page = Number(req.query.pageNumber) || 1;

    const count = await User.countDocuments({});
    const users = await User.find({})
      .select('-password') // Security: Never send passwords
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({ users, page, pages: Math.ceil(count / pageSize) });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Advanced User Management (Ban, Verify Identity, Verify Company)
// @route   PATCH /api/admin/users/:id/action
exports.manageUser = async (req, res) => {
    try {
        const { action } = req.body; // 'ban', 'unban', 'verify_identity', 'verify_company'
        const user = await User.findById(req.params.id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        // SAFETY LOCK: Prevent modifying other Admins
        if (user.role === 'admin') {
            return res.status(403).json({ message: 'Cannot modify Super Admin accounts.' });
        }

        switch (action) {
            case 'ban':
            case 'freeze':
                user.isFrozen = true; // Maps to your existing schema
                break;
            case 'unban':
            case 'unfreeze':
                user.isFrozen = false;
                break;
            case 'verify_identity':
                // Update User model (assuming you store it there) or fetch Profile
                // Here we update a flag on User for simplicity, or find Profile
                const profile = await Profile.findOne({ user: user._id });
                if (profile) {
                    profile.verificationStatus = 'verified';
                    profile.verification.isVerified = true;
                    await profile.save();
                }
                break;
            case 'verify_company':
                // Special perk for recruiters
                if (user.role === 'recruiter') {
                    // Update subscription or specific flag
                    // Assuming we give them PRO plan perks manually
                    user.subscription = { ...user.subscription, plan: 'PRO', status: 'active' };
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

// @desc    Legacy Toggle Freeze (Kept for backward compatibility)
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
      .sort({ createdAt: 1 }); // Oldest first
    res.json(certs);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Approve or Reject Certificate
// @route   PUT /api/admin/certificate/:id/verify
exports.verifyCertificate = async (req, res) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'
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

// @desc    Get Trust Center Reports (Phase-17)
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

// @desc    Resolve a Report (Phase-17)
// @route   PATCH /api/admin/reports/:id/resolve
exports.resolveReport = async (req, res) => {
    try {
        const { action } = req.body; // 'dismiss', 'ban_recruiter', 'remove_job'
        const report = await Report.findById(req.params.id);
        
        if (!report) return res.status(404).json({ message: 'Report not found' });

        // Perform Action
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