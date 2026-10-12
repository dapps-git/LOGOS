const express = require('express');
const router = express.Router();
const {
  getAuthorHighlights,
  getAuthorHighlightsAdmin,
  createAuthorHighlight,
  updateAuthorHighlight,
  deleteAuthorHighlight
} = require('../controllers/authorHighlightController');

const { protectAdmin } = require('../middleware/adminMiddleware');

// Public route for storefront
router.get('/', getAuthorHighlights);

// Admin routes (Protected with JWT)
router.get('/admin/all', protectAdmin, getAuthorHighlightsAdmin);
router.post('/', protectAdmin, createAuthorHighlight);
router.put('/:id', protectAdmin, updateAuthorHighlight);
router.delete('/:id', protectAdmin, deleteAuthorHighlight);

module.exports = router;
