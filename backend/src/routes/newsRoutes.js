const express = require('express');
const router = express.Router();
const {
  getNews,
  getRecentNews,
  getNewsBySlugOrId,
  getAllNewsAdmin,
  uploadNewsMedia,
  createNews,
  updateNews,
  deleteNews
} = require('../controllers/newsController');
const { protectAdmin } = require('../middleware/adminMiddleware');

// Public News Endpoints
router.get('/', getNews);
router.get('/recent', getRecentNews);
router.get('/admin/all', protectAdmin, getAllNewsAdmin);
router.get('/:idOrSlug', getNewsBySlugOrId);

// Admin News Management
router.post('/upload-media', protectAdmin, uploadNewsMedia);
router.post('/', protectAdmin, createNews);
router.put('/:id', protectAdmin, updateNews);
router.delete('/:id', protectAdmin, deleteNews);

module.exports = router;

