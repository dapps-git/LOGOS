const Order = require('../models/Order');
const Book = require('../models/Book');
const Customer = require('../models/Customer');
const Coupon = require('../models/Coupon');
const Referral = require('../models/Referral');
const Cart = require('../models/Cart');

// @desc    Process Referrer Reward Credit of ₹100 upon purchase
const creditReferrerOnPurchase = async (customerId, orderId, orderAmount) => {
  try {
    const referral = await Referral.findOne({
      referredUser: customerId,
      status: 'registered'
    });

    if (referral) {
      // Award ₹100 to referrer
      const referrer = await Customer.findById(referral.referrer);
      if (referrer) {
        referrer.referralRewardBalance = (referrer.referralRewardBalance || 0) + (referral.referrerRewardAmount || 100);
        referrer.referralRewardsEarned = (referrer.referralRewardsEarned || 0) + (referral.referrerRewardAmount || 100);
        referrer.successfulReferralsCount = (referrer.successfulReferralsCount || 0) + 1;
        await referrer.save();

        referral.status = 'rewarded';
        referral.orderId = orderId;
        referral.orderAmount = orderAmount;
        referral.rewardedAt = new Date();
        await referral.save();
      }
    }
  } catch (err) {
    console.error('[Referral Reward Error]', err.message);
  }
};

