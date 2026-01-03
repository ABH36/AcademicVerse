const Job = require('../models/Job');
const Application = require('../models/Application');
const mongoose = require('mongoose');

// @desc    Get Recruiter Hiring Analytics (Dashboard Stats)
// @route   GET /api/analytics/recruiter
exports.getRecruiterStats = async (req, res) => {
    try {
        const recruiterId = new mongoose.Types.ObjectId(req.user.id);

        // 1. Get All Job IDs posted by this recruiter
        const jobs = await Job.find({ recruiter: recruiterId }).select('_id');
        const jobIds = jobs.map(job => job._id);

        if (jobIds.length === 0) {
            return res.json({
                totalJobs: 0,
                totalApplications: 0,
                funnel: { applied: 0, shortlisted: 0, interview: 0, offered: 0, hired: 0, rejected: 0 },
                metrics: { acceptanceRate: '0%', rejectionRate: '0%', hiringEfficiency: '0%' },
                quality: { avgCandidateTrust: 0, flaggedCandidates: 0, spamAttempts: 0 } // Default for new users
            });
        }

        // 2. AGGREGATION PIPELINE: Calculate Status Counts (Hiring Funnel)
        const statusStats = await Application.aggregate([
            { $match: { job: { $in: jobIds } } }, // Filter apps for my jobs
            { $group: { _id: "$status", count: { $sum: 1 } } } // Group by status
        ]);

        // 3. Format Data for Frontend (Funnel Logic)
        const funnel = {
            applied: 0, shortlisted: 0, interview: 0, offered: 0, hired: 0, rejected: 0, withdrawn: 0
        };
        
        let totalApplications = 0;

        statusStats.forEach(stat => {
            if (funnel[stat._id] !== undefined) {
                funnel[stat._id] = stat.count;
            }
            totalApplications += stat.count;
        });

        // 4. Calculate Advanced Metrics
        const totalOffers = funnel.offered + funnel.hired; // Hired people were once offered
        const acceptanceRate = totalOffers > 0 ? ((funnel.hired / totalOffers) * 100).toFixed(1) : 0;
        const rejectionRate = totalApplications > 0 ? ((funnel.rejected / totalApplications) * 100).toFixed(1) : 0;
        const interviewCount = funnel.interview + funnel.offered + funnel.hired; // Cumulative count for funnel visualization

        // 5. PHASE-15B: RISK & QUALITY ANALYTICS (Fraud Detection Layer)
        // This pipeline calculates average trust score and counts fraud flags
        const riskStats = await Application.aggregate([
            { $match: { job: { $in: jobIds } } },
            { 
                $group: { 
                    _id: null, 
                    avgTrustScore: { $avg: "$trustSnapshot.score" },
                    
                    // Count how many are marked suspicious
                    suspiciousCount: { 
                        $sum: { $cond: ["$riskProfile.isSuspicious", 1, 0] } 
                    },
                    
                    // Count specific spam flags (Rapid Apply Abuse)
                    spamCount: {
                        $sum: { 
                            $cond: [
                                { $in: ["RAPID_APPLY_ABUSE", { $ifNull: ["$riskProfile.flags", []] }] }, 
                                1, 
                                0
                            ] 
                        }
                    }
                } 
            }
        ]);

        // Extract Risk Data (Handle case where no apps exist yet)
        const riskData = riskStats[0] || { avgTrustScore: 0, suspiciousCount: 0, spamCount: 0 };

        // 6. Send Final Response
        res.json({
            totalJobs: jobs.length,
            totalApplications,
            
            // Hiring Funnel Data
            funnel: {
                ...funnel,
                interview: interviewCount, 
                totalOffers
            },
            
            // Efficiency Metrics
            metrics: {
                acceptanceRate: acceptanceRate + '%',
                rejectionRate: rejectionRate + '%',
                hiringEfficiency: totalApplications > 0 ? ((funnel.hired / totalApplications) * 100).toFixed(1) + '%' : '0%'
            },

            // Phase-15B: Candidate Quality & Risk Data
            quality: {
                avgCandidateTrust: Math.round(riskData.avgTrustScore || 0),
                flaggedCandidates: riskData.suspiciousCount,
                spamAttempts: riskData.spamCount
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Analytics Engine Error' });
    }
};