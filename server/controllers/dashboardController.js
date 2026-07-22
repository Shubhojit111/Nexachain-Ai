const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Investment = require('../models/Investment');
const RoiHistory = require('../models/RoiHistory');
const ReferralIncome = require('../models/ReferralIncome');

/**
 * @route   GET /api/dashboard/summary
 * @access  Private
 * Returns totalInvestments, totalROIEarned, totalLevelIncomeEarned, walletBalance
 * using a single aggregation for the investment total (avoids N+1 queries),
 * and the running totals already denormalized onto the User document for
 * the rest (kept in sync by roiService / referralService).
 */
const getSummary = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [investmentAgg] = await Investment.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalInvestments: { $sum: '$amount' },
        activeInvestments: {
          $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] },
        },
        investmentCount: { $sum: 1 },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalInvestments: investmentAgg?.totalInvestments || 0,
      investmentCount: investmentAgg?.investmentCount || 0,
      activeInvestments: investmentAgg?.activeInvestments || 0,
      totalROIEarned: req.user.totalROIEarned,
      totalLevelIncomeEarned: req.user.totalLevelIncomeEarned,
      walletBalance: req.user.walletBalance,
    },
  });
});

/**
 * @route   GET /api/dashboard/roi-history
 * @access  Private
 */
const getROIHistory = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 30, 100);

  const [history, total] = await Promise.all([
    RoiHistory.find({ user: req.user._id })
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('investment', 'plan amount')
      .lean(),
    RoiHistory.countDocuments({ user: req.user._id }),
  ]);

  res.status(200).json({
    success: true,
    data: { history, pagination: { page, limit, total, pages: Math.ceil(total / limit) } },
  });
});

/**
 * @route   GET /api/dashboard/referral-income-history
 * @access  Private
 */
const getReferralIncomeHistory = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 30, 100);

  const [history, total] = await Promise.all([
    ReferralIncome.find({ beneficiary: req.user._id })
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('sourceUser', 'fullName email')
      .lean(),
    ReferralIncome.countDocuments({ beneficiary: req.user._id }),
  ]);

  res.status(200).json({
    success: true,
    data: { history, pagination: { page, limit, total, pages: Math.ceil(total / limit) } },
  });
});

module.exports = { getSummary, getROIHistory, getReferralIncomeHistory };
