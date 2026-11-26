const express = require('express');
const router = express.Router();
const {
  getPublicSettings,
  getAdminSettings,
  updateAdminSettings
} = require('../controllers/settingsController');
const { optionalAuth } = require('../middleware/authMiddleware');
const { protectAdmin } = require('../middleware/adminMiddleware');

router.get('/public', optionalAuth, getPublicSettings);
router.get('/admin', protectAdmin, getAdminSettings);
router.put('/admin', protectAdmin, updateAdminSettings);

module.exports = router;

