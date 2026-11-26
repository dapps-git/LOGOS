'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useToast } from '@/context/ToastContext';
import { apiClient } from '@/api/client';
import {
  Save,
  Store,
  Gift,
  Globe,
  Truck,
  ArrowRight,
  Loader2
} from 'lucide-react';

export default function SettingsPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    storeName: 'LOGOS Bookstore',
    tagline: 'Premium Books & Literary Collections',
    supportEmail: 'support@logosbooks.com',
    supportPhone: '+91 98765 43210',
    gstin: '32AAACL1902K1Z8',
    defaultSeoTitle: 'LOGOS Books | Malayalam & English Book Store',
    defaultMetaDescription: 'Official online bookstore for LOGOS publications, bestsellers, new arrivals, and literature.',
    freeShippingThreshold: 999,
    referralRewardAmount: 100,
    friendDiscountPercent: 15,
    welcomeDiscountAmount: 100
  });

  useEffect(() => {
    let active = true;
    apiClient('/settings/admin')
      .then((res) => {
        if (!active || !res?.settings) return;
        const s = res.settings;
        setSettings((prev) => ({
          ...prev,
          storeName: s.storeName || prev.storeName,
          tagline: s.tagline || prev.tagline,
          supportEmail: s.supportEmail || prev.supportEmail,
          supportPhone: s.supportPhone || prev.supportPhone,
          gstin: s.gstin || prev.gstin,
          defaultSeoTitle: s.defaultSeoTitle || prev.defaultSeoTitle,
          defaultMetaDescription: s.defaultMetaDescription || prev.defaultMetaDescription,
          freeShippingThreshold: Number(s.freeShippingThreshold ?? prev.freeShippingThreshold),
          referralRewardAmount: Number(s.referralRewardAmount ?? prev.referralRewardAmount),
          friendDiscountPercent: Number(s.friendDiscountPercent ?? prev.friendDiscountPercent),
          welcomeDiscountAmount: Number(s.welcomeDiscountAmount ?? prev.welcomeDiscountAmount)
        }));
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient('/settings/admin', {
        method: 'PUT',
        body: JSON.stringify(settings)
      });
      showToast('Store & SEO settings saved successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Store Settings &amp; Configuration</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Configure bookstore profile, global SEO metadata, GST compliance, and referral bonuses.
            </p>
          </div>
          <Link
            href="/shipping-settings"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1E3A8A] hover:bg-[#152e72] text-white font-bold text-xs rounded-md shadow-xs transition-all shrink-0"
          >
            <Truck className="w-4 h-4" />
            <span>Open Shipping Settings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-10 bg-white rounded-md border border-slate-200 flex items-center justify-center gap-2 text-xs text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin text-[#1E3A8A]" />
            <span>Loading settings...</span>
          </div>
        ) : (
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

            {/* Built-in Global SEO Configuration */}
            <div className="p-6 rounded-md bg-white border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#1E3A8A]" />
                  Built-In SEO Defaults
                </h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-[#1E3A8A] border border-blue-200">
                  Native SEO Engine Active
                </span>
              </div>

              <p className="text-[11px] text-slate-500">
                LOGOS Books Admin has built-in SEO controls directly inside each Product&apos;s Add/Edit page (SEO Title, Meta Description, URL Slug, and Cover Alt Text) — no third-party plugin required. Set global storefront fallback tags below:
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Default Storefront SEO Title</label>
                  <input
                    type="text"
                    value={settings.defaultSeoTitle}
                    onChange={(e) => setSettings({ ...settings, defaultSeoTitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-md font-medium outline-hidden focus:border-slate-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Default Storefront Meta Description</label>
                  <textarea
                    rows={2}
                    value={settings.defaultMetaDescription}
                    onChange={(e) => setSettings({ ...settings, defaultMetaDescription: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-md font-medium outline-hidden focus:border-slate-900 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Growth Engine Parameters */}
            <div className="p-6 rounded-md bg-white border border-slate-200 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
                <Gift className="w-4 h-4 text-emerald-800" />
                Referral &amp; Growth Engine Parameters
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Referral Qualification Min (₹)</label>
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
                disabled={saving}
                className="px-6 py-2.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}
