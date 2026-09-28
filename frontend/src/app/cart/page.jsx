'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
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
  const [referralInput, setReferralInput] = useState('');
  const [referralMsg, setReferralMsg] = useState(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [applyingReferral, setApplyingReferral] = useState(false);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setApplyingCoupon(true);
    setCouponMsg(null);
    const res = await applyCouponCode(couponInput.trim().toUpperCase());
    setCouponMsg(res);
    setApplyingCoupon(false);
  };

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
        {items.length === 0 ? (
          /* Empty Cart State */
          <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center border border-slate-100 shadow-sm max-w-md mx-auto my-8 sm:my-12">
            <div className="w-14 h-14 bg-blue-50 text-[#1E3A8A] rounded-full flex items-center justify-center mx-auto mb-3.5">
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
              className="inline-flex items-center justify-center px-6 py-2.5 bg-[#1E3A8A] hover:bg-[#152e72] text-white rounded-full text-xs font-medium tracking-wide transition-all shadow-sm"
            >
              Discover Books
            </Link>
          </div>
        ) : (
          /* Cart Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8">
            {/* Left Column: Items List */}
            <div className="lg:col-span-8 space-y-4">
              {/* Items Card */}
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm divide-y divide-slate-100 overflow-hidden">
                {items.map((item) => {
                  const book = item.book || {};
                  const bookId = book._id || book.id || item.book;
                  const price = item.price || book.salePrice || book.price || 299;
                  const original = book.originalPrice || price + 60;
                  const image = book.coverImage || book.image || (book.images && book.images[0]) || '/book1.jpg';
                  const title = book.titleMalayalam || book.title || 'LOGOS Book';
                  const author = book.author || 'LOGOS Publications';

                  return (
                    <div key={bookId} className="p-3.5 sm:p-5 flex items-start sm:items-center justify-between gap-3 sm:gap-4">
                      {/* Image & Title */}
                      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                        <Link
                          href={`/books/${book.slug || bookId}`}
                          className="shrink-0 relative w-14 sm:w-16 aspect-3/4 bg-[#f1f3f7] rounded-xl overflow-hidden shadow-xs border border-slate-100"
                        >
                          <img
                            src={image}
                            alt={title}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = '/book1.jpg';
                            }}
                            className="w-full h-full object-cover object-center"
                          />
                        </Link>

                        <div className="min-w-0 flex-1">
                          <Link href={`/books/${book.slug || bookId}`}>
                            <h3 className="text-xs sm:text-sm font-normal text-slate-900 hover:text-[#1E3A8A] transition-colors line-clamp-1">
                              {title}
                            </h3>
                          </Link>
                          <p className="text-[11px] font-light text-slate-400 truncate mt-0.5">{author}</p>
                          <div className="flex items-baseline gap-1.5 sm:hidden mt-1">
                            <span className="text-xs font-medium text-slate-900 font-mono">
                              ₹{price * item.quantity}
                            </span>
                            {original > price && (
                              <span className="text-[10px] font-light text-slate-400 line-through font-mono">
                                ₹{original * item.quantity}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Quantity Stepper & Price on Desktop/Mobile */}
                      <div className="flex items-center gap-3 sm:gap-6 shrink-0">
                        {/* Stepper */}
                        <div className="flex items-center border border-slate-200 rounded-xl bg-[#FAFBFD] overflow-hidden">
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

                        {/* Desktop Price */}
                        <div className="text-right hidden sm:block min-w-[70px]">
                          <div className="text-sm font-medium text-slate-900 font-mono">
                            ₹{price * item.quantity}
                          </div>
                          {original > price && (
                            <div className="text-[11px] font-light text-slate-400 line-through font-mono">
                              ₹{original * item.quantity}
                            </div>
                          )}
                        </div>

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() => removeFromCart(bookId)}
                          className="text-slate-400 hover:text-red-500 transition-colors p-1"
                          title="Remove item"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Coupons & Order Summary */}
            <div className="lg:col-span-4 space-y-4 sm:space-y-5">
              {/* Coupon Box */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm">
                <h3 className="text-[11px] font-medium text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-[#1E3A8A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span>Apply Coupon Code</span>
                </h3>

                {appliedCoupon ? (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-between">
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
                      className="flex-1 px-3 py-2 bg-[#FAFBFD] border border-slate-200 rounded-xl text-xs font-mono uppercase text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] transition-all"
                    />
                    <button
                      type="submit"
                      disabled={applyingCoupon}
                      className="px-3.5 py-2 bg-[#1E3A8A] hover:bg-[#152e72] text-white text-xs font-medium rounded-xl transition-all shadow-xs disabled:opacity-50"
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
              </div>

              {/* Order Summary Card */}
              <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-lg shadow-slate-200/50">
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
                  <div className="mt-3 p-2 bg-emerald-50 rounded-xl text-center">
                    <span className="text-[11px] font-medium text-emerald-700">
                      ✨ You save ₹{totalSavings} on this order!
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => router.push('/checkout')}
                  className="w-full mt-4 sm:mt-5 py-3.5 px-5 bg-[#1E3A8A] hover:bg-[#152e72] text-white rounded-xl text-xs sm:text-sm font-medium tracking-wide transition-all shadow-md shadow-blue-900/15 hover:shadow-lg flex items-center justify-center gap-2 active:scale-95"
                >
                  <span>Proceed to Checkout</span>
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
