const mongoose = require('mongoose');
const Review = require('../models/Review');
const Book = require('../models/Book');
const Order = require('../models/Order');
const cloudinary = require('../config/cloudinary');

// Helper to upload images to Cloudinary in WebP format
const uploadToCloudinaryWebp = async (imageInput, folder = 'logos_reviews') => {
  if (!imageInput || typeof imageInput !== 'string') return imageInput;
  if (imageInput.includes('res.cloudinary.com') && (imageInput.includes('f_webp') || imageInput.endsWith('.webp'))) {
    return imageInput;
  }

  const uploadResponse = await cloudinary.uploader.upload(imageInput, {
    folder,
    format: 'webp',
    transformation: [
      { width: 1200, crop: 'limit' },
      { quality: 'auto', fetch_format: 'webp' }
    ]
  });
  return uploadResponse.secure_url;
};

// Helper to recalculate book rating
const updateBookRating = async (bookId) => {
  const reviews = await Review.find({ book: bookId, isApproved: true });
  const count = reviews.length;
  const avg = count > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : 5.0;

  await Book.findByIdAndUpdate(bookId, {
    rating: Number(avg.toFixed(1)),
    reviewsCount: count
  });
};

// @desc    Get Reviews for a Book (Sorted by highest positive rating first)
// @route   GET /api/reviews/book/:bookId
// @access  Public
const getBookReviews = async (req, res) => {
  try {
    const { bookId } = req.params;
    let targetBookId = bookId;

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      const book = await Book.findOne({ $or: [{ slug: bookId }, { _id: bookId }] });
      if (book) {
        targetBookId = book._id;
      }
    }

    const reviews = await Review.find({ book: targetBookId, isApproved: true })
      .populate('customer', 'name avatar')
      .sort({ rating: -1, createdAt: -1 });

    return res.json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add Review for a Book (with WebP image conversion and star rating 1-5)
// @route   POST /api/reviews
// @access  Public / Customer
const addReview = async (req, res) => {
  try {
    const { bookId, rating, title, comment, images, customerName } = req.body;

    if (!bookId || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Book ID, rating (1-5), and comment are required' });
    }

    let book = null;
    if (mongoose.Types.ObjectId.isValid(bookId)) {
      book = await Book.findById(bookId);
    }
    if (!book) {
      book = await Book.findOne({ slug: bookId });
    }
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    // Process and convert images to Cloudinary WebP format
    const processedImages = [];
    if (Array.isArray(images) && images.length > 0) {
      for (const img of images) {
        if (typeof img === 'string' && img.trim()) {
          try {
            const webpUrl = await uploadToCloudinaryWebp(img.trim(), 'logos_reviews');
            processedImages.push(webpUrl);
          } catch (uploadErr) {
            console.warn('[addReview] Image WebP upload error:', uploadErr.message);
            processedImages.push(img);
          }
        }
      }
    }

    // Check if user has purchased this book
    let isVerified = false;
    const customerId = req.customer ? req.customer._id : null;
    if (customerId) {
      const verifiedOrder = await Order.findOne({
        customer: customerId,
        'items.book': book._id,
        orderStatus: { $in: ['Delivered', 'Confirmed', 'Processing', 'Shipped'] }
      });
      isVerified = Boolean(verifiedOrder);
    }

    const finalRating = Math.max(1, Math.min(5, Math.round(Number(rating) || 5)));
    const reviewerName = (req.customer && req.customer.name) || customerName || 'Reader';

    const review = await Review.create({
      book: book._id,
      customer: customerId,
      customerName: reviewerName.trim(),
      rating: finalRating,
      title: title ? title.trim() : '',
      comment: comment.trim(),
      images: processedImages,
      isVerifiedPurchase: isVerified,
      isApproved: true,
      addedBy: req.customer ? 'customer' : 'guest'
    });

    await updateBookRating(book._id);

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

// @desc    Get Public Testimonials for Homepage
// @route   GET /api/reviews/testimonials
// @access  Public
const getPublicTestimonials = async (req, res) => {
  try {
    const reviews = await Review.find({ isApproved: true })
      .populate('book', 'title author images slug')
      .sort({ isTestimonial: -1, createdAt: -1 })
      .limit(12);

    return res.json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create Review / Testimonial by Admin
// @route   POST /api/reviews/admin/create
// @access  Private (Admin)
const createReviewAdmin = async (req, res) => {
  try {
    const { customerName, rating, comment, title, avatar, bookId, isApproved, isTestimonial } = req.body;

    if (!customerName || !comment) {
      return res.status(400).json({ success: false, message: 'Reviewer name and comment are required' });
    }

    const review = await Review.create({
      customerName: customerName.trim(),
      rating: Number(rating) || 5,
      comment: comment.trim(),
      title: title ? title.trim() : '',
      avatar: avatar || '/testimonial_avatar.png',
      book: bookId || null,
      isApproved: isApproved !== undefined ? Boolean(isApproved) : true,
      isTestimonial: isTestimonial !== undefined ? Boolean(isTestimonial) : true,
      isVerifiedPurchase: true,
      addedBy: 'admin'
    });

    if (bookId) {
      await updateBookRating(bookId);
    }

    return res.status(201).json({
      success: true,
      message: 'Review created successfully',
      review
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle Review Approval (Admin)
// @route   PUT /api/reviews/admin/:id/approve
// @access  Private (Admin)
const toggleApproveReviewAdmin = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    review.isApproved = !review.isApproved;
    await review.save();

    if (review.book) {
      await updateBookRating(review.book);
    }

    return res.json({
      success: true,
      message: `Review is now ${review.isApproved ? 'approved' : 'hidden'}`,
      review
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getBookReviews,
  addReview,
  deleteReview,
  getAllReviewsAdmin,
  getPublicTestimonials,
  createReviewAdmin,
  toggleApproveReviewAdmin
};
