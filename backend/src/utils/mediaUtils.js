const cloudinary = require('../config/cloudinary');

const PLACEHOLDER_BOOK_IMAGE = '/book-placeholder.svg';
const PLACEHOLDER_AUTHOR_IMAGE = '/author_benyamin.webp';

const isOversizedOrDataUrl = (value) =>
  typeof value === 'string' && (value.startsWith('data:image') || value.length > 2000);

/**
 * Uploads a base64 data URI or remote image URL to Cloudinary as WebP.
 */
const uploadToCloudinaryWebp = async (imageInput, folder = 'logos_books', { width = 1200 } = {}) => {
  if (!imageInput || typeof imageInput !== 'string') return imageInput;
  if (
    imageInput.includes('res.cloudinary.com') &&
    (imageInput.includes('f_webp') || imageInput.endsWith('.webp'))
  ) {
    return imageInput;
  }

  const uploadResponse = await cloudinary.uploader.upload(imageInput, {
    folder,
    format: 'webp',
    transformation: [
      { width, crop: 'limit' },
      { quality: 'auto', fetch_format: 'webp' }
    ]
  });
  return uploadResponse.secure_url;
};

/**
 * Ensures any incoming base64 data:image string is uploaded to Cloudinary before DB persistence.
 */
const normalizeSingleMediaToCloudinary = async (value, folder = 'logos_books', options = {}) => {
  if (!value || typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed.startsWith('data:image')) return trimmed;
  return uploadToCloudinaryWebp(trimmed, folder, options);
};

/**
 * Converts any base64 data:image items in an array to Cloudinary WebP URLs, deduplicating repeats.
 */
const normalizeImageListToCloudinary = async (images, folder = 'logos_books', options = {}) => {
  if (!Array.isArray(images)) return [];
  const cache = new Map();
  const normalized = [];

  for (const item of images) {
    if (typeof item !== 'string') continue;
    const trimmed = item.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('data:image')) {
      if (cache.has(trimmed)) {
        normalized.push(cache.get(trimmed));
      } else {
        const url = await uploadToCloudinaryWebp(trimmed, folder, options);
        cache.set(trimmed, url);
        normalized.push(url);
      }
    } else {
      normalized.push(trimmed);
    }
  }

  return normalized;
};

/**
 * Strips raw base64 / oversized blobs from returned book documents so API responses stay tiny.
 */
const sanitizeBookMedia = (book) => {
  if (!book || typeof book !== 'object') return book;
  const cloned = { ...book };

  if (Array.isArray(cloned.images)) {
    const cleaned = cloned.images
      .filter((img) => typeof img === 'string' && img.trim() && !isOversizedOrDataUrl(img));
    cloned.images = cleaned.length > 0 ? cleaned : [PLACEHOLDER_BOOK_IMAGE];
  }

  const fallbackCover =
    (Array.isArray(cloned.images) && cloned.images.find((u) => !u.includes('placeholder'))) ||
    PLACEHOLDER_BOOK_IMAGE;

  if (isOversizedOrDataUrl(cloned.coverImage) || !cloned.coverImage) {
    cloned.coverImage = fallbackCover;
  }
  if (isOversizedOrDataUrl(cloned.image) || !cloned.image) {
    cloned.image = cloned.coverImage || fallbackCover;
  }
  if (isOversizedOrDataUrl(cloned.authorPhoto)) {
    cloned.authorPhoto = PLACEHOLDER_AUTHOR_IMAGE;
  }

  return cloned;
};

module.exports = {
  PLACEHOLDER_BOOK_IMAGE,
  PLACEHOLDER_AUTHOR_IMAGE,
  isOversizedOrDataUrl,
  uploadToCloudinaryWebp,
  normalizeSingleMediaToCloudinary,
  normalizeImageListToCloudinary,
  sanitizeBookMedia
};

