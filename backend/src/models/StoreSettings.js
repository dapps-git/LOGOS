const mongoose = require('mongoose');

const storeSettingsSchema = new mongoose.Schema({
  key: {
    type: String,
    default: 'default',
    unique: true
  },
  // General Store Details
  storeName: {
    type: String,
    default: 'LOGOS Bookstore',
    trim: true
  },
  tagline: {
    type: String,
    default: 'Premium Books & Literary Collections',
    trim: true
  },
  supportEmail: {
    type: String,
    default: 'support@logosbooks.com',
    trim: true
  },
  supportPhone: {
    type: String,
    default: '+91 98765 43210',
    trim: true
  },
  gstin: {
    type: String,
    default: '32AAACL1902K1Z8',
    trim: true
  },
  // Global SEO Defaults
  defaultSeoTitle: {
    type: String,
    default: 'LOGOS Books | Malayalam & English Book Store',
    trim: true
  },
  defaultMetaDescription: {
    type: String,
    default: 'Official online bookstore for LOGOS publications, bestsellers, new arrivals, and literature.',
    trim: true
  },
  // Shipping Settings
  keralaShippingCharge: {
    type: Number,
    default: 0,
    min: 0
  },
  outsideKeralaShippingCharge: {
    type: Number,
    default: 0,
    min: 0
  },
  freeShippingFirstOrder: {
    type: Boolean,
    default: false
  },
  freeShippingOnOnlinePayment: {
    type: Boolean,
    default: true
  },
  codFeeEnabled: {
    type: Boolean,
    default: true
  },
  codFeePercent: {
    type: Number,
    default: 2,
    min: 0,
    max: 100
  },
  codFreeThreshold: {
    type: Number,
    default: 1000,
    min: 0
  },
  // Growth & Referral Parameters
  freeShippingThreshold: {
    type: Number,
    default: 999,
    min: 0
  },
  referralRewardAmount: {
    type: Number,
    default: 100,
    min: 0
  },
  friendDiscountPercent: {
    type: Number,
    default: 15,
    min: 0,
    max: 100
  },
  welcomeDiscountAmount: {
    type: Number,
    default: 100,
    min: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('StoreSettings', storeSettingsSchema);

