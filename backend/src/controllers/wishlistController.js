const Wishlist = require('../models/Wishlist');
const Book = require('../models/Book');

const findOrCreateWishlist = async (customerId, guestId) => {
  let wishlist;
  if (customerId) {
    wishlist = await Wishlist.findOne({ customer: customerId }).populate('books', 'title author price discountPrice discountPercent images stock stockStatus slug rating');
    if (!wishlist) {
      wishlist = await Wishlist.create({ customer: customerId, books: [] });
    }
  } else if (guestId) {
    wishlist = await Wishlist.findOne({ guestId }).populate('books', 'title author price discountPrice discountPercent images stock stockStatus slug rating');
    if (!wishlist) {
      wishlist = await Wishlist.create({ guestId, books: [] });
    }
  }
  return wishlist;
};

// @desc    Get Wishlist
// @route   GET /api/wishlist
// @access  Public / Optional Auth
const getWishlist = async (req, res) => {
  try {
    const customerId = req.customer ? req.customer._id : null;
    const guestId = req.headers['x-guest-id'] || req.headers['x-guest-session-id'] || req.query.guestId;

    if (!customerId && !guestId) {
      return res.json({ success: true, wishlist: { books: [] } });
    }

    const wishlist = await findOrCreateWishlist(customerId, guestId);
    return res.json({
      success: true,
      wishlist: {
        _id: wishlist ? wishlist._id : null,
        books: wishlist ? wishlist.books.filter(Boolean) : []
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle Book in Wishlist (Add if absent, Remove if present)
// @route   POST /api/wishlist/toggle
// @access  Public / Optional Auth
const toggleWishlist = async (req, res) => {
  try {
    const rawId = req.body.bookId || req.body.id || req.body._id || (req.body.book && (req.body.book._id || req.body.book.id || req.body.book));
    const bookId = typeof rawId === 'object' && rawId !== null ? (rawId._id || rawId.id || rawId.bookId) : rawId;
    const customerId = req.customer ? req.customer._id : null;
    const gId = req.body.guestId || req.headers['x-guest-id'] || req.headers['x-guest-session-id'] || req.query.guestId || ('guest_' + Math.random().toString(36).substring(2, 12));

    if (!bookId) {
      return res.status(400).json({ success: false, message: 'Book ID is required' });
    }

    let targetBookId = bookId;
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      const found = await Book.findOne({ $or: [{ slug: bookId }, { sku: bookId }] });
      if (found) targetBookId = found._id.toString();
    }

    let wishlist;
    if (customerId) {
      wishlist = await Wishlist.findOne({ customer: customerId });
      if (!wishlist) wishlist = await Wishlist.create({ customer: customerId, books: [] });
    } else {
      wishlist = await Wishlist.findOne({ guestId: gId });
      if (!wishlist) wishlist = await Wishlist.create({ guestId: gId, books: [] });
    }

    const exists = wishlist.books.some(b => (b._id ? b._id.toString() : b.toString()) === targetBookId);
    let action = 'added';

    if (exists) {
      wishlist.books = wishlist.books.filter(b => (b._id ? b._id.toString() : b.toString()) !== targetBookId);
      action = 'removed';
    } else {
      wishlist.books.push(targetBookId);
    }

    await wishlist.save();

    const populated = await Wishlist.findById(wishlist._id).populate('books', 'title author price discountPrice discountPercent images stock stockStatus slug rating');

    return res.json({
      success: true,
      message: `Book ${action} ${action === 'added' ? 'to' : 'from'} wishlist`,
      action,
      wishlist: {
        _id: populated._id,
        books: populated.books.filter(Boolean)
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Merge Guest Wishlist to Customer Wishlist
// @route   POST /api/wishlist/merge
// @access  Private (Customer)
const mergeGuestWishlist = async (req, res) => {
  try {
    const { guestId } = req.body;
    if (!guestId) {
      return res.status(400).json({ success: false, message: 'Guest ID is required' });
    }

    const guestWishlist = await Wishlist.findOne({ guestId });
    if (!guestWishlist || guestWishlist.books.length === 0) {
      return getWishlist(req, res);
    }

    let customerWishlist = await Wishlist.findOne({ customer: req.customer._id });
    if (!customerWishlist) {
      customerWishlist = await Wishlist.create({ customer: req.customer._id, books: [] });
    }

    for (const bookId of guestWishlist.books) {
      if (!customerWishlist.books.includes(bookId)) {
        customerWishlist.books.push(bookId);
      }
    }

    await customerWishlist.save();
    await Wishlist.findByIdAndDelete(guestWishlist._id);

    return getWishlist(req, res);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getWishlist,
  toggleWishlist,
  mergeGuestWishlist
};
