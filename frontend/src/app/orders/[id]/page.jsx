'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { apiGetOrderById, apiCancelOrder, apiRequestReturn } from '../../../lib/api';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';

export default function OrderTrackingPage({ params }) {
  const routeParams = useParams();
  const [resolvedOrderId, setResolvedOrderId] = useState(routeParams?.id || null);

  useEffect(() => {
    if (routeParams?.id) {
      setResolvedOrderId(routeParams.id);
    } else if (params) {
      Promise.resolve(params).then((p) => {
        if (p?.id) setResolvedOrderId(p.id);
      }).catch(() => {});
    }
  }, [routeParams?.id, params]);

  const orderId = resolvedOrderId || routeParams?.id;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cancellation State
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReasonType, setCancelReasonType] = useState('Ordered by mistake');
  const [cancelReasonNote, setCancelReasonNote] = useState('');
  const [cancelSubmitting, setCancelSubmitting] = useState(false);
  const [cancelMsg, setCancelMsg] = useState('');

  // Return State
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReasonType, setReturnReasonType] = useState('Book received in damaged condition');
  const [returnDescription, setReturnDescription] = useState('');
  const [returnSubmitting, setReturnSubmitting] = useState(false);
  const [returnMsg, setReturnMsg] = useState('');

  const loadOrder = async () => {
    try {
      const data = await apiGetOrderById(orderId);
      setOrder(data);
    } catch (err) {
      setError(err.message || 'Could not load order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    setCancelSubmitting(true);
    const finalReason = [cancelReasonType, cancelReasonNote.trim()].filter(Boolean).join(' - ');
    try {
      await apiCancelOrder(orderId, finalReason);
      setCancelMsg('Order cancelled successfully. Inventory restored.');
      setTimeout(() => {
        setShowCancelModal(false);
        setCancelMsg('');
        loadOrder();
      }, 1500);
    } catch (err) {
      alert(err.message || 'Failed to cancel order');
    } finally {
      setCancelSubmitting(false);
    }
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    if (!returnDescription.trim()) {
      alert('Please provide a detailed explanation for your return request.');
      return;
    }
    setReturnSubmitting(true);
    try {
      await apiRequestReturn(orderId, returnReasonType, returnDescription.trim());
      setReturnMsg('Return request submitted successfully! It is now under admin review.');
      setTimeout(() => {
        setShowReturnModal(false);
        setReturnMsg('');
        loadOrder();
      }, 1800);
    } catch (err) {
      alert(err.message || 'Failed to submit return request');
    } finally {
      setReturnSubmitting(false);
    }
  };

  const orderNum = order?.orderNumber || order?.orderId || (orderId ? (orderId.length > 12 ? `#LB${orderId.slice(-8).toUpperCase()}` : orderId) : '#LB202506281045');
  const items = order?.items || order?.orderItems || [];
  const status = (order?.orderStatus || 'Processing').toLowerCase();
  const rawReturnStatus = (order?.returnRequest?.status || '').toLowerCase();

  const isCOD = order?.paymentMethod === 'COD' || order?.paymentMethod === 'cod';
  const isReturnRequested = status === 'return requested' || status === 'requested' || rawReturnStatus === 'pending' || rawReturnStatus === 'requested';
  const isReturnUnderReview = status === 'under review' || status === 'return under review' || rawReturnStatus === 'under review';
  const isReturnApproved = ['return accepted', 'approved', 'return approved'].includes(status) || rawReturnStatus === 'approved';
  const isReturnScheduled = ['return scheduled', 'pickup scheduled'].includes(status) || ['return scheduled', 'pickup scheduled'].includes(rawReturnStatus) || Boolean(order?.returnRequest?.scheduledDate);
  const isReturned = ['returned', 'received', 'return received'].includes(status) || ['returned', 'received', 'return received'].includes(rawReturnStatus);
  const isRefundInitiated = status === 'refund initiated' || rawReturnStatus === 'refund initiated';
  const isRefunded = ['refunded'].includes(status) || ['refunded'].includes(rawReturnStatus);
  const isExchanged = ['exchanged', 'replacement dispatched'].includes(status) || ['exchanged', 'replacement dispatched'].includes(rawReturnStatus);
  const isReturnRejected = ['return rejected', 'rejected'].includes(status) || rawReturnStatus === 'rejected';

  const scheduledDateFormatted = order?.returnRequest?.scheduledDate
    ? new Date(order.returnRequest.scheduledDate).toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    : '';

  const hasReturn = Boolean(
    order?.returnRequest?.reason ||
    isReturnRequested ||
    isReturnUnderReview ||
    isReturnApproved ||
    isReturnScheduled ||
    isReturned ||
    isRefundInitiated ||
    isRefunded ||
    isExchanged ||
    isReturnRejected
  );

  // Timeline Step Calculations
  const isPlaced = true;
  const isPaymentConfirmed = order?.paymentStatus?.toLowerCase() === 'paid' || isCOD || true;
  const isProcessing = hasReturn || ['processing', 'shipped', 'out for delivery', 'delivered'].includes(status);
  const isShipped = hasReturn || ['shipped', 'out for delivery', 'delivered'].includes(status);
  const isOutForDelivery = hasReturn || ['out for delivery', 'delivered'].includes(status);
  const isDelivered = hasReturn || status === 'delivered';
  const isCancelled = status === 'cancelled';
  const cancelEntry = order?.statusHistory?.find((h) => (h.status || '').toLowerCase() === 'cancelled');
  const cancelledAtStr = (cancelEntry?.timestamp || order?.cancelledAt || order?.updatedAt)
    ? new Date(cancelEntry?.timestamp || order?.cancelledAt || order?.updatedAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : '';

  const orderDateStr = order?.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : '28 Jun 2025, 11:18 AM';

  const liveLocation = order?.currentLocation || order?.shippingLocation || '';

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 max-w-md sm:max-w-xl mx-auto w-full px-4 pt-24 sm:pt-28 pb-16">
        {loading ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
            <div className="w-8 h-8 border-3 border-[#1044A5]/30 border-t-[#1044A5] rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-400">Loading order tracking...</p>
          </div>
        ) : error || !order ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-sm">
            <p className="text-sm text-slate-600 mb-4">{error || 'Order not found'}</p>
            <Link href="/profile" className="px-6 py-2.5 bg-[#1044A5] text-white rounded-full text-xs font-medium">
              Back to Orders
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 1. Header Banner with Delivery Truck */}
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#EFF6FF] via-[#F5F9FF] to-[#EBF3FF] border border-blue-100/60 flex items-center gap-4">
              {/* Truck Illustration */}
              <div className="w-24 h-20 sm:w-28 sm:h-24 shrink-0 relative flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 140 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Floating Pin */}
                  <g transform="translate(60, 5)">
                    <path d="M12 0C5.37 0 0 5.37 0 12C0 21 12 30 12 30C12 30 24 21 24 12C24 5.37 18.63 0 12 0Z" fill="#2563EB"/>
                    <circle cx="12" cy="11" r="4.5" fill="white"/>
                  </g>
                  {/* Road */}
                  <path d="M5 85H135" stroke="#BFDBFE" strokeWidth="2" strokeDasharray="6 4"/>
                  {/* Truck Body */}
                  <rect x="25" y="42" width="62" height="38" rx="4" fill="#1D4ED8"/>
                  {/* Open Book Logo on Truck */}
                  <path d="M48 54C52 52 56 54 56 64C52 62 48 64 48 64V54Z" fill="white" opacity="0.95"/>
                  <path d="M64 54C60 52 56 54 56 64C60 62 64 64 64 64V54Z" fill="white" opacity="0.85"/>
                  {/* Truck Cabin */}
                  <path d="M87 52H105C108 52 112 56 114 60L119 70C120 72 120 74 120 76V80H87V52Z" fill="#2563EB"/>
                  {/* Window */}
                  <path d="M91 56H103L111 68H91V56Z" fill="#BFDBFE"/>
                  {/* Wheels */}
                  <circle cx="45" cy="80" r="9" fill="#1E293B"/>
                  <circle cx="45" cy="80" r="4" fill="#94A3B8"/>
                  <circle cx="102" cy="80" r="9" fill="#1E293B"/>
                  <circle cx="102" cy="80" r="4" fill="#94A3B8"/>
                  {/* Speed lines */}
                  <path d="M10 50H20" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M6 58H18" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M12 66H22" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>

              {/* Banner Text */}
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Track Your Order
                </h1>
                <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                  Stay updated on your book's journey to your doorstep.
                </p>
              </div>
            </div>

            {/* 2. Order Card with Status Pill */}
            <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 block font-normal">Order ID</span>
                  <span className="text-xs sm:text-sm font-mono font-bold text-slate-900">{orderNum}</span>
                </div>

                {isCancelled ? (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-600 border border-rose-200 rounded-md text-xs font-semibold">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Cancelled</span>
                  </div>
                ) : hasReturn ? (
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold border ${
                    isReturnRejected
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : isRefunded || isReturnApproved
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : isReturnScheduled || isReturned
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    <span className="w-2 h-2 rounded-full animate-pulse bg-current" />
                    <span>
                      {isReturnRejected
                        ? 'Return Declined'
                        : isRefunded
                        ? 'Refunded'
                        : isRefundInitiated
                        ? 'Refund Initiated'
                        : isReturned
                        ? 'Return Received'
                        : isReturnScheduled
                        ? 'Pickup Scheduled'
                        : isReturnApproved
                        ? 'Return Approved'
                        : 'Return Under Review'}
                    </span>
                  </div>
                ) : (
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium ${isDelivered ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-[#1044A5]'}`}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    <span className="capitalize">{order.orderStatus || 'Processing'}</span>
                  </div>
                )}
              </div>

              {/* Book Item Info */}
              {items.map((item, idx) => {
                const title = item.title || item.book?.titleMalayalam || item.book?.title || 'Book Title';
                const author = item.author || item.book?.author || 'LOGOS';
                const img = (Array.isArray(item.book?.images) && item.book.images[0]) ||
                  item.image ||
                  item.coverImage ||
                  item.book?.coverImage ||
                  item.book?.image ||
                  '/book-placeholder.svg';
                const price = item.price || 112;

                return (
                  <div key={idx} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
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
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">{title}</h4>
                        <p className="text-[11px] text-slate-400 font-light truncate mt-0.5">{author}</p>
                        <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Qty: {item.quantity || 1}</span>
                      </div>
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-slate-900 font-mono shrink-0">
                      ₹{price * (item.quantity || 1)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* 3. Vertical Tracking Timeline */}
            <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm space-y-6">
              {/* Step 1: Order Placed */}
              <div className="flex items-start gap-4 relative">
                {/* Connecting line */}
                <div className={`absolute left-3.5 top-7 bottom-0 w-[2px] ${isPaymentConfirmed ? 'bg-blue-600' : 'bg-slate-200'}`} style={{ height: 'calc(100% + 8px)' }} />

                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 z-10 shadow-xs">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-slate-900">Order Placed</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{orderDateStr}</p>
                </div>
              </div>

              {/* Step 2: Payment Confirmed */}
              <div className="flex items-start gap-4 relative">
                <div className={`absolute left-3.5 top-7 bottom-0 w-[2px] ${isCancelled ? 'bg-rose-300' : isProcessing ? 'bg-blue-600' : 'bg-slate-200'}`} style={{ height: 'calc(100% + 8px)' }} />

                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 shadow-xs ${isPaymentConfirmed ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-slate-900">Payment Confirmed</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {isCOD ? (isDelivered ? 'Cash Collected on Delivery' : 'Cash on Delivery (Pending)') : 'Verified via Online Gateway / UPI'}
                  </p>
                </div>
              </div>

              {isCancelled ? (
                /* Cancelled Step (replaces remaining steps) */
                <div className="flex items-start gap-4 relative">
                  <div className="w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0 z-10 shadow-xs">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-rose-600">Order Cancelled</h4>
                    {cancelledAtStr && <p className="text-[11px] text-slate-400 mt-0.5">{cancelledAtStr}</p>}
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {isCOD ? 'No payment was collected.' : 'Refund will be processed to your original payment method.'}
                    </p>
                  </div>
                </div>
              ) : (
              <>
              {/* Step 3: Processing */}
              <div className="flex items-start gap-4 relative">
                <div className={`absolute left-3.5 top-7 bottom-0 w-[2px] ${isShipped ? 'bg-blue-600' : 'bg-slate-200'}`} style={{ height: 'calc(100% + 8px)' }} />

                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 shadow-xs ${isProcessing ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-slate-900">Processing</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {isProcessing ? 'Quality inspected & packed at LOGOS Hub' : 'In fulfillment queue'}
                  </p>
                </div>
              </div>

              {/* Step 4: Shipped */}
              <div className="flex items-start gap-4 relative">
                <div className={`absolute left-3.5 top-7 bottom-0 w-[2px] ${isOutForDelivery ? 'bg-blue-600' : 'bg-slate-200'}`} style={{ height: 'calc(100% + 8px)' }} />

                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 shadow-xs ${isShipped ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1m-6 0a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-slate-900">Shipped</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {isShipped
                      ? liveLocation
                        ? `In transit - ${liveLocation}${order?.trackingNumber ? ` (ID: ${order.trackingNumber})` : ''}`
                        : order?.trackingNumber
                        ? `Handed to courier (ID: ${order.trackingNumber})`
                        : 'Dispatched with logistics partner'
                      : 'Awaiting courier handover'}
                  </p>
                </div>
              </div>

              {/* Step 5: Out for Delivery */}
              <div className="flex items-start gap-4 relative">
                <div className={`absolute left-3.5 top-7 bottom-0 w-[2px] ${isDelivered ? 'bg-blue-600' : 'bg-slate-200'}`} style={{ height: 'calc(100% + 8px)' }} />

                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 shadow-xs ${isOutForDelivery ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-slate-900">Out for Delivery</h4>
                  {isOutForDelivery ? (
                    <p className="text-[11px] text-blue-600 font-medium mt-0.5">
                      {liveLocation ? `Out for delivery from ${liveLocation}` : 'Courier is out for delivery today'}
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-400 mt-0.5">Pending arrival at local distribution facility</p>
                  )}
                </div>
              </div>

              {/* Step 6: Delivered */}
              <div className="flex items-start gap-4 relative">
                {hasReturn && (
                  <div
                    className={`absolute left-3.5 top-7 bottom-0 w-[2px] ${
                      isReturnRejected ? 'bg-rose-400' : isRefunded || isExchanged ? 'bg-emerald-500' : 'bg-amber-400'
                    }`}
                    style={{ height: 'calc(100% + 8px)' }}
                  />
                )}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 ${isDelivered ? 'bg-emerald-600 text-white' : 'bg-white border-2 border-slate-300 text-slate-400'}`}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-slate-900">Delivered</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {isDelivered ? 'Delivered safely to recipient' : 'Expected within 3-5 business days'}
                  </p>
                </div>
              </div>

              {/* Step 7: Return & Resolution Lifecycle */}
              {hasReturn && (
                <div className="flex items-start gap-4 relative">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 shadow-xs ${
                    isReturnRejected
                      ? 'bg-rose-600 text-white'
                      : isRefunded || isExchanged
                      ? 'bg-emerald-600 text-white'
                      : isReturnApproved || isReturnScheduled || isReturned
                      ? 'bg-blue-600 text-white'
                      : 'bg-amber-500 text-white'
                  }`}>
                    {isReturnRejected ? (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : isRefunded || isExchanged || isReturnApproved || isReturnScheduled ? (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className={`text-xs font-semibold ${
                      isReturnRejected ? 'text-rose-600' : isRefunded || isExchanged || isReturnApproved || isReturnScheduled ? 'text-emerald-700' : 'text-amber-700'
                    }`}>
                      {isReturnRejected
                        ? 'Return Request Declined'
                        : isRefunded
                        ? 'Return Completed & Refunded'
                        : isExchanged
                        ? 'Replacement Book Dispatched'
                        : isReturned
                        ? 'Book Received & Inspected'
                        : isReturnScheduled
                        ? 'Return Pickup Scheduled'
                        : isReturnApproved
                        ? 'Return Request Accepted'
                        : 'Return Request Under Review'}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {isReturnRejected
                        ? (order.returnRequest?.note || order.returnRequest?.adminNote ? `Note: ${order.returnRequest?.note || order.returnRequest?.adminNote}` : 'Does not meet return policy criteria.')
                        : isRefunded
                        ? `Refund of ₹${order.returnRequest?.refundAmount || order.finalTotal || order.totalAmount} credited to original payment account.`
                        : isExchanged
                        ? 'Replacement copy has been prepared & dispatched for COD order.'
                        : isReturned
                        ? 'Item verified at logistics hub. Processing resolution.'
                        : isReturnScheduled && scheduledDateFormatted
                        ? `Pickup scheduled for ${scheduledDateFormatted}. Courier will arrive at your address.`
                        : isReturnApproved
                        ? 'Return accepted. Logistics partner is scheduling pickup.'
                        : 'Submitted and under verification.'}
                    </p>
                    {order.returnRequest?.requestedAt && (
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Requested on {new Date(order.returnRequest.requestedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                </div>
              )}
              </>
              )}
            </div>

            {/* 4. Delivery Address Card */}
            {order.shippingAddress && (
              <div className="p-4 sm:p-5 rounded-xl bg-[#F0F5FF] flex items-start justify-between gap-3 text-left">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#1044A5] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-slate-800">Delivery Address</h4>
                    <p className="text-xs font-normal text-slate-700 mt-1">{order.shippingAddress.fullName}</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                      {order.shippingAddress.streetAddress}, {order.shippingAddress.postOffice ? `${order.shippingAddress.postOffice} P.O., ` : ''}{order.shippingAddress.city}, {order.shippingAddress.state || 'Kerala'} - <span className="font-mono font-bold text-slate-800">{order.shippingAddress.postalCode}</span>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 font-mono">Phone: {order.shippingAddress.phone}</p>
                  </div>
                </div>

                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(`${order.shippingAddress.streetAddress}, ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 text-[#1044A5] border border-[#1044A5]/30 rounded-xl text-[11px] font-medium transition-all shadow-2xs flex items-center gap-1 shrink-0"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <span>View on Map</span>
                </a>
              </div>
            )}

            {/* 5. Status Feedback & Action Banners */}
            {/* Case A: Return Requested / Under Review */}
            {(isReturnRequested || isReturnUnderReview) && !isReturnApproved && !isReturnScheduled && !isReturnRejected && !isRefunded && !isExchanged && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1.5">
                <div className="flex items-center gap-2 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span>Return Request Under Review</span>
                </div>
                <p className="text-[11px] text-amber-800/90 leading-relaxed">
                  Your return request has been submitted.
                  {order.returnRequest?.reason && (
                    <span className="block mt-1 font-medium italic">Reason: &ldquo;{order.returnRequest.reason}&rdquo;</span>
                  )}
                  You will be notified once reviewed.
                </p>
              </div>
            )}

            {/* Case B: Return Approved / Scheduled / Returned / Refunded / Exchanged */}
            {(isReturnApproved || isReturnScheduled || isReturned || isRefunded || isExchanged) && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-2">
                <div className="flex items-center gap-2 font-semibold text-emerald-800 text-xs sm:text-sm">
                  <span>✓</span>
                  <span>
                    {isRefunded
                      ? 'Return Completed & Refund Processed'
                      : isExchanged
                      ? 'Return Completed & Replacement Dispatched'
                      : isReturned
                      ? 'Package Received at Facility'
                      : isReturnScheduled && scheduledDateFormatted
                      ? `Return Pickup Scheduled: ${scheduledDateFormatted}`
                      : 'Return Request Accepted'}
                  </span>
                </div>

                {/* Return Scheduled Date Box */}
                {scheduledDateFormatted && !isRefunded && !isExchanged && (
                  <div className="p-2.5 bg-white/90 rounded-xl border border-emerald-200 text-emerald-900 flex items-center gap-2">
                    <span className="text-base">📅</span>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">Scheduled Pickup Date</p>
                      <p className="text-xs font-bold text-slate-800">{scheduledDateFormatted}</p>
                    </div>
                  </div>
                )}

                <p className="text-[11px] text-emerald-700/90 leading-relaxed">
                  {isRefunded
                    ? `The return is complete. Refund of ₹${order.returnRequest?.refundAmount || order.finalTotal || order.totalAmount} has been credited to your original payment account.`
                    : isExchanged
                    ? 'The return is complete. A replacement copy has been dispatched to your delivery address.'
                    : isReturnScheduled
                    ? 'Our courier partner will visit your shipping address on the scheduled date to collect the book.'
                    : isCOD
                    ? 'Your return has been approved. A replacement book exchange will be arranged upon courier pickup.'
                    : 'Your return has been approved. Our courier partner will collect the item and refund will be processed.'}
                </p>

                {(order.returnRequest?.note || order.returnRequest?.adminNote) && (
                  <div className="pt-1 text-[11px] text-slate-600 border-t border-emerald-200/60 font-medium">
                    <span>Note: {order.returnRequest?.note || order.returnRequest?.adminNote}</span>
                  </div>
                )}
              </div>
            )}

            {/* Case C: Return Rejected */}
            {isReturnRejected && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-1.5">
                <div className="flex items-center gap-2 font-semibold text-rose-800">
                  <span>✕</span>
                  <span>Return Request Declined</span>
                </div>
                <p className="text-[11px] text-rose-700/90 leading-relaxed">
                  Your return request could not be accepted.
                  <span className="block mt-1 font-medium">
                    Reason: {order.returnRequest?.adminNote || 'Does not meet return & replacement policy criteria.'}
                  </span>
                </p>
              </div>
            )}

            {/* Case D: Cancelled Order */}
            {status === 'cancelled' && (
              <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 text-xs space-y-1">
                <p className="font-semibold text-rose-600 flex items-center gap-1.5">
                  <span>✕</span> Order Cancelled
                </p>
                <p className="text-[11px] text-slate-500">
                  {order.cancellationReason || order.statusHistory?.find(h => h.status === 'Cancelled')?.note || 'This order was cancelled. Inventory was restored.'}
                </p>
              </div>
            )}

            {/* Case E: Shipped / Out for Delivery (No Cancellation Allowed Banner) */}
            {['shipped', 'out for delivery'].includes(status) && (
              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 text-blue-900 text-xs flex items-center gap-2.5">
                <span className="text-base">📦</span>
                <p className="text-[11px] text-blue-800 leading-snug">
                  <strong className="font-semibold">Dispatched:</strong> Cancellation is no longer available as your parcel has been handed over to courier.
                </p>
              </div>
            )}

            {/* Action Buttons: Cancel (when placed/pending/confirmed/processing) OR Return (when delivered) */}
            <div className="pt-2 flex flex-col gap-2.5">
              {/* Cancellation Button (Before Dispatch) */}
              {['pending', 'confirmed', 'processing'].includes(status) && (
                <button
                  type="button"
                  onClick={() => setShowCancelModal(true)}
                  className="w-full py-3 px-4 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 hover:border-rose-300 rounded-lg text-xs font-semibold tracking-wide transition-all shadow-2xs flex items-center justify-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Cancel Order</span>
                </button>
              )}

              {/* Return Button (Only when Delivered) */}
              {status === 'delivered' && (
                <button
                  type="button"
                  onClick={() => setShowReturnModal(true)}
                  className="w-full py-3 px-4 bg-white hover:bg-amber-50 text-amber-800 border border-amber-300 hover:border-amber-400 rounded-lg text-xs font-semibold tracking-wide transition-all shadow-2xs flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Request Return / Replacement</span>
                </button>
              )}

              {/* Need Help Button */}
              <a
                href="https://wa.me/919876543210?text=Hi%20LOGOS%20Support,%20I%20need%20help%20with%20my%20order"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-6 bg-[#1044A5] hover:bg-[#0c3986] text-white rounded-lg text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-md shadow-blue-900/15 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>Need Help with Order?</span>
              </a>
            </div>
          </div>
        )}

        {/* 6. Cancel Order Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-sm">
                    ✕
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Cancel Order</h3>
                    <p className="text-[11px] text-slate-400">Order #{orderNum}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              {cancelMsg ? (
                <div className="p-4 bg-emerald-50 rounded-2xl text-xs text-emerald-700 font-medium text-center">
                  ✓ {cancelMsg}
                </div>
              ) : (
                <form onSubmit={handleCancelSubmit} className="space-y-4 text-xs">
                  <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-100 text-rose-800 text-[11px] leading-relaxed">
                    ⚠️ Are you sure you want to cancel? If paid online, your refund will be returned to your original payment method.
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Reason for Cancellation <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={cancelReasonType}
                      onChange={(e) => setCancelReasonType(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#FAFBFD] border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                    >
                      <option value="Ordered by mistake">Ordered by mistake</option>
                      <option value="Need to change delivery address or phone">Need to change delivery address or phone</option>
                      <option value="Expected delivery time is too late">Expected delivery time is too late</option>
                      <option value="Found a better price elsewhere">Found a better price elsewhere</option>
                      <option value="Changed mind / book no longer needed">Changed mind / book no longer needed</option>
                      <option value="Other reason">Other reason</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={cancelReasonNote}
                      onChange={(e) => setCancelReasonNote(e.target.value)}
                      placeholder="Add details for the admin team..."
                      className="w-full px-3 py-2 bg-[#FAFBFD] border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCancelModal(false)}
                      className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-colors"
                    >
                      Keep Order
                    </button>
                    <button
                      type="submit"
                      disabled={cancelSubmitting}
                      className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 shadow-xs"
                    >
                      {cancelSubmitting ? 'Cancelling...' : 'Confirm Cancellation'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* 7. Return & Replacement Request Modal */}
        {showReturnModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-sm">
                    🔄
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Return &amp; Replacement</h3>
                    <p className="text-[11px] text-slate-400">Requires admin review and approval</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowReturnModal(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center text-xs"
                >
                  ✕
                </button>
              </div>

              {returnMsg ? (
                <div className="p-4 bg-emerald-50 rounded-2xl text-xs text-emerald-800 font-medium text-center space-y-1">
                  <p className="font-bold text-emerald-900">✓ Return Request Submitted</p>
                  <p className="text-[11px] text-emerald-700">{returnMsg}</p>
                </div>
              ) : (
                <form onSubmit={handleReturnSubmit} className="space-y-4 text-xs">
                  <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-amber-900 text-[11px] leading-relaxed">
                    ℹ️ Return requests are reviewed by LOGOS admin. Once accepted and reviewed, our courier will collect the package.
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Reason for Return <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={returnReasonType}
                      onChange={(e) => setReturnReasonType(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#FAFBFD] border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1044A5]/20 cursor-pointer"
                    >
                      <option value="Book received in damaged condition / torn pages">Book received in damaged condition / torn pages</option>
                      <option value="Binding defect or missing pages">Binding defect or missing pages</option>
                      <option value="Received wrong book / incorrect edition">Received wrong book / incorrect edition</option>
                      <option value="Poor print quality / illegible text">Poor print quality / illegible text</option>
                      <option value="Quality defect / other issue">Quality defect / other issue</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Detailed Reason / Description <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={returnDescription}
                      onChange={(e) => setReturnDescription(e.target.value)}
                      placeholder="Please explain the issue in detail so our admin team can verify and accept your return..."
                      className="w-full px-3 py-2 bg-[#FAFBFD] border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1044A5]/20 text-xs"
                    />
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowReturnModal(false)}
                      className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={returnSubmitting}
                      className="flex-1 py-2.5 bg-[#1044A5] hover:bg-[#0c3986] text-white rounded-lg font-semibold transition-colors disabled:opacity-50 shadow-xs"
                    >
                      {returnSubmitting ? 'Submitting...' : 'Submit Return Request'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
