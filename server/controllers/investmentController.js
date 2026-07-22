const asyncHandler = require('express-async-handler');
const Investment = require('../models/Investment');

/**
 * @route   POST /api/investments
 * @access  Private
 * @body    { amount, planName, durationInDays, dailyROIPercentage }
 */
const createInvestment = asyncHandler(async (req, res) => {
  const { amount, planName, durationInDays, dailyROIPercentage } = req.body;

  if (!amount || !planName || !durationInDays || dailyROIPercentage === undefined) {
    res.status(400);
    throw new Error('amount, planName, durationInDays and dailyROIPercentage are required');
  }

  if (amount <= 0) {
    res.status(400);
    throw new Error('Investment amount must be greater than 0');
  }

  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + Number(durationInDays));

  const investment = await Investment.create({
    user: req.user._id,
    amount,
    plan: { name: planName, durationInDays },
    startDate,
    endDate,
    dailyROIPercentage,
    status: 'Active',
  });

  res.status(201).json({ success: true, data: { investment } });
});

/**
 * @route   GET /api/investments
 * @access  Private
 * @query   page, limit, status
 */
const getMyInvestments = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const filter = { user: req.user._id };
  if (req.query.status) filter.status = req.query.status;

  const [investments, total] = await Promise.all([
    Investment.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Investment.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: {
      investments,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    },
  });
});

module.exports = { createInvestment, getMyInvestments };
