const express = require('express');
const router = express.Router();
const {
  getBooks,
  getBookByIdOrSlug,
  getBestSellers,
  getNewArrivals,
  getFeaturedBooks,
  getFilterOptions,
  getSpotlightAuthor,
  getSpotlightBook,
  getAuthorsList,
  createBook,
  updateBook,
  deleteBook,
  uploadBookImage,
  bulkImportBooks
} = require('../controllers/bookController');
const { protectAdmin } = require('../middleware/adminMiddleware');

// Public Collections & Filters
router.get('/', getBooks);
router.get('/collections/best-sellers', getBestSellers);
router.get('/collections/new-arrivals', getNewArrivals);
router.get('/collections/featured', getFeaturedBooks);
router.get('/spotlight/author', getSpotlightAuthor);
router.get('/spotlight/book', getSpotlightBook);
router.get('/authors/all', getAuthorsList);
router.get('/filters/options', getFilterOptions);
router.get('/:idOrSlug', getBookByIdOrSlug);

// Admin Book Management
router.post('/bulk-import', protectAdmin, bulkImportBooks);
router.post('/', protectAdmin, createBook);
router.put('/:id', protectAdmin, updateBook);
router.delete('/:id', protectAdmin, deleteBook);
router.post('/upload-image', protectAdmin, uploadBookImage);

module.exports = router;
