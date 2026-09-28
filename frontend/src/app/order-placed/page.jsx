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

  return (
    <div className="max-w-2xl mx-auto w-full bg-white rounded-3xl p-8 sm:p-12 shadow-xl shadow-slate-200/60 border border-slate-100 text-center">
      {/* Success Badge */}
      <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-emerald-50/50">
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <span className="inline-block px-3 py-1 bg-blue-50 text-[#1E3A8A] text-xs font-medium rounded-full mb-3 tracking-wide">
        ORDER CONFIRMED
      </span>
      <h1 className="text-2xl sm:text-3xl font-normal text-slate-900 tracking-tight">
        Thank You For Your Order!
      </h1>
      <p className="text-sm font-light text-slate-500 mt-2 max-w-md mx-auto">
        Your book order has been received and is being carefully prepared for shipping.
      </p>

      {/* Order Info Card */}
      <div className="mt-8 p-6 bg-[#FAFBFD] rounded-2xl border border-slate-100 text-left space-y-3">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-400 font-light">Order Reference:</span>
          <span className="font-mono font-medium text-slate-800">{orderId || 'LOGOS-78291'}</span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-400 font-light">Estimated Delivery:</span>
          <span className="font-medium text-slate-800">Within 3 - 5 Business Days</span>
        </div>
        {order && (
          <>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-light">Payment Method:</span>
              <span className="uppercase font-medium text-slate-800">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-light">Total Paid:</span>
              <span className="font-mono font-medium text-[#1E3A8A] text-sm">₹{order.totalPrice}</span>
            </div>
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/profile"
          className="w-full sm:w-auto px-8 py-3.5 bg-[#1E3A8A] hover:bg-[#152e72] text-white rounded-full text-xs font-medium tracking-wide transition-all shadow-md shadow-blue-900/10"
        >
          View My Orders
        </Link>
        <Link
          href="/"
          className="w-full sm:w-auto px-8 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-medium tracking-wide transition-all"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default function OrderPlacedPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-28">
        <Suspense fallback={<div className="text-center py-10">Loading order receipt...</div>}>
          <OrderPlacedContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
