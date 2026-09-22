const Cart = require('../models/Cart');
const Book = require('../models/Book');

// Helper to get or initialize cart
const findOrCreateCart = async (customerId, guestId) => {
  let cart;
  if (customerId) {
    cart = await Cart.findOne({ customer: customerId }).populate('items.book', 'title author price discountPrice images stock stockStatus slug');
    if (!cart) {
      cart = await Cart.create({ customer: customerId, items: [] });
    }
  } else if (guestId) {
    cart = await Cart.findOne({ guestId }).populate('items.book', 'title author price discountPrice images stock stockStatus slug');
    if (!cart) {
      cart = await Cart.create({ guestId, items: [] });
    }
  }
  return cart;
};

// @desc    Get Cart
// @route   GET /api/cart
// @access  Public / Optional Auth
const getCart = async (req, res) => {
  try {
    const customerId = req.customer ? req.customer._id : null;
    const guestId = req.headers['x-guest-id'] || req.query.guestId;

    if (!customerId && !guestId) {
      return res.json({ success: true, cart: { items: [] } });
    }

    const cart = await findOrCreateCart(customerId, guestId);

    // Calculate cart totals
    let subtotal = 0;
    const items = (cart ? cart.items : []).map(item => {
      const book = item.book;
      if (!book) return null;
      const unitPrice = (book.discountPrice && book.discountPrice < book.price) ? book.discountPrice : book.price;
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
        _id: cart ? cart._id : null,
        items,
        totalItems: items.reduce((sum, i) => sum + i.quantity, 0),
        subtotal
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add Item to Cart
// @route   POST /api/cart/add
// @access  Public / Optional Auth
const addToCart = async (req, res) => {
  try {
    const { bookId, quantity = 1, guestId } = req.body;
    const customerId = req.customer ? req.customer._id : null;
    const gId = guestId || req.headers['x-guest-id'];

    if (!bookId) {
      return res.status(400).json({ success: false, message: 'Book ID is required' });
    }

    const book = await Book.findById(bookId);
    if (!book || !book.isActive) {
      return res.status(404).json({ success: false, message: 'Book not found or unavailable' });
    }

    const cart = await findOrCreateCart(customerId, gId);
    if (!cart) {
      return res.status(400).json({ success: false, message: 'Could not create cart session' });
    }

    const unitPrice = (book.discountPrice && book.discountPrice < book.price) ? book.discountPrice : book.price;
    const existingIndex = cart.items.findIndex(i => i.book && i.book._id.toString() === bookId);

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += Number(quantity);
    } else {
      cart.items.push({
        book: book._id,
        quantity: Number(quantity),
        price: unitPrice
      });
    }

    await cart.save();
    return getCart(req, res);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Item Quantity
// @route   PUT /api/cart/update
// @access  Public / Optional Auth
const updateCartItem = async (req, res) => {
  try {
    const { bookId, quantity, guestId } = req.body;
    const customerId = req.customer ? req.customer._id : null;
    const gId = guestId || req.headers['x-guest-id'];

    const cart = await findOrCreateCart(customerId, gId);
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(i => i.book && i.book._id.toString() === bookId);
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    if (Number(quantity) <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = Number(quantity);
    }

    await cart.save();
    return getCart(req, res);
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
    const guestId = req.query.guestId || req.headers['x-guest-id'];
    const customerId = req.customer ? req.customer._id : null;

    const cart = await findOrCreateCart(customerId, guestId);
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter(i => i.book && i.book._id.toString() !== bookId);
    await cart.save();

    return getCart(req, res);
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
    if (!guestCart || guestCart.items.length === 0) {
      return getCart(req, res);
    }

    let customerCart = await Cart.findOne({ customer: req.customer._id });
    if (!customerCart) {
      customerCart = await Cart.create({ customer: req.customer._id, items: [] });
    }

    // Merge items
    for (const guestItem of guestCart.items) {
      const idx = customerCart.items.findIndex(i => i.book && i.book.toString() === guestItem.book.toString());
      if (idx > -1) {
        customerCart.items[idx].quantity += guestItem.quantity;
      } else {
        customerCart.items.push(guestItem);
      }
    }

    await customerCart.save();
    await Cart.findByIdAndDelete(guestCart._id);

    return getCart(req, res);
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
