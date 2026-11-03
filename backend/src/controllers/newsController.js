const News = require('../models/News');
const cloudinary = require('../config/cloudinary');

// Helper to generate a clean URL slug from title
const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '') || `news-${Date.now()}`;
};

// @desc    Get all active news articles (Public)
// @route   GET /api/news
// @access  Public
const getNews = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    const query = { isActive: true };

    if (category && category !== 'ALL') {
      query.category = category;
    }

    if (search && search.trim()) {
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { title: { $regex: escaped, $options: 'i' } },
        { summary: { $regex: escaped, $options: 'i' } },
        { content: { $regex: escaped, $options: 'i' } },
        { author: { $regex: escaped, $options: 'i' } },
        { tags: { $regex: escaped, $options: 'i' } }
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 12);
    const skip = (pageNum - 1) * limitNum;

    const [articles, total] = await Promise.all([
      News.find(query)
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      News.countDocuments(query)
    ]);

    return res.json({
      success: true,
      articles,
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

// @desc    Get recent 4-6 news for homepage widget (Public)
// @route   GET /api/news/recent
// @access  Public
const getRecentNews = async (req, res) => {
  try {
    const limit = Math.min(10, parseInt(req.query.limit, 10) || 4);
    const articles = await News.find({ isActive: true })
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(limit)
      .lean();

    return res.json({
      success: true,
      articles
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single news article by ID or slug (Public)
// @route   GET /api/news/:idOrSlug
// @access  Public
const getNewsBySlugOrId = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    let article = null;

    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      article = await News.findById(idOrSlug);
    }
    if (!article) {
      article = await News.findOne({ slug: idOrSlug });
    }

    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    // Increment views asynchronously
    News.findByIdAndUpdate(article._id, { $inc: { viewsCount: 1 } }).exec();

    // Fetch related articles (same category, excluding current)
    const related = await News.find({
      isActive: true,
      _id: { $ne: article._id },
      category: article.category
    })
      .sort({ publishedAt: -1 })
      .limit(3)
      .lean();

    return res.json({
      success: true,
      article,
      related
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all news articles for Admin
// @route   GET /api/news/admin/all
// @access  Private (Admin)
const getAllNewsAdmin = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 50 } = req.query;
    const query = {};

    if (category && category !== 'ALL') {
      query.category = category;
    }

    if (search && search.trim()) {
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { title: { $regex: escaped, $options: 'i' } },
        { summary: { $regex: escaped, $options: 'i' } },
        { author: { $regex: escaped, $options: 'i' } }
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 50);
    const skip = (pageNum - 1) * limitNum;

    const [articles, total] = await Promise.all([
      News.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      News.countDocuments(query)
    ]);

    return res.json({
      success: true,
      articles,
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

// @desc    Upload image/video media to Cloudinary
// @route   POST /api/news/upload-media
// @access  Private (Admin)
const uploadNewsMedia = async (req, res) => {
  try {
    const { file, mediaType = 'image' } = req.body; // base64 or URL
    if (!file) {
      return res.status(400).json({ success: false, message: 'No media data provided' });
    }

    if (mediaType === 'video') {
      // Cloudinary video upload with automatic compression
      const uploadResponse = await cloudinary.uploader.upload(file, {
        resource_type: 'video',
        folder: 'logos_news/videos'
      });

      // Video thumbnail from Cloudinary
      const thumbUrl = uploadResponse.secure_url
        .replace(/\.[^/.]+$/, '.webp')
        .replace('/upload/', '/upload/so_0,w_800,c_limit,f_webp,q_auto/');

      return res.json({
        success: true,
        mediaUrl: uploadResponse.secure_url,
        thumbnailUrl: thumbUrl,
        public_id: uploadResponse.public_id,
        duration: uploadResponse.duration
      });
    }

    // Image upload: compress size and convert into WebP format
    const uploadResponse = await cloudinary.uploader.upload(file, {
      folder: 'logos_news',
      format: 'webp',
      transformation: [
        { width: 1400, crop: 'limit' },
        { quality: 'auto', fetch_format: 'webp' }
      ]
    });

    return res.json({
      success: true,
      mediaUrl: uploadResponse.secure_url,
      thumbnailUrl: uploadResponse.secure_url,
      public_id: uploadResponse.public_id
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create News article
// @route   POST /api/news
// @access  Private (Admin)
const createNews = async (req, res) => {
  try {
    const {
      title,
      summary,
      content,
      mediaType = 'image',
      mediaUrl = '',
      videoUrl = '',
      thumbnailUrl = '',
      author = 'LOGOS Editorial',
      category = 'General',
      tags = [],
      isFeatured = false,
      isActive = true,
      publishedAt
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Content is required' });
    }

    // Auto-generate unique slug
    let baseSlug = generateSlug(title);
    let slug = baseSlug;
    let counter = 1;
    while (await News.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Auto-compress base64 image if passed directly
    let finalMediaUrl = mediaUrl;
    let finalThumbnailUrl = thumbnailUrl;

    if (mediaUrl && mediaUrl.startsWith('data:image')) {
      try {
        const uploaded = await cloudinary.uploader.upload(mediaUrl, {
          folder: 'logos_news',
          format: 'webp',
          transformation: [
            { width: 1400, crop: 'limit' },
            { quality: 'auto', fetch_format: 'webp' }
          ]
        });
        finalMediaUrl = uploaded.secure_url;
        if (!finalThumbnailUrl) finalThumbnailUrl = uploaded.secure_url;
      } catch (uploadErr) {
        console.warn('[News Upload Image Error]:', uploadErr.message);
      }
    }

    const article = await News.create({
      title: title.trim(),
      slug,
      summary: summary ? summary.trim() : title.trim().slice(0, 160),
      content: content.trim(),
      mediaType,
      mediaUrl: finalMediaUrl,
      videoUrl: videoUrl ? videoUrl.trim() : '',
      thumbnailUrl: finalThumbnailUrl || finalMediaUrl,
      author: author ? author.trim() : 'LOGOS Editorial',
      category: category || 'General',
      tags: Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      isFeatured: Boolean(isFeatured),
      isActive: isActive !== false,
      publishedAt: publishedAt ? new Date(publishedAt) : new Date()
    });

    return res.status(201).json({
      success: true,
      message: 'News article published successfully',
      article
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update News article
// @route   PUT /api/news/:id
// @access  Private (Admin)
const updateNews = async (req, res) => {
  try {
    const article = await News.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    const {
      title,
      summary,
      content,
      mediaType,
      mediaUrl,
      videoUrl,
      thumbnailUrl,
      author,
      category,
      tags,
      isFeatured,
      isActive,
      publishedAt
    } = req.body;

    if (title && title.trim()) article.title = title.trim();
    if (summary !== undefined) article.summary = summary ? summary.trim() : '';
    if (content !== undefined) article.content = content.trim();
    if (mediaType !== undefined) article.mediaType = mediaType;
    if (mediaUrl !== undefined) article.mediaUrl = mediaUrl;
    if (videoUrl !== undefined) article.videoUrl = videoUrl ? videoUrl.trim() : '';
    if (thumbnailUrl !== undefined) article.thumbnailUrl = thumbnailUrl;
    if (author !== undefined) article.author = author.trim();
    if (category !== undefined) article.category = category;
    if (tags !== undefined) {
      article.tags = Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
    }
    if (isFeatured !== undefined) article.isFeatured = Boolean(isFeatured);
    if (isActive !== undefined) article.isActive = Boolean(isActive);
    if (publishedAt !== undefined) article.publishedAt = new Date(publishedAt);

    await article.save();

    return res.json({
      success: true,
      message: 'Article updated successfully',
      article
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete News article
// @route   DELETE /api/news/:id
// @access  Private (Admin)
const deleteNews = async (req, res) => {
  try {
    const article = await News.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    await News.findByIdAndDelete(req.params.id);

    return res.json({
      success: true,
      message: 'Article deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getNews,
  getRecentNews,
  getNewsBySlugOrId,
  getAllNewsAdmin,
  uploadNewsMedia,
  createNews,
  updateNews,
  deleteNews
};

