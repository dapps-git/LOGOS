const Banner = require('../models/Banner');
const cloudinary = require('../config/cloudinary');

// Helper to upload base64 or remote URL images to Cloudinary in WebP format
const uploadToCloudinaryWebp = async (imageInput, folder = 'logos_banners') => {
  if (!imageInput || typeof imageInput !== 'string') return imageInput;
  if (imageInput.includes('res.cloudinary.com') && (imageInput.includes('f_webp') || imageInput.endsWith('.webp'))) {
    return imageInput;
  }
  try {
    const uploadResponse = await cloudinary.uploader.upload(imageInput, {
      folder: folder,
      format: 'webp',
      quality: 'auto',
      fetch_format: 'auto'
    });
    return uploadResponse.secure_url;
  } catch (err) {
    console.warn('[Banner Cloudinary Error]:', err.message);
    return imageInput;
  }
};

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
      .lean();

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
      .lean();

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

    let finalImage = image;
    if (image && (image.startsWith('data:') || image.startsWith('http'))) {
      finalImage = await uploadToCloudinaryWebp(image, 'logos_banners');
    }
    let finalMobileImage = mobileImage ? (await uploadToCloudinaryWebp(mobileImage, 'logos_banners')) : finalImage;

    const banner = await Banner.create({
      title,
      subtitle,
      description,
      badge: badge || 'Special Offer',
      image: finalImage,
      mobileImage: finalMobileImage,
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

    const updateData = { ...req.body };
    if (updateData.image && (updateData.image.startsWith('data:') || updateData.image.startsWith('http'))) {
      updateData.image = await uploadToCloudinaryWebp(updateData.image, 'logos_banners');
    }
    if (updateData.mobileImage && (updateData.mobileImage.startsWith('data:') || updateData.mobileImage.startsWith('http'))) {
      updateData.mobileImage = await uploadToCloudinaryWebp(updateData.mobileImage, 'logos_banners');
    }

    Object.assign(banner, updateData);
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
