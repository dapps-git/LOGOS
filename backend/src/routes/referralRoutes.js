const express = require('express');
const router = express.Router();
const {
  getMyReferralSummary,
  validateReferralCode,
  getAllReferralsAdmin
} = require('../controllers/referralController');
const { protectCustomer, optionalAuth } = require('../middleware/authMiddleware');
const { protectAdmin } = require('../middleware/adminMiddleware');

// Customer Referral Summary
router.get('/my-rewards', protectCustomer, getMyReferralSummary);

// Validate referral code (for 15% 1st order discount)
router.post('/validate', optionalAuth, validateReferralCode);

// Admin Referral Tracking
router.get('/admin/all', protectAdmin, getAllReferralsAdmin);

module.exports = router;
