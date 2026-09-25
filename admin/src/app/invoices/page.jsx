'use client';

import React, { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { InvoiceModal } from '@/components/InvoiceModal';
import { Badge } from '@/components/common/Badge';
import { useStoreData } from '@/context/StoreDataContext';
import { Search, Printer } from 'lucide-react';

export default function InvoicesPage() {
  const { orders = [] } = useStoreData();
  const [search, setSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const filteredOrders = orders.filter((order) => {
    return (
      order.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
      order.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
      order.customer?.email?.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Invoice Management</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Generate, print, and archive GST-compliant retail tax receipts for all book orders.
            </p>
          </div>

          <span className="px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-bold text-slate-700">
            {orders.length} Tax Invoices Available
          </span>
        </div>

        {/* Search */}
        <div className="p-4 bg-white border border-slate-200 rounded-md">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by invoice number, order ID, customer name..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-md text-xs font-medium outline-hidden focus:border-slate-900 focus:bg-white"
            />
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4 font-bold min-w-[130px]">Invoice No.</th>
                  <th className="py-3 px-4 font-bold min-w-[130px]">Order & Date</th>
                  <th className="py-3 px-4 font-bold min-w-[180px]">Billed Customer</th>
                  <th className="py-3 px-4 font-bold text-right min-w-[100px]">Taxable Amt</th>
                  <th className="py-3 px-4 font-bold text-right min-w-[90px]">GST (5%)</th>
                  <th className="py-3 px-4 font-bold text-right min-w-[100px]">Final Total</th>
                  <th className="py-3 px-4 font-bold text-center min-w-[110px]">Payment</th>
                  <th className="py-3 px-4 font-bold text-right min-w-[120px]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No invoices found.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const invNo = `INV-${order.orderNumber ? order.orderNumber.replace('#', '') : (order._id || '').slice(-6).toUpperCase()}`;
                    const subtotal = order.subtotal || order.totalAmount || 0;
                    const gst = Math.round(subtotal * 0.05);

                    return (
                      <tr key={order._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-900 align-middle">
                          {invNo}
                        </td>

                        <td className="py-3.5 px-4 align-middle">
                          <p className="font-bold text-slate-800">{order.orderNumber || order._id}</p>
                          <p className="text-[10px] text-slate-400">
                            {new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                        </td>

                        <td className="py-3.5 px-4 align-middle">
                          <p className="font-bold text-slate-900">{order.customer?.name || order.shippingAddress?.fullName || 'Customer'}</p>
                          <p className="text-[11px] text-slate-500">{order.customer?.email || 'N/A'}</p>
                        </td>

                        <td className="py-3.5 px-4 text-right text-slate-700 align-middle">
                          ₹{subtotal.toLocaleString('en-IN')}
                        </td>

                        <td className="py-3.5 px-4 text-right text-slate-700 align-middle">
                          ₹{gst.toLocaleString('en-IN')}
                        </td>

                        <td className="py-3.5 px-4 text-right font-black text-slate-900 text-sm align-middle">
                          ₹{(order.finalTotal || order.totalAmount || 0).toLocaleString('en-IN')}
                        </td>

                        <td className="py-3.5 px-4 text-center align-middle whitespace-nowrap">
                          <Badge variant={order.paymentStatus === 'Paid' ? 'delivered' : 'pending'}>
                            {order.paymentStatus || 'Pending'}
                          </Badge>
                        </td>

                        <td className="py-3.5 px-4 text-right align-middle whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setSelectedInvoice(order)}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-md flex items-center gap-1.5 ml-auto transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            Print / View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Invoice Modal */}
        {selectedInvoice && (
          <InvoiceModal
            isOpen={Boolean(selectedInvoice)}
            onClose={() => setSelectedInvoice(null)}
            order={selectedInvoice}
          />
        )}
      </div>
    </AdminLayout>
  );
}
