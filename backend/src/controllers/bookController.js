const Book = require('../models/Book');
const AuthorHighlight = require('../models/AuthorHighlight');
const cloudinary = require('../config/cloudinary');

// Helper to upload base64 or remote URL images to Cloudinary in WebP format
const uploadToCloudinaryWebp = async (imageInput, folder = 'logos_books') => {
  if (!imageInput || typeof imageInput !== 'string') return imageInput;
  if (imageInput.includes('res.cloudinary.com') && (imageInput.includes('f_webp') || imageInput.endsWith('.webp'))) {
    return imageInput;
  }

  const uploadResponse = await cloudinary.uploader.upload(imageInput, {
    folder,
    format: 'webp',
    transformation: [
      { width: 1200, crop: 'limit' },
      { quality: 'auto', fetch_format: 'webp' }
    ]
  });
  return uploadResponse.secure_url;
};

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
      isHandpicked,
      isAuthorSpotlight,
      isBestAuthor,
      stockStatus,
      sortBy,
      page = 1,
      limit = 15
    } = req.query;

    const query = { isActive: true };

    if (search) {
      const trimmedSearch = String(search).trim();
      const escaped = trimmedSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const isbnDigits = trimmedSearch.replace(/[^0-9X]/gi, '');

      const searchConditions = [
        { title: { $regex: escaped, $options: 'i' } },
        { name: { $regex: escaped, $options: 'i' } },
        { titleMalayalam: { $regex: escaped, $options: 'i' } },
        { author: { $regex: escaped, $options: 'i' } },
        { publisher: { $regex: escaped, $options: 'i' } },
        { theme: { $regex: escaped, $options: 'i' } },
        { genre: { $regex: escaped, $options: 'i' } },
        { category: { $regex: escaped, $options: 'i' } },
        { tags: { $regex: escaped, $options: 'i' } },
        { description: { $regex: escaped, $options: 'i' } },
        { isbn: { $regex: escaped, $options: 'i' } },
        { sku: { $regex: escaped, $options: 'i' } }
      ];

      // If user typed digits that could match an ISBN (stripping dashes/spaces)
      if (isbnDigits && isbnDigits.length >= 3) {
        searchConditions.push({ isbn: { $regex: isbnDigits, $options: 'i' } });
      }

      query.$or = searchConditions;
    }

    if (theme && theme !== 'ALL' && theme !== 'All Categories') {
      const escapedTheme = theme.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const themeRegex = new RegExp(`^${escapedTheme}$`, 'i');
      const themeConditions = [
        { theme: themeRegex },
        { category: themeRegex },
        { genre: themeRegex }
      ];
      if (query.$or) {
        query.$and = (query.$and || []).concat([{ $or: query.$or }, { $or: themeConditions }]);
        delete query.$or;
      } else {
        query.$or = themeConditions;
      }
    } else if (genre && genre !== 'ALL') {
      const escapedGenre = genre.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const genreRegex = new RegExp(`^${escapedGenre}$`, 'i');
      const genreConditions = [
        { theme: genreRegex },
        { genre: genreRegex }
      ];
      if (query.$or) {
        query.$and = (query.$and || []).concat([{ $or: query.$or }, { $or: genreConditions }]);
        delete query.$or;
      } else {
        query.$or = genreConditions;
      }
    }

    if (category && category !== 'ALL' && category !== 'All Categories') {
      query.category = category;
    }

    if (author && author !== 'ALL' && author !== 'All Authors') {
      const escapedAuthor = author.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.author = { $regex: new RegExp(escapedAuthor, 'i') };
    }

    if (publisher && publisher !== 'ALL') {
      query.publisher = { $regex: new RegExp(`^${publisher}$`, 'i') };
    }

    if (language && language !== 'ALL') {
      query.languages = { $in: [new RegExp(language, 'i')] };
    }

    if (isBestSeller === 'true') query.isBestSeller = true;
    if (isNewArrival === 'true') query.isNewArrival = true;
    if (isFeatured === 'true') query.isFeatured = true;
    if (isHandpicked === 'true') query.isHandpicked = true;
    if (isAuthorSpotlight === 'true') query.isAuthorSpotlight = true;
    if (isBestAuthor === 'true') query.isBestAuthor = true;

    if (stockStatus && stockStatus !== 'ALL') {
      if (stockStatus === 'in_stock') {
        query.stockStatus = { $ne: 'out_of_stock' };
        query.stock = { $gt: 0 };
      } else if (stockStatus === 'out_of_stock') {
        const outConditions = [{ stockStatus: 'out_of_stock' }, { stock: { $lte: 0 } }];
        if (query.$or) {
          query.$and = (query.$and || []).concat([{ $or: query.$or }, { $or: outConditions }]);
          delete query.$or;
        } else {
          query.$or = outConditions;
        }
      } else {
        query.stockStatus = stockStatus;
      }
    }

    if (minPrice || maxPrice) {
      const priceQuery = {};
      if (minPrice && Number(minPrice) > 0) priceQuery.$gte = Number(minPrice);
      if (maxPrice && Number(maxPrice) < 999999) priceQuery.$lte = Number(maxPrice);
      if (Object.keys(priceQuery).length > 0) {
        query.price = priceQuery;
      }
    }

    let sort = { createdAt: -1 };
    if (sortBy === 'price_asc' || sortBy === 'price-asc' || sortBy === 'price-low') {
      sort = { price: 1 };
    } else if (sortBy === 'price_desc' || sortBy === 'price-desc' || sortBy === 'price-high') {
      sort = { price: -1 };
    } else if (sortBy === 'rating') {
      sort = { rating: -1, reviewsCount: -1 };
    } else if (sortBy === 'popular' || sortBy === 'bestseller' || sortBy === 'bestsellers') {
      sort = { isBestSeller: -1, rating: -1, createdAt: -1 };
    } else if (sortBy === 'newest' || sortBy === 'new') {
      sort = { isNewArrival: -1, createdAt: -1 };
    } else if (sortBy === 'title') {
      sort = { title: 1 };
    } else {
      // 'featured' default: active bestseller first, then newest
      sort = { isBestSeller: -1, createdAt: -1 };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 15);
    const skip = (pageNum - 1) * limitNum;

    const [books, total] = await Promise.all([
      Book.find(query).sort(sort).skip(skip).limit(limitNum).lean(),
      Book.countDocuments(query)
    ]);

    // Sanitize any massive base64 payloads to keep JSON lightweight & fast
    const sanitizedBooks = books.map((book) => {
      if (Array.isArray(book.images)) {
        book.images = book.images.map((img) => {
          if (typeof img === 'string' && (img.startsWith('data:image') || img.length > 2000)) {
            return '/book-placeholder.svg';
          }
          return img;
        });
      }
      if (typeof book.coverImage === 'string' && (book.coverImage.startsWith('data:image') || book.coverImage.length > 2000)) {
        book.coverImage = '/book-placeholder.svg';
      }
      return book;
    });

    return res.json({
      success: true,
      books: sanitizedBooks,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
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
      authorPhoto,
      authorBio,
      publisher,
      edition,
      theme,
      genre,
      category,
      languages,
      pageCount,
      description,
      spotlightDescription,
      price,
      discountPrice,
      stock,
      images,
      sku,
      isbn,
      isBestSeller,
      isNewArrival,
      isFeatured,
      isHandpicked,
      isAuthorSpotlight,
      isFeaturedSpotlight,
      isBestAuthor,
      tags
    } = req.body;

    const bookTitle = title || name;
    if (!bookTitle || !author || !publisher || !theme || !pageCount || !description || price === undefined || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required book fields: title, author, publisher, theme, pageCount, description, price, stock'
      });
    }

    if (!Array.isArray(images) || images.length < 1) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least 1 photo per product'
      });
    }

    if (isAuthorSpotlight) {
      await Book.updateMany({ author: { $ne: author.trim() } }, { $set: { isAuthorSpotlight: false } });
      if (authorPhoto || authorBio) {
        await Book.updateMany(
          { author: author.trim() },
          { $set: { ...(authorPhoto ? { authorPhoto } : {}), ...(authorBio ? { authorBio } : {}) } }
        );
      }
    }

    if (isFeaturedSpotlight) {
      await Book.updateMany({}, { $set: { isFeaturedSpotlight: false } });
    }

    const book = await Book.create({
      title: bookTitle.trim(),
      name: bookTitle.trim(),
      author: author.trim(),
      authorPhoto: authorPhoto || '',
      authorBio: authorBio || '',
      publisher: publisher.trim(),
      edition: edition || '1st Edition',
      theme: theme.trim(),
      genre: genre || theme.trim(),
      category: category || theme.trim(),
      languages: Array.isArray(languages) && languages.length > 0 ? languages : ['English'],
      pageCount: Number(pageCount),
      description: description.trim(),
      spotlightDescription: spotlightDescription ? spotlightDescription.trim() : '',
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : null,
      stock: Number(stock),
      images,
      sku: sku || `LGS-BK-${Date.now().toString().slice(-6)}`,
      isbn: isbn || '',
      isBestSeller: Boolean(isBestSeller),
      isNewArrival: isNewArrival !== undefined ? Boolean(isNewArrival) : true,
      isFeatured: Boolean(isFeatured),
      isHandpicked: Boolean(isHandpicked),
      isAuthorSpotlight: Boolean(isAuthorSpotlight),
      isFeaturedSpotlight: Boolean(isFeaturedSpotlight),
      isBestAuthor: Boolean(isBestAuthor),
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
      if (!Array.isArray(images) || images.length < 1) {
        return res.status(400).json({
          success: false,
          message: 'A minimum of 1 photo is required per book'
        });
      }
      book.images = images;
    }

    const authorToUse = (otherFields.author || book.author || '').trim();

    if (otherFields.isAuthorSpotlight) {
      await Book.updateMany({ author: { $ne: authorToUse } }, { $set: { isAuthorSpotlight: false } });
      if (otherFields.authorPhoto || otherFields.authorBio) {
        await Book.updateMany(
          { author: authorToUse },
          {
            $set: {
              ...(otherFields.authorPhoto ? { authorPhoto: otherFields.authorPhoto } : {}),
              ...(otherFields.authorBio ? { authorBio: otherFields.authorBio } : {})
            }
          }
        );
      }
    }

    if (otherFields.isFeaturedSpotlight) {
      await Book.updateMany({ _id: { $ne: book._id } }, { $set: { isFeaturedSpotlight: false } });
    }

    if (otherFields.stock !== undefined) {
      const parsedStock = Math.max(0, parseInt(otherFields.stock, 10) || 0);
      otherFields.stock = parsedStock;
      otherFields.stockStatus = parsedStock === 0 ? 'out_of_stock' : parsedStock <= 5 ? 'low_stock' : 'in_stock';
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

    const webpUrl = await uploadToCloudinaryWebp(image, 'logos_books');

    return res.json({
      success: true,
      url: webpUrl
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Convert and upload all book images (Google Drive, base64) to Cloudinary in WebP format
// @route   POST or GET /api/books/admin/convert-images-to-webp
// @access  Public / Private (Admin)
const convertImagesToCloudinaryWebp = async (req, res) => {
  try {
    const books = await Book.find({});
    let totalUpdated = 0;
    const report = [];

    for (const book of books) {
      let changed = false;
      const newImages = [];

      for (const img of book.images || []) {
        if (
          typeof img === 'string' &&
          (img.startsWith('data:image') ||
            img.includes('googleusercontent.com') ||
            img.includes('drive.google.com') ||
            (img.includes('res.cloudinary.com') && !img.includes('f_webp')))
        ) {
          try {
            const webpUrl = await uploadToCloudinaryWebp(img, 'logos_books');
            newImages.push(webpUrl);
            changed = true;
          } catch (e) {
            console.warn(`[MigrateWebP] Skipped for book ${book._id}:`, e.message);
            newImages.push(img);
          }
        } else {
          newImages.push(img);
        }
      }

      if (changed) {
        book.images = newImages;
        if (newImages[0]) book.coverImage = newImages[0];
        await book.save();
        totalUpdated++;
        report.push({ id: book._id, title: book.title, imagesCount: newImages.length });
      }
    }

    return res.json({
      success: true,
      message: `Successfully migrated ${totalUpdated} books to Cloudinary WebP format!`,
      totalUpdated,
      report
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Bulk Import Books from Excel / JSON dataset
// @route   POST /api/books/bulk-import
// @access  Private (Admin)
const bulkImportBooks = async (req, res) => {
  try {
    const { books } = req.body;
    if (!Array.isArray(books) || books.length === 0) {
      return res.status(400).json({ success: false, message: 'No book data provided for bulk import' });
    }

    // Helper to transform Google Drive sharing links to direct image URLs
    const transformDriveUrl = (url) => {
      if (!url || typeof url !== 'string') return url;
      const str = url.trim();
      const driveMatch = str.match(/(?:drive\.google\.com\/(?:file\/d\/|open\?id=|drive\/folders\/)|docs\.google\.com\/file\/d\/)([a-zA-Z0-9_-]+)/i);
      if (driveMatch && driveMatch[1]) {
        return `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
      }
      return str;
    };

    const inserted = [];
    const errors = [];

    for (let i = 0; i < books.length; i++) {
      const b = books[i];
      try {
        const title = (b.title || b.name || b.Title || b.Name || '').trim();
        const author = (b.author || b.Author || 'LOGOS Author').trim();
        const publisher = (b.publisher || b.Publisher || 'LOGOS Books').trim();
        const theme = (b.theme || b.Theme || b.genre || b.Genre || b.category || b.Category || 'General').trim();
        const price = Number(b.price || b.Price || b.Rate || b.MRP || 299);
        const discountPrice = b.discountPrice || b.DiscountPrice || b.SalePrice ? Number(b.discountPrice || b.DiscountPrice || b.SalePrice) : null;
        const stock = b.stock !== undefined ? Number(b.stock) : b.Stock !== undefined ? Number(b.Stock) : 25;
        const pageCount = Number(b.pageCount || b.PageCount || b.pages || 250);
        const description = (b.description || b.Description || b.synopsis || b.Synopsis || `${title} by ${author}. Premium edition available at LOGOS Books.`).trim();
        
        let imagesList = [];
        if (Array.isArray(b.images)) {
          imagesList = b.images.map(transformDriveUrl);
        } else if (typeof b.images === 'string' && b.images.trim()) {
          imagesList = b.images.split(/[,;\n]+/).map(s => transformDriveUrl(s.trim())).filter(Boolean);
        }

        for (let imgNum = 1; imgNum <= 6; imgNum++) {
          const key = `image${imgNum}` in b ? `image${imgNum}` : `Image${imgNum}` in b ? `Image${imgNum}` : `Image ${imgNum}` in b ? `Image ${imgNum}` : null;
          if (key && b[key]) {
            const transformed = transformDriveUrl(String(b[key]).trim());
            if (transformed && !imagesList.includes(transformed)) {
              imagesList.push(transformed);
            }
          }
        }

        if (imagesList.length === 0) {
          imagesList = [];
        }

        const rawLanguages = b.languages || b.Languages || b.language || b.Language || ['Malayalam'];
        const languages = Array.isArray(rawLanguages) 
          ? rawLanguages 
          : typeof rawLanguages === 'string' 
            ? rawLanguages.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean) 
            : ['Malayalam'];

        let rawSku = (b.sku || b.SKU || `LGS-BK-${Date.now().toString().slice(-4)}${i + 1}`).trim();
        const isbn = (b.isbn || b.ISBN || '').trim();

        const isBestSeller = Boolean(b.isBestSeller || b.isBestseller || b.Bestseller === 'yes' || b.Bestseller === 'true' || b.Bestseller === true);
        const isNewArrival = b.isNewArrival !== undefined ? Boolean(b.isNewArrival) : true;
        const isFeatured = Boolean(b.isFeatured || b.Featured === 'yes' || b.Featured === 'true' || b.Featured === true);
        const isHandpicked = Boolean(b.isHandpicked || b.Handpicked === 'yes' || b.Handpicked === 'true' || b.Handpicked === true);
        const isAuthorSpotlight = Boolean(b.isAuthorSpotlight || b.AuthorSpotlight === 'yes' || b.AuthorSpotlight === 'true' || b.AuthorSpotlight === true);

        if (!title) {
          errors.push({ row: i + 1, error: 'Missing title' });
          continue;
        }

        // Check if book already exists by title & author or SKU
        let existingBook = await Book.findOne({
          $or: [
            { title: title, author: author },
            { sku: rawSku }
          ]
        });

        if (existingBook) {
          existingBook.title = title;
          existingBook.name = title;
          existingBook.author = author;
          existingBook.publisher = publisher;
          existingBook.theme = theme;
          existingBook.genre = theme;
          existingBook.category = b.category || b.Category || 'Books';
          existingBook.languages = languages;
          existingBook.pageCount = isNaN(pageCount) || pageCount <= 0 ? 250 : pageCount;
          existingBook.description = description;
          existingBook.price = isNaN(price) || price < 0 ? 299 : price;
          existingBook.discountPrice = discountPrice && !isNaN(discountPrice) ? discountPrice : null;
          existingBook.stock = isNaN(stock) || stock < 0 ? 25 : stock;
          existingBook.images = imagesList;
          existingBook.isbn = isbn || existingBook.isbn;
          existingBook.isBestSeller = isBestSeller;
          existingBook.isNewArrival = isNewArrival;
          existingBook.isFeatured = isFeatured;
          existingBook.isHandpicked = isHandpicked;
          existingBook.isAuthorSpotlight = isAuthorSpotlight;
          existingBook.isActive = true;
          await existingBook.save();
          inserted.push(existingBook);
        } else {
          // Check if SKU is taken by another book; if so, make SKU unique
          const skuTaken = await Book.findOne({ sku: rawSku });
          const finalSku = skuTaken ? `${rawSku}-${i + 1}` : rawSku;

          const newBook = new Book({
            title,
            name: title,
            author,
            publisher,
            edition: b.edition || b.Edition || '1st Edition',
            theme,
            genre: theme,
            category: b.category || b.Category || 'Books',
            languages,
            pageCount: isNaN(pageCount) || pageCount <= 0 ? 250 : pageCount,
            description,
            price: isNaN(price) || price < 0 ? 299 : price,
            discountPrice: discountPrice && !isNaN(discountPrice) ? discountPrice : null,
            stock: isNaN(stock) || stock < 0 ? 25 : stock,
            images: imagesList,
            sku: finalSku,
            isbn,
            isBestSeller,
            isNewArrival,
            isFeatured,
            isHandpicked,
            isAuthorSpotlight,
            isActive: true
          });

          await newBook.save();
          inserted.push(newBook);
        }
      } catch (rowErr) {
        console.error(`[bulkImportBooks] Error on row ${i + 1}:`, rowErr.message);
        errors.push({ row: i + 1, title: b.title || b.Name || 'Unknown', error: rowErr.message });
      }
    }

    return res.json({
      success: true,
      message: `Successfully processed ${books.length} items: ${inserted.length} imported/updated, ${errors.length} skipped`,
      importedCount: inserted.length,
      errorsCount: errors.length,
      errors: errors.slice(0, 20)
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current Spotlight Author ("Meet the Author")
// @route   GET /api/books/spotlight/author
// @access  Public
const getSpotlightAuthor = async (req, res) => {
  try {
    // 1. Check dedicated AuthorHighlight model for spotlight author
    const authorHighlight = await AuthorHighlight.findOne({ isActive: true, isSpotlight: true }).sort({ updatedAt: -1 });

    let authorName = authorHighlight ? authorHighlight.name : '';
    let authorPhoto = (authorHighlight && authorHighlight.photo) || '';
    let authorBio = (authorHighlight && authorHighlight.bio) || '';

    // 2. Fallback to any active AuthorHighlight with bio
    if (!authorName) {
      const anyHighlight = await AuthorHighlight.findOne({ isActive: true, bio: { $exists: true, $ne: '' } }).sort({ order: 1, updatedAt: -1 });
      if (anyHighlight) {
        authorName = anyHighlight.name;
        authorPhoto = anyHighlight.photo;
        authorBio = anyHighlight.bio;
      }
    }

    // 3. Fallback to Book with isAuthorSpotlight or authorPhoto
    let spotlightBook = null;
    if (!authorName) {
      spotlightBook = await Book.findOne({ isActive: true, isAuthorSpotlight: true }).sort({ updatedAt: -1 });
      if (!spotlightBook) {
        spotlightBook = await Book.findOne({
          isActive: true,
          authorPhoto: { $exists: true, $ne: '' },
          authorBio: { $exists: true, $ne: '' }
        }).sort({ updatedAt: -1 });
      }
      if (spotlightBook) {
        authorName = spotlightBook.author;
        authorPhoto = spotlightBook.authorPhoto;
        authorBio = spotlightBook.authorBio;
      }
    }

    // If no author found from Admin Author Highlights or Books, return null
    if (!authorName) {
      return res.json({
        success: true,
        author: null
      });
    }

    // Get list of books under this author
    const authorBooks = await Book.find({
      isActive: true,
      author: { $regex: new RegExp(`^${authorName.trim()}$`, 'i') }
    }).select('title name slug price discountPrice images coverImage author').limit(8);

    // Sanitize authorPhoto to prevent huge base64 strings from bloating response
    if (authorPhoto && typeof authorPhoto === 'string' && authorPhoto.startsWith('data:image') && authorPhoto.length > 1000) {
      authorPhoto = '/author_benyamin.webp';
    }

    return res.json({
      success: true,
      author: {
        name: authorName,
        photo: authorPhoto,
        image: authorPhoto,
        bio: authorBio,
        booksCount: authorBooks.length,
        featuredBookSlug: (spotlightBook && spotlightBook.slug) || (authorBooks[0] && authorBooks[0].slug) || '',
        books: authorBooks
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current Spotlight Book ("Featured Book Spotlight")
// @route   GET /api/books/spotlight/book
// @access  Public
const getSpotlightBook = async (req, res) => {
  try {
    let book = await Book.findOne({ isActive: true, isFeaturedSpotlight: true }).sort({ updatedAt: -1 });

    if (!book) {
      book = await Book.findOne({ isActive: true, isFeatured: true }).sort({ updatedAt: -1 });
    }

    if (!book) {
      book = await Book.findOne({ isActive: true, slug: 'parajithanayakar' });
    }

    if (book) {
      return res.json({
        success: true,
        book: {
          id: book._id,
          title: book.title || book.name,
          author: book.author,
          description: book.spotlightDescription || book.description,
          image: (book.images && book.images[0]) || book.coverImage || '/featured_parajitha.png',
          slug: book.slug,
          price: book.price,
          discountPrice: book.discountPrice
        }
      });
    }

    return res.json({
      success: true,
      book: {
        title: 'പരാജിതനായകർ',
        author: 'ടി. അനീഷ്',
        description: 'തമിഴ് സിനിമയും രാഷ്ട്രീയവും തമ്മിലുള്ള ആഴത്തിലുള്ള ബന്ധം വ്യക്തമാക്കുന്നതാണ് ഈ പുസ്തകം. എം.ജി.ആർ, ജയലളിത തുടങ്ങിയവർ തമിഴ് രാഷ്ട്രീയത്തിൽ വലിയ വിജയങ്ങൾ കൊയ്തപ്പോൾ, രാഷ്ട്രീയത്തിൽ പരാജയപ്പെടുകയോ അല്ലെങ്കിൽ വലിയ ചലനങ്ങൾ സൃഷ്ടിക്കാൻ കഴിയാതെ പോവുകയോ ചെയ്ത ശിവാജി ഗണേശൻ, വിജയകാന്ത്, കമൽ ഹാസൻ, രജനീകാന്ത് തുടങ്ങിയ താരങ്ങളുടെ രാഷ്ട്രീയ ശ്രമങ്ങളെയും അവരുടെ സിനിമകളെയും ഈ പുസ്തകം വിലയിരുത്തുന്നു. [1, 2]',
        image: '/featured_parajitha.png',
        slug: 'parajithanayakar'
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all distinct authors with book counts, photo, and bio for mapping
// @route   GET /api/books/authors/all
// @access  Public
const getAuthorsList = async (req, res) => {
  try {
    const [highlights, bookAuthors] = await Promise.all([
      AuthorHighlight.find({ isActive: true }).sort({ isSpotlight: -1, order: 1, createdAt: -1 }),
      Book.aggregate([
        { $match: { isActive: true, author: { $exists: true, $ne: '' } } },
        {
          $group: {
            _id: '$author',
            booksCount: { $sum: 1 },
            lastBookSlug: { $first: '$slug' }
          }
        }
      ])
    ]);

    const bookCountMap = new Map();
    bookAuthors.forEach((b) => {
      const name = (b._id || '').trim().toLowerCase();
      if (name) {
        bookCountMap.set(name, { count: b.booksCount, slug: b.lastBookSlug });
      }
    });

    // Only return authors explicitly created in the Admin Authors section
    let authorsList = highlights.map((h) => {
      const key = (h.name || '').trim().toLowerCase();
      const bookInfo = bookCountMap.get(key) || { count: 0, slug: '' };
      return {
        id: h._id,
        name: h.name.trim(),
        photo: h.photo || '',
        bio: h.bio || '',
        isSpotlight: Boolean(h.isSpotlight),
        booksCount: bookInfo.count,
        lastBookSlug: bookInfo.slug
      };
    });

    // If no manual highlights exist yet, derive authors from actual bookstore catalog
    if (authorsList.length === 0 && Array.isArray(bookAuthors) && bookAuthors.length > 0) {
      authorsList = bookAuthors.map((b, idx) => ({
        id: b._id || `auth-${idx}`,
        name: (b._id || '').trim(),
        photo: '',
        bio: '',
        isSpotlight: false,
        booksCount: b.booksCount || 1,
        lastBookSlug: b.lastBookSlug || ''
      }));
    }

    if (req.query.page || req.query.limit) {
      const pageNum = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limitNum = Math.max(1, parseInt(req.query.limit, 10) || 15);
      const skip = (pageNum - 1) * limitNum;
      const paginatedAuthors = authorsList.slice(skip, skip + limitNum);
      return res.json({
        success: true,
        authors: paginatedAuthors,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(authorsList.length / limitNum) || 1,
          totalItems: authorsList.length
        }
      });
    }

    return res.json({
      success: true,
      authors: authorsList
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Quick autocomplete / suggestions search for navbar
// @route   GET /api/books/search/suggest
// @access  Public
const getBookSuggestions = async (req, res) => {
  try {
    const { q = '' } = req.query;
    const trimmed = String(q).trim();
    if (!trimmed || trimmed.length < 2) {
      return res.json({ success: true, count: 0, suggestions: [] });
    }

    const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const isbnDigits = trimmed.replace(/[^0-9X]/gi, '');

    const orConditions = [
      { title: { $regex: escaped, $options: 'i' } },
      { name: { $regex: escaped, $options: 'i' } },
      { titleMalayalam: { $regex: escaped, $options: 'i' } },
      { author: { $regex: escaped, $options: 'i' } },
      { publisher: { $regex: escaped, $options: 'i' } },
      { theme: { $regex: escaped, $options: 'i' } },
      { genre: { $regex: escaped, $options: 'i' } },
      { category: { $regex: escaped, $options: 'i' } },
      { tags: { $regex: escaped, $options: 'i' } },
      { isbn: { $regex: escaped, $options: 'i' } },
      { sku: { $regex: escaped, $options: 'i' } }
    ];

    if (isbnDigits && isbnDigits.length >= 3) {
      orConditions.push({ isbn: { $regex: isbnDigits, $options: 'i' } });
    }

    const books = await Book.find({
      isActive: true,
      $or: orConditions
    })
      .select('title name titleMalayalam author publisher images price discountPrice discountPercent slug isbn theme genre tags')
      .limit(8)
      .lean();

    const lower = trimmed.toLowerCase();
    const suggestions = books.map((b) => {
      let matchedBy = 'Book';
      const isbnStr = (b.isbn || '').toLowerCase();
      const authorStr = (b.author || '').toLowerCase();
      const titleStr = `${b.title || ''} ${b.name || ''} ${b.titleMalayalam || ''}`.toLowerCase();
      const tagsStr = Array.isArray(b.tags) ? b.tags.join(' ').toLowerCase() : '';
      const genreStr = `${b.theme || ''} ${b.genre || ''} ${b.category || ''} ${b.publisher || ''}`.toLowerCase();

      if (isbnStr.includes(lower) || (isbnDigits.length >= 3 && isbnStr.replace(/[^0-9x]/gi, '').includes(isbnDigits.toLowerCase()))) {
        matchedBy = 'ISBN';
      } else if (authorStr.includes(lower)) {
        matchedBy = 'Author';
      } else if (titleStr.includes(lower)) {
        matchedBy = 'Book';
      } else if (tagsStr.includes(lower) || genreStr.includes(lower)) {
        matchedBy = 'Keyword';
      }

      return {
        _id: b._id,
        slug: b.slug,
        title: b.title || b.name,
        titleMalayalam: b.titleMalayalam,
        author: b.author,
        publisher: b.publisher,
        price: b.price,
        discountPrice: b.discountPrice,
        coverImage: (b.images && b.images[0]) || '/book-placeholder.svg',
        isbn: b.isbn,
        theme: b.theme,
        matchedBy
      };
    });

    return res.json({
      success: true,
      count: suggestions.length,
      suggestions
    });
  } catch (error) {
    console.error('Book suggestions error:', error);
    return res.status(500).json({ success: false, message: error.message, suggestions: [] });
  }
};

module.exports = {
  getBooks,
  getBookByIdOrSlug,
  getBestSellers,
  getNewArrivals,
  getFeaturedBooks,
  getFilterOptions,
  getSpotlightAuthor,
  getSpotlightBook,
  getAuthorsList,
  getBookSuggestions,
  createBook,
  updateBook,
  deleteBook,
  uploadBookImage,
  bulkImportBooks,
  convertImagesToCloudinaryWebp
};
