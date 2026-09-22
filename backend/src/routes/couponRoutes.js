const express = require('express');
const router = express.Router();
const {
  validateCoupon,
  getAvailableCoupons,
  getAllCouponsAdmin,
  createCoupon,
  updateCoupon,
  deleteCoupon
} = require('../controllers/couponController');
const { optionalAuth } = require('../middleware/authMiddleware');
const { protectAdmin } = require('../middleware/adminMiddleware');

// Public / User
router.post('/validate', optionalAuth, validateCoupon);
router.get('/available', optionalAuth, getAvailableCoupons);

// Admin Coupon Management
router.get('/admin/all', protectAdmin, getAllCouponsAdmin);
router.post('/', protectAdmin, createCoupon);
router.put('/:id', protectAdmin, updateCoupon);
router.delete('/:id', protectAdmin, deleteCoupon);

module.exports = router;
