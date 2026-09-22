const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');
const Admin = require('../models/Admin');
const Referral = require('../models/Referral');

const generateToken = (id, role = 'customer') => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// @desc    Register a new customer
// @route   POST /api/auth/register
// @access  Public
const registerCustomer = async (req, res) => {
  try {
    const { name, email, password, phone, referralCode } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    const customerExists = await Customer.findOne({ email: email.toLowerCase().trim() });
    if (customerExists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    let referredByCustomer = null;
    let isReferred = false;

    // Check referral code if provided
    if (referralCode) {
      const referrer = await Customer.findOne({ referralCode: referralCode.trim().toUpperCase() });
      if (referrer) {
        referredByCustomer = referrer._id;
        isReferred = true;
      }
    }

    const customer = await Customer.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone || '',
      referredBy: referredByCustomer,
      isReferred: isReferred
    });

    // Create pending referral record if referred
    if (isReferred && referredByCustomer) {
      await Referral.create({
        referrer: referredByCustomer,
        referredUser: customer._id,
        referralCode: referralCode.trim().toUpperCase(),
        friendDiscountPercent: 15,
        referrerRewardAmount: 100,
        status: 'registered'
      });
    }

    const token = generateToken(customer._id, 'customer');

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        referralCode: customer.referralCode,
        isReferred: customer.isReferred,
        referralDiscountUsed: customer.referralDiscountUsed,
        referralRewardBalance: customer.referralRewardBalance
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login customer
// @route   POST /api/auth/login
// @access  Public
const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const customer = await Customer.findOne({ email: email.toLowerCase().trim() });
    if (!customer || !customer.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid credentials or inactive account' });
    }

    const isMatch = await customer.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(customer._id, 'customer');

    return res.json({
      success: true,
      token,
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        referralCode: customer.referralCode,
        isReferred: customer.isReferred,
        referralDiscountUsed: customer.referralDiscountUsed,
        referralRewardBalance: customer.referralRewardBalance,
        referralRewardsEarned: customer.referralRewardsEarned,
        addresses: customer.addresses
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Google OAuth / Auth Token Signin
// @route   POST /api/auth/google
// @access  Public
const googleAuth = async (req, res) => {
  try {
    const { email, name, googleId, avatar, referralCode } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required for Google Sign-In' });
    }

    let customer = await Customer.findOne({ email: email.toLowerCase().trim() });

    if (!customer) {
      let referredByCustomer = null;
      let isReferred = false;

      if (referralCode) {
        const referrer = await Customer.findOne({ referralCode: referralCode.trim().toUpperCase() });
        if (referrer) {
          referredByCustomer = referrer._id;
          isReferred = true;
        }
      }

      customer = await Customer.create({
        name: name || 'Google User',
        email: email.toLowerCase().trim(),
        googleId,
        avatar: avatar || '',
        referredBy: referredByCustomer,
        isReferred: isReferred
      });

      if (isReferred && referredByCustomer) {
        await Referral.create({
          referrer: referredByCustomer,
          referredUser: customer._id,
          referralCode: referralCode.trim().toUpperCase(),
          friendDiscountPercent: 15,
          referrerRewardAmount: 100,
          status: 'registered'
        });
      }
    } else {
      if (googleId && !customer.googleId) {
        customer.googleId = googleId;
        if (avatar) customer.avatar = avatar;
        await customer.save();
      }
    }

    const token = generateToken(customer._id, 'customer');

    return res.json({
      success: true,
      token,
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        avatar: customer.avatar,
        referralCode: customer.referralCode,
        isReferred: customer.isReferred,
        referralDiscountUsed: customer.referralDiscountUsed,
        referralRewardBalance: customer.referralRewardBalance
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Current Customer Profile
// @route   GET /api/auth/profile
// @access  Private (Customer)
const getProfile = async (req, res) => {
  try {
    const customer = await Customer.findById(req.customer._id)
      .select('-password')
      .populate('referredBy', 'name email referralCode');

    return res.json({
      success: true,
      customer
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Customer Profile
// @route   PUT /api/auth/profile
// @access  Private (Customer)
const updateProfile = async (req, res) => {
  try {
    const customer = await Customer.findById(req.customer._id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const { name, phone, avatar, password } = req.body;
    if (name) customer.name = name.trim();
    if (phone) customer.phone = phone.trim();
    if (avatar) customer.avatar = avatar;
    if (password && password.length >= 6) {
      customer.password = password;
    }

    await customer.save();

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        avatar: customer.avatar
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add / Update Shipping Address
// @route   POST /api/auth/address
// @access  Private (Customer)
const addAddress = async (req, res) => {
  try {
    const { fullName, phone, streetAddress, city, state, postalCode, country, isDefault } = req.body;

    if (!fullName || !phone || !streetAddress || !city || !state || !postalCode) {
      return res.status(400).json({ success: false, message: 'All address fields are required' });
    }

    const customer = await Customer.findById(req.customer._id);
    if (isDefault) {
      customer.addresses.forEach(a => { a.isDefault = false; });
    }

    customer.addresses.push({
      fullName,
      phone,
      streetAddress,
      city,
      state,
      postalCode,
      country: country || 'India',
      isDefault: isDefault || customer.addresses.length === 0
    });

    await customer.save();

    return res.json({
      success: true,
      message: 'Address saved successfully',
      addresses: customer.addresses
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete Address
// @route   DELETE /api/auth/address/:addressId
// @access  Private (Customer)
const deleteAddress = async (req, res) => {
  try {
    const customer = await Customer.findById(req.customer._id);
    customer.addresses = customer.addresses.filter(a => a._id.toString() !== req.params.addressId);
    await customer.save();

    return res.json({
      success: true,
      message: 'Address removed',
      addresses: customer.addresses
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Forgot Password OTP request
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const customer = await Customer.findOne({ email: email.toLowerCase().trim() });
    if (!customer) {
      return res.status(404).json({ success: false, message: 'No customer account found with this email' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    customer.resetPasswordOTP = otp;
    customer.resetPasswordOTPExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await customer.save();

    // In development or production, return OTP success
    return res.json({
      success: true,
      message: 'Reset OTP generated successfully',
      // For immediate ease of use in local/development environments
      otpPreview: process.env.NODE_ENV !== 'production' ? otp : undefined
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset Password with OTP
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required' });
    }

    const customer = await Customer.findOne({
      email: email.toLowerCase().trim(),
      resetPasswordOTP: otp,
      resetPasswordOTPExpires: { $gt: new Date() }
    });

    if (!customer) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    customer.password = newPassword;
    customer.resetPasswordOTP = undefined;
    customer.resetPasswordOTPExpires = undefined;
    await customer.save();

    return res.json({
      success: true,
      message: 'Password has been reset successfully. You can now log in.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin Login
// @route   POST /api/auth/admin/login
// @access  Public
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (!admin || !admin.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(admin._id, 'admin');

    return res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Admin Profile
// @route   GET /api/auth/admin/profile
// @access  Private (Admin)
const getAdminProfile = async (req, res) => {
  return res.json({
    success: true,
    admin: {
      id: req.admin._id,
      name: req.admin.name,
      email: req.admin.email,
      role: req.admin.role
    }
  });
};

// @desc    Get all customers (Admin)
// @route   GET /api/auth/admin/customers
// @access  Private (Admin)
const getCustomersAdmin = async (req, res) => {
  try {
    const customers = await Customer.find()
      .select('-password -resetPasswordOTP -resetPasswordOTPExpires')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: customers.length,
      customers
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerCustomer,
  loginCustomer,
  googleAuth,
  getProfile,
  updateProfile,
  addAddress,
  deleteAddress,
  forgotPassword,
  resetPassword,
  loginAdmin,
  getAdminProfile,
  getCustomersAdmin
};
