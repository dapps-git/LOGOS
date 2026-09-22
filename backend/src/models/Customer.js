const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  streetAddress: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, default: 'India' },
  isDefault: { type: Boolean, default: false }
});

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters']
  },
  phone: {
    type: String,
    trim: true
  },
  avatar: {
    type: String
  },
  googleId: {
    type: String,
    sparse: true
  },
  addresses: [addressSchema],
  
  // Referral System Fields
  referralCode: {
    type: String,
    unique: true,
    sparse: true,
    uppercase: true,
    trim: true,
    index: true
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    default: null
  },
  isReferred: {
    type: Boolean,
    default: false
  },
  referralDiscountUsed: {
    type: Boolean,
    default: false
  },
  referralRewardsEarned: {
    type: Number,
    default: 0
  },
  referralRewardBalance: {
    type: Number,
    default: 0
  },
  successfulReferralsCount: {
    type: Number,
    default: 0
  },
  
  // Welcome & Coupon Rules
  isWelcomeOfferUsed: {
    type: Boolean,
    default: false
  },
  
  // Password Reset
  resetPasswordOTP: {
    type: String
  },
  resetPasswordOTPExpires: {
    type: Date
  },

  role: {
    type: String,
    default: 'customer'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Generate unique referral code if none exists
customerSchema.pre('save', async function (next) {
  if (!this.referralCode) {
    const randomChars = Math.random().toString(36).substring(2, 7).toUpperCase();
    this.referralCode = `LOGOS-${randomChars}`;
  }

  if (this.isModified('password') && this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Compare password
customerSchema.methods.comparePassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Customer', customerSchema);
