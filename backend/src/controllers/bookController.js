const Book = require('../models/Book');
const cloudinary = require('../config/cloudinary');

// @desc    Get all books with rich filters, search, pagination, and sorting
// @route   GET /api/books
// @access  Public
const getBooks = async (req, res) => {
  try {
    const {
      search,
      theme,
      genre,
      category,
      author,
      publisher,
      language,
      minPrice,
      maxPrice,
      isBestSeller,
      isNewArrival,
      isFeatured,
      stockStatus,
      sortBy,
      page = 1,
      limit = 12
    } = req.query;

    const query = { isActive: true };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { publisher: { $regex: search, $options: 'i' } },
        { theme: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (theme) query.theme = { $regex: new RegExp(`^${theme}$`, 'i') };
    if (genre) query.$or = [{ theme: { $regex: new RegExp(`^${genre}$`, 'i') } }, { genre: { $regex: new RegExp(`^${genre}$`, 'i') } }];
    if (category) query.category = category;
    if (author) query.author = { $regex: new RegExp(`^${author}$`, 'i') };
    if (publisher) query.publisher = { $regex: new RegExp(`^${publisher}$`, 'i') };
    if (language) query.languages = { $in: [new RegExp(language, 'i')] };

    if (isBestSeller === 'true') query.isBestSeller = true;
    if (isNewArrival === 'true') query.isNewArrival = true;
    if (isFeatured === 'true') query.isFeatured = true;
    if (stockStatus) query.stockStatus = stockStatus;

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let sort = { createdAt: -1 };
    if (sortBy === 'price_asc' || sortBy === 'price-asc') sort = { price: 1 };
    if (sortBy === 'price_desc' || sortBy === 'price-desc') sort = { price: -1 };
    if (sortBy === 'rating') sort = { rating: -1, reviewsCount: -1 };
    if (sortBy === 'popular' || sortBy === 'bestseller') sort = { isBestSeller: -1, rating: -1 };
    if (sortBy === 'title') sort = { title: 1 };

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [books, total] = await Promise.all([
      Book.find(query).sort(sort).skip(skip).limit(limitNum),
      Book.countDocuments(query)
    ]);

    return res.json({
      success: true,
      books,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single book by ID or Slug
// @route   GET /api/books/:idOrSlug
// @access  Public
const getBookByIdOrSlug = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    let book;

    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      book = await Book.findById(idOrSlug);
    } else {
      book = await Book.findOne({ slug: idOrSlug });
    }

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    // Also fetch related books in the same theme or author
    const relatedBooks = await Book.find({
      _id: { $ne: book._id },
      isActive: true,
      $or: [{ theme: book.theme }, { author: book.author }]
    }).limit(4);

    return res.json({
      success: true,
      book,
      relatedBooks
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Best Sellers
// @route   GET /api/books/collections/best-sellers
// @access  Public
const getBestSellers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || '8', 10);
    const books = await Book.find({ isActive: true, isBestSeller: true })
      .sort({ rating: -1, createdAt: -1 })
      .limit(limit);

    return res.json({
      success: true,
      count: books.length,
      books
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get New Arrivals
// @route   GET /api/books/collections/new-arrivals
// @access  Public
const getNewArrivals = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || '8', 10);
    const books = await Book.find({ isActive: true, isNewArrival: true })
      .sort({ createdAt: -1 })
      .limit(limit);

    return res.json({
      success: true,
      count: books.length,
      books
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Featured Books
// @route   GET /api/books/collections/featured
// @access  Public
const getFeaturedBooks = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || '8', 10);
    const books = await Book.find({ isActive: true, isFeatured: true })
      .sort({ createdAt: -1 })
      .limit(limit);

    return res.json({
      success: true,
      count: books.length,
      books
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get List of Themes, Genres, Authors, Languages for UI Filters
// @route   GET /api/books/filters/options
// @access  Public
const getFilterOptions = async (req, res) => {
  try {
    const [themes, authors, publishers, languages] = await Promise.all([
      Book.distinct('theme', { isActive: true }),
      Book.distinct('author', { isActive: true }),
      Book.distinct('publisher', { isActive: true }),
      Book.distinct('languages', { isActive: true })
    ]);

    return res.json({
      success: true,
      options: {
        themes: themes.filter(Boolean),
        authors: authors.filter(Boolean),
        publishers: publishers.filter(Boolean),
        languages: languages.filter(Boolean)
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new book (Admin)
// @route   POST /api/books
// @access  Private (Admin)
const createBook = async (req, res) => {
  try {
    const {
      title,
      name,
      author,
      publisher,
      edition,
      theme,
      genre,
      category,
      languages,
      pageCount,
      description,
      price,
      discountPrice,
      stock,
      images,
      sku,
      isbn,
      isBestSeller,
      isNewArrival,
      isFeatured,
      tags
    } = req.body;

    const bookTitle = title || name;
    if (!bookTitle || !author || !publisher || !theme || !pageCount || !description || price === undefined || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required book fields: title, author, publisher, theme, pageCount, description, price, stock'
      });
    }

    if (!Array.isArray(images) || images.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least 3 photos per product (front cover, back cover, sample page)'
      });
    }

    const book = await Book.create({
      title: bookTitle.trim(),
      name: bookTitle.trim(),
      author: author.trim(),
      publisher: publisher.trim(),
      edition: edition || '1st Edition',
      theme: theme.trim(),
      genre: genre || theme.trim(),
      category: category || theme.trim(),
      languages: Array.isArray(languages) && languages.length > 0 ? languages : ['English'],
      pageCount: Number(pageCount),
      description: description.trim(),
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : null,
      stock: Number(stock),
      images,
      sku: sku || `LGS-BK-${Date.now().toString().slice(-6)}`,
      isbn: isbn || '',
      isBestSeller: Boolean(isBestSeller),
      isNewArrival: isNewArrival !== undefined ? Boolean(isNewArrival) : true,
      isFeatured: Boolean(isFeatured),
      tags: Array.isArray(tags) ? tags : []
    });

    return res.status(201).json({
      success: true,
      message: 'Book added successfully',
      book
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update book (Admin)
// @route   PUT /api/books/:id
// @access  Private (Admin)
const updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    const { images, ...otherFields } = req.body;

    if (images !== undefined) {
      if (!Array.isArray(images) || images.length < 3) {
        return res.status(400).json({
          success: false,
          message: 'A minimum of 3 photos are required per book'
        });
      }
      book.images = images;
    }

    Object.assign(book, otherFields);
    await book.save();

    return res.json({
      success: true,
      message: 'Book updated successfully',
      book
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete book (Admin)
// @route   DELETE /api/books/:id
// @access  Private (Admin)
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    await Book.findByIdAndDelete(req.params.id);

    return res.json({
      success: true,
      message: 'Book deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload image to Cloudinary
// @route   POST /api/books/upload-image
// @access  Private (Admin)
const uploadBookImage = async (req, res) => {
  try {
    const { image } = req.body; // base64 or url
    if (!image) {
      return res.status(400).json({ success: false, message: 'No image data provided' });
    }

    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: 'logos_books',
      transformation: [{ width: 1000, crop: 'limit' }]
    });

    return res.json({
      success: true,
      url: uploadResponse.secure_url,
      public_id: uploadResponse.public_id
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getBooks,
  getBookByIdOrSlug,
  getBestSellers,
  getNewArrivals,
  getFeaturedBooks,
  getFilterOptions,
  createBook,
  updateBook,
  deleteBook,
  uploadBookImage
};
