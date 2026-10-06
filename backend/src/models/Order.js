const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  author: {
    type: String
  },
  image: {
    type: String
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  subtotal: {
    type: Number,
    required: true
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    index: true,
    default: () => `LGS-${Date.now().toString().slice(-8)}-${Math.floor(100 + Math.random() * 900)}`
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    index: true
  },
  items: [orderItemSchema],
  shippingAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    streetAddress: { type: String, required: true },
    postOffice: { type: String, default: '' },
    city: { type: String, required: true },
    state: { type: String, required: true, default: 'Kerala' },
    postalCode: { type: String, required: true },
    country: { type: String, default: 'India' }
  },
  paymentMethod: {
    type: String,
    enum: ['COD', 'Online', 'Card', 'UPI', 'Wallet', 'cod', 'online', 'razorpay', 'RAZORPAY'],
    default: 'COD',
    set: (v) => {
      if (!v) return 'COD';
      const upper = String(v).toUpperCase();
      if (upper === 'COD') return 'COD';
      return 'Online';
    }
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  razorpayOrderId: {
    type: String,
    sparse: true,
    index: true
  },
  razorpayPaymentId: {
    type: String,
    sparse: true,
    index: true
  },
  razorpaySignature: {
    type: String
  },
  paymentDetails: {
    transactionId: String,
    paidAt: Date,
    gateway: String
  },
  subtotal: {
    type: Number,
    required: true
  },
  shippingFee: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  referralDiscount: {
    type: Number,
    default: 0
  },
  couponDiscount: {
    type: Number,
    default: 0
  },
  appliedCoupon: {
    type: String,
    default: null
  },
  isReferralOrder: {
    type: Boolean,
    default: false
  },
  totalAmount: {
    type: Number,
    required: true
  },
  finalTotal: {
    type: Number
  },
  orderStatus: {
    type: String,
    enum: [
      'Pending', 'Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned', 'Refunded',
      'Return Requested', 'Return Accepted', 'Return Rejected',
      'pending', 'confirmed', 'processing', 'shipped', 'out for delivery', 'delivered', 'cancelled', 'returned', 'refunded',
      'return requested', 'return accepted', 'return rejected'
    ],
    default: 'Pending',
    index: true
  },
  cancellationReason: {
    type: String
  },
  returnRequest: {
    reason: { type: String },
    requestedAt: { type: Date },
    reviewedAt: { type: Date },
    adminNote: { type: String },
    status: {
      type: String,
      enum: ['None', 'Pending', 'Approved', 'Rejected'],
      default: 'None'
    }
  },
  statusHistory: [{
    status: { type: String },
    timestamp: { type: Date, default: Date.now },
    note: { type: String }
  }],
  trackingNumber: {
    type: String
  },
  trackingUrl: {
    type: String
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

orderSchema.pre('save', function (next) {
  if (!this.finalTotal) {
    this.finalTotal = this.totalAmount;
  }
  if (!this.orderNumber) {
    this.orderNumber = `LGS-${Date.now().toString().slice(-8)}-${Math.floor(100 + Math.random() * 900)}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
