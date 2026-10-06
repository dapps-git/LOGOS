const mongoose = require('mongoose');
const Coupon = require('../models/Coupon');
const Customer = require('../models/Customer');

// @desc    Validate and calculate coupon discount
// @route   POST /api/coupons/validate
// @access  Public / Optional Auth
const validateCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Please provide a coupon code' });
    }

    const orderAmount = Number(cartTotal) || 0;
    const couponCode = code.trim().toUpperCase();

    const coupon = await Coupon.findOne({ code: couponCode, isActive: true });

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid or expired coupon code' });
    }

    // Expiry check
    const now = new Date();
    if (coupon.validFrom && now < new Date(coupon.validFrom)) {
      return res.status(400).json({ success: false, message: 'Coupon is not yet active' });
    }
    if (coupon.validUntil && now > new Date(coupon.validUntil)) {
      return res.status(400).json({ success: false, message: 'Coupon has expired' });
    }

    // Usage limit check
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
    }

    // Coupons rule: only applicable on orders of ₹1,000 or more
    if (orderAmount < 1000) {
      return res.status(400).json({
        success: false,
        message: 'Coupons are applicable only on orders above ₹1,000'
      });
    }

    // Min order value from admin
    if (coupon.minOrderValue && orderAmount < coupon.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Minimum order value of ₹${coupon.minOrderValue} required for this coupon`
      });
    }

    // Check user specific usage if authenticated
    if (req.customer) {
      const customer = await Customer.findById(req.customer._id);

      // Rule: Welcome coupon exclusivity
      if (coupon.isWelcomeCoupon) {
        if (customer.isWelcomeOfferUsed) {
          return res.status(400).json({
            success: false,
            message: 'Welcome offer can only be used once per account'
          });
        }
      }

      const alreadyUsed = coupon.usedBy && coupon.usedBy.some(id => id.toString() === customer._id.toString());
      if (alreadyUsed) {
        return res.status(400).json({
          success: false,
          message: 'You have already redeemed this coupon code'
        });
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (orderAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = coupon.discountValue;
      if (discountAmount > orderAmount) {
        discountAmount = orderAmount;
      }
    }

    discountAmount = Math.round(discountAmount);

    return res.json({
      success: true,
      message: `Coupon applied: ₹${discountAmount} discount`,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        maxDiscount: coupon.maxDiscount,
        minOrderValue: coupon.minOrderValue,
        isWelcomeCoupon: coupon.isWelcomeCoupon
      },
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
      finalAmount: Math.max(0, orderAmount - discountAmount)
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get public available coupons
// @route   GET /api/coupons/available
// @access  Public / Optional Auth
const getAvailableCoupons = async (req, res) => {
  try {
    const now = new Date();
    const query = {
      isActive: true,
      $or: [{ validUntil: null }, { validUntil: { $gte: now } }]
    };

    let coupons = await Coupon.find(query).sort({ discountValue: -1 });

    // If user is authenticated and referred on first order, filter out welcome coupons
    if (req.customer) {
      if (req.customer.isReferred && !req.customer.referralDiscountUsed) {
        coupons = coupons.filter(c => !c.isWelcomeCoupon);
      }
    }

    return res.json({
      success: true,
      coupons
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all coupons (Admin)
// @route   GET /api/coupons/admin/all
// @access  Private (Admin)
const getAllCouponsAdmin = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return res.json({
      success: true,
      count: coupons.length,
      coupons
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create coupon (Admin)
// @route   POST /api/coupons
// @access  Private (Admin)
const createCoupon = async (req, res) => {
  try {
    const { code, description, discountType, discountValue, minOrderValue, maxDiscount, validUntil, usageLimit, isWelcomeCoupon } = req.body;

    if (!code || !discountValue) {
      return res.status(400).json({ success: false, message: 'Coupon code and discount value are required' });
    }

    const existing = await Coupon.findOne({ code: code.trim().toUpperCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Coupon code already exists' });
    }

    const coupon = await Coupon.create({
      code: code.trim().toUpperCase(),
      description,
      discountType: discountType || 'percentage',
      discountValue: Number(discountValue),
      minOrderValue: minOrderValue ? Number(minOrderValue) : 0,
      maxDiscount: maxDiscount ? Number(maxDiscount) : null,
      validUntil: validUntil ? new Date(validUntil) : null,
      usageLimit: usageLimit ? Number(usageLimit) : null,
      isWelcomeCoupon: Boolean(isWelcomeCoupon)
    });

    return res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      coupon
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update coupon (Admin)
// @route   PUT /api/coupons/:id
// @access  Private (Admin)
const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    if (req.body.code) {
      req.body.code = req.body.code.trim().toUpperCase();
    }

    Object.assign(coupon, req.body);
    await coupon.save();

    return res.json({
      success: true,
      message: 'Coupon updated successfully',
      coupon
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete coupon (Admin)
// @route   DELETE /api/coupons/:id
// @access  Private (Admin)
const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    let coupon = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      coupon = await Coupon.findById(id);
    }
    if (!coupon) {
      coupon = await Coupon.findOne({ code: String(id).toUpperCase().trim() });
    }

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    await Coupon.findByIdAndDelete(coupon._id);

    return res.json({
      success: true,
      message: `Coupon ${coupon.code} deleted successfully`
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  validateCoupon,
  getAvailableCoupons,
  getAllCouponsAdmin,
  createCoupon,
  updateCoupon,
  deleteCoupon
};
