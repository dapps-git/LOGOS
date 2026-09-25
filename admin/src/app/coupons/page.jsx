'use client';

import React, { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Modal } from '@/components/common/Modal';
import { useStoreData } from '@/context/StoreDataContext';
import { useToast } from '@/context/ToastContext';
import {
  Ticket,
  Plus,
  Copy,
  Trash2,
  Check
} from 'lucide-react';

export default function CouponsPage() {
  const { coupons = [], addCoupon, deleteCoupon } = useStoreData();
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: 20,
    minOrderValue: 599,
    maxDiscount: 250,
    isWelcomeCoupon: false,
    usageLimit: 500,
    validUntil: '2026-12-31'
  });

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast(`Coupon code ${code} copied to clipboard!`, 'success');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.discountValue) {
      showToast('Coupon code and discount value are required', 'error');
      return;
    }

    addCoupon({
      ...formData,
      code: formData.code.trim().toUpperCase(),
      discountValue: Number(formData.discountValue),
      minOrderValue: Number(formData.minOrderValue) || 0,
      maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : null,
      usageLimit: Number(formData.usageLimit) || null,
      isActive: true
    });

    showToast(`Coupon "${formData.code.toUpperCase()}" created successfully!`, 'success');
    setIsModalOpen(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Coupon Management</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Create promotional promo codes, welcome discounts, and order thresholds.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-md shadow-xs transition-all active:scale-95 w-fit"
          >
            <Plus className="w-4 h-4" />
            Create Coupon Code
          </button>
        </div>

        {/* Coupons Grid */}
        {coupons.length === 0 ? (
          <div className="p-12 text-center bg-white border border-slate-200 rounded-md text-slate-400 text-xs">
            No active discount coupons found. Click &quot;Create Coupon Code&quot; to add one.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {coupons.map((coupon) => (
              <div
                key={coupon._id}
                className="p-5 bg-white border border-slate-200 rounded-md space-y-4 relative flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all"
              >
                {/* Header Badge */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {coupon.isWelcomeCoupon ? '🌟 Welcome Offer' : '🎟️ Promo Coupon'}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-lg font-mono font-black text-emerald-900 bg-emerald-50 border border-emerald-200 rounded px-3 py-1 tracking-wider">
                        {coupon.code}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(coupon.code)}
                        className="p-1.5 border border-slate-200 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                        title="Copy code"
                      >
                        {copiedCode === coupon.code ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <span className="text-lg font-black text-slate-900">
                    {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                  </span>
                </div>

                {/* Description & Rules */}
                <p className="text-xs text-slate-600 leading-relaxed min-h-[36px]">
                  {coupon.description || 'Special discount coupon applicable during checkout.'}
                </p>

                <div className="space-y-1.5 pt-3 border-t border-slate-200 text-[11px] text-slate-500">
                  <p>• Min Order Value: <span className="font-bold text-slate-800">₹{coupon.minOrderValue || 0}</span></p>
                  {coupon.maxDiscount && (
                    <p>• Max Discount Cap: <span className="font-bold text-slate-800">₹{coupon.maxDiscount}</span></p>
                  )}
                  <p>• Usage: <span className="font-bold text-slate-800">{coupon.usedCount || 0} redeemed</span> {coupon.usageLimit ? `(Limit: ${coupon.usageLimit})` : ''}</p>
                </div>

                {/* Footer */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 font-medium">
                    Valid till {new Date(coupon.validUntil || '2026-12-31').toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                  </span>

                  <button
                    type="button"
                    onClick={() => deleteCoupon(coupon._id)}
                    className="p-1.5 rounded-md text-rose-600 hover:text-rose-800 hover:bg-rose-50 border border-slate-200 transition-colors"
                    title="Delete Coupon"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Coupon Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create New Coupon Code"
          subtitle="Define promotional discount codes with thresholds and expiry"
        >
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-800 mb-1 uppercase tracking-wider text-[10px]">
                Coupon Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g. SUMMERREAD20, WELCOME50"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-md font-mono font-bold uppercase tracking-wider outline-hidden focus:border-slate-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1 uppercase tracking-wider text-[10px]">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g. 20% flat discount on books orders above ₹599"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-md font-medium outline-hidden focus:border-slate-900 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-800 mb-1 uppercase tracking-wider text-[10px]">Discount Type</label>
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-md font-bold outline-hidden focus:border-slate-900"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1 uppercase tracking-wider text-[10px]">
                  Discount Value <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                  placeholder={formData.discountType === 'percentage' ? 'e.g. 20 (for 20%)' : 'e.g. 150 (for ₹150)'}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-md font-bold outline-hidden focus:border-slate-900 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-800 mb-1 uppercase tracking-wider text-[10px]">Minimum Order Value (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.minOrderValue}
                  onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                  placeholder="e.g. 599"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-md font-medium outline-hidden focus:border-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1 uppercase tracking-wider text-[10px]">Maximum Discount Cap (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.maxDiscount || ''}
                  onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                  placeholder="e.g. 250 (leave empty for unlimited)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-md font-medium outline-hidden focus:border-slate-900 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-800 mb-1 uppercase tracking-wider text-[10px]">Usage Limit (Total uses)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.usageLimit || ''}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                  placeholder="e.g. 500"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-md font-medium outline-hidden focus:border-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1 uppercase tracking-wider text-[10px]">Valid Until</label>
                <input
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-md font-medium outline-hidden focus:border-slate-900 focus:bg-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-md">
              <input
                type="checkbox"
                id="isWelcomeCoupon"
                checked={formData.isWelcomeCoupon}
                onChange={(e) => setFormData({ ...formData, isWelcomeCoupon: e.target.checked })}
                className="w-4 h-4 text-emerald-800 border-slate-300 rounded"
              />
              <label htmlFor="isWelcomeCoupon" className="font-bold text-slate-800 cursor-pointer">
                Mark as First-Time Registration Welcome Coupon
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 font-bold border border-slate-300 rounded-md text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-md shadow-xs"
              >
                Create Coupon
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  );
}
