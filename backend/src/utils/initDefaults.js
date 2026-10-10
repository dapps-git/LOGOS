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
  } catch (err) {
    console.warn('[LOGOS Init Warning]', err.message);
  }
};

module.exports = initDefaults;
