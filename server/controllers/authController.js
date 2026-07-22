const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateReferralCode = require('../utils/generateReferralCode');
const generateToken = require('../utils/generateToken');

/**
 * @route   POST /api/auth/register
 * @access  Public
 * @body    { fullName, email, mobile, password, referralCode? }
 */
const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, mobile, password, referralCode } = req.body;

  if (!fullName || !email || !mobile || !password) {
    res.status(400);
    throw new Error('fullName, email, mobile and password are all required');
  }

  const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
  if (existingUser) {
    res.status(409);
    throw new Error('An account with this email or mobile number already exists');
  }

  let referredBy = null;
  if (referralCode) {
    const referrer = await User.findOne({ referralCode });
    if (!referrer) {
      res.status(400);
      throw new Error('Invalid referral code');
    }
    referredBy = referrer._id;
  }

  const newReferralCode = await generateReferralCode();

  // Hash password here in controller
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    fullName,
    email,
    mobile,
    password: hashedPassword,
    referralCode: newReferralCode,
    referredBy,
  });

  res.status(201).json({
    success: true,
    data: {
      user,
      token: generateToken(user._id),
    },
  });
});

/**
 * @route   POST /api/auth/login
 * @access  Public
 * @body    { email, password }
 */
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    res.status(401);
    throw new Error('User not found');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    res.status(401);
    // Cause security 
    throw new Error('Invalid email or password');
  }
  
  if (user.accountStatus !== 'Active') {
    res.status(403);
    throw new Error('Account is not active, please contact support');
  }

  res.status(200).json({
    success: true,
    data: {
      user,
      token: generateToken(user._id),
    },
  });
});

/**
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: { user: req.user } });
});

module.exports = { registerUser, loginUser, getMe };
