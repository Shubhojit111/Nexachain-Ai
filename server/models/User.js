const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false, 
    },
    referralCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    walletBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalROIEarned: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalLevelIncomeEarned: {
      type: Number,
      default: 0,
      min: 0,
    },
    accountStatus: {
      type: String,
      enum: ['Active', 'Inactive', 'Suspended'],
      default: 'Active',
    },
  },
  { timestamps: true }
);

userSchema.index({ referredBy: 1, createdAt: -1 });

// Never leak the password hash even if select('+password') was used elsewhere
userSchema.methods.toJSON = function toJSON() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
