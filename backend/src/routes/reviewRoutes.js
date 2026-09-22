const express = require('express');
const router = express.Router();
const {
  getBookReviews,
  addReview,
  deleteReview,
  getAllReviewsAdmin
} = require('../controllers/reviewController');
const { protectCustomer } = require('../middleware/authMiddleware');
const { protectAdmin } = require('../middleware/adminMiddleware');

// Public
router.get('/book/:bookId', getBookReviews);

// Customer
router.post('/', protectCustomer, addReview);
router.delete('/:id', protectCustomer, deleteReview);

// Admin
router.get('/admin/all', protectAdmin, getAllReviewsAdmin);

module.exports = router;
