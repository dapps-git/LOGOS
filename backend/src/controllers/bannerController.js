const Banner = require('../models/Banner');

// @desc    Get all active banners
// @route   GET /api/banners
// @access  Public
const getActiveBanners = async (req, res) => {
  try {
    const { position } = req.query;
    const query = { isActive: true };
    if (position) query.position = position;

    const banners = await Banner.find(query)
      .sort({ order: 1, createdAt: -1 })
      .populate('bookRef', 'title author price discountPrice images slug');

    return res.json({
      success: true,
      count: banners.length,
      banners
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all banners (Admin)
// @route   GET /api/banners/admin/all
// @access  Private (Admin)
const getAllBannersAdmin = async (req, res) => {
  try {
    const banners = await Banner.find()
      .sort({ order: 1, createdAt: -1 })
      .populate('bookRef', 'title author price discountPrice images slug');

    return res.json({
      success: true,
      count: banners.length,
      banners
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new banner (Admin)
// @route   POST /api/banners
// @access  Private (Admin)
const createBanner = async (req, res) => {
  try {
    const { title, subtitle, description, badge, image, mobileImage, link, buttonText, position, discountText, bookRef, order } = req.body;

    if (!title || !image) {
      return res.status(400).json({ success: false, message: 'Title and image are required' });
    }

    const banner = await Banner.create({
      title,
      subtitle,
      description,
      badge: badge || 'Special Offer',
      image,
      mobileImage,
      link: link || '/books',
      buttonText: buttonText || 'Explore Collection',
      position: position || 'hero',
      discountText,
      bookRef: bookRef || null,
      order: order || 0
    });

    return res.status(201).json({
      success: true,
      message: 'Banner created successfully',
      banner
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update banner (Admin)
// @route   PUT /api/banners/:id
// @access  Private (Admin)
const updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    Object.assign(banner, req.body);
    await banner.save();

    return res.json({
      success: true,
      message: 'Banner updated successfully',
      banner
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete banner (Admin)
// @route   DELETE /api/banners/:id
// @access  Private (Admin)
const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    await Banner.findByIdAndDelete(req.params.id);

    return res.json({
      success: true,
      message: 'Banner deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getActiveBanners,
  getAllBannersAdmin,
  createBanner,
  updateBanner,
  deleteBanner
};
