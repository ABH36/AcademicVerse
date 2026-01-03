const User = require('../models/User');
const PLANS = require('../config/plans');

// Check if Recruiter can Post a Job
exports.checkJobLimit = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        const plan = PLANS[user.subscription.plan];

        if (user.subscription.usage.jobsPosted >= plan.limits.jobs) {
            return res.status(403).json({ 
                message: `Plan Limit Reached! You are on ${plan.name} plan (Max ${plan.limits.jobs} jobs). Upgrade to Post More.` 
            });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: 'Subscription Check Failed' });
    }
};

// Check if Recruiter can Schedule Interview
exports.checkInterviewLimit = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        const plan = PLANS[user.subscription.plan];

        // Check only if status is changing to 'interview'
        if (req.body.status === 'interview') {
             if (user.subscription.usage.interviewsScheduled >= plan.limits.interviews) {
                return res.status(403).json({ 
                    message: `Interview Limit Reached! (${user.subscription.usage.interviewsScheduled}/${plan.limits.interviews}). Upgrade to Schedule More.` 
                });
            }
        }
        next();
    } catch (error) {
        res.status(500).json({ message: 'Subscription Check Failed' });
    }
};