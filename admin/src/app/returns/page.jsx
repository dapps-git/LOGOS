'use client';

import React, { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Modal } from '@/components/common/Modal';
import { Badge } from '@/components/common/Badge';
import { useStoreData } from '@/context/StoreDataContext';
import { useToast } from '@/context/ToastContext';
import { Search } from 'lucide-react';

export default function ReturnsPage() {
  const { returnsList = [], updateReturnStatus } = useStoreData();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [selectedReturn, setSelectedReturn] = useState(null);

  const filteredReturns = returnsList.filter((ret) => {
    return (
      ret.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
      ret.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      ret.bookTitle?.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleApprove = (id) => {
    updateReturnStatus(id, 'Approved');
    showToast('Return request approved & refund marked for processing', 'success');
    setSelectedReturn(null);
  };

  const handleReject = (id) => {
    updateReturnStatus(id, 'Rejected');
    showToast('Return request rejected', 'info');
    setSelectedReturn(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Returns & Refunds</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Review customer return requests, inspect condition reasons, and disburse refunds.
            </p>
          </div>

          <span className="px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-bold text-slate-700">
            {returnsList.filter((r) => r.status?.toLowerCase() === 'pending review' || r.status?.toLowerCase() === 'pending').length} Pending Requests
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
              placeholder="Search by order ID, customer name, book..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-md text-xs font-medium outline-hidden focus:border-slate-900 focus:bg-white"
            />
          </div>
        </div>

        {/* Returns Table */}
        <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4 font-bold min-w-[130px]">Order ID</th>
                  <th className="py-3 px-4 font-bold min-w-[170px]">Customer</th>
                  <th className="py-3 px-4 font-bold min-w-[200px]">Book & Condition</th>
                  <th className="py-3 px-4 font-bold min-w-[200px]">Reason for Return</th>
                  <th className="py-3 px-4 font-bold text-right min-w-[110px]">Refund (₹)</th>
                  <th className="py-3 px-4 font-bold text-center min-w-[130px]">Status</th>
                  <th className="py-3 px-4 font-bold text-right min-w-[90px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReturns.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No return requests recorded.
                    </td>
                  </tr>
                ) : (
                  filteredReturns.map((ret) => (
                    <tr key={ret._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 align-middle">
                        {ret.orderNumber || ret.orderId}
                        <span className="text-[10px] text-slate-400 font-normal block">
                          {new Date(ret.requestDate || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 align-middle">
                        <p className="font-bold text-slate-800">{ret.customerName || 'Customer'}</p>
                        <p className="text-[11px] text-slate-500">{ret.customerEmail || 'N/A'}</p>
                      </td>

                      <td className="py-3.5 px-4 align-middle">
                        <p className="font-bold text-slate-900">{ret.bookTitle || 'Book'}</p>
                        <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.2 border border-slate-200 rounded-xs mt-0.5 inline-block">
                          Condition: {ret.condition || 'Standard'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-700 max-w-xs align-middle">
                        <p className="line-clamp-2 leading-relaxed">{ret.reason || 'No details provided.'}</p>
                      </td>

                      <td className="py-3.5 px-4 text-right font-black text-rose-700 text-sm align-middle">
                        ₹{ret.refundAmount || 0}
                      </td>

                      <td className="py-3.5 px-4 text-center align-middle whitespace-nowrap">
                        <Badge
                          variant={
                            ret.status === 'Approved' || ret.status === 'Refunded'
                              ? 'success'
                              : ret.status === 'Rejected'
                              ? 'danger'
                              : 'warning'
                          }
                        >
                          {ret.status || 'Pending'}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 text-right align-middle whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedReturn(ret)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-md font-bold text-xs transition-colors"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Return Review Modal */}
        {selectedReturn && (
          <Modal
            isOpen={Boolean(selectedReturn)}
            onClose={() => setSelectedReturn(null)}
            title={`Review Return for ${selectedReturn.orderNumber || selectedReturn.orderId}`}
            subtitle={`Customer: ${selectedReturn.customerName} (${selectedReturn.customerEmail})`}
          >
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Book Item:</span>
                  <span className="font-bold text-slate-900">{selectedReturn.bookTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Book Condition:</span>
                  <span className="font-bold text-slate-900">{selectedReturn.condition}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Refund Amount:</span>
                  <span className="font-black text-rose-600 text-sm">₹{selectedReturn.refundAmount}</span>
                </div>
              </div>

              <div>
                <p className="font-bold text-slate-800 uppercase tracking-wider text-[10px] mb-1">Customer Explanation:</p>
                <p className="p-3 bg-white border border-slate-200 rounded-md text-slate-700 leading-relaxed">
                  {selectedReturn.reason}
                </p>
              </div>

              {selectedReturn.image && (
                <div>
                  <p className="font-bold text-slate-800 uppercase tracking-wider text-[10px] mb-1">Attached Photo Evidence:</p>
                  <div className="h-40 border border-slate-300 rounded-md overflow-hidden">
                    <img src={selectedReturn.image} alt="Defect proof" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => handleReject(selectedReturn._id)}
                  className="px-4 py-2 font-bold bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 rounded-md transition-colors"
                >
                  Reject Return
                </button>
                <button
                  type="button"
                  onClick={() => handleApprove(selectedReturn._id)}
                  className="px-5 py-2 font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-md shadow-xs transition-colors"
                >
                  Approve & Issue Refund
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AdminLayout>
  );
}
