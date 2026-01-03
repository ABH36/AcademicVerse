const Job = require('../models/Job');
const Application = require('../models/Application');
const Profile = require('../models/Profile');
const User = require('../models/User'); // <--- ADDED FOR PHASE-16
const calculateTrustScore = require('../utils/trustEngine');
const sendEmail = require('../utils/sendEmail');
const { generateEmailHtml } = require('../utils/emailTemplates');
const { analyzeApplicationRisk } = require('../utils/fraudGuard');
const Report = require('../models/Report');
const { analyzeJobRisk } = require('../utils/recruiterGuard');

// --- HELPER: PRODUCTION EMAIL ENGINE (FINAL CRASH-PROOF) ---
exports.sendStatusEmail = async (user, job, status, interviewDetails = null) => {
    // 1. SAFETY CHECK
    if (!user || !job || !user.email) {
        console.log("Email skipped: User or Job details missing.");
        return;
    }

    let subject = '';
    let emailData = {
        name: user.name,
        company: job.company?.name || 'AcademicVerse Recruiter',
        jobTitle: job.title
    };

    // Prepare Data for Template
    switch (status) {
        case 'interview':
            subject = `Action Required: Interview with ${emailData.company}`;
            // --- CRASH PROOF LOGIC ---
            emailData.mode = String(interviewDetails?.type || 'Online').toUpperCase();
            emailData.date = interviewDetails?.datetime ? new Date(interviewDetails.datetime).toLocaleDateString() : 'Date TBD';
            emailData.time = interviewDetails?.datetime ? new Date(interviewDetails.datetime).toLocaleTimeString() : 'Time TBD';
            emailData.link = interviewDetails?.link || interviewDetails?.venue || 'Check Dashboard for details';
            emailData.message = interviewDetails?.message || 'Please arrive 5 mins early.';
            break;
        case 'offered':
            subject = `🎉 OFFER LETTER: ${emailData.company}`;
            break;
        case 'rejected':
            subject = `Application Status Update: ${job.title}`;
            break;
        case 'hired':
            subject = `🚀 Welcome Aboard! Hiring Confirmed for ${job.title}`;
            break;
        case 'shortlisted':
            return; 
        default:
            return; 
    }

    // Generate Professional HTML
    const htmlMessage = generateEmailHtml(status, emailData);

    // Send via Production Engine
    await sendEmail({
        email: user.email,
        subject: subject,
        message: htmlMessage,
        type: status,       
        userId: user._id,   
        metadata: { jobId: job._id, jobTitle: job.title }
    });
};

