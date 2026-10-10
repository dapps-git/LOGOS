'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { apiGetAvailableCoupons } from '../../lib/api';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    items,
    itemCount,
    loading,
    subtotal,
    couponDiscount,
    referralDiscount,
    walletDiscount,
    shippingFee,
    grandTotal,
    totalSavings,
    appliedCoupon,
    appliedReferral,
    useWalletBalance,
    setUseWalletBalance,
    updateQuantity,
    removeFromCart,
    applyCouponCode,
    removeCoupon,
    applyReferralCode,
    removeReferral
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState(null);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [referralInput, setReferralInput] = useState('');
  const [referralMsg, setReferralMsg] = useState(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [applyingReferral, setApplyingReferral] = useState(false);

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

  const eligibleCoupons = availableCoupons.filter((c) => {
    const minVal = Number(c.minOrderValue ?? c.minOrderAmount ?? 0);
    return subtotal >= minVal;
  });

  const handleApplyReferral = async (e) => {
    e.preventDefault();
    if (!referralInput.trim()) return;
    setApplyingReferral(true);
    setReferralMsg(null);
    const res = await applyReferralCode(referralInput.trim().toUpperCase());
    setReferralMsg(res);
    setApplyingReferral(false);
  };

  const freeShippingThreshold = 499;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-3.5 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16">
        {/* Sleek Minimal Header */}
        <div className="flex items-center justify-between gap-3 mb-5 sm:mb-6 pb-3 border-b border-slate-200/80">
          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              className="p-1.5 -ml-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              title="Back to store"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-lg sm:text-xl font-normal text-slate-900 tracking-tight flex items-center gap-2">
              <span>Shopping Cart</span>
              <span className="text-[11px] font-mono font-medium px-2 py-0.5 bg-blue-50 text-[#1E3A8A] rounded-md">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </span>
            </h1>
          </div>

          <Link
            href="/"
            className="text-xs font-light text-[#1E3A8A] hover:underline"
          >
            Continue Shopping
          </Link>
        </div>

        {items.length === 0 ? (
          /* Empty Cart State */
          <div className="bg-white rounded-xl p-8 sm:p-12 text-center border border-slate-100 shadow-sm max-w-md mx-auto my-8 sm:my-12">
            <div className="w-14 h-14 bg-blue-50 text-[#1E3A8A] rounded-xl flex items-center justify-center mx-auto mb-3.5">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-base sm:text-lg font-normal text-slate-800 mb-1">Your cart is empty</h2>
            <p className="text-xs font-light text-slate-400 mb-5">
              Explore our wide collection of Malayalam and English literature.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-2.5 bg-[#1E3A8A] hover:bg-[#152e72] text-white rounded-lg text-xs font-medium tracking-wide transition-all shadow-sm"
            >
              Discover Books
            </Link>
          </div>
        ) : (
          /* Cart Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8">
            {/* Left Column: Items List (Image Left, Details Right) */}
            <div className="lg:col-span-8 space-y-3.5 sm:space-y-4">
              {items.map((item) => {
                const book = item.book || {};
                const bookId = book._id || book.id || item.book;
                const price = item.price || book.salePrice || book.price || 299;
                const original = book.originalPrice || price + 60;
                const image = (Array.isArray(book.images) && book.images[0]) || book.coverImage || book.image || '/book-placeholder.svg';
                const title = book.titleMalayalam || book.title || 'LOGOS Book';
                const author = book.author || 'LOGOS Publications';

                return (
                  <div
                    key={bookId}
                    className="bg-white rounded-xl p-3.5 sm:p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-3.5 sm:gap-6 group"
                  >
                    {/* LEFT: Book Cover Image */}
                    <Link
                      href={`/books/${book.slug || bookId}`}
                      className="shrink-0 relative w-20 sm:w-24 aspect-3/4 bg-[#f1f3f7] rounded-lg overflow-hidden border border-slate-100/80 shadow-xs"
                    >
                      <img
                        src={image}
                        alt={title}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/book-placeholder.svg';
                        }}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>

                    {/* RIGHT: Product Details & Controls */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
                      {/* Top Row: Title, Author, Remove Icon */}
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <Link href={`/books/${book.slug || bookId}`} className="block">
                            <h3 className="text-xs sm:text-base font-normal text-slate-900 group-hover:text-[#1E3A8A] transition-colors line-clamp-2 leading-snug">
                              {title}
                            </h3>
                          </Link>
                          {/* Remove Trash Button */}
                          <button
                            type="button"
                            onClick={() => removeFromCart(bookId)}
                            className="p-1 text-slate-400 hover:text-red-500 transition-colors shrink-0"
                            title="Remove from cart"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>

                        <p className="text-[11px] sm:text-xs font-light text-slate-400 truncate mt-0.5">
                          {author}
                        </p>
                      </div>

                      {/* Bottom Row: Price & Quantity Stepper */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2 border-t border-slate-50">
                        {/* Price Breakdown */}
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-sm sm:text-base font-medium text-slate-900 font-mono">
                            ₹{price * item.quantity}
                          </span>
                          {original > price && (
                            <span className="text-[11px] sm:text-xs font-light text-slate-400 line-through font-mono">
                              ₹{original * item.quantity}
                            </span>
                          )}
                          {item.quantity > 1 && (
                            <span className="text-[10px] text-slate-400 font-light font-mono ml-1 hidden sm:inline">
                              (₹{price}/each)
                            </span>
                          )}
                        </div>

                        {/* Quantity Stepper */}
                        <div className="flex items-center border border-slate-200 rounded-lg bg-[#FAFBFD] overflow-hidden shadow-xs">
                          <button
                            type="button"
                            onClick={() => updateQuantity(bookId, item.quantity - 1)}
                            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors text-xs sm:text-sm font-light"
                          >
                            −
                          </button>
                          <span className="w-7 sm:w-8 text-center text-xs font-medium text-slate-800 font-mono">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(bookId, item.quantity + 1)}
                            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors text-xs sm:text-sm font-light"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Coupons & Order Summary */}
            <div className="lg:col-span-4 space-y-4 sm:space-y-5">
              {/* Coupon Box */}
              <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-100 shadow-sm">
                <h3 className="text-[11px] font-medium text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-[#1E3A8A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span>Apply Coupon Code</span>
                </h3>

                {appliedCoupon ? (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono font-medium text-emerald-800 uppercase">
                        {appliedCoupon.code}
                      </span>
                      <p className="text-[10px] text-emerald-600 font-light">
                        {appliedCoupon.discountType === 'percentage'
                          ? `${appliedCoupon.discountValue}% discount applied`
                          : `₹${appliedCoupon.discountValue} flat discount`}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-[11px] text-red-500 hover:underline font-light"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="e.g. LOGOS10"
                      className="flex-1 px-3 py-2 bg-[#FAFBFD] border border-slate-200 rounded-lg text-xs font-mono uppercase text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] transition-all"
                    />
                    <button
                      type="submit"
                      disabled={applyingCoupon}
                      className="px-3.5 py-2 bg-[#1E3A8A] hover:bg-[#152e72] text-white text-xs font-medium rounded-lg transition-all shadow-xs disabled:opacity-50"
                    >
                      {applyingCoupon ? '...' : 'Apply'}
                    </button>
                  </form>
                )}

                {couponMsg && (
                  <p className={`text-[10px] mt-1.5 font-light ${couponMsg.success ? 'text-emerald-600' : 'text-red-500'}`}>
                    {couponMsg.message}
                  </p>
                )}

                {/* Available Coupons Suggestions */}
                {!appliedCoupon && eligibleCoupons.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Available Offers
                    </p>
                    <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                      {eligibleCoupons.map((coupon) => {
                        const minVal = Number(coupon.minOrderValue ?? coupon.minOrderAmount ?? 0);
                        return (
                          <div
                            key={coupon._id || coupon.code}
                            className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-blue-50/50 border border-slate-200/80 transition-all text-left"
                          >
                            <div className="min-w-0 pr-2">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-xs font-semibold text-[#1E3A8A] uppercase">
                                  {coupon.code}
                                </span>
                                <span className="text-[9px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-md font-medium">
                                  {coupon.discountType === 'percentage'
                                    ? `${coupon.discountValue}% OFF`
                                    : `₹${coupon.discountValue} OFF`}
                                </span>
                              </div>
                              {minVal > 0 && (
                                <p className="text-[9px] text-slate-400">
                                  Min order: ₹{minVal}
                                </p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleApplyCoupon(null, coupon.code)}
                              className="px-2.5 py-1 bg-white hover:bg-[#1E3A8A] hover:text-white border border-slate-200 hover:border-[#1E3A8A] text-[#1E3A8A] text-[10px] font-medium rounded-md transition-all shadow-2xs shrink-0"
                            >
                              Apply
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Order Summary Card */}
              <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-100 shadow-md shadow-slate-200/40">
                <h2 className="text-sm sm:text-base font-normal text-slate-900 mb-3 pb-2.5 border-b border-slate-100">
                  Order Summary
                </h2>

                <div className="space-y-2.5 text-xs font-light text-slate-600">
                  <div className="flex justify-between">
                    <span>Subtotal ({itemCount} items)</span>
                    <span className="font-mono text-slate-900 font-normal">₹{subtotal}</span>
                  </div>

                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Coupon Discount</span>
                      <span className="font-mono font-normal">−₹{couponDiscount}</span>
                    </div>
                  )}

                  {referralDiscount > 0 && (
                    <div className="flex justify-between text-blue-600">
                      <span>Referral Discount (15%)</span>
                      <span className="font-mono font-normal">−₹{referralDiscount}</span>
                    </div>
                  )}

                  {walletDiscount > 0 && (
                    <div className="flex justify-between text-indigo-600">
                      <span>Rewards Applied</span>
                      <span className="font-mono font-normal">−₹{walletDiscount}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Delivery Charge</span>
                    <span className="font-mono font-normal">
                      {shippingFee === 0 ? <span className="text-emerald-600">FREE</span> : `₹${shippingFee}`}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
                    <span className="text-xs sm:text-sm font-normal text-slate-900">Total Amount</span>
                    <div className="text-right">
                      <span className="text-lg sm:text-xl font-normal text-[#1E3A8A] font-mono">
                        ₹{grandTotal}
                      </span>
                    </div>
                  </div>
                </div>

                {totalSavings > 0 && (
                  <div className="mt-3 p-2 bg-emerald-50 rounded-lg text-center">
                    <span className="text-[11px] font-medium text-emerald-700">
                      ✨ You save ₹{totalSavings} on this order!
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (!user) {
                      router.push('/auth/login?redirect=/checkout');
                    } else {
                      router.push('/checkout');
                    }
                  }}
                  className="w-full mt-4 sm:mt-5 py-3.5 px-5 bg-[#1E3A8A] hover:bg-[#152e72] text-white rounded-lg text-xs sm:text-sm font-medium tracking-wide transition-all shadow-md shadow-blue-900/15 hover:shadow-lg flex items-center justify-center gap-2 active:scale-95"
                >
                  <span>{user ? 'Proceed to Checkout' : 'Login to Checkout'}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
