const express = require('express');
const router = express.Router();
const { getCategories, createCategory } = require('../controllers/categoryController');
const { protectAdmin } = require('../middleware/adminMiddleware');

router.get('/', getCategories);
router.post('/', protectAdmin, createCategory);

module.exports = router;

