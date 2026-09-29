'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useStoreData } from '@/context/StoreDataContext';
import { useToast } from '@/context/ToastContext';
import {
  Search,
  Eye,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  RotateCcw,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

const STATUS_TABS = [
  { id: 'ALL', label: 'All' },
  { id: 'Return Requested', label: 'Requested' },
  { id: 'Under Review', label: 'Under Review' },
  { id: 'Approved', label: 'Approved' },
  { id: 'Pickup Scheduled', label: 'Pickup Scheduled' },
  { id: 'Received', label: 'Received' },
  { id: 'Refund Initiated', label: 'Refund Initiated' },
  { id: 'Refunded', label: 'Refunded' },
  { id: 'Rejected', label: 'Rejected' }
];

export default function ReturnsPage() {
  const { returnsList = [], updateReturnStatus } = useStoreData();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateClock = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
      const dateStr = now.toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      setCurrentTime(`${timeStr} | ${dateStr}`);
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filtered results
  const filteredReturns = returnsList.filter((ret) => {
    const term = search.toLowerCase();
    const matchesSearch =
      !term ||
      ret.orderNumber?.toLowerCase().includes(term) ||
      ret.customerName?.toLowerCase().includes(term) ||
      ret.customerEmail?.toLowerCase().includes(term) ||
      ret.reason?.toLowerCase().includes(term);

    const matchesStatus =
      statusFilter === 'ALL' ||
      ret.status?.toLowerCase() === statusFilter.toLowerCase() ||
      (statusFilter === 'Return Requested' && (ret.status === 'Requested' || ret.status === 'Pending' || ret.status === 'Return Requested'));

    return matchesSearch && matchesStatus;
  });

  // Calculate count per status
  const getStatusCount = (statusId) => {
    if (statusId === 'ALL') return returnsList.length;
    return returnsList.filter((r) => {
      if (statusId === 'Return Requested') {
        return r.status === 'Return Requested' || r.status === 'Requested' || r.status === 'Pending';
      }
      return r.status?.toLowerCase() === statusId.toLowerCase();
    }).length;
  };

  const handleStatusTransition = (returnId, newStatus) => {
    updateReturnStatus(returnId, newStatus);
    showToast(`Request updated to "${newStatus}"`, 'success');
    if (selectedReturn && selectedReturn._id === returnId) {
      setSelectedReturn({ ...selectedReturn, status: newStatus });
    }
  };

  const getStatusBadgeClass = (st) => {
    const lower = (st || '').toLowerCase();
    if (lower.includes('requested') || lower.includes('pending')) {
      return 'bg-amber-50 text-amber-800 border-amber-200/80';
    }
    if (lower.includes('refund initiated')) {
      return 'bg-cyan-50 text-cyan-800 border-cyan-200/80';
    }
    if (lower.includes('approved') || lower.includes('refunded')) {
      return 'bg-emerald-50 text-emerald-800 border-emerald-200/80';
    }
    if (lower.includes('rejected')) {
      return 'bg-rose-50 text-rose-800 border-rose-200/80';
    }
    if (lower.includes('pickup') || lower.includes('review') || lower.includes('received')) {
      return 'bg-indigo-50 text-indigo-800 border-indigo-200/80';
    }
    return 'bg-slate-50 text-slate-700 border-slate-200';
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        {/* 1. Breadcrumb Top Bar with Clock */}
        <div className="flex items-center justify-between text-xs text-slate-600 pb-1">
          <h1 className="font-bold text-slate-900 text-sm tracking-tight">
            Return &amp; Refund Requests
          </h1>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50/70 border border-amber-200/60 rounded-xl text-slate-700 font-mono text-xs">
            <Clock className="w-3.5 h-3.5 text-amber-700" />
            <span>{currentTime || '11:46:39 am | Tue, 29 Sept, 2026'}</span>
          </div>
        </div>

        {/* 2. Main Title Row with Policy Button */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Return &amp; Refund Management
            </h2>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 flex-wrap">
              <span>Classify return requests through full lifecycle:</span>
              <span className="font-semibold text-slate-700">
                Return Requested → Under Review → Approved → Pickup Scheduled → Received → Refund Initiated → Refunded
              </span>
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowPolicyModal(true)}
            className="self-start md:self-auto px-4 py-2 bg-amber-50/80 hover:bg-amber-100/80 text-amber-900 border border-amber-300/80 rounded-xl text-xs font-semibold tracking-wide transition-all shadow-2xs flex items-center gap-2 shrink-0"
          >
            <ShieldCheck className="w-4 h-4 text-amber-700" />
            <span>Return Control Policy</span>
          </button>
        </div>

        {/* 3. Lifecycle Status Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {STATUS_TABS.map((tab) => {
            const count = getStatusCount(tab.id);
            const isActive = statusFilter === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#8B5E34] text-white shadow-xs'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* 4. Search Bar */}
        <div className="p-3.5 bg-white border border-slate-200/80 rounded-2xl shadow-2xs">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order ID, customer name, email, or return reason..."
              className="w-full pl-9 pr-4 py-2 bg-[#FAFBFD] border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-amber-700 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* 5. Returns Data Table */}
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAFBFD] text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200/80">
                  <th className="py-3.5 px-4 font-bold min-w-[140px]">ORDER REF</th>
                  <th className="py-3.5 px-4 font-bold min-w-[160px]">CUSTOMER</th>
                  <th className="py-3.5 px-4 font-bold min-w-[190px]">REASON</th>
                  <th className="py-3.5 px-4 font-bold min-w-[90px]">EVIDENCE</th>
                  <th className="py-3.5 px-4 font-bold min-w-[120px]">REFUND AMOUNT</th>
                  <th className="py-3.5 px-4 font-bold min-w-[140px]">STATUS</th>
                  <th className="py-3.5 px-4 font-bold text-right min-w-[140px]">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReturns.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 text-xs font-light">
                      No return requests found matching current filter.
                    </td>
                  </tr>
                ) : (
                  filteredReturns.map((ret) => {
                    const st = ret.status || 'Return Requested';

                    return (
                      <tr key={ret._id} className="hover:bg-slate-50/60 transition-colors">
                        {/* Order Ref */}
                        <td className="py-3.5 px-4 align-middle">
                          <span className="font-mono font-bold text-slate-900 block text-xs">
                            {ret.orderNumber || (typeof ret.orderId === 'object' ? (ret.orderId?.orderNumber || ret.orderId?._id) : ret.orderId) || 'GRV-158858-130'}
                          </span>
                          <span className="text-[11px] text-slate-400 font-light block mt-0.5">
                            {new Date(ret.requestDate || Date.now()).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </td>

                        {/* Customer */}
                        <td className="py-3.5 px-4 align-middle">
                          <p className="font-semibold text-slate-900">{ret.customerName || 'Customer'}</p>
                          <p className="text-[11px] text-slate-400 font-light truncate">{ret.customerEmail || 'aifasa@gmail.com'}</p>
                        </td>

                        {/* Reason */}
                        <td className="py-3.5 px-4 align-middle">
                          <span className="inline-block px-2.5 py-1 rounded-lg bg-amber-50/70 border border-amber-200/80 text-amber-900 text-[11px] font-medium">
                            {ret.reason || 'Received Wrong Product'}
                          </span>
                        </td>

                        {/* Evidence */}
                        <td className="py-3.5 px-4 align-middle text-slate-400 text-xs">
                          {ret.evidence ? (
                            <span className="text-blue-600 underline cursor-pointer">1 Photo</span>
                          ) : (
                            <span>None</span>
                          )}
                        </td>

                        {/* Refund Amount */}
                        <td className="py-3.5 px-4 align-middle font-mono font-bold text-slate-900 text-xs">
                          ₹{ret.refundAmount ? Number(ret.refundAmount).toLocaleString('en-IN') : '0'}
                        </td>

                        {/* Status Pill */}
                        <td className="py-3.5 px-4 align-middle">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-[11px] font-semibold border ${getStatusBadgeClass(
                              st
                            )}`}
                          >
                            {st}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 align-middle text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Eye View Button */}
                            <button
                              type="button"
                              onClick={() => setSelectedReturn(ret)}
                              className="p-1 text-slate-400 hover:text-slate-800 transition-colors"
                              title="Inspect Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Contextual Action Buttons */}
                            {st === 'Return Requested' || st === 'Requested' || st === 'Pending' ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setSelectedReturn(ret)}
                                  className="text-xs font-semibold text-blue-600 hover:underline px-1"
                                >
                                  Review
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleStatusTransition(ret._id, 'Approved')}
                                  className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold transition-all"
                                >
                                  Accept
                                </button>
                              </>
                            ) : st === 'Refund Initiated' ? (
                              <button
                                type="button"
                                onClick={() => handleStatusTransition(ret._id, 'Refunded')}
                                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold transition-all"
                              >
                                Mark Refunded
                              </button>
                            ) : st === 'Approved' ? (
                              <button
                                type="button"
                                onClick={() => handleStatusTransition(ret._id, 'Pickup Scheduled')}
                                className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold transition-all"
                              >
                                Schedule Pickup
                              </button>
                            ) : st === 'Pickup Scheduled' ? (
                              <button
                                type="button"
                                onClick={() => handleStatusTransition(ret._id, 'Received')}
                                className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold transition-all"
                              >
                                Mark Received
                              </button>
                            ) : st === 'Received' ? (
                              <button
                                type="button"
                                onClick={() => handleStatusTransition(ret._id, 'Refund Initiated')}
                                className="px-2.5 py-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200 rounded-lg text-xs font-semibold transition-all"
                              >
                                Initiate Refund
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setSelectedReturn(ret)}
                                className="text-xs font-semibold text-slate-600 hover:underline"
                              >
                                View
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* 6. Footer Summary & Pagination */}
          <div className="p-3.5 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Showing {filteredReturns.length} of {returnsList.length} requests</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled
                className="p-1 rounded-md text-slate-300 cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-medium text-slate-700">1 / 1</span>
              <button
                type="button"
                disabled
                className="p-1 rounded-md text-slate-300 cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Detail & Action Inspector Modal */}
      {selectedReturn && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">RETURN REQUEST INSPECTION</span>
                <h3 className="text-sm font-bold text-slate-900 font-mono">
                  {selectedReturn.orderNumber || (typeof selectedReturn.orderId === 'object' ? (selectedReturn.orderId?.orderNumber || selectedReturn.orderId?._id) : selectedReturn.orderId) || 'Order Ref'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReturn(null)}
                className="text-slate-400 hover:text-slate-600 text-base"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 block">Customer</span>
                  <span className="font-semibold text-slate-800">{selectedReturn.customerName}</span>
                  <span className="text-[11px] text-slate-500 block">{selectedReturn.customerEmail}</span>
                  <span className="text-[11px] text-slate-500 block">{selectedReturn.customerPhone}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Refund Amount</span>
                  <span className="text-base font-bold text-slate-900 font-mono">₹{selectedReturn.refundAmount}</span>
                  <span className="text-[10px] text-slate-400 block mt-1">Current Status:</span>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadgeClass(selectedReturn.status)}`}>
                    {selectedReturn.status}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">Reason for Return</span>
                <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/60 text-amber-900 font-medium">
                  {selectedReturn.reason}
                </div>
              </div>

              {selectedReturn.notes && (
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">Customer Notes</span>
                  <p className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 leading-relaxed">
                    {selectedReturn.notes}
                  </p>
                </div>
              )}

              {selectedReturn.pickupAddress && (
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">Pickup Address</span>
                  <p className="text-slate-600">
                    {selectedReturn.pickupAddress}
                  </p>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Update Lifecycle Status</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleStatusTransition(selectedReturn._id, 'Under Review')}
                    className="py-2 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px]"
                  >
                    Under Review
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusTransition(selectedReturn._id, 'Approved')}
                    className="py-2 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-[11px] border border-emerald-200"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusTransition(selectedReturn._id, 'Pickup Scheduled')}
                    className="py-2 px-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[11px] border border-indigo-200"
                  >
                    Pickup Sched.
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusTransition(selectedReturn._id, 'Received')}
                    className="py-2 px-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[11px] border border-blue-200"
                  >
                    Mark Received
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusTransition(selectedReturn._id, 'Refund Initiated')}
                    className="py-2 px-2 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-700 font-semibold text-[11px] border border-cyan-200"
                  >
                    Refund Initiated
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusTransition(selectedReturn._id, 'Refunded')}
                    className="py-2 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px]"
                  >
                    ✓ Refunded
                  </button>
                </div>
                <div className="pt-1 text-center">
                  <button
                    type="button"
                    onClick={() => handleStatusTransition(selectedReturn._id, 'Rejected')}
                    className="text-xs text-rose-600 hover:underline font-medium"
                  >
                    Reject This Return Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Return Control Policy Modal */}
      {showPolicyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-700" />
                <h3 className="text-sm font-bold text-slate-900">Return &amp; Refund Control Policy</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPolicyModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/60">
                <h4 className="font-bold text-amber-900 text-xs mb-1">Standard 7-Day Return Window</h4>
                <p>Books can be returned within 7 days of delivery for wrong editions, damaged binding, or printing errors.</p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <h4 className="font-bold text-slate-800 text-xs mb-1">Quality Inspection</h4>
                <p>Pickups must be inspected for physical condition before initiating the gateway refund.</p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <h4 className="font-bold text-slate-800 text-xs mb-1">Instant Wallet or Source Refund</h4>
                <p>Refunds can be credited instantly to user Rewards Balance or refunded to the original Razorpay/UPI source within 3-5 business days.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowPolicyModal(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-xs transition-all"
            >
              Close Policy
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
