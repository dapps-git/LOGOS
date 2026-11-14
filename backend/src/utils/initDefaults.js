const Coupon = require('../models/Coupon');
const Banner = require('../models/Banner');

const initDefaults = async () => {
  try {
    // 1. Ensure WELCOME100 coupon exists (₹100 discount above ₹500, limit 1000 users)
    const existingWelcome = await Coupon.findOne({
      $or: [{ code: 'WELCOME100' }, { isWelcomeCoupon: true }]
    });

    if (!existingWelcome) {
      await Coupon.create({
        code: 'WELCOME100',
        description: 'Welcome Offer: Flat ₹100 OFF on your first order above ₹500',
        discountType: 'fixed',
        discountValue: 100,
        minOrderValue: 500,
        usageLimit: 1000,
        isWelcomeCoupon: true,
        isActive: true
      });
      console.log('[LOGOS Init] Created default Welcome Coupon WELCOME100');
    } else if (existingWelcome.code === 'WELCOME100' && (existingWelcome.minOrderValue !== 500 || existingWelcome.discountValue !== 100)) {
      existingWelcome.discountType = 'fixed';
      existingWelcome.discountValue = 100;
      existingWelcome.minOrderValue = 500;
      existingWelcome.usageLimit = 1000;
      existingWelcome.isWelcomeCoupon = true;
      existingWelcome.isActive = true;
      await existingWelcome.save();
      console.log('[LOGOS Init] Updated Welcome Coupon WELCOME100 parameters');
    }

    // 2. Only seed default banners if the Banner collection is completely empty
    const existingBannerCount = await Banner.countDocuments();
    if (existingBannerCount === 0) {
      const defaultBanners = [
        {
          title: 'Hero Banner 1',
          image: '/banner.png',
          link: '/products',
          position: 'hero',
          order: 1,
          isActive: true
        },
        {
          title: 'Hero Banner 2',
          image: '/a6596570bf1b78258701cededbec40dde96c7849.png',
          link: '/products',
          position: 'hero',
          order: 2,
          isActive: true
        },
        {
          title: 'Hero Banner 3',
          image: '/f66b23b4bcdf731edbe393527a48ad68d2f69134.png',
          link: '/products',
          position: 'hero',
          order: 3,
          isActive: true
        },
        {
          title: 'Above Bestsellers Promo Banner',
          image: '/combo_banner.png',
          link: '/products',
          position: 'deal_of_day',
          order: 4,
          isActive: true
        }
      ];

      for (const b of defaultBanners) {
        await Banner.create(b);
      }
      console.log('[LOGOS Init] Seeded initial default banners');
    }

    // 3. Auto-sync stock quantities & stockStatus across all books to eliminate discrepancies
    const Book = require('../models/Book');
    const syncRes1 = await Book.updateMany(
      { stock: { $gt: 5 }, stockStatus: { $ne: 'in_stock' } },
      { $set: { stockStatus: 'in_stock' } }
    );
    const syncRes2 = await Book.updateMany(
      { stock: { $gt: 0, $lte: 5 }, stockStatus: { $ne: 'low_stock' } },
      { $set: { stockStatus: 'low_stock' } }
    );
    const syncRes3 = await Book.updateMany(
      { stock: { $lte: 0 }, stockStatus: { $ne: 'out_of_stock' } },
      { $set: { stock: 0, stockStatus: 'out_of_stock' } }
    );
    const syncRes4 = await Book.updateMany(
      { stock: { $exists: false } },
      { $set: { stock: 25, stockStatus: 'in_stock' } }
    );
    const totalFixed = (syncRes1.modifiedCount || 0) + (syncRes2.modifiedCount || 0) + (syncRes3.modifiedCount || 0) + (syncRes4.modifiedCount || 0);
    if (totalFixed > 0) {
      console.log(`[LOGOS Init] Auto-synchronized stock status for ${totalFixed} catalog books.`);
    }

    // 4. Auto-sync coverImage & image fields for books that have photos in images array
    const booksNeedingCover = await Book.find({
      $or: [
        { coverImage: { $exists: false } },
        { coverImage: '' },
        { coverImage: /placeholder/i }
      ],
      'images.0': { $exists: true }
    }).select('_id images coverImage').lean();

    let coverFixedCount = 0;
    for (const b of booksNeedingCover) {
      if (Array.isArray(b.images) && b.images.length > 0) {
        const realImg = b.images.find((img) => typeof img === 'string' && img.trim() && !img.includes('placeholder')) || b.images[0];
        if (realImg && !realImg.includes('placeholder')) {
          await Book.updateOne({ _id: b._id }, { $set: { coverImage: realImg, image: realImg } });
          coverFixedCount++;
        }
      }
    }
    if (coverFixedCount > 0) {
      console.log(`[LOGOS Init] Synchronized coverImage for ${coverFixedCount} books from their uploaded photos.`);
    }
  } catch (err) {
    console.warn('[LOGOS Init Warning]', err.message);
  }
};

module.exports = initDefaults;
