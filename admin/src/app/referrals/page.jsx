'use client';

import React from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Badge } from '@/components/common/Badge';
import { useStoreData } from '@/context/StoreDataContext';
import {
  Users,
  IndianRupee,
  Link as LinkIcon,
  CheckCircle2,
  Clock,
  Gift
} from 'lucide-react';

export default function ReferralsPage() {
  const { referrals = [], referralStats = {} } = useStoreData();

  const totalRewardsDisbursed = referrals
    .filter((r) => r.status === 'rewarded' || r.rewardIssued)
    .reduce((sum, r) => sum + (r.referrerRewardAmount || 100), 0);

  const successfulReferralsCount = referrals.filter((r) => r.status === 'rewarded' || r.rewardIssued).length;
  const pendingReferralsCount = referrals.filter((r) => r.status !== 'rewarded' && r.status !== 'cancelled').length;
  const totalLinksGenerated = referralStats?.totalLinksGenerated || 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Referral &amp; Rewards Engine</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitor customer referral links, ₹100 wallet rewards upon verified delivery/payment, and 15% first-order friend discounts.
          </p>
        </div>

        {/* 5 Referral Program KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          <div className="p-4 bg-white border border-slate-200 rounded-md space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">Links Generated</span>
              <LinkIcon className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">{totalLinksGenerated} Links</h3>
            <p className="text-[10px] text-slate-500">From eligible 1st orders (≥ ₹999)</p>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-md space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">Total Invites</span>
              <Users className="w-4 h-4 text-slate-700" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">{referrals.length} Friends</h3>
            <p className="text-[10px] text-slate-500">Registered via referral</p>
          </div>

          <div className="p-4 bg-white border border-amber-300 rounded-md space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-bold text-amber-800 uppercase tracking-wider">Pending Orders</span>
              <Clock className="w-4 h-4 text-amber-700" />
            </div>
            <h3 className="text-2xl font-black text-amber-800">{pendingReferralsCount} Pending</h3>
            <p className="text-[10px] text-amber-700">Awaiting order / delivery</p>
          </div>

          <div className="p-4 bg-white border border-emerald-300 rounded-md space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-bold text-emerald-800 uppercase tracking-wider">Completed</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            </div>
            <h3 className="text-2xl font-black text-emerald-800">{successfulReferralsCount} Orders</h3>
            <p className="text-[10px] text-emerald-700">Verified purchases with 15% OFF</p>
          </div>

          <div className="p-4 bg-white border border-indigo-300 rounded-md space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-bold text-indigo-800 uppercase tracking-wider">Rewards Issued</span>
              <IndianRupee className="w-4 h-4 text-indigo-700" />
            </div>
            <h3 className="text-2xl font-black text-indigo-900">₹{totalRewardsDisbursed.toLocaleString('en-IN')}</h3>
            <p className="text-[10px] text-indigo-700">₹100 per verified customer</p>
          </div>
        </div>

        {/* Referral Activity Table */}
        <div className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Referral Activity Log</h3>
            <span className="text-xs text-slate-400 font-medium">{referrals.length} Total Records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4 font-bold min-w-[170px]">Referrer (User A)</th>
                  <th className="py-3 px-4 font-bold min-w-[120px]">Referral Code</th>
                  <th className="py-3 px-4 font-bold min-w-[170px]">Referred Customer (User B)</th>
                  <th className="py-3 px-4 font-bold min-w-[150px]">Referral Order</th>
                  <th className="py-3 px-4 font-bold text-center min-w-[110px]">Reward</th>
                  <th className="py-3 px-4 font-bold min-w-[120px]">Referral Status</th>
                  <th className="py-3 px-4 font-bold text-right min-w-[120px]">Reward Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {referrals.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No referral activity recorded yet in database.
                    </td>
                  </tr>
                ) : (
                  referrals.map((ref) => {
                    const isRewarded = ref.status === 'rewarded' || ref.rewardIssued;
                    const orderObj = typeof ref.orderId === 'object' ? ref.orderId : null;

                    return (
                      <tr key={ref._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900 align-middle">
                          {ref.referrer?.name || 'Customer'}
                          <p className="text-[10px] text-slate-400 font-normal">{ref.referrer?.email}</p>
                        </td>

                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-900 align-middle">
                          <span className="bg-emerald-50 border border-emerald-200 rounded px-2 py-0.5">
                            {ref.referralCode}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-medium text-slate-800 align-middle">
                          {ref.referredUser?.name || 'Customer'}
                          <p className="text-[10px] text-slate-400">{ref.referredUser?.email}</p>
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 align-middle">
                          {orderObj ? (
                            <div>
                              <span className="font-bold text-slate-900">
                                #{orderObj.orderNumber || orderObj._id?.slice(-6).toUpperCase()}
                              </span>
                              <span className="text-[10px] text-slate-500 block">
                                ₹{orderObj.totalAmount || ref.orderAmount || 0} • {orderObj.paymentMethod || 'Online'}
                              </span>
                              <span className="text-[9.5px] text-slate-400 block capitalize">
                                Status: {orderObj.orderStatus || 'Confirmed'} ({orderObj.paymentStatus || 'Paid'})
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Pending purchase</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center font-black text-emerald-800 text-sm align-middle">
                          ₹{ref.referrerRewardAmount || 100}
                        </td>

                        <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                          <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            isRewarded
                              ? 'bg-emerald-100 text-emerald-800'
                              : ref.status === 'cancelled'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {isRewarded ? 'COMPLETED' : ref.status === 'cancelled' ? 'CANCELLED' : 'PENDING'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right align-middle whitespace-nowrap">
                          <Badge variant={isRewarded ? 'success' : 'warning'}>
                            {isRewarded ? '₹100 Issued' : 'Awaiting Delivery/Payment'}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
