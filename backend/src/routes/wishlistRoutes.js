const express = require('express');
const router = express.Router();
const {
  getWishlist,
  toggleWishlist,
  mergeGuestWishlist
} = require('../controllers/wishlistController');
const { optionalAuth, protectCustomer } = require('../middleware/authMiddleware');

router.get('/', optionalAuth, getWishlist);
router.post('/toggle', optionalAuth, toggleWishlist);
router.post('/merge', protectCustomer, mergeGuestWishlist);

module.exports = router;
