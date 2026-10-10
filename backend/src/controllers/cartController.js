const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const Book = require('../models/Book');

// Helper to extract clean string ID for a cart item's book
const getItemBookId = (item) => {
  if (!item || !item.book) return null;
  if (typeof item.book === 'object' && item.book !== null) {
    return (item.book._id || item.book.id || item.book).toString();
  }
  return item.book.toString();
};

// Helper to get or initialize unpopulated cart (for mutating operations)
const findOrCreateCart = async (customerId, guestId) => {
  let cart = null;
  if (customerId) {
    cart = await Cart.findOne({ customer: customerId });
    if (!cart) {
      cart = await Cart.create({ customer: customerId, items: [] });
    }
  } else if (guestId) {
    cart = await Cart.findOne({ guestId });
    if (!cart) {
      cart = await Cart.create({ guestId, items: [] });
    }
  }
  return cart;
};

// Helper to format and return populated cart response
const sendCartResponse = async (cart, res) => {
  if (!cart) {
    return res.json({
      success: true,
      cart: { items: [], totalItems: 0, subtotal: 0 }
    });
  }

  // Populate book details cleanly for client consumption
  await cart.populate('items.book', 'title name titleMalayalam author price discountPrice images coverImage stock stockStatus slug');

  let subtotal = 0;
  const items = (cart.items || []).map(item => {
    const book = item.book;
    if (!book) return null;
    const unitPrice = (book.discountPrice && book.discountPrice < book.price)
      ? book.discountPrice
      : (book.price != null ? book.price : (item.price || 0));
    const itemTotal = unitPrice * item.quantity;
    subtotal += itemTotal;
    return {
      _id: item._id,
      book: item.book,
      quantity: item.quantity,
      price: unitPrice,
      subtotal: itemTotal
    };
  }).filter(Boolean);

  return res.json({
    success: true,
    cart: {
      _id: cart._id,
      items,
      totalItems: items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal
    }
  });
};

// @desc    Get Cart
// @route   GET /api/cart
// @access  Public / Optional Auth
const getCart = async (req, res) => {
  try {
    const customerId = req.customer ? req.customer._id : null;
    const guestId = req._guestId || req.headers['x-guest-id'] || req.headers['x-guest-session-id'] || req.query.guestId || (req.body && req.body.guestId);

    if (!customerId && !guestId) {
      return res.json({ success: true, cart: { items: [], totalItems: 0, subtotal: 0 } });
    }

    const cart = await findOrCreateCart(customerId, guestId);
    return sendCartResponse(cart, res);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add Item to Cart
// @route   POST /api/cart/add
// @access  Public / Optional Auth
const addToCart = async (req, res) => {
  try {
    const rawId = req.body.bookId || req.body.id || req.body._id || (req.body.book && (req.body.book._id || req.body.book.id || req.body.book));
    const bookId = typeof rawId === 'object' && rawId !== null ? (rawId._id || rawId.id || rawId.bookId) : rawId;
    const quantity = Math.max(1, Number(req.body.quantity || 1));
    const customerId = req.customer ? req.customer._id : null;
    const gId = req.body.guestId || req.headers['x-guest-id'] || req.headers['x-guest-session-id'] || req.query.guestId || ('guest_' + Math.random().toString(36).substring(2, 12));

    if (!bookId) {
      return res.status(400).json({ success: false, message: 'Book ID is required' });
    }

    let book = null;
    if (mongoose.Types.ObjectId.isValid(bookId)) {
      book = await Book.findById(bookId);
    }
    if (!book) {
      book = await Book.findOne({ $or: [{ slug: bookId }, { sku: bookId }] });
    }
    if (!book || book.isActive === false) {
      return res.status(404).json({ success: false, message: 'Book not found or unavailable' });
    }

    const cart = await findOrCreateCart(customerId, gId);
    if (!cart) {
      return res.status(400).json({ success: false, message: 'Could not create cart session' });
    }

    const unitPrice = (book.discountPrice && book.discountPrice < book.price) ? book.discountPrice : book.price;
    const targetBookIdStr = book._id.toString();

    const existingIndex = cart.items.findIndex(i => getItemBookId(i) === targetBookIdStr);

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += quantity;
      cart.items[existingIndex].price = unitPrice;
    } else {
      cart.items.push({
        book: book._id,
        quantity: quantity,
        price: unitPrice
      });
    }

    await cart.save();
    return sendCartResponse(cart, res);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Item Quantity
// @route   PUT /api/cart/update
// @access  Public / Optional Auth
const updateCartItem = async (req, res) => {
  try {
    const rawId = req.body.bookId || req.body.id || req.body._id;
    const bookId = typeof rawId === 'object' && rawId !== null ? (rawId._id || rawId.id) : rawId;
    const quantity = Number(req.body.quantity);
    const customerId = req.customer ? req.customer._id : null;
    const gId = req.body.guestId || req.headers['x-guest-id'] || req.headers['x-guest-session-id'] || req.query.guestId;

    if (!bookId) {
      return res.status(400).json({ success: false, message: 'Book ID is required' });
    }

    const cart = await findOrCreateCart(customerId, gId);
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const targetBookIdStr = bookId.toString();
    const itemIndex = cart.items.findIndex(i => getItemBookId(i) === targetBookIdStr);
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();
    return sendCartResponse(cart, res);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove Item from Cart
// @route   DELETE /api/cart/item/:bookId
// @access  Public / Optional Auth
const removeFromCart = async (req, res) => {
  try {
    const { bookId } = req.params;
    const gId = req.query.guestId || req.headers['x-guest-id'] || req.headers['x-guest-session-id'];
    const customerId = req.customer ? req.customer._id : null;

    const cart = await findOrCreateCart(customerId, gId);
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const targetBookIdStr = bookId.toString();
    cart.items = cart.items.filter(i => getItemBookId(i) !== targetBookIdStr);
    await cart.save();

    return sendCartResponse(cart, res);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Merge Guest Cart into Customer Cart upon Login
// @route   POST /api/cart/merge
// @access  Private (Customer)
const mergeGuestCart = async (req, res) => {
  try {
    const { guestId } = req.body;
    if (!guestId) {
      return res.status(400).json({ success: false, message: 'Guest ID is required' });
    }

    const guestCart = await Cart.findOne({ guestId });
    let customerCart = await Cart.findOne({ customer: req.customer._id });
    if (!customerCart) {
      customerCart = await Cart.create({ customer: req.customer._id, items: [] });
    }

    if (guestCart && guestCart.items.length > 0) {
      for (const guestItem of guestCart.items) {
        const guestBookId = getItemBookId(guestItem);
        if (!guestBookId) continue;
        const idx = customerCart.items.findIndex(i => getItemBookId(i) === guestBookId);
        if (idx > -1) {
          customerCart.items[idx].quantity += guestItem.quantity;
        } else {
          customerCart.items.push({
            book: (guestItem.book && (guestItem.book._id || guestItem.book)) || guestBookId,
            quantity: guestItem.quantity,
            price: guestItem.price
          });
        }
      }
      await customerCart.save();
      await Cart.findByIdAndDelete(guestCart._id);
    }

    return sendCartResponse(customerCart, res);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  mergeGuestCart
};
