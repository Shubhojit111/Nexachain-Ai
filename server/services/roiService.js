const mongoose = require('mongoose');
const Investment = require('../models/Investment');
const RoiHistory = require('../models/RoiHistory');
const User = require('../models/User');
const { distributeLevelIncome } = require('./referralService');

// Normalize date to midnight UTC for consistent daily ROI checks
const toCalendarDate = (date = new Date()) => {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

// Process daily ROI for all active investments
const processDailyROI = async () => {
  const today = toCalendarDate();
  const summary = { processed: 0, skipped: 0, failed: 0 };

  const activeInvestments = await Investment.find({
    status: 'Active',
    startDate: { $lte: new Date() },
  }).lean();

  for (const investment of activeInvestments) {
    // Skip if already processed today
    if (
      investment.lastROIProcessedDate &&
      toCalendarDate(investment.lastROIProcessedDate).getTime() === today.getTime()
    ) {
      summary.skipped += 1;
      continue;
    }

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        // Calculate today's ROI
        const roiAmount = Number(
          ((investment.amount * investment.dailyROIPercentage) / 100).toFixed(2)
        );

        // Save ROI history
        await RoiHistory.create(
          [
            {
              user: investment.user,
              investment: investment._id,
              amount: roiAmount,
              date: today,
              status: 'Credited',
            },
          ],
          { session }
        );

        // Update user's wallet and total earned
        await User.findByIdAndUpdate(
          investment.user,
          { $inc: { walletBalance: roiAmount, totalROIEarned: roiAmount } },
          { session }
        );

        // Mark investment as completed if it's matured
        const isMatured = new Date(investment.endDate) <= new Date();
        await Investment.findByIdAndUpdate(
          investment._id,
          {
            lastROIProcessedDate: today,
            ...(isMatured ? { status: 'Completed' } : {}),
          },
          { session }
        );

        // Distribute referral income based on this ROI
        await distributeLevelIncome({
          sourceUserId: investment.user,
          sourceInvestmentId: investment._id,
          baseAmount: roiAmount,
          session,
        });
      });

      summary.processed += 1;
    } catch (error) {
      // Duplicate key means we already processed this
      if (error.code === 11000) {
        summary.skipped += 1;
      } else {
        summary.failed += 1;
        console.error(`ROI failed for ${investment._id}:`, error.message);
      }
    } finally {
      session.endSession();
    }
  }

  return summary;
};

module.exports = { processDailyROI, toCalendarDate };
