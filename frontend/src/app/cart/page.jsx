'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
    originalTotal,
    productSavings,
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

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-normal text-slate-900 tracking-tight flex items-center gap-3">
              <span>Shopping Cart</span>
              <span className="text-xs font-light px-3 py-1 bg-blue-50 text-[#1E3A8A] rounded-full">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </span>
            </h1>
            <p className="text-xs sm:text-sm font-light text-slate-500 mt-1">
              Review your selected Malayalam and English books before checkout
            </p>
          </div>

          <Link
            href="/"
            className="text-xs sm:text-sm font-light text-[#1E3A8A] hover:underline flex items-center gap-1.5 self-start sm:self-auto"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Continue Shopping</span>
          </Link>
        </div>

        {items.length === 0 ? (
          /* Empty Cart State */
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm max-w-xl mx-auto my-12">
            <div className="w-20 h-20 bg-blue-50 text-[#1E3A8A] rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-xl font-normal text-slate-800 mb-2">Your Cart is Empty</h2>
            <p className="text-sm font-light text-slate-500 mb-8 max-w-md mx-auto">
              Explore our wide collection of bestsellers, classics, and newly published books.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-8 py-3.5 bg-[#1E3A8A] hover:bg-[#152e72] text-white rounded-full text-sm font-medium tracking-wide transition-all shadow-md shadow-blue-900/10"
            >
              Discover Books
            </Link>
          </div>
        ) : (
          /* Cart Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Items List */}
            <div className="lg:col-span-8 space-y-4">
              {/* Free Delivery Banner */}
              <div className="bg-white rounded-2xl p-4 border border-blue-100 shadow-sm">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-medium text-slate-700">
                    {remainingForFreeShipping === 0 ? (
                      <span className="text-emerald-600 flex items-center gap-1">
                        🎉 <strong>Congratulations!</strong> You qualify for FREE Delivery!
                      </span>
                    ) : (
                      <span>
                        Add books worth <strong className="text-[#1E3A8A]">₹{remainingForFreeShipping}</strong> more for <strong>FREE Delivery</strong>
                      </span>
                    )}
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">{freeShippingPercent}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-[#1E3A8A] h-full rounded-full transition-all duration-500"
                    style={{ width: `${freeShippingPercent}%` }}
                  />
                </div>
              </div>

              {/* Items Table / Cards */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm divide-y divide-slate-100 overflow-hidden">
                {items.map((item) => {
                  const book = item.book || {};
                  const bookId = book._id || book.id || item.book;
                  const price = item.price || book.salePrice || book.price || 299;
                  const original = book.originalPrice || price + 60;
                  const image = book.coverImage || book.image || '/images/bestsellers/book1.png';
                  const title = book.titleMalayalam || book.title || 'LOGOS Book';
                  const author = book.author || 'LOGOS Publications';

                  return (
                    <div key={bookId} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      {/* Image & Title */}
                      <div className="flex items-center gap-4 flex-1">
                        <Link href={`/books/${book.slug || bookId}`} className="shrink-0 relative w-16 h-24 bg-slate-50 rounded-xl overflow-hidden shadow-sm border border-slate-100">
                          <Image
                            src={image}
                            alt={title}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </Link>
                        <div className="min-w-0 flex-1">
                          <Link href={`/books/${book.slug || bookId}`}>
                            <h3 className="text-sm sm:text-base font-normal text-slate-900 hover:text-[#1E3A8A] transition-colors line-clamp-1">
                              {title}
                            </h3>
                          </Link>
                          <p className="text-xs font-light text-slate-500 mt-0.5">{author}</p>
                          {book.language && (
                            <span className="inline-block text-[10px] font-light text-[#1E3A8A] bg-blue-50 px-2 py-0.5 rounded mt-1.5">
                              {book.language}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Pricing & Quantity Controls */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-50">
                        {/* Stepper */}
                        <div className="flex items-center border border-slate-200 rounded-xl bg-[#FAFBFD] overflow-hidden">
                          <button
                            type="button"
                            onClick={() => updateQuantity(bookId, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors text-sm font-light"
                          >
                            −
                          </button>
                          <span className="w-8 text-center text-xs font-medium text-slate-800 font-mono">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(bookId, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors text-sm font-light"
                          >
                            +
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right min-w-[80px]">
                          <div className="text-sm sm:text-base font-medium text-slate-900 font-mono">
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

            {/* Right Column: Coupons, Referrals & Order Summary */}
            <div className="lg:col-span-4 space-y-6">
              {/* Coupon Form */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                <h3 className="text-xs font-normal text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#1E3A8A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span>Apply Coupon Code</span>
                </h3>

                {appliedCoupon ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono font-medium text-emerald-800 uppercase">
                        {appliedCoupon.code}
                      </span>
                      <p className="text-[11px] text-emerald-600 font-light">
                        {appliedCoupon.discountType === 'percentage'
                          ? `${appliedCoupon.discountValue}% discount applied`
                          : `₹${appliedCoupon.discountValue} flat discount`}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-xs text-red-500 hover:underline font-light"
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
                      className="flex-1 px-3.5 py-2.5 bg-[#FAFBFD] border border-slate-200 rounded-xl text-xs font-mono uppercase text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] transition-all"
                    />
                    <button
                      type="submit"
                      disabled={applyingCoupon}
                      className="px-4 py-2.5 bg-[#1E3A8A] hover:bg-[#152e72] text-white text-xs font-medium rounded-xl transition-all shadow-sm disabled:opacity-50"
                    >
                      {applyingCoupon ? '...' : 'Apply'}
                    </button>
                  </form>
                )}

                {couponMsg && (
                  <p className={`text-[11px] mt-2 font-light ${couponMsg.success ? 'text-emerald-600' : 'text-red-500'}`}>
                    {couponMsg.message}
                  </p>
                )}
              </div>

              {/* Referral Code (First Order 15% OFF) */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-normal text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <span>Friend&apos;s Referral</span>
                  </h3>
                  <span className="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full font-medium">
                    15% OFF
                  </span>
                </div>

                {appliedReferral ? (
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono font-medium text-[#1E3A8A] uppercase">
                        {appliedReferral.code}
                      </span>
                      <p className="text-[11px] text-blue-600 font-light">15% Referral discount applied</p>
                    </div>
                    <button
                      type="button"
                      onClick={removeReferral}
                      className="text-xs text-red-500 hover:underline font-light"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyReferral} className="flex gap-2">
                    <input
                      type="text"
                      value={referralInput}
                      onChange={(e) => setReferralInput(e.target.value)}
                      placeholder="e.g. LOGOS-XXXX"
                      className="flex-1 px-3.5 py-2.5 bg-[#FAFBFD] border border-slate-200 rounded-xl text-xs font-mono uppercase text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] transition-all"
                    />
                    <button
                      type="submit"
                      disabled={applyingReferral}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium rounded-xl transition-all shadow-sm disabled:opacity-50"
                    >
                      {applyingReferral ? '...' : 'Apply'}
                    </button>
                  </form>
                )}

                {referralMsg && (
                  <p className={`text-[11px] mt-2 font-light ${referralMsg.success ? 'text-emerald-600' : 'text-red-500'}`}>
                    {referralMsg.message}
                  </p>
                )}
              </div>

              {/* Referral Wallet Balance (if user logged in with rewards) */}
              {user && user.referralRewardBalance > 0 && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-3xl p-5 border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-medium text-[#1E3A8A] block">Logos Reward Balance</span>
                      <span className="text-lg font-mono font-medium text-slate-900">₹{user.referralRewardBalance}</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useWalletBalance}
                        onChange={(e) => setUseWalletBalance(e.target.value === 'true' || e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1E3A8A]"></div>
                    </label>
                  </div>
                </div>
              )}

              {/* Order Summary Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-lg shadow-slate-200/50">
                <h2 className="text-base font-normal text-slate-900 mb-4 pb-3 border-b border-slate-100">
                  Order Summary
                </h2>

                <div className="space-y-3 text-xs font-light text-slate-600">
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

                  <div className="pt-4 border-t border-slate-100 flex items-baseline justify-between">
                    <span className="text-sm font-normal text-slate-900">Total Amount</span>
                    <div className="text-right">
                      <span className="text-xl sm:text-2xl font-normal text-[#1E3A8A] font-mono">
                        ₹{grandTotal}
                      </span>
                      <p className="text-[10px] text-slate-400 font-light mt-0.5">Includes all taxes</p>
                    </div>
                  </div>
                </div>

                {totalSavings > 0 && (
                  <div className="mt-4 p-2.5 bg-emerald-50 rounded-xl text-center">
                    <span className="text-xs font-medium text-emerald-700">
                      ✨ You are saving ₹{totalSavings} on this order!
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => router.push('/checkout')}
                  className="w-full mt-6 py-4 px-6 bg-[#1E3A8A] hover:bg-[#152e72] text-white rounded-2xl text-sm font-medium tracking-wide transition-all shadow-md shadow-blue-900/15 hover:shadow-lg flex items-center justify-center gap-2"
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
