'use client';

import React, { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { HeroSliderPreview } from '@/components/HeroSliderPreview';
import { Modal } from '@/components/common/Modal';
import { Badge } from '@/components/common/Badge';
import { useStoreData } from '@/context/StoreDataContext';
import { useToast } from '@/context/ToastContext';
import { Plus, Edit3, Trash2, Upload, Sparkles, X, ImageIcon } from 'lucide-react';

const SAMPLE_BANNER_PRESETS = [
  {
    title: 'The Choices That Change Your Life',
    subtitle: 'Curated Classics & Mindset Bestsellers',
    image: 'https://images.unsplash.com/photo-1507842229451-797177793d52?w=1200&auto=format&fit=crop&q=80'
  },
  {
    title: 'Discover Rare & Antique Editions',
    subtitle: 'Hand-picked literature by master authors',
    image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200&auto=format&fit=crop&q=80'
  },
  {
    title: 'Summer Reading Festival - 40% OFF',
    subtitle: 'Special discounts on philosophy & finance books',
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1200&auto=format&fit=crop&q=80'
  }
];

export default function BannersPage() {
  const { banners = [], addBanner, updateBanner, deleteBanner } = useStoreData();
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [showPresets, setShowPresets] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    badge: 'Special Offer',
    image: '',
    mobileImage: '',
    buttonText: 'Explore Collection',
    link: '/books',
    position: 'hero',
    discountText: 'Flat 30% OFF',
    isActive: true
  });

  const handleOpenAdd = () => {
    setEditingBanner(null);
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      badge: 'Special Offer',
      image: 'https://images.unsplash.com/photo-1507842229451-797177793d52?w=1200&auto=format&fit=crop&q=80',
      mobileImage: '',
      buttonText: 'Explore Collection',
      link: '/books',
      position: 'hero',
      discountText: 'Flat 30% OFF',
      isActive: true
    });
    setShowPresets(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      description: banner.description || '',
      badge: banner.badge || 'Special Offer',
      image: banner.image || '',
      mobileImage: banner.mobileImage || '',
      buttonText: banner.buttonText || 'Explore Collection',
      link: banner.link || '/books',
      position: banner.position || 'hero',
      discountText: banner.discountText || '',
      isActive: banner.isActive !== false
    });
    setShowPresets(false);
    setIsModalOpen(true);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result;
      if (base64) {
        setFormData((prev) => ({ ...prev, image: base64 }));
        showToast('Local image loaded successfully!', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.image) {
      showToast('Title and Image are required', 'error');
      return;
    }

    if (editingBanner) {
      updateBanner(editingBanner._id, formData);
      showToast('Banner updated successfully!', 'success');
    } else {
      addBanner(formData);
      showToast('Banner created successfully!', 'success');
    }

    setIsModalOpen(false);
  };

  const handleToggleActive = (banner) => {
    updateBanner(banner._id, { isActive: !banner.isActive });
    showToast(`Banner marked as ${!banner.isActive ? 'Active' : 'Inactive'}`, 'info');
  };

  const handleDelete = (id) => {
    deleteBanner(id);
    showToast('Banner deleted', 'info');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Banner Management</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Customize home hero slider banners with 3-slide animation, deal spotlights, and promos.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-md shadow-xs transition-all active:scale-95 w-fit"
          >
            <Plus className="w-4 h-4" />
            Add New Banner
          </button>
        </div>

        {/* Live 3-Slide Animated Hero Preview */}
        {banners.length > 0 && (
          <div className="bg-white p-5 sm:p-6 border border-slate-200 rounded-md">
            <HeroSliderPreview banners={banners} />
          </div>
        )}

        {/* Banners List Table */}
        <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">All Configured Banners ({banners.length})</h3>
            <span className="text-xs text-slate-400 font-medium">Position: Hero Slider & Spotlights</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4 font-bold min-w-[130px]">Banner Preview</th>
                  <th className="py-3 px-4 font-bold min-w-[220px]">Title & Subtitle</th>
                  <th className="py-3 px-4 font-bold min-w-[120px]">Badge / Tag</th>
                  <th className="py-3 px-4 font-bold min-w-[110px]">Position</th>
                  <th className="py-3 px-4 font-bold text-center min-w-[100px]">Status</th>
                  <th className="py-3 px-4 font-bold text-right min-w-[100px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {banners.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No banners configured yet. Click &quot;Add New Banner&quot; to create one.
                    </td>
                  </tr>
                ) : (
                  banners.map((b) => (
                    <tr key={b._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 align-middle">
                        <div className="w-24 h-14 border border-slate-300 rounded-xs bg-slate-100 overflow-hidden">
                          <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
                        </div>
                      </td>

                      <td className="py-3 px-4 max-w-xs align-middle">
                        <p className="font-bold text-slate-900 truncate">{b.title}</p>
                        <p className="text-[11px] text-slate-500 truncate">{b.subtitle || 'No subtitle'}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-mono">Link: {b.link}</p>
                      </td>

                      <td className="py-3 px-4 align-middle">
                        {b.badge ? (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-xs bg-amber-50 text-amber-900 border border-amber-300">
                            {b.badge}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>

                      <td className="py-3 px-4 align-middle">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-xs bg-slate-100 text-slate-800 uppercase border border-slate-200">
                          {b.position || 'hero'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center align-middle whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(b)}
                          className="cursor-pointer"
                        >
                          <Badge variant={b.isActive ? 'success' : 'default'}>
                            {b.isActive ? 'Active' : 'Disabled'}
                          </Badge>
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right align-middle whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(b)}
                            className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
                            title="Edit Banner"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(b._id)}
                            className="p-1.5 rounded-md text-rose-600 hover:text-rose-800 hover:bg-rose-50 border border-slate-200 transition-colors"
                            title="Delete Banner"
                          >
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

        {/* Add/Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingBanner ? 'Edit Banner' : 'Create Home Hero Banner'}
          subtitle="Configure visual banners with direct file upload or image URL"
        >
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-800 mb-1 uppercase tracking-wider text-[10px]">
                Banner Headline / Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. The Choices That Change Your Life"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-md font-bold outline-hidden focus:border-slate-900 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-800 mb-1 uppercase tracking-wider text-[10px]">Subtitle</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="e.g. Curated Classics & Mindset Bestsellers"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-md font-medium outline-hidden focus:border-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1 uppercase tracking-wider text-[10px]">Badge Pill Text</label>
                <input
                  type="text"
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  placeholder="e.g. Special Offer, Trending Now"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-md font-medium outline-hidden focus:border-slate-900 focus:bg-white"
                />
              </div>
            </div>

            {/* Banner Image Upload Area with Choose File */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                  Banner Image <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowPresets(!showPresets)}
                  className="text-[11px] font-bold text-emerald-900 bg-emerald-50 border border-emerald-300 rounded-xs px-2 py-0.5 hover:bg-emerald-100 flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  {showPresets ? 'Hide Presets' : 'Sample Presets'}
                </button>
              </div>

              {/* Sample Presets */}
              {showPresets && (
                <div className="p-2.5 bg-slate-50 border border-emerald-300 rounded-md grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {SAMPLE_BANNER_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          image: p.image,
                          title: prev.title || p.title,
                          subtitle: prev.subtitle || p.subtitle
                        }));
                      }}
                      className="border border-slate-300 hover:border-slate-900 rounded-xs text-left bg-white overflow-hidden"
                    >
                      <img src={p.image} alt={p.title} className="w-full h-12 object-cover" />
                      <p className="p-1 text-[10px] font-bold text-slate-800 truncate">{p.title}</p>
                    </button>
                  ))}
                </div>
              )}

              {/* Choose File / Upload Local Image */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <label className="flex-1 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-400 hover:border-slate-900 rounded-md cursor-pointer flex items-center justify-center gap-2 text-xs font-bold text-slate-800 transition-colors">
                  <Upload className="w-4 h-4 text-emerald-800" />
                  <span>Choose File from Device</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="sr-only"
                  />
                </label>

                <span className="text-[10px] text-slate-400 font-bold uppercase text-center sm:text-left">OR URL:</span>

                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="Paste direct Image URL (https://...)"
                  className="flex-1 px-3.5 py-2 bg-white border border-slate-300 rounded-md text-xs font-medium outline-hidden focus:border-slate-900"
                />
              </div>

              {/* Image Preview */}
              {formData.image ? (
                <div className="relative aspect-21/8 border border-slate-300 rounded-md bg-slate-900 overflow-hidden mt-2">
                  <img
                    src={formData.image}
                    alt="Banner preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const fallback = e.target.nextSibling;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <div className="hidden absolute inset-0 items-center justify-center bg-slate-100 text-slate-500 text-xs font-bold flex-col gap-1">
                    <ImageIcon className="w-6 h-6 text-slate-400" />
                    <span>Unable to load image. Please choose another file or URL.</span>
                  </div>

                  <div className="absolute top-2 right-2 flex gap-1">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image: '' })}
                      className="p-1 bg-slate-900/80 hover:bg-rose-700 text-white text-[10px] font-bold rounded-xs px-2 py-0.5 flex items-center gap-1 transition-colors"
                    >
                      <X className="w-3 h-3" /> Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 border border-dashed border-slate-200 rounded-md bg-slate-50 text-center text-xs text-slate-400">
                  No image selected yet. Click &quot;Choose File from Device&quot; or paste a link above.
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-800 mb-1 uppercase tracking-wider text-[10px]">CTA Button Text</label>
                <input
                  type="text"
                  value={formData.buttonText}
                  onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                  placeholder="e.g. Explore Collection"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-md font-medium outline-hidden focus:border-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1 uppercase tracking-wider text-[10px]">Target Link / URL</label>
                <input
                  type="text"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="/books?theme=Self-Help"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-md font-medium outline-hidden focus:border-slate-900 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-800 mb-1 uppercase tracking-wider text-[10px]">Offer Tag / Discount</label>
                <input
                  type="text"
                  value={formData.discountText}
                  onChange={(e) => setFormData({ ...formData, discountText: e.target.value })}
                  placeholder="Flat 40% OFF"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-md font-medium outline-hidden focus:border-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1 uppercase tracking-wider text-[10px]">Display Position</label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-md font-semibold outline-hidden focus:border-slate-900"
                >
                  <option value="hero">Hero Slider (Home Top)</option>
                  <option value="deal_of_day">Deal of the Day</option>
                  <option value="footer_spotlight">Footer Spotlight</option>
                  <option value="sidebar">Sidebar Spotlight</option>
                </select>
              </div>
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
                {editingBanner ? 'Update Banner' : 'Create Banner'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  );
}
