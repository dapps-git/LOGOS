const express = require('express');
const router = express.Router();
const {
  getActiveBanners,
  getAllBannersAdmin,
  createBanner,
  updateBanner,
  deleteBanner
} = require('../controllers/bannerController');
const { protectAdmin } = require('../middleware/adminMiddleware');

// Public
router.get('/', getActiveBanners);

// Admin
router.get('/admin/all', protectAdmin, getAllBannersAdmin);
router.post('/', protectAdmin, createBanner);
router.put('/:id', protectAdmin, updateBanner);
router.delete('/:id', protectAdmin, deleteBanner);

module.exports = router;
