const express = require('express');
const {
  getSummary,
  getROIHistory,
  getReferralIncomeHistory,
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/summary', getSummary);
router.get('/roi-history', getROIHistory);
router.get('/referral-income-history', getReferralIncomeHistory);

module.exports = router;
