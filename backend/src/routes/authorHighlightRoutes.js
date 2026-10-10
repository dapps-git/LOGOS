const express = require('express');
const router = express.Router();
const {
  getAuthorHighlights,
  getAuthorHighlightsAdmin,
  createAuthorHighlight,
  updateAuthorHighlight,
  deleteAuthorHighlight
} = require('../controllers/authorHighlightController');

// Public route for storefront
router.get('/', getAuthorHighlights);

// Admin routes
router.get('/admin/all', getAuthorHighlightsAdmin);
router.post('/', createAuthorHighlight);
router.put('/:id', updateAuthorHighlight);
router.delete('/:id', deleteAuthorHighlight);

module.exports = router;
