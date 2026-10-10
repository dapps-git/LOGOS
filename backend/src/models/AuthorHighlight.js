const mongoose = require('mongoose');

const authorHighlightSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    tagline: {
      type: String,
      default: 'Meet the author',
      trim: true
    },
    bio: {
      type: String,
      default: '',
      trim: true
    },
    photo: {
      type: String,
      default: '',
      trim: true
    },
    isSpotlight: {
      type: Boolean,
      default: false,
      index: true
    },
    position: {
      type: String,
      default: 'position_1'
    },
    shopLink: {
      type: String,
      default: '/products',
      trim: true
    },
    bookRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book'
    },
    order: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('AuthorHighlight', authorHighlightSchema);