// @desc    Post a Job (Recruiter) - WITH FRAUD GUARD & USAGE TRACKING
// @route   POST /api/jobs
exports.createJob = async (req, res) => {
  try {
    const { company, title, description, type, location, salary, requirements, minTrustScore, verifiedOnly } = req.body;

    // PHASE-15C: RUN FRAUD GUARD
    const riskAnalysis = analyzeJobRisk(
        { title, description, salary }, 
        req.user.email
    );

    const job = await Job.create({
      recruiter: req.user.id,
      company, title, description, type, location, salary, requirements, minTrustScore, verifiedOnly,
      
      // Inject Risk Profile
      trustProfile: {
          riskScore: riskAnalysis.riskScore,
          flags: riskAnalysis.flags,
          isVerifiedCompany: riskAnalysis.riskScore < 10 
      },
      status: riskAnalysis.isFlagged ? 'flagged' : 'active'
    });

    // PHASE-16: INCREMENT JOB POSTING USAGE
    await User.findByIdAndUpdate(req.user.id, { 
        $inc: { 'subscription.usage.jobsPosted': 1 } 
    });

    const msg = riskAnalysis.isFlagged 
        ? 'Job Posted but Flagged for Review due to suspicious content.' 
        : 'Job Posted Successfully!';

    res.status(201).json({ message: msg, job });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get All Active Jobs
// @route   GET /api/jobs
exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'active' })
      .sort({ createdAt: -1 })
      .populate('recruiter', 'name email'); 
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Apply for a Job (With Fraud Detection)
// @route   POST /api/jobs/:id/apply
exports.applyForJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await Job.findById(jobId);

    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.status !== 'active') return res.status(400).json({ message: 'Job is closed' });

    // 1. Fetch Profile
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    // 2. Calculate Trust
    const trustData = calculateTrustScore({ ...profile.toObject(), skills: { technical: [] }, academicDetails: {} });

    // 3. Eligibility Gate (Hard Block)
    if (job.verifiedOnly && !profile.verification.isVerified) return res.status(403).json({ message: 'Verified Badge Required' });
    if (trustData.score < job.minTrustScore) return res.status(403).json({ message: 'Trust Score too low' });

    // 4. PHASE-15B: RUN FRAUD GUARD
    const riskAnalysis = await analyzeApplicationRisk(req.user.id, trustData.score, profile.verification.isVerified);
    
    // 5. Create Application with Risk Profile
    const application = await Application.create({
      job: jobId,
      applicant: req.user.id,
      status: riskAnalysis.isSuspicious ? 'flagged' : 'applied', // Auto-flag if suspicious
      trustSnapshot: { 
          score: trustData.score, 
          tier: trustData.tier, 
          isVerified: profile.verification.isVerified 
      },
      riskProfile: {
          riskScore: riskAnalysis.riskScore,
          flags: riskAnalysis.flags,
          isSuspicious: riskAnalysis.isSuspicious
      }
    });

    job.applicantsCount += 1;
    await job.save();

    const msg = riskAnalysis.isSuspicious 
        ? 'Application received but flagged for review.' 
        : 'Application Submitted Successfully!';

    res.status(201).json({ message: msg, application });

  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ message: 'Already applied' });
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get Applications for a Job (Recruiter)
// @route   GET /api/jobs/:id/applications
exports.getJobApplications = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        
        if (job.recruiter.toString() !== req.user.id) return res.status(403).json({ message: 'Access Denied' });

        const applications = await Application.find({ job: req.params.id })
            .populate('applicant', 'name email avatar username') 
            .sort({ 'trustSnapshot.score': -1 }); 
        res.json(applications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get Jobs Posted by Recruiter
// @route   GET /api/jobs/my-jobs
exports.getMyPostedJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ recruiter: req.user.id }).sort({ createdAt: -1 });
        res.json(jobs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get Student History
// @route   GET /api/jobs/applications/my
exports.getMyApplications = async (req, res) => {
    try {
        const applications = await Application.find({ applicant: req.user.id })
            .populate({ path: 'job', select: 'title company type location status' })
            .sort({ createdAt: -1 });
        res.json(applications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Recruiter Updates Status (Interview, Offer, Reject)
// @route   PATCH /api/jobs/application/:id/status
exports.updateApplicationStatus = async (req, res) => {
    try {
        const { status, interview } = req.body; 
        const applicationId = req.params.id;
        const application = await Application.findById(applicationId).populate('job').populate('applicant');
        
        if (!application) return res.status(404).json({ message: 'Application not found' });
        if (application.job.recruiter.toString() !== req.user.id) return res.status(403).json({ message: 'Access Denied: Not your job' });

        // Update Status
        application.status = status;

        // If Interview, save details safely
        if (status === 'interview' && interview) {
            application.interview = {
                type: interview.type || 'online',
                link: interview.link || '',
                venue: interview.venue || '',
                datetime: interview.datetime || Date.now(),
                message: interview.message || '',
                scheduledAt: Date.now()
            };
            
            // PHASE-16: INCREMENT INTERVIEW USAGE
            await User.findByIdAndUpdate(req.user.id, { 
                $inc: { 'subscription.usage.interviewsScheduled': 1 } 
            });
        }

        await application.save();

        // Trigger Email Notification
        await exports.sendStatusEmail(application.applicant, application.job, status, application.interview);

        res.json({ message: `Candidate moved to ${status}`, status, interview: application.interview });

    } catch (error) {
        console.error("Update Status Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Student Responds to Offer (Accept/Reject)
// @route   PATCH /api/jobs/application/:id/respond
exports.respondToOffer = async (req, res) => {
    try {
        const { response } = req.body; // 'accepted' or 'declined'
        const applicationId = req.params.id;
        
        const application = await Application.findById(applicationId).populate('job');

        if (!application) return res.status(404).json({ message: 'App not found' });
        if (application.applicant.toString() !== req.user.id) return res.status(403).json({ message: 'Not your application' });
        if (application.status !== 'offered') return res.status(400).json({ message: 'No active offer found' });

        if (response === 'accepted') {
            application.status = 'hired';
            await application.save();

            // Close Job
            const job = await Job.findById(application.job._id);
            job.status = 'closed';
            await job.save();

            // Reject others
            await Application.updateMany(
                { job: job._id, _id: { $ne: applicationId } },
                { status: 'rejected' }
            );

            // Send Hired Email
            await exports.sendStatusEmail(req.user, job, 'hired');

            res.json({ message: 'Offer Accepted! Job Closed.', status: 'hired' });

        } else if (response === 'declined') {
            application.status = 'withdrawn';
            await application.save();
            res.json({ message: 'Offer Declined.', status: 'withdrawn' });
        } else {
            res.status(400).json({ message: 'Invalid response' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Report a Job (Student)
// @route   POST /api/jobs/:id/report
exports.reportJob = async (req, res) => {
    try {
        const { reason, description } = req.body;
        const jobId = req.params.id;

        const job = await Job.findById(jobId);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        // Check if already reported
        const existingReport = await Report.findOne({ job: jobId, reporter: req.user.id });
        if (existingReport) {
            return res.status(400).json({ message: 'You have already reported this job.' });
        }

        // Create Report
        await Report.create({
            job: jobId,
            reporter: req.user.id,
            recruiter: job.recruiter,
            reason,
            description
        });

        // Increment Report Count
        job.reports += 1;
        
        // Auto-Flag if too many reports
        if (job.reports >= 5) {
            job.status = 'flagged';
        }
        
        await job.save();

        res.json({ message: 'Report submitted. Our Trust & Safety team will review it.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};