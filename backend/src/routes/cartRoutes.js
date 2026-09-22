const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  mergeGuestCart
} = require('../controllers/cartController');
const { optionalAuth, protectCustomer } = require('../middleware/authMiddleware');

router.get('/', optionalAuth, getCart);
router.post('/add', optionalAuth, addToCart);
router.put('/update', optionalAuth, updateCartItem);
router.delete('/item/:bookId', optionalAuth, removeFromCart);
router.post('/merge', protectCustomer, mergeGuestCart);

module.exports = router;
