const Review = require('../models/Review');
const Book = require('../models/Book');
const Order = require('../models/Order');

// Helper to recalculate book rating
const updateBookRating = async (bookId) => {
  const reviews = await Review.find({ book: bookId, isApproved: true });
  const count = reviews.length;
  const avg = count > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : 0;

  await Book.findByIdAndUpdate(bookId, {
    rating: Number(avg.toFixed(1)),
    reviewsCount: count
  });
};

// @desc    Get Reviews for a Book
// @route   GET /api/reviews/book/:bookId
// @access  Public
const getBookReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ book: req.params.bookId, isApproved: true })
      .populate('customer', 'name avatar')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add Review for a Book
// @route   POST /api/reviews
// @access  Private (Customer)
const addReview = async (req, res) => {
  try {
    const { bookId, rating, title, comment, images } = req.body;

    if (!bookId || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Book ID, rating (1-5), and comment are required' });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    // Check if user has purchased this book
    const verifiedOrder = await Order.findOne({
      customer: req.customer._id,
      'items.book': bookId,
      orderStatus: { $in: ['Delivered', 'Confirmed', 'Processing', 'Shipped'] }
    });

    const review = await Review.create({
      book: bookId,
      customer: req.customer._id,
      customerName: req.customer.name,
      rating: Number(rating),
      title: title ? title.trim() : '',
      comment: comment.trim(),
      images: Array.isArray(images) ? images : [],
      isVerifiedPurchase: !!verifiedOrder
    });

    await updateBookRating(bookId);

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a Review (Customer or Admin)
// @route   DELETE /api/reviews/:id
// @access  Private (Customer / Admin)
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // IDOR Protection: Check ownership
    const isOwner = req.customer && review.customer && review.customer.toString() === req.customer._id.toString();
    const isAdmin = Boolean(req.admin);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
    }

    const bookId = review.book;
    await Review.findByIdAndDelete(req.params.id);
    await updateBookRating(bookId);

    return res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get All Reviews (Admin)
// @route   GET /api/reviews/admin/all
// @access  Private (Admin)
const getAllReviewsAdmin = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('book', 'title author images slug')
      .populate('customer', 'name email')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getBookReviews,
  addReview,
  deleteReview,
  getAllReviewsAdmin
};
