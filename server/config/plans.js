const PLANS = {
  FREE: {
    name: 'Free Starter',
    price: 0,
    limits: {
      jobs: 1,           // 1 active job at a time
      interviews: 3,     // 3 interviews per month
      analytics: 'basic', // Basic stats only
      verifiedBadge: false
    }
  },
  PRO: {
    name: 'Pro Recruiter',
    price: 2999, // INR
    limits: {
      jobs: 10,
      interviews: 100,
      analytics: 'advanced',
      verifiedBadge: true
    }
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: 9999,
    limits: {
      jobs: 9999, // Unlimited
      interviews: 9999,
      analytics: 'full',
      verifiedBadge: true
    }
  }
};

module.exports = PLANS;