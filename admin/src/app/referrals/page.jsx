'use client';

import React from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Badge } from '@/components/common/Badge';
import { useStoreData } from '@/context/StoreDataContext';
import {
  Users,
  IndianRupee,
  Percent,
  CheckCircle2,
  Gift
} from 'lucide-react';

export default function ReferralsPage() {
  const { referrals = [] } = useStoreData();

  const totalRewardsDisbursed = referrals
    .filter((r) => r.status === 'rewarded')
    .reduce((sum, r) => sum + (r.referrerRewardAmount || 100), 0);

  const successfulReferralsCount = referrals.filter((r) => r.status === 'rewarded').length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Referral & Rewards Engine</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitor reader referral virality, ₹100 wallet credits upon purchase, and 15% first-order friend discounts.
          </p>
        </div>

        {/* 4 Referral Program KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white border border-slate-200 rounded-md space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Referrals</span>
              <Users className="w-5 h-5 text-slate-700" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">{referrals.length} Invites</h3>
            <p className="text-[11px] text-slate-500">From registered customers</p>
          </div>

          <div className="p-5 bg-white border border-emerald-300 rounded-md space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Successful Orders</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
            </div>
            <h3 className="text-2xl font-black text-emerald-800">{successfulReferralsCount} Orders</h3>
            <p className="text-[11px] text-emerald-700">Friend purchased with 15% OFF</p>
          </div>

          <div className="p-5 bg-white border border-amber-300 rounded-md space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Rewards Credited</span>
              <IndianRupee className="w-5 h-5 text-amber-700" />
            </div>
            <h3 className="text-2xl font-black text-amber-800">₹{totalRewardsDisbursed.toLocaleString('en-IN')}</h3>
            <p className="text-[11px] text-amber-700">₹100 per verified purchase</p>
          </div>

          <div className="p-5 bg-white border border-indigo-300 rounded-md space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider">Friend Discount</span>
              <Percent className="w-5 h-5 text-indigo-700" />
            </div>
            <h3 className="text-2xl font-black text-indigo-900">Flat 15% OFF</h3>
            <p className="text-[11px] text-indigo-700">On friend&apos;s first book order</p>
          </div>
        </div>

        {/* How Referral Works Banner */}
        <div className="p-6 bg-slate-900 text-white border border-slate-800 rounded-md flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <span className="text-xs font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/30 rounded-xs px-2.5 py-0.5 inline-block uppercase tracking-wider">
              Customer Virality Mechanism
            </span>
            <h3 className="text-lg font-black uppercase tracking-tight">How LOGOS Referral System Operates</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every registered user receives a unique code (e.g. <span className="font-mono text-emerald-300 font-bold">LOGOS-AK44</span>).
              When their invited friend signs up and completes their first book purchase, the friend gets an automatic <span className="font-bold text-white">15% discount</span> and the referrer automatically receives a <span className="font-bold text-emerald-400">₹100 wallet credit</span>.
            </p>
          </div>

          <div className="flex-shrink-0 flex items-center justify-center w-32 h-24 bg-white/5 border border-white/10 rounded-md p-3 text-center">
            <Gift className="w-10 h-10 text-emerald-400 mx-auto" />
          </div>
        </div>

        {/* Referral Activity Table */}
        <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Referral Activity Log</h3>
            <span className="text-xs text-slate-400 font-medium">Live Activity</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4 font-bold min-w-[180px]">Referrer</th>
                  <th className="py-3 px-4 font-bold min-w-[130px]">Referral Code</th>
                  <th className="py-3 px-4 font-bold min-w-[180px]">Referred Friend</th>
                  <th className="py-3 px-4 font-bold min-w-[140px]">Order Reference</th>
                  <th className="py-3 px-4 font-bold text-center min-w-[110px]">Reward (₹)</th>
                  <th className="py-3 px-4 font-bold text-right min-w-[140px]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {referrals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No referral activity recorded yet.
                    </td>
                  </tr>
                ) : (
                  referrals.map((ref) => (
                    <tr key={ref._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 align-middle">
                        {ref.referrer?.name || 'Customer'}
                        <p className="text-[10px] text-slate-400 font-normal">{ref.referrer?.email}</p>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-900 align-middle">
                        <span className="bg-emerald-50 border border-emerald-200 rounded-xs px-2 py-0.5">
                          {ref.referralCode}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-800 align-middle">
                        {ref.referredUser?.name}
                        <p className="text-[10px] text-slate-400">{ref.referredUser?.email}</p>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 align-middle">
                        {ref.orderId ? (
                          <div>
                            <span className="font-bold text-slate-900">{ref.orderId}</span>
                            <span className="text-[10px] text-slate-400 block">Amt: ₹{ref.orderAmount}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No purchase yet</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center font-black text-emerald-800 text-sm align-middle">
                        +₹{ref.referrerRewardAmount || 100}
                      </td>

                      <td className="py-3.5 px-4 text-right align-middle whitespace-nowrap">
                        <Badge variant={ref.status === 'rewarded' ? 'success' : 'warning'}>
                          {ref.status === 'rewarded' ? 'Rewarded' : 'Pending 1st Order'}
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
    </AdminLayout>
  );
}
