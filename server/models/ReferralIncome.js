const mongoose = require('mongoose');

const referralIncomeSchema = new mongoose.Schema(
  {
    // The user who receives (is credited with) the referral income
    beneficiary: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // The user whose investment/ROI generated this income
    sourceUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // The investment that triggered this level income, if applicable
    sourceInvestment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Investment',
      default: null,
    },
    level: {
      type: Number,
      required: true,
      min: 1,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// indexing
referralIncomeSchema.index({ beneficiary: 1, date: -1 });

module.exports = mongoose.model('ReferralIncome', referralIncomeSchema);