// @desc    Create a new book order
// @route   POST /api/orders
// @access  Private (Customer)
const createOrder = async (req, res) => {
  try {
    const {
      items,
      orderItems,
      shippingAddress,
      paymentMethod = 'COD',
      couponCode,
      applyReferralDiscount = false,
      useWalletBalance = false,
      customerInfo,
      notes
    } = req.body;

    const rawItems = items || orderItems;

    if (!rawItems || !Array.isArray(rawItems) || rawItems.length === 0) {
      return res.status(400).json({ success: false, message: 'Order items are required' });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.streetAddress || !shippingAddress.city || !shippingAddress.postalCode) {
      return res.status(400).json({ success: false, message: 'Complete shipping address is required' });
    }

    const cleanPin = String(shippingAddress.postalCode).replace(/\D/g, '');
    if (cleanPin.length !== 6) {
      return res.status(400).json({ success: false, message: 'PIN code must be exactly 6 digits' });
    }

    const cleanPhone = String(shippingAddress.phone).replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return res.status(400).json({ success: false, message: 'Phone number must be at least 10 digits' });
    }

    shippingAddress.postalCode = cleanPin;
    shippingAddress.phone = cleanPhone.slice(-10);
    shippingAddress.state = shippingAddress.state || 'Kerala';
    shippingAddress.postOffice = shippingAddress.postOffice || '';

    let customer = null;
    if (req.customer) {
      customer = await Customer.findById(req.customer._id);
    } else {
      // Guest customer lookup or auto-creation
      const guestEmail = (customerInfo?.email || shippingAddress?.email || `${shippingAddress.phone}@guest.logos.in`).toLowerCase().trim();
      customer = await Customer.findOne({ email: guestEmail });
      if (!customer) {
        customer = await Customer.create({
          name: customerInfo?.name || shippingAddress.fullName || 'Guest Customer',
          email: guestEmail,
          phone: customerInfo?.phone || shippingAddress.phone || '',
          addresses: [shippingAddress]
        });
      }
    }

    // Verify items, compute subtotal & check stock
    let subtotal = 0;
    const validatedItems = [];

    for (const item of rawItems) {
      const bookKey = item.bookId || item.book || item._id || item.id;
      let book = null;
      if (bookKey) {
        try {
          book = await Book.findById(bookKey);
        } catch {
          book = null;
        }
      }
      if (!book && item.title) {
        book = await Book.findOne({ title: item.title });
      }

      const qty = parseInt(item.quantity || 1, 10);
      const unitPrice = book ? ((book.discountPrice && book.discountPrice < book.price) ? book.discountPrice : book.price) : Number(item.price || 299);
      const itemSubtotal = unitPrice * qty;
      subtotal += itemSubtotal;

      validatedItems.push({
        book: book ? book._id : null,
        title: book ? book.title : (item.title || 'LOGOS Book'),
        author: book ? book.author : (item.author || 'LOGOS Author'),
        image: book && book.images && book.images[0] ? book.images[0] : (item.coverImage || item.image || '/book1.jpg'),
        price: unitPrice,
        quantity: qty,
        subtotal: itemSubtotal
      });
    }

    let referralDiscount = 0;
    let couponDiscount = 0;
    let appliedCouponName = null;
    let isReferralOrder = false;

    // 1. Check & apply Referral 15% Discount on 1st order
    if (applyReferralDiscount || (customer.isReferred && !customer.referralDiscountUsed)) {
      if (!customer.referralDiscountUsed) {
        referralDiscount = Math.round((subtotal * 15) / 100);
        isReferralOrder = true;
        customer.referralDiscountUsed = true;
      }
    }

    // 2. Check & apply Coupon Discount (if not using referral discount on 1st order)
    if (couponCode && referralDiscount === 0) {
      const coupon = await Coupon.findOne({ code: couponCode.trim().toUpperCase(), isActive: true });
      if (coupon) {
        if (coupon.isWelcomeCoupon && customer.isWelcomeOfferUsed) {
          // ignore or error
        } else if (subtotal >= coupon.minOrderValue) {
          if (coupon.discountType === 'percentage') {
            couponDiscount = (subtotal * coupon.discountValue) / 100;
            if (coupon.maxDiscount && couponDiscount > coupon.maxDiscount) {
              couponDiscount = coupon.maxDiscount;
            }
          } else {
            couponDiscount = coupon.discountValue;
          }
          couponDiscount = Math.round(Math.min(couponDiscount, subtotal));
          appliedCouponName = coupon.code;

          // Increment coupon usage
          coupon.usedCount = (coupon.usedCount || 0) + 1;
          coupon.usedBy.push(customer._id);
          await coupon.save();

          if (coupon.isWelcomeCoupon) {
            customer.isWelcomeOfferUsed = true;
          }
        }
      }
    }

    let walletDeduction = 0;
    if (useWalletBalance && customer.referralRewardBalance > 0) {
      const remainingBeforeWallet = Math.max(0, subtotal - referralDiscount - couponDiscount);
      walletDeduction = Math.min(customer.referralRewardBalance, remainingBeforeWallet);
      customer.referralRewardBalance -= walletDeduction;
    }

    const totalDiscount = referralDiscount + couponDiscount + walletDeduction;
    const finalTotal = Math.max(0, subtotal - totalDiscount);

    const normalizedPaymentMethod = (paymentMethod || 'COD').toString().toUpperCase() === 'COD' ? 'COD' : 'Online';
    const generatedOrderNumber = `LGS-${Date.now().toString().slice(-8)}-${Math.floor(100 + Math.random() * 900)}`;

    // Create Order
    const order = await Order.create({
      orderNumber: generatedOrderNumber,
      customer: customer._id,
      items: validatedItems,
      shippingAddress,
      paymentMethod: normalizedPaymentMethod,
      paymentStatus: normalizedPaymentMethod === 'COD' ? 'Pending' : 'Paid',
      subtotal,
      shippingFee: 0,
      discount: totalDiscount,
      referralDiscount,
      couponDiscount,
      appliedCoupon: appliedCouponName,
      isReferralOrder,
      totalAmount: finalTotal,
      finalTotal,
      orderStatus: 'Confirmed',
      statusHistory: [{
        status: 'Confirmed',
        timestamp: new Date(),
        note: 'Order placed successfully'
      }],
      notes
    });

    // Deduct stock for all purchased books
    for (const item of validatedItems) {
      await Book.findByIdAndUpdate(item.book, {
        $inc: { stock: -item.quantity }
      });
    }

    // Save updated customer states
    await customer.save();

    // Trigger ₹100 reward to referrer
    await creditReferrerOnPurchase(customer._id, order._id, finalTotal);

    // Clear Customer Cart
    await Cart.findOneAndUpdate({ customer: customer._id }, { $set: { items: [] } });

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged in customer's orders
// @route   GET /api/orders/my-orders
// @access  Private (Customer)
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.customer._id })
      .populate('items.book', 'title author images slug')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get order details by ID
