'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useToast } from '@/context/ToastContext';
import { apiClient } from '@/api/client';
import {
  Truck,
  Save,
  MapPin,
  Sparkles,
  CreditCard,
  Loader2,
  CheckCircle2,
  Info
} from 'lucide-react';

export default function ShippingSettingsPage() {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    keralaShippingCharge: 0,
    outsideKeralaShippingCharge: 0,
    freeShippingFirstOrder: false,
    freeShippingOnOnlinePayment: true,
    codFeeEnabled: true,
    codFeePercent: 2,
    codFreeThreshold: 1000
  });

  useEffect(() => {
    let active = true;
    apiClient('/settings/admin')
      .then((res) => {
        if (!active) return;
        const s = res?.settings;
        if (s) {
          setForm({
            keralaShippingCharge: Number(s.keralaShippingCharge ?? 0),
            outsideKeralaShippingCharge: Number(s.outsideKeralaShippingCharge ?? 0),
            freeShippingFirstOrder: Boolean(s.freeShippingFirstOrder),
            freeShippingOnOnlinePayment: s.freeShippingOnOnlinePayment !== false,
            codFeeEnabled: s.codFeeEnabled !== false,
            codFeePercent: Number(s.codFeePercent ?? 2),
            codFreeThreshold: Number(s.codFreeThreshold ?? 1000)
          });
        }
      })
      .catch((err) => {
        showToast(err.message || 'Failed to load shipping settings', 'error');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [showToast]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        keralaShippingCharge: Math.max(0, Number(form.keralaShippingCharge) || 0),
        outsideKeralaShippingCharge: Math.max(0, Number(form.outsideKeralaShippingCharge) || 0),
        freeShippingFirstOrder: Boolean(form.freeShippingFirstOrder),
        freeShippingOnOnlinePayment: Boolean(form.freeShippingOnOnlinePayment),
        codFeeEnabled: Boolean(form.codFeeEnabled),
        codFeePercent: Math.max(0, Number(form.codFeePercent) || 0),
        codFreeThreshold: Math.max(0, Number(form.codFreeThreshold) || 0)
      };
      const res = await apiClient('/settings/admin', {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      if (res?.settings) {
        setForm({
          keralaShippingCharge: Number(res.settings.keralaShippingCharge ?? 0),
          outsideKeralaShippingCharge: Number(res.settings.outsideKeralaShippingCharge ?? 0),
          freeShippingFirstOrder: Boolean(res.settings.freeShippingFirstOrder),
          freeShippingOnOnlinePayment: res.settings.freeShippingOnOnlinePayment !== false,
          codFeeEnabled: res.settings.codFeeEnabled !== false,
          codFeePercent: Number(res.settings.codFeePercent ?? 2),
          codFreeThreshold: Number(res.settings.codFreeThreshold ?? 1000)
        });
      }
      showToast('Shipping settings saved! Changes are immediately live on Checkout.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to save shipping settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2.5">
              <Truck className="w-6 h-6 text-[#1E3A8A]" />
              Shipping Settings
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage regional shipping charges (Kerala vs Outside Kerala), First Order Free Shipping, GPay/Online delivery rules, and COD charges.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 bg-white rounded-md border border-slate-200 flex items-center justify-center gap-2 text-xs text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin text-[#1E3A8A]" />
            <span>Loading shipping configuration...</span>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6 text-xs">
            {/* Regional Shipping Rates */}
            <div className="p-6 rounded-md bg-white border border-slate-200 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#1E3A8A]" />
                Regional Shipping Charges
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/60 space-y-2">
                  <label className="block font-bold text-slate-800">
                    Kerala Shipping Charge (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={form.keralaShippingCharge}
                      onChange={(e) => setForm({ ...form, keralaShippingCharge: e.target.value })}
                      className="w-full pl-7 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-md font-bold text-slate-900 outline-hidden focus:border-[#1E3A8A]"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Applied in Checkout → Order Summary when the delivery address state is <strong>Kerala</strong>. Set to 0 for free Kerala shipping.
                  </p>
                </div>

                <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/60 space-y-2">
                  <label className="block font-bold text-slate-800">
                    Outside Kerala Shipping Charge (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={form.outsideKeralaShippingCharge}
                      onChange={(e) => setForm({ ...form, outsideKeralaShippingCharge: e.target.value })}
                      className="w-full pl-7 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-md font-bold text-slate-900 outline-hidden focus:border-[#1E3A8A]"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Applied in Checkout → Order Summary when the delivery address state is <strong>outside Kerala</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* First Order Free Shipping */}
            <div className="p-6 rounded-md bg-white border border-slate-200 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                First Order Free Shipping
              </h3>

              <label className={`flex items-start justify-between gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
                form.freeShippingFirstOrder
                  ? 'border-emerald-400 bg-emerald-50/50'
                  : 'border-slate-200 bg-slate-50/50'
              }`}>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    Enable Free Shipping on Customer&apos;s First Order
                    {form.freeShippingFirstOrder && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                    )}
                  </span>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    When enabled, new customers placing their very first order automatically receive ₹0 shipping (both Kerala and Outside Kerala) in Checkout → Order Summary.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={form.freeShippingFirstOrder}
                  onChange={(e) => setForm({ ...form, freeShippingFirstOrder: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer shrink-0"
                />
              </label>
            </div>

            {/* Payment Method Shipping Rules (GPay/Online Free Delivery + COD 2% Charge) */}
            <div className="p-6 rounded-md bg-white border border-slate-200 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#1E3A8A]" />
                Online (GPay / UPI) &amp; COD Fee Rules
              </h3>

              {/* Free Shipping on Online/GPay */}
              <label className={`flex items-start justify-between gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
                form.freeShippingOnOnlinePayment
                  ? 'border-blue-300 bg-blue-50/40'
                  : 'border-slate-200 bg-slate-50/50'
              }`}>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    Free Delivery for Online / GPay / UPI (Razorpay) Orders
                  </span>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    When enabled, orders paid online via GPay, UPI, Cards, or Net Banking get Free Delivery (₹0), overriding Kerala / Outside Kerala shipping charges.
                    <span className="block mt-1 text-amber-800 font-semibold">
                      Note: Uncheck this if you want Kerala / Outside Kerala shipping charges to apply even on GPay / UPI orders.
                    </span>
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={form.freeShippingOnOnlinePayment}
                  onChange={(e) => setForm({ ...form, freeShippingOnOnlinePayment: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded border-slate-300 text-[#1E3A8A] focus:ring-[#1E3A8A] cursor-pointer shrink-0"
                />
              </label>

              {/* COD Extra Fee */}
              <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-4">
                <label className="flex items-start justify-between gap-4 cursor-pointer">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-900">
                      Cash on Delivery (COD) Extra Handling Charge (%)
                    </span>
                    <p className="text-[11px] text-slate-600">
                      Charges a percentage fee on COD orders below the free COD threshold (default: 2% under ₹1,000).
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.codFeeEnabled}
                    onChange={(e) => setForm({ ...form, codFeeEnabled: e.target.checked })}
                    className="mt-1 w-4 h-4 rounded border-slate-300 text-[#1E3A8A] focus:ring-[#1E3A8A] cursor-pointer shrink-0"
                  />
                </label>

                {form.codFeeEnabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-200/80">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">COD Fee Percentage (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={form.codFeePercent}
                        onChange={(e) => setForm({ ...form, codFeePercent: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md font-bold outline-hidden focus:border-[#1E3A8A]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Waive COD Fee Above Subtotal (₹)</label>
                      <input
                        type="number"
                        min="0"
                        step="50"
                        value={form.codFreeThreshold}
                        onChange={(e) => setForm({ ...form, codFreeThreshold: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md font-bold outline-hidden focus:border-[#1E3A8A]"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Live Preview */}
            <div className="p-4 rounded-md bg-blue-50/70 border border-blue-200 text-slate-700 space-y-2">
              <p className="font-bold text-[#1E3A8A] flex items-center gap-1.5">
                <Info className="w-4 h-4" />
                Live Order Summary Preview (for a ₹500 order):
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="bg-white p-2.5 rounded border border-blue-100">
                  <span className="font-bold text-slate-800 block">Kerala — Online / GPay:</span>
                  <span>
                    {form.freeShippingOnOnlinePayment
                      ? 'FREE (GPay / Online Free Delivery Offer)'
                      : form.freeShippingFirstOrder
                        ? `₹${Number(form.keralaShippingCharge) || 0} (FREE on 1st Order)`
                        : `₹${Number(form.keralaShippingCharge) || 0}`}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded border border-blue-100">
                  <span className="font-bold text-slate-800 block">Outside Kerala — Online / GPay:</span>
                  <span>
                    {form.freeShippingOnOnlinePayment
                      ? 'FREE (GPay / Online Free Delivery Offer)'
                      : form.freeShippingFirstOrder
                        ? `₹${Number(form.outsideKeralaShippingCharge) || 0} (FREE on 1st Order)`
                        : `₹${Number(form.outsideKeralaShippingCharge) || 0}`}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded border border-blue-100">
                  <span className="font-bold text-slate-800 block">Kerala — COD:</span>
                  <span>
                    Shipping: ₹{Number(form.keralaShippingCharge) || 0}
                    {form.freeShippingFirstOrder ? ' (FREE on 1st Order)' : ''}
                    {form.codFeeEnabled ? ` + ${form.codFeePercent}% COD fee (under ₹${form.codFreeThreshold})` : ''}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded border border-blue-100">
                  <span className="font-bold text-slate-800 block">Outside Kerala — COD:</span>
                  <span>
                    Shipping: ₹{Number(form.outsideKeralaShippingCharge) || 0}
                    {form.freeShippingFirstOrder ? ' (FREE on 1st Order)' : ''}
                    {form.codFeeEnabled ? ` + ${form.codFeePercent}% COD fee (under ₹${form.codFreeThreshold})` : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save Shipping Settings'}
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}

