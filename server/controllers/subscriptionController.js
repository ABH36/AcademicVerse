const User = require('../models/User');
const Invoice = require('../models/Invoice');
const PLANS = require('../config/plans');

// @desc    Get Current Subscription & Usage
exports.getMySubscription = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const planDetails = PLANS[user.subscription.plan];
        
        res.json({
            currentPlan: user.subscription.plan,
            details: planDetails,
            usage: user.subscription.usage,
            expiry: user.subscription.endDate
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Upgrade Plan (Simulated Payment)
exports.upgradePlan = async (req, res) => {
    try {
        const { plan } = req.body; // 'PRO' or 'ENTERPRISE'
        if (!PLANS[plan]) return res.status(400).json({ message: 'Invalid Plan' });

        const user = await User.findById(req.user.id);
        
        // 1. Generate Invoice (Mock Payment)
        await Invoice.create({
            user: user._id,
            amount: PLANS[plan].price,
            plan: plan,
            status: 'paid',
            transactionId: 'TXN_' + Date.now()
        });

        // 2. Update User Subscription
        user.subscription.plan = plan;
        user.subscription.startDate = Date.now();
        // Set expiry to 30 days from now
        const nextMonth = new Date();
        nextMonth.setDate(nextMonth.getDate() + 30);
        user.subscription.endDate = nextMonth;
        
        // Reset limits on upgrade? Optional. Let's keep usage for now but increase cap.
        
        await user.save();

        res.json({ message: `Successfully Upgraded to ${PLANS[plan].name}`, plan: user.subscription });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Upgrade Failed' });
    }
};