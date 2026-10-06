const Customer = require('../models/Customer');
const Referral = require('../models/Referral');
const Order = require('../models/Order');

/**
 * Generate a cryptographically distinct, readable unique referral code.
 * Example format: LOGOS-7K9PX
 */
async function generateUniqueReferralCode() {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // omit ambiguous 0, O, 1, I
  let isUnique = false;
  let code = '';

  while (!isUnique) {
    let randomPart = '';
    for (let i = 0; i < 5; i++) {
      randomPart += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    code = `LOGOS-${randomPart}`;
    const existing = await Customer.findOne({ referralCode: code });
    if (!existing) {
      isUnique = true;
    }
  }

  return code;
}

/**
 * Evaluate and award referral eligibility for User A (First Purchase Only, >= ₹999).
 * 
 * Rules:
 * 1. Referral link is generated ONLY for a new customer after their FIRST successful purchase.
 * 2. Order amount must be >= ₹999.
 * 3. Online payment: generated immediately when payment is Paid & order confirmed.
 * 4. COD: generated ONLY when order is successfully Delivered.
 * 5. If first order is cancelled/failed/returned, referral link is NOT generated.
 * 6. Once generated, referral eligibility and code are permanently preserved.
 * 7. Customers with prior completed orders cannot become eligible from later orders.
 */
async function evaluateCustomerReferralEligibility(customerId, targetOrderId = null) {
  try {
    if (!customerId) return { eligible: false, message: 'Customer ID required' };

    const customer = await Customer.findById(customerId);
    if (!customer) return { eligible: false, message: 'Customer not found' };

    // 1. If already eligible, preserve permanently
    if (customer.referralEligible && customer.referralCode) {
      return {
        eligible: true,
        referralCode: customer.referralCode,
        message: 'Customer is already referral eligible'
      };
    }

    // 2. Fetch all orders for this customer ordered chronologically
    const allOrders = await Order.find({ customer: customerId }).sort({ createdAt: 1 });
    if (!allOrders || allOrders.length === 0) {
      return { eligible: false, message: 'No orders found for customer' };
    }

    // Check which order we are evaluating (or default to the first order)
    let qualifyingOrder = null;
    if (targetOrderId) {
      qualifyingOrder = allOrders.find(o => o._id.toString() === targetOrderId.toString());
    } else {
      qualifyingOrder = allOrders[0];
    }

    if (!qualifyingOrder) {
      return { eligible: false, message: 'Qualifying order not found' };
    }

    // 3. Rule: Check complete order history. Must be the customer's FIRST purchase.
    // If there is ANY previous order that was already completed (Delivered or Paid online)
    // prior to this order, the customer cannot become referral-eligible.
    const previousCompletedOrders = allOrders.filter(o => {
      if (o._id.toString() === qualifyingOrder._id.toString()) return false;
      if (new Date(o.createdAt) >= new Date(qualifyingOrder.createdAt)) return false;

      const isCOD = (o.paymentMethod || '').toUpperCase() === 'COD';
      const isOnline = !isCOD;
      const isDelivered = (o.orderStatus || '').toLowerCase() === 'delivered';
      const isPaid = o.paymentStatus === 'Paid';
      const isCancelled = ['cancelled', 'failed', 'returned', 'refunded'].includes((o.orderStatus || '').toLowerCase());

      if (isCancelled) return false;
      return (isOnline && isPaid) || (isCOD && isDelivered);
    });

    if (previousCompletedOrders.length > 0) {
      // Customer has already completed a previous order. Cannot become eligible from later orders.
      return {
        eligible: false,
        message: 'Referral eligibility is strictly reserved for the customer’s first purchase.'
      };
    }

    // 4. Check if order was cancelled or failed
    const currentStatus = (qualifyingOrder.orderStatus || '').toLowerCase();
    if (['cancelled', 'failed', 'returned', 'return requested', 'return rejected'].includes(currentStatus)) {
      return { eligible: false, message: 'Order is cancelled or not completed' };
    }

    // 5. Check qualifying order amount: must be >= ₹999
    const orderAmount = qualifyingOrder.subtotal || qualifyingOrder.totalAmount || qualifyingOrder.finalTotal || 0;
    if (orderAmount < 999) {
      // First order does not meet minimum ₹999 threshold.
      // If this non-qualifying order completes, mark firstPurchaseCompleted so subsequent orders won't qualify.
      const isCOD = (qualifyingOrder.paymentMethod || '').toUpperCase() === 'COD';
      const isDelivered = currentStatus === 'delivered';
      const isPaid = qualifyingOrder.paymentStatus === 'Paid';
      if ((isCOD && isDelivered) || (!isCOD && isPaid)) {
        customer.firstPurchaseCompleted = true;
        await customer.save();
      }
      return {
        eligible: false,
        message: 'Order does not meet minimum qualifying amount of ₹999 for referral eligibility.'
      };
    }

    // 6. Check Payment & Delivery conditions
    const isCOD = (qualifyingOrder.paymentMethod || '').toUpperCase() === 'COD';
    let isCompleted = false;

    if (isCOD) {
      // COD requires order to be DELIVERED
      if (currentStatus === 'delivered') {
        isCompleted = true;
      }
    } else {
      // Online payment requires successful payment
      if (qualifyingOrder.paymentStatus === 'Paid') {
        isCompleted = true;
      }
    }

    if (!isCompleted) {
      return {
        eligible: false,
        message: isCOD
          ? 'COD order must be delivered before referral link is unlocked.'
          : 'Payment must be completed before referral link is unlocked.'
      };
    }

    // 7. Qualifies! Generate unique referral code and save permanent eligibility
    const uniqueCode = customer.referralCode || (await generateUniqueReferralCode());
    customer.referralEligible = true;
    customer.referralCode = uniqueCode;
    customer.referralEligibleOrderId = qualifyingOrder._id;
    customer.firstPurchaseCompleted = true;
    await customer.save();

    return {
      eligible: true,
      referralCode: uniqueCode,
      message: 'Referral link successfully generated!'
    };
  } catch (error) {
    console.error('[evaluateCustomerReferralEligibility Error]:', error);
    return { eligible: false, message: error.message };
  }
}

/**
 * Process referral reward for User A when User B completes their purchase.
 * 
 * Rules:
 * 1. Online: awarded immediately when payment is Paid & order confirmed.
 * 2. COD: awarded ONLY when order is successfully Delivered.
 * 3. Cancelled/failed orders DO NOT award rewards.
 * 4. Must be ONE-TIME per referral relationship (strict idempotency).
 */
async function processReferralRewardOnCompletion(order) {
  try {
    if (!order || !order.customer) return { success: false, message: 'Invalid order' };

    const customerId = order.customer._id || order.customer;

    // Find referral record where this customer is the referred user
    const referral = await Referral.findOne({ referredUser: customerId });
    if (!referral) {
      return { success: false, message: 'Not a referred user' };
    }

    // Idempotency check: Already rewarded?
    if (referral.status === 'rewarded' || referral.rewardIssued) {
      return { success: true, message: 'Referral reward has already been issued' };
    }

    // Check completion condition
    const isCOD = (order.paymentMethod || '').toUpperCase() === 'COD';
    const currentStatus = (order.orderStatus || '').toLowerCase();

    if (['cancelled', 'failed', 'returned', 'refunded'].includes(currentStatus)) {
      return { success: false, message: 'Order is cancelled/failed; no referral reward awarded' };
    }

    let isCompleted = false;
    if (isCOD) {
      if (currentStatus === 'delivered') {
        isCompleted = true;
      }
    } else {
      if (order.paymentStatus === 'Paid') {
        isCompleted = true;
      }
    }

    if (!isCompleted) {
      return {
        success: false,
        message: isCOD
          ? 'COD order awaiting delivery before awarding referral reward'
          : 'Order awaiting online payment completion'
      };
    }

    // Atomic update to prevent duplicate rewards under concurrent requests
    const updatedReferral = await Referral.findOneAndUpdate(
      { _id: referral._id, status: { $ne: 'rewarded' } },
      {
        $set: {
          status: 'rewarded',
          rewardIssued: true,
          rewardIssuedAt: new Date(),
          rewardedAt: new Date(),
          orderId: order._id,
          orderAmount: order.finalTotal || order.totalAmount || order.subtotal
        }
      },
      { new: true }
    );

    if (!updatedReferral) {
      return { success: true, message: 'Referral reward already processed concurrently' };
    }

    const rewardAmount = updatedReferral.referrerRewardAmount || 100;

    // Credit User A (Referrer)
    await Customer.findByIdAndUpdate(updatedReferral.referrer, {
      $inc: {
        referralRewardBalance: rewardAmount,
        referralRewardsEarned: rewardAmount,
        successfulReferralsCount: 1
      }
    });

    return {
      success: true,
      rewarded: true,
      rewardAmount,
      referrerId: updatedReferral.referrer
    };
  } catch (error) {
    console.error('[processReferralRewardOnCompletion Error]:', error);
    return { success: false, message: error.message };
  }
}

module.exports = {
  generateUniqueReferralCode,
  evaluateCustomerReferralEligibility,
  processReferralRewardOnCompletion
};
