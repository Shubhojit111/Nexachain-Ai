const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const User = require('../models/User');

/**
 * @route   GET /api/referrals/direct
 * @access  Private
 * Returns the user's direct (level 1) referrals only.
 */
const getDirectReferrals = asyncHandler(async (req, res) => {
  const referrals = await User.find({ referredBy: req.user._id })
    .select('fullName email mobile accountStatus totalROIEarned createdAt')
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json({ success: true, data: { count: referrals.length, referrals } });
});

/**
 * @route   GET /api/referrals/tree
 * @access  Private
 */
const getReferralTree = asyncHandler(async (req, res) => {
  const [result] = await User.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(req.user._id) } },
    {
      $graphLookup: {
        from: 'users',
        startWith: '$_id',
        connectFromField: '_id',
        connectToField: 'referredBy',
        as: 'downline',
        depthField: 'depth',
      },
    },
    {
      $project: {
        _id: 1,
        'downline._id': 1,
        'downline.fullName': 1,
        'downline.email': 1,
        'downline.referredBy': 1,
        'downline.depth': 1,
        'downline.accountStatus': 1,
        'downline.totalROIEarned': 1,
      },
    },
  ]);

  const flatNodes = result?.downline || [];

  // Build the nested tree in memory from the flat list returned by
  // $graphLookup (depth 0 = direct referrals, depth 1 = their referrals, etc.)
  const nodesById = new Map();
  flatNodes.forEach((node) => {
    nodesById.set(String(node._id), { ...node, children: [] });
  });

  const roots = [];
  flatNodes.forEach((node) => {
    const wrapped = nodesById.get(String(node._id));
    const parentId = String(node.referredBy);
    if (nodesById.has(parentId)) {
      nodesById.get(parentId).children.push(wrapped);
    } else {
      roots.push(wrapped); // direct referral of the requesting user
    }
  });

  res.status(200).json({
    success: true,
    data: { totalDownlineCount: flatNodes.length, tree: roots },
  });
});

module.exports = { getDirectReferrals, getReferralTree };
