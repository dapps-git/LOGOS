const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  referrer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    index: true
  },
  referredUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    unique: true,
    index: true
  },
  referralCode: {
    type: String,
    required: true,
    uppercase: true
  },
  friendDiscountPercent: {
    type: Number,
    default: 15
  },
  referrerRewardAmount: {
    type: Number,
    default: 100
  },
  status: {
    type: String,
    enum: ['registered', 'rewarded', 'cancelled'],
    default: 'registered'
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  orderAmount: {
    type: Number
  },
  rewardedAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Referral', referralSchema);
