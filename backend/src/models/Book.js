const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true,
    index: true
  },
  name: {
    // Alias for compatibility
    type: String,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    sparse: true,
    index: true,
    lowercase: true,
    trim: true
  },
  author: {
    type: String,
    required: [true, 'Author name is required'],
    trim: true,
    index: true
  },
  publisher: {
    type: String,
    required: [true, 'Publisher name is required'],
    trim: true
  },
  edition: {
    type: String,
    default: '1st Edition',
    trim: true
  },
  theme: {
    type: String,
    required: [true, 'Theme or genre is required'],
    trim: true,
    index: true
  },
  genre: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    trim: true
  },
  languages: {
    type: [String],
    default: ['English'],
    validate: {
      validator: function (v) {
        return Array.isArray(v) && v.length > 0;
      },
      message: 'At least one language must be specified'
    }
  },
  pageCount: {
    type: Number,
    required: [true, 'Page count is required'],
    min: [1, 'Page count must be at least 1']
  },
  description: {
    type: String,
    required: [true, 'Book description/synopsis is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be non-negative']
  },
  discountPrice: {
    type: Number,
    default: null
  },
  discountPercent: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  stock: {
    type: Number,
    required: [true, 'Stock count is required'],
    default: 0,
    min: [0, 'Stock cannot be negative']
  },
  stockStatus: {
    type: String,
    enum: ['in_stock', 'low_stock', 'out_of_stock'],
    default: 'in_stock'
  },
  sku: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  isbn: {
    type: String,
    trim: true
  },
  images: {
    type: [String],
    required: [true, 'Book images are required'],
    validate: {
      validator: function (val) {
        return Array.isArray(val) && val.length >= 3;
      },
      message: 'A minimum of 3 photos (front cover, back cover, interior sample) are required for each book'
    }
  },
  isBestSeller: {
    type: Boolean,
    default: false,
    index: true
  },
  isNewArrival: {
    type: Boolean,
    default: true,
    index: true
  },
  isFeatured: {
    type: Boolean,
    default: false,
    index: true
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewsCount: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  tags: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

// Auto-sync name with title, compute stockStatus, and generate slug
bookSchema.pre('save', function (next) {
  if (!this.name && this.title) {
    this.name = this.title;
  }
  if (!this.title && this.name) {
    this.title = this.name;
  }
  if (!this.genre && this.theme) {
    this.genre = this.theme;
  }

  if (this.isModified('title') || !this.slug) {
    const raw = (this.title || this.name || 'book').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    this.slug = `${raw}-${Date.now().toString().slice(-6)}`;
  }

  if (this.stock === 0) {
    this.stockStatus = 'out_of_stock';
  } else if (this.stock <= 5) {
    this.stockStatus = 'low_stock';
  } else {
    this.stockStatus = 'in_stock';
  }

  if (this.discountPrice && this.discountPrice < this.price) {
    this.discountPercent = Math.round(((this.price - this.discountPrice) / this.price) * 100);
  }

  next();
});

module.exports = mongoose.model('Book', bookSchema);
