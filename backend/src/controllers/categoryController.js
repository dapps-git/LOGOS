const Category = require('../models/Category');
const Book = require('../models/Book');

const DEFAULT_THEMES = [
  'Self-Help',
  'Finance',
  'Philosophy',
  'Fiction',
  'Science',
  'History',
  'Biography',
  'Children',
  'Poetry',
  'Spirituality',
  'Technology'
];

// @desc    Get all categories (merged from Category collection + distinct book themes)
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const [dbCategories, distinctThemes] = await Promise.all([
      Category.find({ isActive: true }).sort({ order: 1, name: 1 }).lean(),
      Book.distinct('theme', {})
    ]);

    const seen = new Set();
    const categories = [];

    for (const cat of dbCategories) {
      const name = (cat.name || '').trim();
      if (!name) continue;
      const lower = name.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        categories.push(cat);
      }
    }

    for (const themeName of [...DEFAULT_THEMES, ...(distinctThemes || [])]) {
      const name = (themeName || '').trim();
      if (!name || name.toLowerCase() === 'other') continue;
      const lower = name.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        categories.push({
          _id: `theme-${lower.replace(/[^a-z0-9]+/g, '-')}`,
          name,
          slug: lower.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          theme: name,
          isActive: true
        });
      }
    }

    return res.json({
      success: true,
      categories
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new category (Admin)
// @route   POST /api/categories
// @access  Private (Admin)
const createCategory = async (req, res) => {
  try {
    const rawName = (req.body.name || req.body.title || '').trim();
    if (!rawName) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const escaped = rawName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const existing = await Category.findOne({ name: { $regex: new RegExp(`^${escaped}$`, 'i') } });
    if (existing) {
      if (!existing.isActive) {
        existing.isActive = true;
        await existing.save();
      }
      return res.json({
        success: true,
        message: 'Category already exists and is ready to use',
        category: existing
      });
    }

    const baseSlug = rawName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || `category-${Date.now().toString().slice(-6)}`;

    let slug = baseSlug;
    const slugConflict = await Category.findOne({ slug });
    if (slugConflict) {
      slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
    }

    const category = await Category.create({
      name: rawName,
      slug,
      description: (req.body.description || '').trim(),
      theme: rawName,
      isActive: true
    });

    return res.status(201).json({
      success: true,
      message: `Category "${category.name}" created successfully`,
      category
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCategories,
  createCategory
};

