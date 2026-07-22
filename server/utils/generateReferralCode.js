const crypto = require('crypto');
const User = require('../models/User');

const generateReferralCode = async () => {
  const MAX_ATTEMPTS = 5;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    const code = `NXC-${random}`;
    
    const existing = await User.findOne({ referralCode: code }).lean();
    if (!existing) return code;
  }

  throw new Error('Could not generate a unique referral code, please retry');
};

module.exports = generateReferralCode;
