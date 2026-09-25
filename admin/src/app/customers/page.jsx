'use client';

import React, { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Modal } from '@/components/common/Modal';
import { useStoreData } from '@/context/StoreDataContext';
import { Search, Eye } from 'lucide-react';

export default function CustomersPage() {
  const { customers = [] } = useStoreData();
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const filteredCustomers = customers.filter((cust) => {
    return (
      cust.name?.toLowerCase().includes(search.toLowerCase()) ||
      cust.email?.toLowerCase().includes(search.toLowerCase()) ||
      cust.referralCode?.toLowerCase().includes(search.toLowerCase()) ||
      cust.city?.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Customer Directory</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Manage registered readers, referral reward credits, and order history.
            </p>
          </div>

          <span className="px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-bold text-slate-700">
            {customers.length} Registered Readers
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
              placeholder="Search by customer name, email, referral code, city..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-md text-xs font-medium outline-hidden focus:border-slate-900 focus:bg-white"
            />
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4 font-bold min-w-[200px]">Customer</th>
                  <th className="py-3 px-4 font-bold min-w-[180px]">Contact Details</th>
                  <th className="py-3 px-4 font-bold min-w-[130px]">Referral Code</th>
                  <th className="py-3 px-4 font-bold text-center min-w-[120px]">Reward Balance</th>
                  <th className="py-3 px-4 font-bold text-center min-w-[110px]">Orders Placed</th>
                  <th className="py-3 px-4 font-bold text-right min-w-[120px]">Lifetime Spend</th>
                  <th className="py-3 px-4 font-bold text-right min-w-[90px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No registered customers found.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr key={customer._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold flex items-center justify-center text-xs">
                            {customer.name?.charAt(0) || 'C'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{customer.name}</p>
                            <p className="text-[10px] text-slate-400">{customer.city || 'India'}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 align-middle">
                        <p className="text-slate-800 font-medium">{customer.email}</p>
                        <p className="text-[11px] text-slate-500">{customer.phone || 'N/A'}</p>
                      </td>

                      <td className="py-3.5 px-4 align-middle">
                        <span className="font-mono font-bold text-emerald-900 bg-emerald-50 border border-emerald-200 rounded px-2 py-0.5 text-[11px]">
                          {customer.referralCode || 'N/A'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold text-emerald-800 text-xs align-middle">
                        ₹{customer.referralRewardBalance || 0}
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold text-slate-800 align-middle">
                        {customer.ordersCount || 0} Orders
                      </td>

                      <td className="py-3.5 px-4 text-right font-black text-slate-900 text-sm align-middle">
                        ₹{(customer.totalSpent || 0).toLocaleString('en-IN')}
                      </td>

                      <td className="py-3.5 px-4 text-right align-middle whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedCustomer(customer)}
                          className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
                          title="View Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Customer Detail Modal */}
        {selectedCustomer && (
          <Modal
            isOpen={Boolean(selectedCustomer)}
            onClose={() => setSelectedCustomer(null)}
            title={`Customer Profile: ${selectedCustomer.name}`}
            subtitle={`Member since ${new Date(selectedCustomer.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}`}
          >
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-md text-center">
                <div>
                  <p className="text-slate-500 text-[11px] uppercase tracking-wider font-semibold">Total Spent</p>
                  <p className="text-base font-black text-slate-900">₹{selectedCustomer.totalSpent || 0}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[11px] uppercase tracking-wider font-semibold">Total Orders</p>
                  <p className="text-base font-black text-slate-900">{selectedCustomer.ordersCount || 0}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[11px] uppercase tracking-wider font-semibold">Reward Balance</p>
                  <p className="text-base font-black text-emerald-800">₹{selectedCustomer.referralRewardBalance || 0}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[11px] uppercase tracking-wider font-semibold">Referrals</p>
                  <p className="text-base font-black text-slate-900">{selectedCustomer.successfulReferralsCount || 0} Friends</p>
                </div>
              </div>

              <div className="space-y-1.5 p-4 border border-slate-200 rounded-md bg-white">
                <p className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Contact & Account Details:</p>
                <p className="text-slate-700"><span className="font-semibold">Email:</span> {selectedCustomer.email}</p>
                <p className="text-slate-700"><span className="font-semibold">Phone:</span> {selectedCustomer.phone || 'N/A'}</p>
                <p className="text-slate-700"><span className="font-semibold">Location:</span> {selectedCustomer.city || 'India'}</p>
                <p className="text-slate-700"><span className="font-semibold">Referral Code:</span> <span className="font-mono font-bold text-emerald-900">{selectedCustomer.referralCode || 'N/A'}</span></p>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AdminLayout>
  );
}
