const Order = require('../models/Order');
const Book = require('../models/Book');
const Customer = require('../models/Customer');
const Coupon = require('../models/Coupon');
const Referral = require('../models/Referral');
const Cart = require('../models/Cart');
const {
  evaluateCustomerReferralEligibility,
  processReferralRewardOnCompletion
} = require('../utils/referralService');

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

    if (!req.customer) {
      return res.status(401).json({
        success: false,
        message: 'You must be logged in to place an order. Please sign in or create an account.'
      });
    }

    const customer = await Customer.findById(req.customer._id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer account not found. Please log in again.'
      });
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

    // 2. Check & apply Coupon Discount (supports combining with 15% referral discount, order >= 1000)
    const effectiveCouponCode = couponCode || req.body.appliedCoupon;
    if (effectiveCouponCode && subtotal >= 1000) {
      const coupon = await Coupon.findOne({ code: String(effectiveCouponCode).trim().toUpperCase(), isActive: true });
      if (coupon) {
        if (coupon.isWelcomeCoupon && customer.isWelcomeOfferUsed) {
          // ignore already used welcome coupon
        } else if (subtotal >= (coupon.minOrderValue || 0)) {
          if (coupon.discountType === 'percentage') {
            couponDiscount = (subtotal * coupon.discountValue) / 100;
            if (coupon.maxDiscount && couponDiscount > coupon.maxDiscount) {
              couponDiscount = coupon.maxDiscount;
            }
          } else {
            couponDiscount = coupon.discountValue;
          }
          couponDiscount = Math.round(Math.min(couponDiscount, Math.max(0, subtotal - referralDiscount)));
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

    const totalDiscount = Math.min(subtotal, referralDiscount + couponDiscount + walletDeduction);

    const normalizedPaymentMethod = (paymentMethod || 'COD').toString().toUpperCase() === 'COD' ? 'COD' : 'Online';
    // Shipping fee: COD is FREE if subtotal >= 1000, otherwise 2% of product price. Online/Prepaid is FREE (0)
    const shippingFee = normalizedPaymentMethod === 'COD' ? (subtotal >= 1000 ? 0 : Math.round(subtotal * 0.02)) : 0;
    const finalTotal = Math.max(0, subtotal - totalDiscount + shippingFee);

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
      shippingFee,
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

    // Referral Handling:
    // Online Payment: If paid online immediately, trigger reward to referrer and eligibility for customer.
    // COD: DO NOT trigger yet; will be processed upon successful delivery.
    if (normalizedPaymentMethod === 'Online') {
      await processReferralRewardOnCompletion(order);
      await evaluateCustomerReferralEligibility(customer._id, order._id);
    }

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
      if (['Return Accepted', 'Approved', 'Return Approved', 'Returned', 'Refunded', 'Pickup Scheduled', 'Received', 'Return Received', 'Refund Initiated'].includes(status)) {
        if (!order.returnRequest) {
          order.returnRequest = { reason: 'Return accepted', requestedAt: new Date() };
        }
        order.returnRequest.status = ['Return Accepted', 'Approved', 'Return Approved'].includes(status) ? 'Approved' : status;
        order.returnRequest.reviewedAt = new Date();
        if (note) order.returnRequest.adminNote = note;

        // If transitioning from un-restocked state to return accepted, restore stock
        if (['Return Accepted', 'Approved', 'Return Approved', 'Returned', 'Refunded'].includes(status) && !['Cancelled', 'Returned', 'Return Accepted', 'Approved', 'Return Approved'].includes(previousStatus)) {
          for (const item of order.items) {
            if (item.book) {
              await Book.findByIdAndUpdate(item.book, { $inc: { stock: item.quantity } });
            }
          }
        }
      } else if (['Return Rejected', 'Rejected'].includes(status)) {
        if (!order.returnRequest) {
          order.returnRequest = { reason: 'Return requested', requestedAt: new Date() };
        }
        order.returnRequest.status = 'Rejected';
        order.returnRequest.reviewedAt = new Date();
        if (note) order.returnRequest.adminNote = note;
      } else if (['Under Review', 'Return Under Review', 'Return Requested', 'Requested'].includes(status)) {
        if (!order.returnRequest) {
          order.returnRequest = { reason: 'Return requested', requestedAt: new Date() };
        }
        order.returnRequest.status = status === 'Requested' ? 'Return Requested' : status;
        if (note) order.returnRequest.adminNote = note;
      }
    }

    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (trackingUrl) order.trackingUrl = trackingUrl;

    if (status === 'Delivered' && order.paymentMethod === 'COD') {
      order.paymentStatus = 'Paid';
    }

    await order.save();

    // Trigger Referral Rewards and Eligibility on delivery
    if ((status || '').toLowerCase() === 'delivered') {
      await processReferralRewardOnCompletion(order);
      await evaluateCustomerReferralEligibility(order.customer, order._id);
    }

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

// @desc    Initialize Razorpay order
// @route   POST /api/orders/razorpay/create
// @access  Private (Customer)
const createRazorpayOrder = async (req, res) => {
  try {
    const { getRazorpayKeys, getRazorpayInstance } = require('../utils/razorpay');
    const { items, orderItems, shippingAddress, couponCode, applyReferralDiscount, useWalletBalance } = req.body;

    if (!req.customer) {
      return res.status(401).json({ success: false, message: 'You must be logged in to proceed with online payment.' });
    }

    const rawItems = items || orderItems;
    if (!rawItems || !Array.isArray(rawItems) || rawItems.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in order' });
    }

    const customer = await Customer.findById(req.customer._id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    let subtotal = 0;
    for (const item of rawItems) {
      const bookKey = item.bookId || item.book || item._id || item.id;
      let book = null;
      if (bookKey) {
        try { book = await Book.findById(bookKey); } catch { book = null; }
      }
      if (!book && item.title) {
        book = await Book.findOne({ title: item.title });
      }
      const qty = parseInt(item.quantity || 1, 10);
      const unitPrice = book ? ((book.discountPrice && book.discountPrice < book.price) ? book.discountPrice : book.price) : Number(item.price || 299);
      subtotal += unitPrice * qty;
    }

    let referralDiscount = 0;
    let couponDiscount = 0;

    // Referral 15% discount
    if (applyReferralDiscount || (customer.isReferred && !customer.referralDiscountUsed)) {
      if (!customer.referralDiscountUsed) {
        referralDiscount = Math.round((subtotal * 15) / 100);
      }
    }

    // Coupon discount (supports combining with referral discount)
    const effectiveCouponCode = couponCode || req.body.appliedCoupon;
    if (effectiveCouponCode && subtotal >= 1000) {
      const coupon = await Coupon.findOne({ code: String(effectiveCouponCode).trim().toUpperCase(), isActive: true });
      if (coupon && (!coupon.isWelcomeCoupon || !customer.isWelcomeOfferUsed)) {
        if (subtotal >= (coupon.minOrderValue || 0)) {
          if (coupon.discountType === 'percentage') {
            couponDiscount = (subtotal * coupon.discountValue) / 100;
            if (coupon.maxDiscount && couponDiscount > coupon.maxDiscount) couponDiscount = coupon.maxDiscount;
          } else {
            couponDiscount = coupon.discountValue;
          }
          couponDiscount = Math.round(Math.min(couponDiscount, Math.max(0, subtotal - referralDiscount)));
        }
      }
    }

    let walletDeduction = 0;
    if (useWalletBalance && customer.referralRewardBalance > 0) {
      const remainingBeforeWallet = Math.max(0, subtotal - referralDiscount - couponDiscount);
      walletDeduction = Math.min(customer.referralRewardBalance, remainingBeforeWallet);
    }

    const totalDiscount = referralDiscount + couponDiscount + walletDeduction;
    // Online payment gives FREE shipping
    const shippingFee = 0;
    const finalTotal = Math.max(1, subtotal - totalDiscount + shippingFee);

    const { keyId, keySecret } = getRazorpayKeys();
    const razorpay = getRazorpayInstance();

    if (!razorpay || !keyId || !keySecret) {
      return res.status(500).json({
        success: false,
        message: 'Razorpay payment gateway is not properly configured.'
      });
    }

    const receipt = `rcpt_${Date.now().toString().slice(-8)}_${Math.floor(Math.random() * 1000)}`;
    const amountInPaise = Math.round(finalTotal * 100);

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt,
      notes: {
        customerId: customer._id.toString(),
        customerEmail: customer.email,
        customerName: customer.name,
        customerPhone: shippingAddress?.phone || customer.phone || '',
        itemCount: rawItems.length.toString()
      }
    });

    return res.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId,
      verifiedTotal: finalTotal,
      prefill: {
        name: customer.name || shippingAddress?.fullName || 'Customer',
        email: customer.email,
        contact: shippingAddress?.phone || customer.phone || ''
      }
    });
  } catch (error) {
    console.error('Razorpay create order error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to initialize Razorpay order' });
  }
};

