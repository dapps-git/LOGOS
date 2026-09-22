const Customer = require('../models/Customer');
const Referral = require('../models/Referral');

// @desc    Get user's referral summary & rewards
// @route   GET /api/referrals/my-rewards
// @access  Private (Customer)
const getMyReferralSummary = async (req, res) => {
  try {
    const customer = await Customer.findById(req.customer._id);
    const referrals = await Referral.find({ referrer: req.customer._id })
      .populate('referredUser', 'name email createdAt')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      referralCode: customer.referralCode,
      rewardBalance: customer.referralRewardBalance || 0,
      totalEarned: customer.referralRewardsEarned || 0,
      successfulReferralsCount: customer.successfulReferralsCount || 0,
      isReferred: customer.isReferred,
      referralDiscountUsed: customer.referralDiscountUsed,
      referrals
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Validate referral code for 15% 1st order discount
// @route   POST /api/referrals/validate
// @access  Public / Optional Auth
const validateReferralCode = async (req, res) => {
  try {
    const { referralCode } = req.body;

    if (!referralCode) {
      return res.status(400).json({ success: false, message: 'Please enter a referral code' });
    }

    const code = referralCode.trim().toUpperCase();
    const referrer = await Customer.findOne({ referralCode: code });

    if (!referrer) {
      return res.status(404).json({ success: false, message: 'Invalid referral code' });
    }

    if (req.customer && req.customer._id.toString() === referrer._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot use your own referral code' });
    }

    if (req.customer && req.customer.referralDiscountUsed) {
      return res.status(400).json({
        success: false,
        message: 'Referral discount is only available on your very first order'
      });
    }

    return res.json({
      success: true,
      message: 'Referral code applied! You get 15% off on your first order.',
      referralCode: code,
      discountPercent: 15,
      referrerName: referrer.name
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all referral records (Admin)
// @route   GET /api/referrals/admin/all
// @access  Private (Admin)
const getAllReferralsAdmin = async (req, res) => {
  try {
    const referrals = await Referral.find()
      .populate('referrer', 'name email referralCode')
      .populate('referredUser', 'name email')
      .populate('orderId', 'orderNumber totalAmount paymentStatus')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: referrals.length,
      referrals
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getMyReferralSummary,
  validateReferralCode,
  getAllReferralsAdmin
};
