const express = require('express');
const router = express.Router();
const {
  getBookReviews,
  addReview,
  deleteReview,
  getAllReviewsAdmin,
  getPublicTestimonials,
  createReviewAdmin,
  toggleApproveReviewAdmin
} = require('../controllers/reviewController');
const { protectCustomer } = require('../middleware/authMiddleware');
const { protectAdmin } = require('../middleware/adminMiddleware');

// Public
router.get('/testimonials', getPublicTestimonials);
router.get('/book/:bookId', getBookReviews);

// Customer
router.post('/', protectCustomer, addReview);
router.delete('/:id', protectCustomer, deleteReview);

// Admin
router.get('/admin/all', protectAdmin, getAllReviewsAdmin);
router.post('/admin/create', protectAdmin, createReviewAdmin);
router.put('/admin/:id/approve', protectAdmin, toggleApproveReviewAdmin);
router.delete('/admin/:id', protectAdmin, deleteReview);

module.exports = router;
