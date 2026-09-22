const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  subtitle: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  badge: {
    type: String,
    default: 'Special Offer'
  },
  image: {
    type: String,
    required: true
  },
  mobileImage: {
    type: String
  },
  link: {
    type: String,
    default: '/books'
  },
  buttonText: {
    type: String,
    default: 'Explore Collection'
  },
  position: {
    type: String,
    enum: ['hero', 'featured', 'sidebar', 'footer_spotlight', 'deal_of_day'],
    default: 'hero'
  },
  theme: {
    type: String,
    default: 'dark'
  },
  discountText: {
    type: String
  },
  bookRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Banner', bannerSchema);
