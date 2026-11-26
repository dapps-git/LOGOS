const StoreSettings = require('../models/StoreSettings');
const { getStoreSettings, checkCustomerFirstOrder } = require('../utils/shippingCalculator');

// @desc    Get public store & shipping settings (plus customer's first-order status if logged in)
// @route   GET /api/settings/public
// @access  Public / Optional Auth
const getPublicSettings = async (req, res) => {
  try {
    const settings = await getStoreSettings();
    let isFirstOrder = false;

    if (req.customer) {
      isFirstOrder = await checkCustomerFirstOrder(req.customer);
    }

    return res.json({
      success: true,
      settings: {
        storeName: settings.storeName,
        tagline: settings.tagline,
        defaultSeoTitle: settings.defaultSeoTitle,
        defaultMetaDescription: settings.defaultMetaDescription,
        keralaShippingCharge: Number(settings.keralaShippingCharge || 0),
        outsideKeralaShippingCharge: Number(settings.outsideKeralaShippingCharge || 0),
        freeShippingFirstOrder: Boolean(settings.freeShippingFirstOrder),
        freeShippingOnOnlinePayment: settings.freeShippingOnOnlinePayment !== false,
        codFeeEnabled: settings.codFeeEnabled !== false,
        codFeePercent: Number(settings.codFeePercent ?? 2),
        codFreeThreshold: Number(settings.codFreeThreshold ?? 1000),
        freeShippingThreshold: Number(settings.freeShippingThreshold ?? 999),
        referralRewardAmount: Number(settings.referralRewardAmount ?? 100),
        friendDiscountPercent: Number(settings.friendDiscountPercent ?? 15),
        welcomeDiscountAmount: Number(settings.welcomeDiscountAmount ?? 100)
      },
      isFirstOrder
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get full store & shipping settings (Admin)
// @route   GET /api/settings/admin
// @access  Private (Admin)
const getAdminSettings = async (req, res) => {
  try {
    const settings = await getStoreSettings();
    return res.json({
      success: true,
      settings
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update store & shipping settings (Admin)
// @route   PUT /api/settings/admin
// @access  Private (Admin)
const updateAdminSettings = async (req, res) => {
  try {
    await getStoreSettings();

    const allowedStringFields = [
      'storeName',
      'tagline',
      'supportEmail',
      'supportPhone',
      'gstin',
      'defaultSeoTitle',
      'defaultMetaDescription'
    ];
    const allowedNumberFields = [
      'keralaShippingCharge',
      'outsideKeralaShippingCharge',
      'codFeePercent',
      'codFreeThreshold',
      'freeShippingThreshold',
      'referralRewardAmount',
      'friendDiscountPercent',
      'welcomeDiscountAmount'
    ];
    const allowedBooleanFields = [
      'freeShippingFirstOrder',
      'freeShippingOnOnlinePayment',
      'codFeeEnabled'
    ];

    const updates = {};
    for (const key of allowedStringFields) {
      if (req.body[key] !== undefined) {
        updates[key] = String(req.body[key]).trim();
      }
    }
    for (const key of allowedNumberFields) {
      if (req.body[key] !== undefined && req.body[key] !== '') {
        const parsed = Number(req.body[key]);
        if (!isNaN(parsed) && parsed >= 0) {
          updates[key] = parsed;
        }
      }
    }
    for (const key of allowedBooleanFields) {
      if (req.body[key] !== undefined) {
        updates[key] = Boolean(req.body[key]);
      }
    }

    const updated = await StoreSettings.findOneAndUpdate(
      { key: 'default' },
      { $set: updates },
      { new: true, upsert: true }
    );

    return res.json({
      success: true,
      message: 'Settings saved successfully',
      settings: updated
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getPublicSettings,
  getAdminSettings,
  updateAdminSettings
};

