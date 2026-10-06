const Customer = require('../models/Customer');
const Referral = require('../models/Referral');
const { evaluateCustomerReferralEligibility } = require('../utils/referralService');

// @desc    Get user's referral summary & rewards
// @route   GET /api/referrals/my-rewards
// @access  Private (Customer)
const getMyReferralSummary = async (req, res) => {
  try {
    let customer = await Customer.findById(req.customer._id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    // Auto-check eligibility in case a qualifying first order was recently delivered/completed
    if (!customer.referralEligible) {
      await evaluateCustomerReferralEligibility(customer._id);
      customer = await Customer.findById(req.customer._id);
    }

    const referrals = await Referral.find({ referrer: req.customer._id })
      .populate('referredUser', 'name email createdAt')
      .populate('orderId', 'orderNumber totalAmount orderStatus paymentStatus')
      .sort({ createdAt: -1 });

    const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const referralLink = customer.referralEligible && customer.referralCode
      ? `${baseUrl}/register?ref=${customer.referralCode}`
      : null;

    return res.json({
      success: true,
      referralEligible: Boolean(customer.referralEligible),
      referralCode: customer.referralEligible ? customer.referralCode : null,
      referralLink,
      rewardBalance: customer.referralRewardBalance || 0,
      totalEarned: customer.referralRewardsEarned || 0,
      successfulReferralsCount: customer.successfulReferralsCount || 0,
      isReferred: customer.isReferred,
      referralDiscountUsed: customer.referralDiscountUsed,
      firstPurchaseCompleted: customer.firstPurchaseCompleted,
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

    // Prevent Self-Referral
    if (req.customer) {
      if (req.customer._id.toString() === referrer._id.toString()) {
        return res.status(400).json({ success: false, message: 'You cannot use your own referral code' });
      }

      const reqEmail = (req.customer.email || '').toLowerCase().trim();
      const referrerEmail = (referrer.email || '').toLowerCase().trim();
      if (reqEmail === referrerEmail) {
        return res.status(400).json({ success: false, message: 'You cannot use your own referral code' });
      }

      if (req.customer.referralDiscountUsed) {
        return res.status(400).json({
          success: false,
          message: 'Referral discount is only available on your very first order'
        });
      }
    }

    return res.json({
      success: true,
      valid: true,
      message: 'Referral code applied! You get 15% off on your first order.',
      referralCode: code,
      code,
      discountPercent: 15,
      referrerName: referrer.name
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all referral records & metrics (Admin)
// @route   GET /api/referrals/admin/all
// @access  Private (Admin)
const getAllReferralsAdmin = async (req, res) => {
  try {
    const [referrals, totalLinksGenerated] = await Promise.all([
      Referral.find()
        .populate('referrer', 'name email referralCode')
        .populate('referredUser', 'name email phone createdAt')
        .populate('orderId', 'orderNumber totalAmount paymentStatus orderStatus paymentMethod')
        .sort({ createdAt: -1 }),
      Customer.countDocuments({
        $or: [
          { referralEligible: true },
          { referralCode: { $exists: true, $ne: null } }
        ]
      })
    ]);

    const successfulReferrals = referrals.filter(r => r.status === 'rewarded').length;
    const pendingReferrals = referrals.filter(r => r.status !== 'rewarded' && r.status !== 'cancelled').length;
    const totalRewardsIssued = referrals
      .filter(r => r.status === 'rewarded')
      .reduce((sum, r) => sum + (r.referrerRewardAmount || 100), 0);

    return res.json({
      success: true,
      count: referrals.length,
      totalLinksGenerated,
      totalReferrals: referrals.length,
      successfulReferrals,
      pendingReferrals,
      completedReferrals: successfulReferrals,
      totalRewardsIssued,
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