// @route   GET /api/orders/:id
// @access  Private (Customer / Admin)
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('items.book', 'title author images slug');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // IDOR Protection: Check ownership
    const isOwner = req.customer && order.customer && order.customer._id.toString() === req.customer._id.toString();
    const isAdmin = Boolean(req.admin);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this order' });
    }

    return res.json({
      success: true,
      order
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders/admin/all
// @access  Private (Admin)
const getAllOrdersAdmin = async (req, res) => {
  try {
    const { status, paymentStatus, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.orderStatus = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('customer', 'name email phone referralCode')
        .populate('items.book', 'title author images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Order.countDocuments(query)
    ]);

    return res.json({
      success: true,
      orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/admin/:id/status
// @access  Private (Admin)
const updateOrderStatusAdmin = async (req, res) => {
  try {
    const { status, note, trackingNumber, trackingUrl } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const previousStatus = order.orderStatus;

    if (status) {
      order.orderStatus = status;
      order.statusHistory.push({
        status,
        timestamp: new Date(),
        note: note || `Order status updated to ${status}`
      });

      // Handle return review transitions
      if (['Return Accepted', 'Returned', 'Refunded'].includes(status)) {
        if (!order.returnRequest) {
          order.returnRequest = { reason: 'Return accepted', requestedAt: new Date() };
        }
        order.returnRequest.status = 'Approved';
        order.returnRequest.reviewedAt = new Date();
        if (note) order.returnRequest.adminNote = note;

        // If transitioning from un-restocked state to return accepted, restore stock
        if (!['Cancelled', 'Returned', 'Return Accepted'].includes(previousStatus)) {
          for (const item of order.items) {
            if (item.book) {
              await Book.findByIdAndUpdate(item.book, { $inc: { stock: item.quantity } });
            }
          }
        }
      } else if (status === 'Return Rejected') {
        if (!order.returnRequest) {
          order.returnRequest = { reason: 'Return requested', requestedAt: new Date() };
        }
        order.returnRequest.status = 'Rejected';
        order.returnRequest.reviewedAt = new Date();
        if (note) order.returnRequest.adminNote = note;
      }
    }

    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (trackingUrl) order.trackingUrl = trackingUrl;

    if (status === 'Delivered' && order.paymentMethod === 'COD') {
      order.paymentStatus = 'Paid';
    }

    await order.save();

    return res.json({
      success: true,
      message: `Order status updated to ${status}`,
      order
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update payment status (Admin)
// @route   PUT /api/orders/admin/:id/payment
// @access  Private (Admin)
const updatePaymentStatusAdmin = async (req, res) => {
  try {
    const { paymentStatus, transactionId } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.paymentStatus = paymentStatus;
    if (transactionId) {
      order.paymentDetails = {
        ...order.paymentDetails,
        transactionId,
        paidAt: new Date()
      };
    }

    await order.save();

    return res.json({
      success: true,
      message: 'Payment status updated',
      order
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel order (Customer or Admin)
// @route   PUT /api/orders/:id/cancel
// @access  Private (Customer / Admin)
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // IDOR Protection: Check ownership or Admin
    const isOwner = req.customer && order.customer && order.customer.toString() === req.customer._id.toString();
    const isAdmin = Boolean(req.admin);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this order' });
    }

    const currentStatus = (order.orderStatus || '').toLowerCase();
    const nonCancellable = ['shipped', 'out for delivery', 'delivered', 'cancelled', 'returned', 'refunded', 'return requested', 'return accepted'];

    if (nonCancellable.includes(currentStatus)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled as it is already ${order.orderStatus}. Once an order is shipped or delivered, cancellation is not allowed.`
      });
    }

    const cancellationReason = req.body.cancellationReason || req.body.reason || 'Order cancelled by customer';
    order.orderStatus = 'Cancelled';
    order.cancellationReason = cancellationReason;
    order.statusHistory.push({
      status: 'Cancelled',
      timestamp: new Date(),
      note: `Order cancelled. Reason: ${cancellationReason}`
    });
    order.notes = (order.notes ? order.notes + ' | ' : '') + `Cancellation Note: ${cancellationReason}`;

    // Restock books
    for (const item of order.items) {
      if (item.book) {
        await Book.findByIdAndUpdate(item.book, {
          $inc: { stock: item.quantity }
        });
      }
    }

    await order.save();

    return res.json({
      success: true,
      message: 'Order cancelled successfully and inventory restored',
      order
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Request return for delivered order (Customer)
// @route   POST /api/orders/:id/return
// @access  Private (Customer / Admin)
const requestReturn = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const isOwner = req.customer && order.customer && order.customer.toString() === req.customer._id.toString();
    const isAdmin = Boolean(req.admin);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to request return for this order' });
    }

    const currentStatus = (order.orderStatus || '').toLowerCase();
    if (currentStatus !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Return can only be requested after the order has been delivered.'
      });
    }

    if (order.returnRequest && order.returnRequest.status === 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'A return request is already submitted and under review by our admin team.'
      });
    }

    const reason = (req.body.reason || req.body.returnReason || '').trim();
    const description = (req.body.description || '').trim();
    const fullReason = [reason, description].filter(Boolean).join(' - ');

    if (!fullReason || fullReason.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid and detailed return reason.'
      });
    }

    order.orderStatus = 'Return Requested';
    order.returnRequest = {
      reason: fullReason,
      requestedAt: new Date(),
      status: 'Pending',
      adminNote: ''
    };
    order.statusHistory.push({
      status: 'Return Requested',
      timestamp: new Date(),
      note: `Customer requested return: ${fullReason}`
    });
    order.notes = (order.notes ? order.notes + ' | ' : '') + `Return Request: ${fullReason}`;

    await order.save();

    return res.json({
      success: true,
      message: 'Return request submitted successfully. It will be reviewed by admin.',
      order
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin review and approve/reject return
// @route   PUT /api/orders/admin/:id/return-review
// @access  Private (Admin)
const reviewReturnAdmin = async (req, res) => {
  try {
    const { action, note } = req.body; // 'approve' or 'reject'
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (!order.returnRequest) {
      order.returnRequest = { reason: 'Customer Return', requestedAt: new Date() };
    }

    if (action === 'approve') {
      order.orderStatus = 'Return Accepted';
      order.returnRequest.status = 'Approved';
      order.returnRequest.reviewedAt = new Date();
      order.returnRequest.adminNote = note || 'Return request accepted by admin';
      order.statusHistory.push({
        status: 'Return Accepted',
        timestamp: new Date(),
        note: note || 'Return request approved by admin. Processing return/refund.'
      });

      // Restock books
      for (const item of order.items) {
        if (item.book) {
          await Book.findByIdAndUpdate(item.book, {
            $inc: { stock: item.quantity }
          });
        }
      }
    } else if (action === 'reject') {
      order.orderStatus = 'Return Rejected';
      order.returnRequest.status = 'Rejected';
      order.returnRequest.reviewedAt = new Date();
      order.returnRequest.adminNote = note || 'Return request declined by admin';
      order.statusHistory.push({
        status: 'Return Rejected',
        timestamp: new Date(),
        note: `Return request rejected by admin: ${note || 'Did not satisfy return policy requirements'}`
      });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action. Must be approve or reject.' });
    }

    await order.save();

    return res.json({
      success: true,
      message: `Return request ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      order
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrdersAdmin,
  updateOrderStatusAdmin,
  updatePaymentStatusAdmin,
  cancelOrder,
  requestReturn,
  reviewReturnAdmin
};
