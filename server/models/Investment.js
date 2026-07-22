const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Investment amount is required'],
      min: [1, 'Investment amount must be greater than 0'],
    },
    plan: {
      name: { type: String, required: true },
      durationInDays: { type: Number, required: true },
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    dailyROIPercentage: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Active', 'Completed', 'Cancelled'],
      default: 'Active',
      index: true,
    },
    // To avoid duplicate/double crediting.
    lastROIProcessedDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// indexing
investmentSchema.index({ status: 1, endDate: 1 });

module.exports = mongoose.model('Investment', investmentSchema);
