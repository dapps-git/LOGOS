const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Customer = require('../models/Customer');
const Admin = require('../models/Admin');
const Referral = require('../models/Referral');
const sendEmail = require('../utils/sendEmail');

const JWT_SECRET = process.env.JWT_SECRET || 'logos_book_store_super_secure_jwt_secret_key_2026_xyz!';

const generateToken = (id, role = 'customer') => {
  return jwt.sign({ id, role }, JWT_SECRET, {
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

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Email Uniqueness Check
    const emailExists = await Customer.findOne({ email: normalizedEmail });
    if (emailExists) {
      return res.status(400).json({ success: false, message: 'This email address is already registered.' });
    }

    // 2. Mobile Phone Number Validation & Uniqueness Check
    let cleanPhone = '';
    if (phone) {
      cleanPhone = String(phone).replace(/\D/g, '').slice(-10);
      if (cleanPhone.length < 10) {
        return res.status(400).json({ success: false, message: 'Please provide a valid 10-digit mobile number' });
      }

      const phoneExists = await Customer.findOne({
        $or: [
          { phone: cleanPhone },
          { phone: `+91${cleanPhone}` },
          { phone: `91${cleanPhone}` }
        ]
      });
      if (phoneExists) {
        return res.status(400).json({ success: false, message: 'This mobile number is already registered.' });
      }
    }

    let referredByCustomer = null;
    let isReferred = false;

    // 3. Referral Code Validation & Self-Referral Prevention
    if (referralCode && typeof referralCode === 'string' && referralCode.trim()) {
      const code = referralCode.trim().toUpperCase();
      const referrer = await Customer.findOne({ referralCode: code });
      if (!referrer) {
        return res.status(400).json({ success: false, message: 'Invalid referral code provided.' });
      }

      // Check self-referral by email or phone
      const referrerEmail = (referrer.email || '').toLowerCase().trim();
      const referrerPhone = String(referrer.phone || '').replace(/\D/g, '').slice(-10);

      if (referrerEmail === normalizedEmail || (cleanPhone && referrerPhone && referrerPhone === cleanPhone)) {
        return res.status(400).json({ success: false, message: 'You cannot use your own referral code.' });
      }

      referredByCustomer = referrer._id;
      isReferred = true;
    }

    const customer = await Customer.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      phone: cleanPhone || '',
      referredBy: referredByCustomer,
      isReferred: isReferred,
      referralEligible: false,
      firstPurchaseCompleted: false
    });

    // Create referral tracking record
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
        referralEligible: customer.referralEligible,
        isReferred: customer.isReferred,
        referralDiscountUsed: customer.referralDiscountUsed,
        referralRewardBalance: customer.referralRewardBalance
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      if (error.keyPattern && error.keyPattern.phone) {
        return res.status(400).json({ success: false, message: 'This mobile number is already registered.' });
      }
      if (error.keyPattern && error.keyPattern.email) {
        return res.status(400).json({ success: false, message: 'This email address is already registered.' });
      }
      return res.status(400).json({ success: false, message: 'An account with these details already exists.' });
    }
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

      if (referralCode && typeof referralCode === 'string' && referralCode.trim()) {
        const code = referralCode.trim().toUpperCase();
        const referrer = await Customer.findOne({ referralCode: code });
        if (referrer && referrer.email.toLowerCase().trim() !== email.toLowerCase().trim()) {
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
        isReferred: isReferred,
        referralEligible: false,
        firstPurchaseCompleted: false
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

    // Send OTP via Nodemailer
    const emailResult = await sendEmail({
      email: customer.email,
      otp,
      subject: 'LOGOS Books - Your Password Reset OTP',
      text: `Your LOGOS Books password reset verification code is: ${otp}. It is valid for 15 minutes.`
    });

    // Only expose the OTP for local testing when no SMTP is configured.
    // Never returned on a deployed server, otherwise anyone could reset any account.
    const isLocalRequest = ['localhost', '127.0.0.1', '::1'].includes(req.hostname);
    const exposeOtp = emailResult?.isDevFallback && process.env.NODE_ENV !== 'production' && isLocalRequest;

    return res.json({
      success: true,
      message: 'Password reset OTP has been sent to your email address',
      ...(exposeOtp ? { otp } : {})
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

    const cleanEmail = email.toLowerCase().trim();
    const envAdminEmail = (process.env.ADMIN_EMAIL || 'logosadmin@gmail.com').toLowerCase().trim();
    const envAdminHash = process.env.ADMIN_PASSWORD_HASH || (process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.startsWith('$2') ? process.env.ADMIN_PASSWORD : null);
    const envAdminPassword = process.env.ADMIN_PASSWORD && !process.env.ADMIN_PASSWORD.startsWith('$2') ? process.env.ADMIN_PASSWORD : null;

    let admin = await Admin.findOne({ email: cleanEmail });

    // Auto-create or seed admin if logging in with configured admin email
    if (!admin) {
      if (cleanEmail === envAdminEmail) {
        let isPassValid = false;
        if (envAdminHash && await bcrypt.compare(password, envAdminHash)) {
          isPassValid = true;
        } else if (envAdminPassword && password === envAdminPassword) {
          isPassValid = true;
        }

        if (isPassValid) {
          admin = await Admin.create({
            name: 'LOGOS Administrator',
            email: cleanEmail,
            password: password,
            role: 'superadmin',
            isActive: true
          });
        }
      }
    }

    if (!admin || !admin.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    let isMatch = await admin.comparePassword(password);
    
    // If password mismatch, check if it matches the env hash or fallback credentials and update DB
    if (!isMatch && cleanEmail === envAdminEmail) {
      const isEnvValid = (envAdminHash && await bcrypt.compare(password, envAdminHash)) ||
                         (envAdminPassword && password === envAdminPassword);
      if (isEnvValid) {
        admin.password = password;
        await admin.save();
        isMatch = true;
      }
    }

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(admin._id, 'admin');

    return res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        name: admin.name || 'LOGOS Administrator',
        email: admin.email,
        role: admin.role || 'superadmin'
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
