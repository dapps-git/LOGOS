'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { StatCard } from '@/components/common/StatCard';
import { Badge } from '@/components/common/Badge';
import { InvoiceModal } from '@/components/InvoiceModal';
import { useStoreData } from '@/context/StoreDataContext';
import { useAuth } from '@/context/AuthContext';
import {
  Package,
  ShoppingBag,
  IndianRupee,
  RotateCcw,
  Calendar,
  ChevronRight,
  Plus,
  Image as ImageIcon,
  Boxes,
  FileText
} from 'lucide-react';

export default function Dashboard() {
  const { admin } = useAuth();
  const { books = [], orders = [], banners = [], returnsList = [] } = useStoreData();
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Dynamic calculations directly from live store state
  const totalProductsCount = mounted ? books.length : 0;
  const totalOrdersCount = mounted ? orders.length : 0;
  const totalRevenue = mounted ? orders.reduce((sum, o) => sum + (Number(o.finalTotal) || Number(o.totalAmount) || 0), 0) : 0;
  const pendingReturnsCount = mounted ? returnsList.filter(
    (r) => r.status?.toLowerCase() === 'pending review' || r.status?.toLowerCase() === 'pending'
  ).length : 0;

  // Top selling books (sorted by salesCount or reviewsCount)
  const topBooks = [...books]
    .sort((a, b) => (b.salesCount || b.reviewsCount || 0) - (a.salesCount || a.reviewsCount || 0))
    .slice(0, 5);

  const formattedDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Greeting Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Good Morning, {admin?.name || 'Admin'}!
            </h2>
            <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
              Here is an overview of your bookstore performance and management dashboard.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-semibold text-slate-700 shadow-2xs w-fit">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{formattedDate}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>

        {/* 4 Pastel Top Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <StatCard
            title="Total Products"
            value={totalProductsCount.toLocaleString('en-IN')}
            icon={Package}
            variant="green"
          />
          <StatCard
            title="Total Orders"
            value={totalOrdersCount.toLocaleString('en-IN')}
            icon={ShoppingBag}
            variant="blue"
          />
          <StatCard
            title="Total Revenue"
            value={`₹${totalRevenue.toLocaleString('en-IN')}`}
            icon={IndianRupee}
            variant="amber"
          />
          <StatCard
            title="Pending Returns"
            value={pendingReturnsCount}
            icon={RotateCcw}
            variant="pink"
          />
        </div>

        {/* Middle Row: Recent Orders, Top Selling Books, Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          {/* Recent Orders (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-slate-100">
                <h3 className="text-sm font-medium text-slate-900">Recent Orders</h3>
                <Link
                  href="/orders"
                  className="text-xs font-light text-[#1E3A8A] hover:underline"
                >
                  View All
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-100">
                      <th className="pb-2 font-normal">Order ID</th>
                      <th className="pb-2 font-normal">Customer</th>
                      <th className="pb-2 font-normal text-right">Amount</th>
                      <th className="pb-2 font-normal text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-400 font-light">
                          No orders placed yet.
                        </td>
                      </tr>
                    ) : (
                      orders.slice(0, 5).map((order) => (
                        <tr
                          key={order._id}
                          onClick={() => setSelectedInvoiceOrder(order)}
                          className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                        >
                          <td className="py-2.5 font-mono text-[11px] font-medium text-slate-800">
                            {order.orderNumber || order._id}
                          </td>
                          <td className="py-2.5 font-light text-slate-600 truncate max-w-[120px]">
                            {order.customer?.name || order.shippingAddress?.fullName || 'Customer'}
                          </td>
                          <td className="py-2.5 text-right font-mono font-medium text-slate-800">
                            ₹{order.finalTotal || order.totalAmount || 0}
                          </td>
                          <td className="py-2.5 text-right">
                            <Badge variant={order.orderStatus} size="sm">
                              {order.orderStatus || 'Pending'}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Top Selling Books (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-slate-100">
                <h3 className="text-sm font-medium text-slate-900">Top Selling Books</h3>
                <Link
                  href="/products"
                  className="text-xs font-light text-[#1E3A8A] hover:underline"
                >
                  View All
                </Link>
              </div>

              {topBooks.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs font-light">
                  No books in catalog yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {topBooks.map((book) => {
                    const cover = book.coverImage || book.image || (book.images && book.images[0]) || '/book-placeholder.svg';
                    return (
                      <div key={book._id} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={cover}
                            alt={book.title || book.name}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = '/book-placeholder.svg';
                            }}
                            className="w-9 h-12 object-cover rounded-lg border border-slate-100 shrink-0 shadow-2xs bg-slate-50"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-normal text-slate-900 truncate">{book.title || book.name}</p>
                            <p className="text-[10px] text-slate-400 font-light truncate">{book.author || 'Author'}</p>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-light text-slate-500 whitespace-nowrap">
                          {book.salesCount || 0} sold
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions (3 cols) */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-medium text-slate-900 mb-3.5 pb-2 border-b border-slate-100">
                Quick Actions
              </h3>

              <div className="space-y-2">
                <Link
                  href="/products/add"
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-blue-50/70 hover:bg-blue-100/70 text-[#1E3A8A] font-medium text-xs transition-colors border border-blue-100/60"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Book</span>
                </Link>

                <Link
                  href="/banners"
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-medium text-xs transition-colors border border-slate-200/80"
                >
                  <ImageIcon className="w-4 h-4 text-[#1E3A8A]" />
                  <span>Manage Banners</span>
                </Link>

                <Link
                  href="/inventory"
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-medium text-xs transition-colors border border-slate-200/80"
                >
                  <Boxes className="w-4 h-4 text-[#1E3A8A]" />
                  <span>Inventory Control</span>
                </Link>

                <Link
                  href="/invoices"
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-medium text-xs transition-colors border border-slate-200/80"
                >
                  <FileText className="w-4 h-4 text-[#1E3A8A]" />
                  <span>Generate Invoices</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row: Active Banners Preview */}
        <div className="bg-white rounded-md border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Active Promotional Banners</h3>
              <p className="text-[11px] text-slate-400">Homepage storefront carousel and hero displays</p>
            </div>
            <Link
              href="/banners"
              className="text-xs font-bold text-emerald-800 hover:text-emerald-900 hover:underline"
            >
              Manage Banners
            </Link>
          </div>

          {banners.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No promotional banners created yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {banners.slice(0, 3).map((b) => (
                <div
                  key={b._id}
                  className="group relative rounded-md overflow-hidden border border-slate-200 aspect-16/10 shadow-2xs hover:shadow-md transition-all"
                >
                  <img src={b.image} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-2.5 flex flex-col justify-end text-white">
                    <p className="text-[11px] font-bold leading-tight line-clamp-2">{b.title}</p>
                    {b.badge && <span className="text-[9px] text-amber-300 font-semibold">{b.badge}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Printable Invoice Modal */}
      {selectedInvoiceOrder && (
        <InvoiceModal
          isOpen={Boolean(selectedInvoiceOrder)}
          onClose={() => setSelectedInvoiceOrder(null)}
          order={selectedInvoiceOrder}
        />
      )}
    </AdminLayout>
  );
}
