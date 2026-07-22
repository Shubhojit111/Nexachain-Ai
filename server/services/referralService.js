const User = require('../models/User');
const ReferralIncome = require('../models/ReferralIncome');

// Parse referral percentages from env var (default: 10,5,3,2,1)
const parseLevelPercentages = () =>
  (process.env.REFERRAL_LEVEL_PERCENTAGES || '10,5,3,2,1')
    .split(',')
    .map((p) => Number(p.trim()))
    .filter((p) => !Number.isNaN(p));

const MAX_LEVELS = Number(process.env.MAX_REFERRAL_LEVELS) || 5;

// Distribute referral income up the chain
const distributeLevelIncome = async ({
  sourceUserId,
  sourceInvestmentId = null,
  baseAmount,
  session = null,
}) => {
  if (!baseAmount || baseAmount <= 0) return [];

  const levelPercentages = parseLevelPercentages();
  const credited = [];

  let currentUser = await User.findById(sourceUserId).session(session);
  let level = 1;

  while (currentUser && currentUser.referredBy && level <= MAX_LEVELS) {
    const percentage = levelPercentages[level - 1];

    const upline = await User.findById(currentUser.referredBy).session(session);
    if (!upline) break; // Stop if chain is broken

    if (percentage && upline.accountStatus === 'Active') {
      const incomeAmount = Number(((baseAmount * percentage) / 100).toFixed(2));

      if (incomeAmount > 0) {
        // Save referral income record
        await ReferralIncome.create(
          [
            {
              beneficiary: upline._id,
              sourceUser: sourceUserId,
              sourceInvestment: sourceInvestmentId,
              level,
              amount: incomeAmount,
              date: new Date(),
            },
          ],
          { session }
        );

        // Update upline's wallet
        await User.findByIdAndUpdate(
          upline._id,
          { $inc: { walletBalance: incomeAmount, totalLevelIncomeEarned: incomeAmount } },
          { session }
        );

        credited.push({ beneficiary: upline._id, level, amount: incomeAmount });
      }
    }

    currentUser = upline;
    level += 1;
  }

  return credited;
};

module.exports = { distributeLevelIncome, parseLevelPercentages, MAX_LEVELS };
