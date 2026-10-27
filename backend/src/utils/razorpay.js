const Razorpay = require('razorpay');
const crypto = require('crypto');

function getRazorpayKeys() {
  const keyId =
    process.env.RAZORPAY_KEY_ID ||
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
    'rzp_live_TqU0ldixg2ZuQV';
  const keySecret =
    process.env.RAZORPAY_KEY_SECRET ||
    'CxahKfzuyvxGx1a4GV7m5JBz';
  return { keyId, keySecret };
}

function getRazorpayInstance() {
  const { keyId, keySecret } = getRazorpayKeys();
  if (!keyId || !keySecret) return null;

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

function verifyRazorpaySignature({ orderId, paymentId, signature }) {
  try {
    const { keySecret } = getRazorpayKeys();
    if (!keySecret || !orderId || !paymentId || !signature) return false;

    const payload = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(payload)
      .digest('hex');

    const sigBuf = Buffer.from(signature, 'utf8');
    const expBuf = Buffer.from(expectedSignature, 'utf8');

    if (sigBuf.length !== expBuf.length) return false;
    return crypto.timingSafeEqual(sigBuf, expBuf);
  } catch (err) {
    console.error('Signature verification error:', err);
    return false;
  }
}

/**
 * Initiates an automatic refund for a Razorpay payment (UPI, Card, Netbanking, etc.)
 * @param {Object} options
 * @param {string} options.paymentId - The razorpay payment ID (e.g. 'pay_...')
 * @param {number} [options.amountInRupees] - Amount in Rupees to refund. If omitted, full payment is refunded.
 * @param {Object} [options.notes] - Key-value metadata notes attached to refund
 * @param {string} [options.receipt] - Optional receipt identifier
 * @returns {Promise<Object>} Razorpay refund response object
 */
async function createRazorpayRefund({ paymentId, amountInRupees, notes = {}, receipt }) {
  const razorpay = getRazorpayInstance();
  if (!razorpay) {
    throw new Error('Razorpay payment gateway is not properly configured');
  }
  if (!paymentId) {
    throw new Error('Missing payment ID for refund');
  }

  const payload = {
    notes: {
      platform: 'LOGOS Bookstore',
      ...notes
    }
  };

  if (amountInRupees && Number(amountInRupees) > 0) {
    payload.amount = Math.round(Number(amountInRupees) * 100);
  }

  if (receipt) {
    payload.receipt = receipt;
  }

  const refund = await razorpay.payments.refund(paymentId, payload);
  return refund;
}

module.exports = {
  getRazorpayKeys,
  getRazorpayInstance,
  verifyRazorpaySignature,
  createRazorpayRefund
};
