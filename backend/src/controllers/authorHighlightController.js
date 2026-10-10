const AuthorHighlight = require('../models/AuthorHighlight');

// @desc    Get active author highlights (public for storefront)
// @route   GET /api/author-highlights
// @access  Public
const getAuthorHighlights = async (req, res) => {
  try {
    const { position } = req.query;
    const query = { isActive: true };
    if (position) query.position = position;

    const highlights = await AuthorHighlight.find(query).sort({ order: 1, createdAt: -1 });
    return res.json({
      success: true,
      highlights
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all author highlights (Admin)
// @route   GET /api/author-highlights/admin/all
// @access  Admin
const getAuthorHighlightsAdmin = async (req, res) => {
  try {
    const highlights = await AuthorHighlight.find().sort({ position: 1, order: 1, createdAt: -1 });
    return res.json({
      success: true,
      highlights
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new author highlight
// @route   POST /api/author-highlights
// @access  Admin
const createAuthorHighlight = async (req, res) => {
  try {
    const { name, tagline, bio, photo, isSpotlight, position, shopLink, isActive, order } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Author name is required'
      });
    }

    if (isSpotlight) {
      await AuthorHighlight.updateMany({}, { $set: { isSpotlight: false } });
    }

    const highlight = await AuthorHighlight.create({
      name: name.trim(),
      tagline: tagline || 'Meet the author',
      bio: bio ? bio.trim() : '',
      photo: photo ? photo.trim() : '',
      isSpotlight: Boolean(isSpotlight),
      position: position || 'position_1',
      shopLink: shopLink || `/products?search=${encodeURIComponent(name.trim())}`,
      isActive: isActive !== false,
      order: Number(order) || 0
    });

    return res.status(201).json({
      success: true,
      message: 'Author added successfully',
      highlight
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update author highlight
// @route   PUT /api/author-highlights/:id
// @access  Admin
const updateAuthorHighlight = async (req, res) => {
  try {
    const { id } = req.params;
    const highlight = await AuthorHighlight.findById(id);

    if (!highlight) {
      return res.status(404).json({ success: false, message: 'Author not found' });
    }

    if (req.body.isSpotlight) {
      await AuthorHighlight.updateMany({ _id: { $ne: id } }, { $set: { isSpotlight: false } });
    }

    const fields = ['name', 'tagline', 'bio', 'photo', 'isSpotlight', 'position', 'shopLink', 'isActive', 'order'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        highlight[field] = req.body[field];
      }
    });

    await highlight.save();

    return res.json({
      success: true,
      message: 'Author updated successfully',
      highlight
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete author highlight
// @route   DELETE /api/author-highlights/:id
// @access  Admin
const deleteAuthorHighlight = async (req, res) => {
  try {
    const { id } = req.params;
    const highlight = await AuthorHighlight.findByIdAndDelete(id);

    if (!highlight) {
      return res.status(404).json({ success: false, message: 'Author highlight not found' });
    }

    return res.json({
      success: true,
      message: 'Author highlight deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAuthorHighlights,
  getAuthorHighlightsAdmin,
  createAuthorHighlight,
  updateAuthorHighlight,
  deleteAuthorHighlight
};
