const express = require('express');
const { createInvestment, getMyInvestments } = require('../controllers/investmentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // every investment route is private

router.post('/', createInvestment);
router.get('/', getMyInvestments);

module.exports = router;
