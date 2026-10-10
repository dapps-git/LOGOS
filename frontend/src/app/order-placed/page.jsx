'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { apiGetOrderById } from '../../lib/api';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

function OrderPlacedContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      if (orderId && orderId !== 'LOGOS-ORDER') {
        try {
          const data = await apiGetOrderById(orderId);
          setOrder(data);
        } catch (err) {
          console.warn('Could not fetch order details:', err.message);
        }
      }
      setLoading(false);
    }
    loadOrder();
  }, [orderId]);

  const orderNum = order?.orderNumber || order?.orderId || (orderId ? (orderId.length > 12 ? `#LB${orderId.slice(-8).toUpperCase()}` : orderId) : '#LB202506281045');
  const orderDate = order?.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

  const items = order?.items || order?.orderItems || [];
  const subtotal = order?.subtotal || order?.totalPrice || order?.totalAmount || 180;
  const shippingFee = order?.shippingFee !== undefined ? order.shippingFee : 0;
  const discount = order?.discount || order?.discountAmount || order?.couponDiscount || 0;
  const grandTotal = order?.finalTotal || order?.totalAmount || order?.totalPrice || subtotal;
  const shippingAddr = order?.shippingAddress;

  return (
    <div className="max-w-md sm:max-w-xl mx-auto w-full px-3 py-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100/90 text-center relative">
        {/* Top Book Stack + Checkmark Illustration */}
        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-[#EFF5FF] flex items-center justify-center mx-auto mb-5 relative">
          <svg className="w-20 h-20 sm:w-24 sm:h-24" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Sparkles */}
            <path d="M25 40L26.5 35L31.5 33.5L26.5 32L25 27L23.5 32L18.5 33.5L23.5 35L25 40Z" fill="#3B82F6" opacity="0.6"/>
            <path d="M95 35L96.5 30L101.5 28.5L96.5 27L95 22L93.5 27L88.5 28.5L93.5 30L95 35Z" fill="#60A5FA" opacity="0.8"/>
            {/* Decorative Leaves */}
            <path d="M88 60C96 52 104 60 104 72C96 72 88 66 88 60Z" fill="#93C5FD" opacity="0.7"/>
            <path d="M22 62C14 54 6 62 6 74C14 74 22 68 22 62Z" fill="#93C5FD" opacity="0.7"/>
            
            {/* Book 1 (Top) */}
            <rect x="40" y="48" width="40" height="9" rx="2" fill="#1D4ED8"/>
            <path d="M42 50H78V55H42z" fill="#3B82F6"/>
            <rect x="76" y="49" width="3" height="7" rx="1" fill="#FFFFFF"/>
            
            {/* Book 2 (Middle) */}
            <rect x="34" y="59" width="52" height="11" rx="2.5" fill="#1E40AF"/>
            <path d="M36 61H84V68H36z" fill="#2563EB"/>
            <rect x="82" y="61" width="3" height="7" rx="1" fill="#FFFFFF"/>
            
            {/* Book 3 (Bottom) */}
            <rect x="28" y="72" width="64" height="13" rx="3" fill="#1E3A8A"/>
            <path d="M30 74H90V83H30z" fill="#1D4ED8"/>
            <rect x="88" y="75" width="3" height="7" rx="1" fill="#FFFFFF"/>
            
            {/* Floating Top Checkmark Badge */}
            <circle cx="60" cy="30" r="14" fill="#2563EB"/>
            <path d="M54 30L58 34L66 26" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* Heading & Subtitle */}
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Order Placed Successfully!
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">
          Thank you for choosing LOGOS Books & Reading. Your order has been confirmed and is being processed.
        </p>

        {/* 2 Order Meta Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-5">
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#F0F5FF] text-left">
            <div className="w-8 h-8 rounded-lg bg-white text-[#1044A5] flex items-center justify-center shrink-0 shadow-2xs">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 block font-normal">Order ID</span>
              <span className="text-xs font-mono font-semibold text-slate-800 truncate block">
                {orderNum}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#F0F5FF] text-left">
            <div className="w-8 h-8 rounded-lg bg-white text-[#1044A5] flex items-center justify-center shrink-0 shadow-2xs">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 block font-normal">Order Date</span>
              <span className="text-xs font-semibold text-slate-800 truncate block">
                {orderDate}
              </span>
            </div>
          </div>
        </div>

        {/* Order Summary Card */}
        <div className="mt-5 p-4 sm:p-5 rounded-xl border border-slate-100 bg-white text-left shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs sm:text-sm font-semibold text-slate-900">Order Summary</h3>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-[#1044A5]">
              {items.length || 1} {items.length === 1 ? 'Item' : 'Items'}
            </span>
          </div>

          {/* Items */}
          <div className="py-3 divide-y divide-slate-50 space-y-3">
            {items.length > 0 ? (
              items.map((item, idx) => {
                const title = item.title || item.book?.titleMalayalam || item.book?.title || 'Book Item';
                const author = item.author || item.book?.author || 'LOGOS';
                const img = (Array.isArray(item.book?.images) && item.book.images[0]) ||
                  item.image ||
                  item.coverImage ||
                  item.book?.coverImage ||
                  item.book?.image ||
                  '/book-placeholder.svg';
                const price = item.price || 112;

                return (
                  <div key={idx} className="pt-2 flex items-center gap-3">
                    <div className="w-12 h-16 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                      <img
                        src={img}
                        alt={title}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/book-placeholder.svg';
                        }}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-slate-900 line-clamp-1">{title}</h4>
                      <p className="text-[11px] text-slate-400 font-light truncate">{author}</p>
                      <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                        Qty: {item.quantity || 1}
                      </span>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-xs font-bold text-slate-900 font-mono">₹{price}</span>
                        {item.originalPrice && item.originalPrice > price && (
                          <span className="text-[10px] line-through text-slate-400 font-mono">
                            ₹{item.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="pt-2 flex items-center gap-3">
                <div className="w-12 h-16 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                  <img src="/book1.jpg" alt="Book" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-slate-900 line-clamp-1">മലിമുള്ള എന്ന കുതിര</h4>
                  <p className="text-[11px] text-slate-400 font-light truncate">വിസ്വാർ അഹമ്മദ്</p>
                  <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Qty: 1</span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-xs font-bold text-slate-900 font-mono">₹112.00</span>
                    <span className="text-[10px] line-through text-slate-400 font-mono">₹180.00</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Price Breakdown */}
          <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span className="font-light">Subtotal</span>
              <span className="font-mono text-slate-900">₹{subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-light">Shipping Charges</span>
              <span className="font-mono text-slate-900">
                {shippingFee === 0 ? <span className="text-emerald-600">₹0.00</span> : `₹${shippingFee}`}
              </span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span className="font-light">Discount</span>
                <span className="font-mono">− ₹{discount}</span>
              </div>
            )}
            <div className="pt-2.5 border-t border-slate-100 flex items-baseline justify-between font-semibold text-slate-900 text-sm">
              <span>Total Amount</span>
              <span className="font-mono text-[#1044A5] text-base">₹{grandTotal}</span>
            </div>
          </div>
        </div>

        {/* Delivery Address Pill */}
        {shippingAddr && (
          <div className="mt-4 p-3 rounded-xl bg-[#F0F5FF] text-left flex items-start gap-2.5">
            <svg className="w-4 h-4 text-[#1044A5] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            <div className="text-xs text-slate-600 min-w-0">
              <span className="font-medium text-slate-800 block text-[11px]">Order will be delivered to</span>
              <p className="truncate text-[11px] text-slate-500 mt-0.5">
                {shippingAddr.fullName}, {shippingAddr.streetAddress}, {shippingAddr.postOffice ? `${shippingAddr.postOffice} P.O., ` : ''}{shippingAddr.city}, {shippingAddr.state || 'Kerala'} - {shippingAddr.postalCode}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 space-y-2.5">
          <Link
            href={order ? `/orders/${order._id || orderId}` : (orderId ? `/orders/${orderId}` : '/profile')}
            className="w-full py-3.5 px-6 bg-[#1044A5] hover:bg-[#0c3986] text-white rounded-lg text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-md shadow-blue-900/15 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Track &amp; Manage Order</span>
            <span>›</span>
          </Link>

          <Link
            href="/"
            className="w-full py-3 px-6 bg-white hover:bg-slate-50 text-[#1044A5] border border-[#1044A5]/30 hover:border-[#1044A5] rounded-lg text-xs sm:text-sm font-semibold tracking-wide transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Continue Shopping</span>
          </Link>
        </div>

        {/* Happy Reading Footer */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
          <span className="w-8 h-[1px] bg-slate-200" />
          <span className="flex items-center gap-1 font-serif italic text-slate-500">
            <span>♡</span> Happy Reading!
          </span>
          <span className="w-8 h-[1px] bg-slate-200" />
        </div>
      </div>
    </div>
  );
}

export default function OrderPlacedPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 pt-24 sm:pt-28 pb-16">
        <Suspense fallback={<div className="text-center py-10 text-xs text-slate-400">Loading order receipt...</div>}>
          <OrderPlacedContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
