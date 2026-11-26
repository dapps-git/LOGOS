const StoreSettings = require('../models/StoreSettings');
const Order = require('../models/Order');

/**
 * Retrieve singleton StoreSettings document, creating with defaults if missing.
 */
async function getStoreSettings() {
  let settings = await StoreSettings.findOne({ key: 'default' }).lean();
  if (!settings) {
    const created = await StoreSettings.create({ key: 'default' });
    settings = created.toObject();
  }
  return settings;
}

/**
 * Determine whether the customer is eligible for First-Order benefits.
 * True when customer has not completed a purchase and has 0 non-cancelled orders.
 */
async function checkCustomerFirstOrder(customer) {
  if (!customer || !customer._id) return false;
  if (customer.firstPurchaseCompleted) return false;

  const priorOrderCount = await Order.countDocuments({
    customer: customer._id,
    orderStatus: { $nin: ['Cancelled', 'cancelled', 'Failed', 'failed'] }
  });
  return priorOrderCount === 0;
}

/**
 * Unified shipping & COD fee calculation shared across Checkout quote and Order creation.
 */
function calculateShippingDetails({
  settings,
  state = 'Kerala',
  paymentMethod = 'COD',
  subtotal = 0,
  isFirstOrder = false
}) {
  const s = settings || {};
  const normalizedState = String(state || 'Kerala').trim().toLowerCase();
  const isKerala = !normalizedState || normalizedState === 'kerala';

  const regionalCharge = Math.max(
    0,
    Number(isKerala ? s.keralaShippingCharge : s.outsideKeralaShippingCharge) || 0
  );

  const normalizedPayment = String(paymentMethod || 'COD').trim().toUpperCase();
  const isOnline = normalizedPayment !== 'COD';

  const freeByFirstOrder = Boolean(s.freeShippingFirstOrder && isFirstOrder);
  const freeByOnline = Boolean(isOnline && s.freeShippingOnOnlinePayment);

  const baseShippingFee = (subtotal <= 0 || freeByFirstOrder || freeByOnline) ? 0 : regionalCharge;

  const codFeeEnabled = s.codFeeEnabled !== false;
  const codFeePercent = Number(s.codFeePercent ?? 2);
  const codFreeThreshold = Number(s.codFreeThreshold ?? 1000);

  const codFee = (!isOnline && codFeeEnabled && subtotal > 0 && subtotal < codFreeThreshold)
    ? Math.round((subtotal * codFeePercent) / 100)
    : 0;

  return {
    isKerala,
    regionLabel: isKerala ? 'Kerala' : 'Outside Kerala',
    regionalCharge,
    isOnline,
    freeByFirstOrder,
    freeByOnline,
    baseShippingFee,
    codFee,
    shippingFee: baseShippingFee + codFee
  };
}

module.exports = {
  getStoreSettings,
  checkCustomerFirstOrder,
  calculateShippingDetails
};