// @desc    Verify Razorpay payment signature & finalize order
// @route   POST /api/orders/razorpay/verify
// @access  Private (Customer)
const verifyRazorpayPayment = async (req, res) => {
  try {
    const { verifyRazorpaySignature, getRazorpayInstance } = require('../utils/razorpay');
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      orderItems,
      shippingAddress,
      couponCode,
      applyReferralDiscount,
      useWalletBalance,
      notes
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing Razorpay payment verification credentials' });
    }

    const isValid = verifyRazorpaySignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature
    });

    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature. Verification failed.' });
    }

    // Check idempotency: order already created?
    const existingOrder = await Order.findOne({
      $or: [
        { razorpayPaymentId: razorpay_payment_id },
        { razorpayOrderId: razorpay_order_id }
      ]
    });
    if (existingOrder) {
      return res.json({ success: true, order: existingOrder });
    }

    if (!req.customer) {
      return res.status(401).json({ success: false, message: 'User authentication required' });
    }

    const customer = await Customer.findById(req.customer._id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer record not found' });
    }

    const rawItems = items || orderItems;
    let subtotal = 0;
    const validatedItems = [];

    for (const item of rawItems) {
      const bookKey = item.bookId || item.book || item._id || item.id;
      let book = null;
      if (bookKey) {
        try { book = await Book.findById(bookKey); } catch { book = null; }
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

    if (applyReferralDiscount || (customer.isReferred && !customer.referralDiscountUsed)) {
      if (!customer.referralDiscountUsed) {
        referralDiscount = Math.round((subtotal * 15) / 100);
        isReferralOrder = true;
        customer.referralDiscountUsed = true;
      }
    }

    const effectiveCouponCode = couponCode || req.body.appliedCoupon;
    if (effectiveCouponCode && subtotal >= 1000) {
      const coupon = await Coupon.findOne({ code: String(effectiveCouponCode).trim().toUpperCase(), isActive: true });
      if (coupon && (!coupon.isWelcomeCoupon || !customer.isWelcomeOfferUsed)) {
        if (subtotal >= (coupon.minOrderValue || 0)) {
          if (coupon.discountType === 'percentage') {
            couponDiscount = (subtotal * coupon.discountValue) / 100;
            if (coupon.maxDiscount && couponDiscount > coupon.maxDiscount) couponDiscount = coupon.maxDiscount;
          } else {
            couponDiscount = coupon.discountValue;
          }
          couponDiscount = Math.round(Math.min(couponDiscount, Math.max(0, subtotal - referralDiscount)));
          appliedCouponName = coupon.code;

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

    const totalDiscount = Math.min(subtotal, referralDiscount + couponDiscount + walletDeduction);
    const shippingFee = 0; // FREE for online
    const finalTotal = Math.max(1, subtotal - totalDiscount + shippingFee);

    const generatedOrderNumber = `LGS-${Date.now().toString().slice(-8)}-${Math.floor(100 + Math.random() * 900)}`;

    const order = await Order.create({
      orderNumber: generatedOrderNumber,
      customer: customer._id,
      items: validatedItems,
      shippingAddress,
      paymentMethod: 'Online',
      paymentStatus: 'Paid',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      paymentDetails: {
        transactionId: razorpay_payment_id,
        paidAt: new Date(),
        gateway: 'Razorpay'
      },
      subtotal,
      shippingFee,
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
        note: `Payment verified via Razorpay. Payment ID: ${razorpay_payment_id}`
      }],
      notes
    });

    for (const item of validatedItems) {
      if (item.book) {
        await Book.findByIdAndUpdate(item.book, { $inc: { stock: -item.quantity } });
      }
    }

    await customer.save();
    await processReferralRewardOnCompletion(order);
    await evaluateCustomerReferralEligibility(customer._id, order._id);
    await Cart.findOneAndUpdate({ customer: customer._id }, { $set: { items: [] } });

    return res.status(201).json({
      success: true,
      message: 'Payment verified and order created successfully',
      order
    });
  } catch (error) {
    console.error('Razorpay payment verification error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Payment verification failed' });
  }
};

module.exports = {
  createOrder,
  createRazorpayOrder,
  verifyRazorpayPayment,
  getMyOrders,
  getOrderById,
  getAllOrdersAdmin,
  updateOrderStatusAdmin,
  updatePaymentStatusAdmin,
  cancelOrder,
  requestReturn,
  reviewReturnAdmin
};
