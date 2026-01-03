/**
 * Analyzes a Job Post for Scam Signals.
 * @param {object} jobData - Title, Description, Salary, etc.
 * @param {string} email - Recruiter Email
 */
const analyzeJobRisk = (jobData, email) => {
    let riskScore = 0;
    const flags = [];
    const lowerDesc = jobData.description.toLowerCase();
    const lowerTitle = jobData.title.toLowerCase();

    // 1. KEYWORD SCANNING (Common Scam Words)
    const scamKeywords = ['pay registration', 'asking money', 'bank details', 'telegram', 'whatsapp only', 'easy money', 'no interview'];
    
    scamKeywords.forEach(word => {
        if (lowerDesc.includes(word) || lowerTitle.includes(word)) {
            flags.push(`SUSPICIOUS_KEYWORD: ${word}`);
            riskScore += 40;
        }
    });

    // 2. DOMAIN CHECK
    const freeDomains = ['gmail.com', 'yahoo.com', 'hotmail.com'];
    const emailDomain = email.split('@')[1];
    
    if (freeDomains.includes(emailDomain)) {
        riskScore += 10; // Slight risk if not using corporate email
    } else {
        riskScore -= 10; // Bonus for corporate email
    }

    // 3. SALARY ANOMALY
    if (jobData.salary.max > jobData.salary.min * 5) {
        flags.push('UNREALISTIC_SALARY_RANGE');
        riskScore += 20;
    }

    // 4. DESCRIPTION QUALITY
    if (jobData.description.length < 50) {
        flags.push('LOW_EFFORT_DESCRIPTION');
        riskScore += 15;
    }

    // Cap Risk Score
    if (riskScore < 0) riskScore = 0;
    if (riskScore > 100) riskScore = 100;

    return {
        riskScore,
        flags,
        isFlagged: riskScore >= 50
    };
};

module.exports = { analyzeJobRisk };