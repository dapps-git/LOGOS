'use client';

import React, { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';
import { InvoiceModal } from '@/components/InvoiceModal';
import { useStoreData } from '@/context/StoreDataContext';
import { useToast } from '@/context/ToastContext';
import {
  Search,
  Eye,
  FileText,
  Truck,
  Phone,
  Mail,
  MapPin,
  User
} from 'lucide-react';

export default function OrdersPage() {
  const { orders = [], updateOrderStatus, updatePaymentStatus } = useStoreData();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [trackingInput, setTrackingInput] = useState('');

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
      order.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
      order.customer?.email?.toLowerCase().includes(search.toLowerCase()) ||
      order.customer?.phone?.includes(search);

    const matchesStatus = statusFilter === 'ALL' || order.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus);
    showToast(`Order status updated to ${newStatus}`, 'success');
  };

  const handlePaymentChange = (orderId, paymentStatus) => {
    updatePaymentStatus(orderId, paymentStatus);
    showToast(`Payment status updated to ${paymentStatus}`, 'success');
  };

  const handleUpdateTracking = (orderId) => {
    if (!trackingInput.trim()) return;
    updateOrderStatus(orderId, selectedOrder.orderStatus, 'Tracking updated', trackingInput.trim());
    showToast('Tracking number updated successfully', 'success');
    setTrackingInput('');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Orders Processing</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Track customer book purchases, fulfillment milestones, and generate tax invoices.
            </p>
          </div>

          <span className="px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-bold text-slate-700">
            Total Orders: {orders.length}
          </span>
        </div>

        {/* Filter Bar */}
        <div className="p-4 bg-white border border-slate-200 rounded-md flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order ID (#BW...), customer name, phone..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-md text-xs font-medium outline-hidden focus:border-slate-900 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-md text-xs font-semibold overflow-x-auto w-full sm:w-auto">
            {['ALL', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 whitespace-nowrap text-xs font-bold rounded-sm transition-all ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4 font-bold min-w-[120px]">Order ID</th>
                  <th className="py-3 px-4 font-bold min-w-[170px]">Customer Details</th>
                  <th className="py-3 px-4 font-bold min-w-[200px]">Items Purchased</th>
                  <th className="py-3 px-4 font-bold text-right min-w-[110px]">Total Amount</th>
                  <th className="py-3 px-4 font-bold text-center min-w-[120px]">Payment Status</th>
                  <th className="py-3 px-4 font-bold text-center min-w-[130px]">Order Status</th>
                  <th className="py-3 px-4 font-bold text-right min-w-[110px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No orders found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const itemsCount = order.items?.reduce((sum, i) => sum + i.quantity, 0) || order.items?.length || 1;

                    return (
                      <tr key={order._id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Order ID */}
                        <td className="py-3.5 px-4 font-bold text-slate-900 align-middle">
                          {order.orderNumber || order._id}
                          <p className="text-[10px] text-slate-400 font-normal mt-0.5">
                            {new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short'
                            })}
                          </p>
                        </td>

                        {/* Customer */}
                        <td className="py-3.5 px-4 align-middle">
                          <p className="font-bold text-slate-800">{order.customer?.name || order.shippingAddress?.fullName || 'Customer'}</p>
                          <p className="text-[11px] text-slate-500">{order.customer?.phone || order.shippingAddress?.phone || 'N/A'}</p>
                        </td>

                        {/* Items */}
                        <td className="py-3.5 px-4 max-w-xs align-middle">
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-1.5 overflow-hidden">
                              {order.items?.slice(0, 3).map((it, idx) => (
                                <img
                                  key={idx}
                                  src={it.image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100'}
                                  alt={it.title}
                                  className="inline-block h-8 w-6 object-cover border border-slate-300 rounded-xs"
                                />
                              ))}
                            </div>
                            <span className="text-[11px] font-medium text-slate-700 truncate">
                              {order.items?.[0]?.title || 'Book Item'} {itemsCount > 1 && `+${itemsCount - 1} more`}
                            </span>
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="py-3.5 px-4 text-right font-black text-slate-900 text-sm align-middle">
                          ₹{(order.finalTotal || order.totalAmount || 0).toLocaleString('en-IN')}
                        </td>

                        {/* Payment */}
                        <td className="py-3.5 px-4 text-center align-middle whitespace-nowrap">
                          <select
                            value={order.paymentStatus || 'Pending'}
                            onChange={(e) => handlePaymentChange(order._id, e.target.value)}
                            className="text-[11px] font-bold px-2 py-1 bg-slate-50 border border-slate-300 rounded-sm text-slate-800 focus:outline-hidden cursor-pointer"
                          >
                            <option value="Paid">Paid</option>
                            <option value="Pending">Pending (COD)</option>
                            <option value="Refunded">Refunded</option>
                          </select>
                        </td>

                        {/* Order Status */}
                        <td className="py-3.5 px-4 text-center align-middle whitespace-nowrap">
                          <select
                            value={order.orderStatus || 'Pending'}
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                            className="text-[11px] font-bold px-2 py-1 bg-slate-50 border border-slate-300 rounded-sm text-slate-800 focus:outline-hidden cursor-pointer"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right align-middle whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => setSelectedOrder(order)}
                              className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
                              title="View Order Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setInvoiceOrder(order)}
                              className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
                              title="Print Invoice"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <Modal
            isOpen={Boolean(selectedOrder)}
            onClose={() => setSelectedOrder(null)}
            title={`Order Details ${selectedOrder.orderNumber || selectedOrder._id}`}
            subtitle={`Placed on ${new Date(selectedOrder.createdAt || Date.now()).toLocaleString('en-IN')}`}
            maxWidth="max-w-3xl"
          >
            <div className="space-y-5 text-xs">
              {/* Customer & Shipping Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-md">
                <div className="space-y-1">
                  <p className="font-bold text-slate-900 text-sm flex items-center gap-1.5 uppercase tracking-wider">
                    <User className="w-4 h-4 text-emerald-700" />
                    Customer Details
                  </p>
                  <p className="font-bold text-slate-800">{selectedOrder.customer?.name || selectedOrder.shippingAddress?.fullName || 'Customer'}</p>
                  <p className="text-slate-600 flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {selectedOrder.customer?.email || 'N/A'}</p>
                  <p className="text-slate-600 flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {selectedOrder.customer?.phone || selectedOrder.shippingAddress?.phone || 'N/A'}</p>
                </div>

                <div className="space-y-1">
                  <p className="font-bold text-slate-900 text-sm flex items-center gap-1.5 uppercase tracking-wider">
                    <MapPin className="w-4 h-4 text-emerald-700" />
                    Shipping Address
                  </p>
                  <p className="text-slate-700">{selectedOrder.shippingAddress?.streetAddress || 'Address'}</p>
                  <p className="text-slate-700">
                    {selectedOrder.shippingAddress?.city || ''}, {selectedOrder.shippingAddress?.state || ''} {selectedOrder.shippingAddress?.postalCode ? `- ${selectedOrder.shippingAddress.postalCode}` : ''}
                  </p>
                  <p className="text-slate-700 font-semibold mt-1">Payment: {selectedOrder.paymentMethod || 'COD'}</p>
                </div>
              </div>

              {/* Items List */}
              <div>
                <p className="font-bold text-slate-800 uppercase tracking-wider mb-2">Ordered Items ({selectedOrder.items?.length || 0}):</p>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border border-slate-200 rounded-md bg-white">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100'}
                          alt={item.title}
                          className="w-10 h-14 object-cover border border-slate-300 rounded-xs"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{item.title}</p>
                          <p className="text-slate-500">Qty: {item.quantity} × ₹{item.price}</p>
                        </div>
                      </div>
                      <p className="font-bold text-slate-900 text-sm">₹{item.subtotal || item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tracking Number Input */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md flex items-center gap-2">
                <Truck className="w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  defaultValue={selectedOrder.trackingNumber || ''}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  placeholder="Enter courier tracking ID (e.g. DEL-IND-98231)..."
                  className="flex-1 bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs font-medium outline-hidden focus:border-slate-900"
                />
                <button
                  type="button"
                  onClick={() => handleUpdateTracking(selectedOrder._id)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-md"
                >
                  Save Tracking
                </button>
              </div>

              {/* Footer Modal Action */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setInvoiceOrder(selectedOrder);
                    setSelectedOrder(null);
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-md flex items-center gap-1.5"
                >
                  <FileText className="w-4 h-4" />
                  View & Print Invoice
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* Invoice Modal */}
        {invoiceOrder && (
          <InvoiceModal
            isOpen={Boolean(invoiceOrder)}
            onClose={() => setInvoiceOrder(null)}
            order={invoiceOrder}
          />
        )}
      </div>
    </AdminLayout>
  );
}
