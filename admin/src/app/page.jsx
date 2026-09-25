'use client';

import React, { useState } from 'react';
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

  // Dynamic calculations directly from live store state
  const totalProductsCount = books.length;
  const totalOrdersCount = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.finalTotal) || Number(o.totalAmount) || 0), 0);
  const pendingReturnsCount = returnsList.filter(
    (r) => r.status?.toLowerCase() === 'pending review' || r.status?.toLowerCase() === 'pending'
  ).length;

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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Recent Orders (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-md border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Recent Orders</h3>
                <Link
                  href="/orders"
                  className="text-xs font-bold text-emerald-800 hover:text-emerald-900 hover:underline"
                >
                  View All
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-100">
                      <th className="pb-2 font-bold">Order ID</th>
                      <th className="pb-2 font-bold">Customer</th>
                      <th className="pb-2 font-bold text-right">Amount</th>
                      <th className="pb-2 font-bold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-400">
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
                          <td className="py-2.5 font-bold text-slate-800">{order.orderNumber || order._id}</td>
                          <td className="py-2.5 font-medium text-slate-600 truncate max-w-[120px]">
                            {order.customer?.name || order.shippingAddress?.fullName || 'Customer'}
                          </td>
                          <td className="py-2.5 text-right font-bold text-slate-800">
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
          <div className="lg:col-span-4 bg-white rounded-md border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Top Selling Books</h3>
                <Link
                  href="/products"
                  className="text-xs font-bold text-emerald-800 hover:text-emerald-900 hover:underline"
                >
                  View All
                </Link>
              </div>

              {topBooks.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No books in catalog yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {topBooks.map((book) => (
                    <div key={book._id} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {book.images?.[0] ? (
                          <img
                            src={book.images[0]}
                            alt={book.title}
                            className="w-9 h-12 object-cover rounded-sm border border-slate-200 flex-shrink-0 shadow-2xs"
                          />
                        ) : (
                          <div className="w-9 h-12 bg-slate-100 rounded-sm border border-slate-200 flex items-center justify-center flex-shrink-0 text-slate-400 text-[10px]">
                            <Package className="w-4 h-4" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{book.title || book.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{book.author || 'Author'}</p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                        {book.salesCount || 0} sold
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions (3 cols) */}
          <div className="lg:col-span-3 bg-white rounded-md border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-4">Quick Actions</h3>

              <div className="space-y-2.5">
                <Link
                  href="/products/add"
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-md bg-[#ede9fe] hover:bg-[#ddd6fe] text-[#6d28d9] font-bold text-xs transition-colors shadow-2xs"
                >
                  <Plus className="w-4 h-4" />
                  Add Product
                </Link>

                <Link
                  href="/banners"
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-md bg-[#e0f2fe] hover:bg-[#bae6fd] text-[#0284c7] font-bold text-xs transition-colors shadow-2xs"
                >
                  <ImageIcon className="w-4 h-4" />
                  Manage Banners
                </Link>

                <Link
                  href="/inventory"
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-md bg-[#dcfce7] hover:bg-[#bbf7d0] text-[#15803d] font-bold text-xs transition-colors shadow-2xs"
                >
                  <Boxes className="w-4 h-4" />
                  Check Stock
                </Link>

                <Link
                  href="/returns"
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-md bg-[#ffedd5] hover:bg-[#fed7aa] text-[#c2410c] font-bold text-xs transition-colors shadow-2xs"
                >
                  <RotateCcw className="w-4 h-4" />
                  View Returns
                </Link>

                <Link
                  href="/invoices"
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-md bg-[#f3e8ff] hover:bg-[#e9d5ff] text-[#7e22ce] font-bold text-xs transition-colors shadow-2xs"
                >
                  <FileText className="w-4 h-4" />
                  Generate Invoice
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
