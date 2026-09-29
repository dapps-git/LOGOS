'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { apiCreateOrder, apiGetAvailableCoupons } from '../../lib/api';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, addAddress } = useAuth();
  const {
    items,
    itemCount,
    subtotal,
    couponDiscount,
    referralDiscount,
    walletDiscount,
    shippingFee,
    grandTotal,
    appliedCoupon,
    appliedReferral,
    applyCouponCode,
    removeCoupon,
    removeFromCart,
    clearCart
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState(null);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  // Address State
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    streetAddress: '',
    city: '',
    state: 'Kerala',
    postalCode: '',
    country: 'India'
  });

  // Guest Address fallback if not logged in
  const [guestAddress, setGuestAddress] = useState({
    fullName: '',
    email: '',
    phone: '',
    streetAddress: '',
    city: '',
    state: 'Kerala',
    postalCode: '',
    country: 'India'
  });

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState('razorpay'); // 'razorpay' or 'cod'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch available coupons
  useEffect(() => {
    apiGetAvailableCoupons()
      .then((data) => {
        if (Array.isArray(data)) setAvailableCoupons(data);
        else if (data?.coupons) setAvailableCoupons(data.coupons);
      })
      .catch(() => {});
  }, []);

  const handleApplyCoupon = async (e, codeToApply) => {
    if (e) e.preventDefault();
    const code = (codeToApply || couponInput).trim().toUpperCase();
    if (!code) return;
    setApplyingCoupon(true);
    setCouponMsg(null);
    const res = await applyCouponCode(code);
    setCouponMsg(res);
    setApplyingCoupon(false);
  };

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0 && !loading) {
      router.push('/cart');
    }
  }, [items, loading, router]);

  const handleAddNewAddress = async (e) => {
    e.preventDefault();
    try {
      if (user) {
        await addAddress(newAddress);
        setShowAddressModal(false);
        setSelectedAddressIndex((user.addresses?.length || 1) - 1);
      }
    } catch (err) {
      setError(err.message || 'Failed to save address');
    }
  };

  const handlePlaceOrder = async () => {
    setError('');
    setLoading(true);

    try {
      let finalShippingAddress;
      let customerName = user?.name || guestAddress.fullName;
      let customerEmail = user?.email || guestAddress.email;
      let customerPhone = user?.phone || guestAddress.phone;

      if (user && user.addresses && user.addresses.length > 0) {
        finalShippingAddress = user.addresses[selectedAddressIndex] || user.addresses[0];
      } else {
        if (!guestAddress.fullName || !guestAddress.streetAddress || !guestAddress.postalCode || !guestAddress.phone) {
          throw new Error('Please fill in your complete delivery address details.');
        }
        finalShippingAddress = {
          fullName: guestAddress.fullName,
          phone: guestAddress.phone,
          streetAddress: guestAddress.streetAddress,
          city: guestAddress.city,
          state: guestAddress.state,
          postalCode: guestAddress.postalCode,
          country: guestAddress.country
        };
      }

      const formattedItems = items.map((item) => ({
        bookId: item.book?._id || item.book?.id || item.book,
        book: item.book?._id || item.book?.id || item.book,
        title: item.book?.titleMalayalam || item.book?.title || 'LOGOS Book',
        author: item.book?.author || 'LOGOS',
        quantity: item.quantity,
        price: item.price || item.book?.discountPrice || item.book?.salePrice || item.book?.price || 299,
        coverImage: item.book?.coverImage || item.book?.image || ''
      }));

      const orderPayload = {
        items: formattedItems,
        orderItems: formattedItems,
        shippingAddress: finalShippingAddress,
        paymentMethod: paymentMethod === 'cod' ? 'cod' : 'razorpay',
        itemsPrice: subtotal,
        subtotal,
        shippingPrice: shippingFee,
        shippingFee,
        discount: (couponDiscount || 0) + (referralDiscount || 0) + (walletDiscount || 0),
        couponDiscount,
        referralDiscount,
        walletDiscount,
        totalPrice: grandTotal,
        totalAmount: grandTotal,
        appliedCoupon: appliedCoupon?.code || null,
        isGuest: !user,
        guestEmail: customerEmail,
        guestName: customerName,
        guestPhone: customerPhone
      };

      const result = await apiCreateOrder(orderPayload);
      const createdOrderId = result?.order?._id || result?.order?.orderNumber || result?._id || 'LOGOS-ORDER';

      // If Razorpay online payment selected and gateway configured
      if (paymentMethod === 'razorpay' && result?.razorpayOrder) {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
          amount: result.razorpayOrder.amount,
          currency: 'INR',
          name: 'LOGOS Books',
          description: 'Payment for Book Purchase',
          order_id: result.razorpayOrder.id,
          handler: function (response) {
            clearCart();
            router.push(`/order-placed?orderId=${createdOrderId}`);
          },
          prefill: {
            name: customerName,
            email: customerEmail,
            contact: customerPhone
          },
          theme: {
            color: '#1044A5'
          }
        };

        if (typeof window !== 'undefined' && window.Razorpay) {
          const rzp = new window.Razorpay(options);
          rzp.open();
          setLoading(false);
          return;
        }
      }

      // Small deliberate pause to show the literary loading graphic
      setTimeout(() => {
        clearCart();
        router.push(`/order-placed?orderId=${createdOrderId}`);
      }, 1500);

    } catch (err) {
      console.error('Order placement error:', err);
      setError(err.message || 'Failed to place order. Please check all details.');
      setLoading(false);
    }
  };

  const activeAddr = (user?.addresses && user.addresses[selectedAddressIndex]) || (guestAddress.fullName ? guestAddress : null);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 max-w-md sm:max-w-xl mx-auto w-full px-4 pt-24 sm:pt-28 pb-16">
        {/* 1. Stepper Header */}
        <div className="flex items-center justify-between mb-6 px-1 text-xs">
          {/* Step 1: Review Order */}
          <div className="flex items-center gap-1.5 font-medium text-[#1044A5]">
            <span className="w-5 h-5 rounded-full bg-[#1044A5] text-white flex items-center justify-center text-[11px] font-bold">
              1
            </span>
            <span>Review Order</span>
          </div>

          <div className="flex-1 h-[1px] bg-slate-200 mx-2" />

          {/* Step 2: Payment */}
          <div className="flex items-center gap-1.5 font-normal text-slate-400">
            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[11px]">
              2
            </span>
            <span>Payment</span>
          </div>

          <div className="flex-1 h-[1px] bg-slate-200 mx-2" />

          {/* Step 3: Confirmation */}
          <div className="flex items-center gap-1.5 font-normal text-slate-400">
            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[11px]">
              3
            </span>
            <span>Confirmation</span>
          </div>
        </div>

        {/* Page Title */}
        <div className="mb-5">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Place Your Order
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Review your details and complete your purchase.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-100 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          {/* 2. Ordered Item Card */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-sm">
            {items.map((item) => {
              const book = item.book || {};
              const title = book.titleMalayalam || book.title || 'LOGOS Book';
              const author = book.author || 'LOGOS Publications';
              const img = book.coverImage || book.image || '/book1.jpg';
              const price = item.price || book.salePrice || book.price || 112;
              const original = book.originalPrice || price + 68;

              return (
                <div key={book._id || book.id || item.book} className="flex items-center gap-3">
                  <div className="w-14 h-18 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                    <img
                      src={img}
                      alt={title}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/book1.jpg';
                      }}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">{title}</h3>
                      <button
                        type="button"
                        onClick={() => removeFromCart(book._id || book.id || item.book)}
                        className="text-slate-400 hover:text-rose-500 p-0.5"
                        title="Remove"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400 font-light truncate">{author}</p>
                    <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Qty: {item.quantity}</span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-xs sm:text-sm font-bold text-slate-900 font-mono">₹{price * item.quantity}</span>
                      <span className="text-[10px] line-through text-slate-400 font-mono">₹{original * item.quantity}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 3. Delivery Address Card */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-sm flex items-start justify-between gap-3 text-left">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-[#1044A5] flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-semibold text-slate-900">Delivery Address</h3>
                {activeAddr ? (
                  <>
                    <p className="text-xs font-normal text-slate-800 mt-1">{activeAddr.fullName}</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                      {activeAddr.streetAddress}, {activeAddr.city}, {activeAddr.state} - {activeAddr.postalCode}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Phone: {activeAddr.phone}</p>
                  </>
                ) : (
                  <p className="text-xs text-rose-500 mt-1">Please set your delivery address</p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAddressModal(true)}
              className="text-xs text-[#1044A5] hover:underline font-medium shrink-0 flex items-center gap-0.5 pt-0.5"
            >
              <span>Change</span>
              <span>›</span>
            </button>
          </div>

          {/* 4. Payment Method Card */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-sm flex items-start justify-between gap-3 text-left">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-[#1044A5] flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-semibold text-slate-900">Payment Method</h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#5F259F] text-white flex items-center justify-center text-[8px] font-bold">
                    पे
                  </span>
                  <p className="text-xs text-slate-700">
                    {paymentMethod === 'cod'
                      ? 'Cash on Delivery (COD)'
                      : 'UPI (PhonePe / Google Pay / Paytm)'}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowPaymentModal(true)}
              className="text-xs text-[#1044A5] hover:underline font-medium shrink-0 flex items-center gap-0.5 pt-0.5"
            >
              <span>Change</span>
              <span>›</span>
            </button>
          </div>

          {/* 5. Price Details Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-2 text-xs text-slate-600">
            <h3 className="text-xs font-semibold text-slate-900 pb-2 border-b border-slate-100">
              Price Details
            </h3>

            <div className="flex justify-between pt-1">
              <span className="font-light">Subtotal ({itemCount} item)</span>
              <span className="font-mono text-slate-900">₹{subtotal}</span>
            </div>

            <div className="flex justify-between">
              <span className="font-light">Shipping Charges</span>
              <span className="font-mono text-slate-900">
                {shippingFee === 0 ? <span className="text-emerald-600">₹0.00</span> : `₹${shippingFee}`}
              </span>
            </div>

            {(couponDiscount > 0 || referralDiscount > 0 || walletDiscount > 0) && (
              <div className="flex justify-between text-emerald-600">
                <span className="font-light">Discount</span>
                <span className="font-mono">
                  − ₹{(couponDiscount || 0) + (referralDiscount || 0) + (walletDiscount || 0)}
                </span>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between font-bold text-slate-900 text-sm">
              <span>Total Amount</span>
              <span className="font-mono text-[#1044A5] text-base">₹{grandTotal}</span>
            </div>
          </div>

          {/* 6. Place Order Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full py-4 px-6 bg-[#1044A5] hover:bg-[#0c3986] text-white rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-md shadow-blue-900/15 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Place Order</span>
            </button>

            <p className="text-[10px] text-center text-slate-400 mt-2.5">
              By placing this order, you agree to our{' '}
              <Link href="/policies/terms" className="text-[#1044A5] hover:underline">
                Terms &amp; Conditions
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Literary Book Order Placing Loading Modal Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xs w-full p-6 text-center shadow-2xl border border-slate-100 flex flex-col items-center">
            {/* Animated Book graphic */}
            <div className="w-24 h-24 rounded-full bg-[#EFF5FF] flex items-center justify-center mb-4 relative animate-pulse">
              <svg className="w-16 h-16" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 20C40 18 20 22 20 22V75C20 75 40 71 50 75C60 71 80 75 80 75V22C80 22 60 18 50 20Z" fill="#1D4ED8" opacity="0.9"/>
                <path d="M50 20V75" stroke="white" strokeWidth="2"/>
                <path d="M26 32H44M26 42H44M26 52H38" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M56 32H74M56 42H74M56 52H68" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>

            <h3 className="text-base font-bold text-slate-900">Placing Your Order...</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Preparing your literary journey to your doorstep.
            </p>
            <div className="w-6 h-6 border-2 border-[#1044A5]/30 border-t-[#1044A5] rounded-full animate-spin mt-4" />
          </div>
        </div>
      )}

      {/* Address Selector / Adder Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-semibold text-slate-900">Delivery Address</h3>
              <button
                type="button"
                onClick={() => setShowAddressModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* If user has addresses */}
            {user?.addresses && user.addresses.length > 0 ? (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {user.addresses.map((addr, idx) => (
                  <label
                    key={addr._id || idx}
                    onClick={() => {
                      setSelectedAddressIndex(idx);
                      setShowAddressModal(false);
                    }}
                    className={`block p-3 rounded-2xl border cursor-pointer ${
                      selectedAddressIndex === idx
                        ? 'border-[#1044A5] bg-blue-50/50'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-900">{addr.fullName}</span>
                      <input
                        type="radio"
                        name="modal_address"
                        checked={selectedAddressIndex === idx}
                        onChange={() => {}}
                        className="text-[#1044A5]"
                      />
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1">
                      {addr.streetAddress}, {addr.city} - {addr.postalCode}
                    </p>
                  </label>
                ))}
              </div>
            ) : (
              /* Address Form */
              <form onSubmit={handleAddNewAddress} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={guestAddress.fullName}
                    onChange={(e) => setGuestAddress({ ...guestAddress, fullName: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAFBFD] border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    required
                    value={guestAddress.phone}
                    onChange={(e) => setGuestAddress({ ...guestAddress, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAFBFD] border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    value={guestAddress.streetAddress}
                    onChange={(e) => setGuestAddress({ ...guestAddress, streetAddress: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAFBFD] border border-slate-200 rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={guestAddress.city}
                      onChange={(e) => setGuestAddress({ ...guestAddress, city: e.target.value })}
                      className="w-full px-3 py-2 bg-[#FAFBFD] border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">PIN Code</label>
                    <input
                      type="text"
                      required
                      value={guestAddress.postalCode}
                      onChange={(e) => setGuestAddress({ ...guestAddress, postalCode: e.target.value })}
                      className="w-full px-3 py-2 bg-[#FAFBFD] border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="w-full py-2.5 bg-[#1044A5] text-white rounded-xl font-medium mt-2"
                >
                  Confirm Address
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Payment Selector Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-semibold text-slate-900">Select Payment Method</h3>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <label
                onClick={() => {
                  setPaymentMethod('razorpay');
                  setShowPaymentModal(false);
                }}
                className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer ${
                  paymentMethod === 'razorpay' ? 'border-[#1044A5] bg-blue-50/50' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-[#5F259F] text-white flex items-center justify-center text-[9px] font-bold">
                    पे
                  </span>
                  <span className="font-medium text-slate-900">UPI / Cards / Net Banking</span>
                </div>
                <span className="text-[10px] text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-full">Instant</span>
              </label>

              <label
                onClick={() => {
                  setPaymentMethod('cod');
                  setShowPaymentModal(false);
                }}
                className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer ${
                  paymentMethod === 'cod' ? 'border-[#1044A5] bg-blue-50/50' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="font-medium text-slate-900">Cash on Delivery (COD)</span>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
