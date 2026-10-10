'use client';

import React, { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { HeroSliderPreview } from '@/components/HeroSliderPreview';
import { Modal } from '@/components/common/Modal';
import { Badge } from '@/components/common/Badge';
import { useStoreData } from '@/context/StoreDataContext';
import { useToast } from '@/context/ToastContext';
import { Plus, Edit3, Trash2, Upload, Sparkles, X, ImageIcon, ExternalLink } from 'lucide-react';

const SAMPLE_BANNER_PRESETS = [
  { name: 'Malayalam Literature Classic (Hero 1)', image: '/banner.png', position: 'hero' },
  { name: 'Festival Collection Spotlight (Hero 2)', image: '/a6596570bf1b78258701cededbec40dde96c7849.png', position: 'hero' },
  { name: 'Author Works Showcase (Hero 3)', image: '/f66b23b4bcdf731edbe393527a48ad68d2f69134.png', position: 'hero' },
  { name: 'Buy 1 Get 2 Combo (Above Bestsellers)', image: '/combo_banner.png', position: 'deal_of_day' }
];

const EMPTY_FORM = { image: '', mobileImage: '', position: 'hero', link: '/products', isActive: true };

export default function BannersPage() {
  const { banners = [], addBanner, updateBanner, deleteBanner } = useStoreData();
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [showPresets, setShowPresets] = useState(false);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });

  const handleOpenAdd = () => {
    setEditingBanner(null);
    setFormData({ ...EMPTY_FORM });
    setShowPresets(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      image: banner.image || '',
      mobileImage: banner.mobileImage || '',
      position: banner.position || 'hero',
      link: banner.link || '/products',
      isActive: banner.isActive !== false
    });
    setShowPresets(false);
    setIsModalOpen(true);
  };

  const handleFileUpload = (e, field = 'image') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result;
      if (base64) {
        setFormData((prev) => ({ ...prev, [field]: base64 }));
        showToast(field === 'mobileImage' ? 'Mobile banner image selected!' : 'Desktop banner image selected!', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.image) { showToast('Please upload a desktop banner image', 'error'); return; }
    const payload = { ...formData, title: formData.position === 'hero' ? 'LOGOS Hero Banner' : 'LOGOS Promo Banner' };
    if (editingBanner) {
      updateBanner(editingBanner._id, payload);
      showToast('Banner updated successfully!', 'success');
    } else {
      addBanner(payload);
      showToast('Banner added successfully!', 'success');
    }
    setIsModalOpen(false);
  };

  const handleToggleActive = (banner) => {
    updateBanner(banner._id, { isActive: !banner.isActive });
    showToast(`Banner marked as ${!banner.isActive ? 'Active' : 'Disabled'}`, 'info');
  };

  const handleDelete = (id) => { deleteBanner(id); showToast('Banner removed', 'info'); };

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Banner Management</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Manage Home Hero slider (3 s auto-transition) and Promo banners.
              Upload <strong>separate images</strong> for Desktop and Mobile views.
            </p>
          </div>
          <button type="button" onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-md shadow-xs transition-all active:scale-95 w-fit cursor-pointer">
            <Plus className="w-4 h-4" /> Add Banner Image
          </button>
        </div>

        {/* Live Hero Simulation */}
        {banners.length > 0 && (
          <div className="bg-white p-5 sm:p-6 border border-slate-200 rounded-md">
            <HeroSliderPreview banners={banners} />
          </div>
        )}

        {/* Banners Table */}
        <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Configured Banners ({banners.length})</h3>
            <span className="text-xs text-slate-400 font-medium">Auto-rotates every 3 seconds</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4 font-bold min-w-[160px]">Desktop Image</th>
                  <th className="py-3 px-4 font-bold min-w-[100px]">Mobile Image</th>
                  <th className="py-3 px-4 font-bold min-w-[160px]">Position</th>
                  <th className="py-3 px-4 font-bold min-w-[180px]">Redirect Link</th>
                  <th className="py-3 px-4 font-bold text-center min-w-[100px]">Status</th>
                  <th className="py-3 px-4 font-bold text-right min-w-[100px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {banners.length === 0 ? (
                  <tr><td colSpan={6} className="py-12 text-center text-slate-400">No banners yet. Click "Add Banner Image" to upload one.</td></tr>
                ) : (
                  banners.map((b) => (
                    <tr key={b._id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Desktop */}
                      <td className="py-3 px-4 align-middle">
                        <div className="w-36 h-20 border border-slate-200 rounded-md bg-slate-100 overflow-hidden shadow-2xs">
                          {b.image
                            ? <img src={b.image} alt="Desktop" className="w-full h-full object-cover object-center" />
                            : <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon className="w-5 h-5" /></div>}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">Desktop</p>
                      </td>
                      {/* Mobile */}
                      <td className="py-3 px-4 align-middle">
                        <div className="w-11 h-20 border border-slate-200 rounded-md bg-slate-100 overflow-hidden shadow-2xs">
                          {b.mobileImage
                            ? <img src={b.mobileImage} alt="Mobile" className="w-full h-full object-cover object-center" />
                            : <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-0.5">
                                <ImageIcon className="w-4 h-4" />
                                <span className="text-[8px] text-slate-400">None</span>
                              </div>}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">Mobile</p>
                      </td>
                      {/* Position */}
                      <td className="py-3 px-4 align-middle">
                        <span className={`px-2.5 py-1 text-[11px] font-bold rounded-md border ${b.position === 'deal_of_day' || b.position === 'above_bestseller' ? 'bg-amber-50 text-amber-900 border-amber-200' : 'bg-blue-50 text-blue-900 border-blue-200'}`}>
                          {b.position === 'deal_of_day' || b.position === 'above_bestseller' ? 'Above Bestsellers' : 'Hero Slider (Home Top)'}
                        </span>
                      </td>
                      {/* Link */}
                      <td className="py-3 px-4 align-middle font-mono text-[11px] text-slate-600">
                        <span className="flex items-center gap-1"><ExternalLink className="w-3.5 h-3.5 text-slate-400" />{b.link || '/products'}</span>
                      </td>
                      {/* Status */}
                      <td className="py-3 px-4 text-center align-middle whitespace-nowrap">
                        <button type="button" onClick={() => handleToggleActive(b)} className="cursor-pointer">
                          <Badge variant={b.isActive ? 'success' : 'default'}>{b.isActive ? 'Active' : 'Disabled'}</Badge>
                        </button>
                      </td>
                      {/* Actions */}
                      <td className="py-3 px-4 text-right align-middle whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button type="button" onClick={() => handleOpenEdit(b)} className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer" title="Edit Banner">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button type="button" onClick={() => handleDelete(b._id)} className="p-1.5 rounded-md text-rose-600 hover:text-rose-800 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer" title="Delete Banner">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add / Edit Modal */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
          title={editingBanner ? 'Edit Banner Graphic' : 'Upload Banner Graphic'}
          subtitle="Upload separate images for Desktop (landscape) and Mobile (portrait) views">
          <form onSubmit={handleSubmit} className="space-y-5 text-xs">

            {/* Position */}
            <div>
              <label className="block font-bold text-slate-800 mb-1 uppercase tracking-wider text-[10px]">
                Banner Placement <span className="text-rose-500">*</span>
              </label>
              <select value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-md font-semibold outline-hidden focus:border-slate-900">
                <option value="hero">Hero Slider (Home Top — 3 s Auto-Slide)</option>
                <option value="deal_of_day">Above Bestsellers (Middle Promo Slot)</option>
              </select>
            </div>

            {/* Desktop Banner */}
            <BannerUploadSection
              label="Desktop Banner Image"
              sublabel="Landscape / wide — shown on tablet & desktop (≥ 768 px)"
              required
              value={formData.image}
              onChange={(val) => setFormData((p) => ({ ...p, image: val }))}
              onFileChange={(e) => handleFileUpload(e, 'image')}
              previewClass="aspect-[21/8]"
              accentColor="emerald"
              showPresets={showPresets}
              onTogglePresets={() => setShowPresets(!showPresets)}
              presets={SAMPLE_BANNER_PRESETS}
              onSelectPreset={(p) => setFormData((prev) => ({ ...prev, image: p.image, position: p.position }))}
            />

            {/* Mobile Banner */}
            <BannerUploadSection
              label="Mobile Banner Image"
              sublabel="Portrait / tall — shown on phones (< 768 px). Falls back to desktop image if not set."
              required={false}
              value={formData.mobileImage}
              onChange={(val) => setFormData((p) => ({ ...p, mobileImage: val }))}
              onFileChange={(e) => handleFileUpload(e, 'mobileImage')}
              previewClass="aspect-[9/16] max-w-[160px] mx-auto"
              accentColor="purple"
            />

            {/* Click link */}
            <div>
              <label className="block font-bold text-slate-800 mb-1 uppercase tracking-wider text-[10px]">Target Click Link (Optional)</label>
              <input type="text" value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="/products or /books/slug"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-md font-medium outline-hidden focus:border-slate-900 focus:bg-white" />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
              <button type="button" onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 font-bold border border-slate-300 rounded-md text-slate-700 hover:bg-slate-100 cursor-pointer">Cancel</button>
              <button type="submit" className="px-5 py-2 font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-md shadow-xs cursor-pointer">
                {editingBanner ? 'Update Banner' : 'Save Banner'}
              </button>
            </div>
          </form>
        </Modal>

      </div>
    </AdminLayout>
  );
}

/* ─────────────── Reusable upload section ─────────────── */
function BannerUploadSection({
  label, sublabel, required,
  value, onChange, onFileChange,
  previewClass, accentColor = 'emerald',
  showPresets, onTogglePresets,
  presets = [], onSelectPreset
}) {
  const ac = accentColor === 'purple'
    ? { btn: 'text-purple-900 bg-purple-50 border border-purple-300 hover:bg-purple-100', icon: 'text-purple-700' }
    : { btn: 'text-emerald-900 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100', icon: 'text-emerald-700' };

  return (
    <div className="space-y-2 p-3.5 border border-slate-200 rounded-md bg-slate-50/40">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
            {label} {required && <span className="text-rose-500">*</span>}
          </p>
          {sublabel && <p className="text-[10px] text-slate-400 mt-0.5">{sublabel}</p>}
        </div>
        {onTogglePresets && (
          <button type="button" onClick={onTogglePresets}
            className={`text-[11px] font-bold ${ac.btn} rounded-xs px-2 py-0.5 flex items-center gap-1 cursor-pointer shrink-0`}>
            <Sparkles className="w-3 h-3" />
            {showPresets ? 'Hide Presets' : 'Sample Presets'}
          </button>
        )}
      </div>

      {showPresets && presets.length > 0 && (
        <div className="p-2.5 bg-white border border-emerald-200 rounded-md grid grid-cols-2 gap-2">
          {presets.map((p, i) => (
            <button key={i} type="button" onClick={() => onSelectPreset?.(p)}
              className="border border-slate-300 hover:border-slate-900 rounded-xs text-left bg-white overflow-hidden p-1.5 flex items-center gap-2 cursor-pointer">
              <img src={p.image} alt={p.name} className="w-16 h-10 object-cover rounded-xs shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-800 truncate">{p.name}</p>
                <p className="text-[10px] text-slate-400 capitalize">{p.position}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <label className="flex-1 px-4 py-2.5 bg-white hover:bg-slate-50 border border-dashed border-slate-400 hover:border-slate-900 rounded-md cursor-pointer flex items-center justify-center gap-2 font-bold text-slate-800 transition-colors">
          <Upload className={`w-4 h-4 ${ac.icon}`} />
          <span>Choose File from Device</span>
          <input type="file" accept="image/*" onChange={onFileChange} className="sr-only" />
        </label>
        <span className="text-[10px] text-slate-400 font-bold uppercase text-center">OR</span>
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
          placeholder="Paste image URL…"
          className="flex-1 px-3.5 py-2 bg-white border border-slate-300 rounded-md text-xs font-medium outline-hidden focus:border-slate-900" />
      </div>

      {value ? (
        <div className={`relative ${previewClass} border border-slate-300 rounded-md bg-slate-900 overflow-hidden`}>
          <img src={value} alt="Preview" className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'; }} />
          <div className="hidden absolute inset-0 items-center justify-center bg-slate-100 text-slate-500 text-xs font-bold flex-col gap-1">
            <ImageIcon className="w-6 h-6 text-slate-400" /><span>Unable to load image.</span>
          </div>
          <button type="button" onClick={() => onChange('')}
            className="absolute top-2 right-2 p-1 bg-slate-900/80 hover:bg-rose-700 text-white text-[10px] font-bold rounded-xs px-2 py-0.5 flex items-center gap-1 transition-colors cursor-pointer">
            <X className="w-3 h-3" /> Remove
          </button>
        </div>
      ) : (
        <div className="p-3 border border-dashed border-slate-200 rounded-md bg-white text-center text-[10px] text-slate-400">No image selected.</div>
      )}
    </div>
  );
}
