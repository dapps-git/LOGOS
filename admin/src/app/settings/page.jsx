'use client';

import React, { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import {
  Settings,
  Save,
  Store,
  Gift
} from 'lucide-react';

export default function SettingsPage() {
  const { admin } = useAuth();
  const { showToast } = useToast();

  const [settings, setSettings] = useState({
    storeName: 'LOGOS Bookstore',
    tagline: 'Premium Books & Literary Collections',
    supportEmail: 'support@logosbooks.com',
    supportPhone: '+91 98765 43210',
    gstin: '32AAACL1902K1Z8',
    currency: 'INR (₹)',
    freeShippingThreshold: 999,
    referralRewardAmount: 100,
    friendDiscountPercent: 15,
    welcomeDiscountAmount: 100
  });

  const handleSave = (e) => {
    e.preventDefault();
    showToast('Store settings updated successfully!', 'success');
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Store Settings & Configuration</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure bookstore profile, GST compliance, free delivery limits, and referral bonuses.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6 text-xs">
          {/* General Store Details */}
          <div className="p-6 rounded-md bg-white border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Store className="w-4 h-4 text-emerald-800" />
              General Store Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Store Name</label>
                <input
                  type="text"
                  value={settings.storeName}
                  onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-md font-medium outline-hidden focus:border-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Store Tagline</label>
                <input
                  type="text"
                  value={settings.tagline}
                  onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-md font-medium outline-hidden focus:border-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Support Email</label>
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-md font-medium outline-hidden focus:border-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">GSTIN Tax ID</label>
                <input
                  type="text"
                  value={settings.gstin}
                  onChange={(e) => setSettings({ ...settings, gstin: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-md font-mono font-bold outline-hidden focus:border-slate-900 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Shipping & Referral Engine Config */}
          <div className="p-6 rounded-md bg-white border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Gift className="w-4 h-4 text-emerald-800" />
              Delivery & Growth Engine Parameters
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Free Shipping Order Min (₹)</label>
                <input
                  type="number"
                  value={settings.freeShippingThreshold}
                  onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-md font-bold outline-hidden focus:border-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Referral Reward Credit (₹)</label>
                <input
                  type="number"
                  value={settings.referralRewardAmount}
                  onChange={(e) => setSettings({ ...settings, referralRewardAmount: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-md font-bold outline-hidden focus:border-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Friend 1st Order Discount (%)</label>
                <input
                  type="number"
                  value={settings.friendDiscountPercent}
                  onChange={(e) => setSettings({ ...settings, friendDiscountPercent: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-md font-bold outline-hidden focus:border-slate-900 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Save Action */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
