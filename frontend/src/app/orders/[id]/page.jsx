'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { apiGetOrderById, apiCancelOrder } from '../../../lib/api';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';

export default function OrderDetailPage({ params }) {
  const unwrappedParams = use(params);
  const orderId = unwrappedParams.id;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const data = await apiGetOrderById(orderId);
        setOrder(data);
      } catch (err) {
        setError(err.message || 'Could not load order details');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [orderId]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 pt-28 pb-16">
        <Link
          href="/profile"
          className="text-xs font-light text-[#1E3A8A] hover:underline flex items-center gap-1.5 mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to My Orders</span>
        </Link>

        {loading ? (
          <div className="p-12 text-center text-xs font-light text-slate-400">Loading order...</div>
        ) : error || !order ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-100">
            <p className="text-sm font-light text-slate-500 mb-4">{error || 'Order not found'}</p>
            <Link href="/profile" className="px-5 py-2.5 bg-[#1E3A8A] text-white rounded-xl text-xs font-medium">
              Go to Profile
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-sm space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
              <div>
                <span className="text-xs uppercase tracking-widest font-medium text-slate-400">ORDER DETAILS</span>
                <h1 className="text-xl sm:text-2xl font-normal text-slate-900 mt-1 font-mono">
                  #{order.orderId || order._id}
                </h1>
                <p className="text-xs font-light text-slate-500 mt-1">
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>

              <span
                className={`self-start sm:self-auto text-xs font-medium px-4 py-1.5 rounded-full capitalize ${
                  order.orderStatus === 'delivered'
                    ? 'bg-emerald-50 text-emerald-700'
                    : order.orderStatus === 'cancelled'
                    ? 'bg-rose-50 text-rose-700'
                    : order.orderStatus === 'shipped'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                Status: {order.orderStatus || 'Processing'}
              </span>
            </div>

            {/* Items List */}
            <div>
              <h2 className="text-sm font-medium text-slate-900 mb-4">Books in this Order</h2>
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                {order.orderItems?.map((item, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 bg-slate-100 text-slate-700 text-xs font-mono rounded-lg flex items-center justify-center">
                        {item.quantity}x
                      </span>
                      <div>
                        <h3 className="text-xs sm:text-sm font-normal text-slate-900">{item.title}</h3>
                        <p className="text-[11px] font-light text-slate-400">Author: {item.author}</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-medium text-slate-900">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping & Payment Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              <div className="p-4 bg-[#FAFBFD] rounded-2xl border border-slate-100">
                <h3 className="text-xs font-medium text-slate-800 uppercase tracking-wider mb-2">
                  Delivery Address
                </h3>
                <p className="text-xs font-normal text-slate-900">{order.shippingAddress?.fullName}</p>
                <p className="text-xs font-light text-slate-600 mt-1 leading-relaxed">
                  {order.shippingAddress?.streetAddress}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}
                </p>
                <p className="text-xs font-light text-slate-500 mt-1">Phone: {order.shippingAddress?.phone}</p>
              </div>

              <div className="p-4 bg-[#FAFBFD] rounded-2xl border border-slate-100 space-y-2">
                <h3 className="text-xs font-medium text-slate-800 uppercase tracking-wider mb-2">
                  Payment Breakdown
                </h3>
                <div className="flex justify-between text-xs font-light text-slate-600">
                  <span>Method:</span>
                  <span className="uppercase font-medium text-slate-800">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-xs font-light text-slate-600">
                  <span>Status:</span>
                  <span className="capitalize font-medium text-emerald-600">{order.paymentStatus || 'Completed'}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-xs font-light text-emerald-600">
                    <span>Discount:</span>
                    <span>−₹{order.discountAmount}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 flex justify-between text-xs font-medium text-slate-900">
                  <span>Grand Total:</span>
                  <span className="font-mono text-[#1E3A8A] text-sm">₹{order.totalPrice}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
