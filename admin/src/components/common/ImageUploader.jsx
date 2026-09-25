'use client';

import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon, Plus, Sparkles, Check } from 'lucide-react';

const PRESET_BOOK_COVERS = [
  { label: 'Classic Literature', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80' },
  { label: 'Vintage Cover', url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=80' },
  { label: 'Modern Hardcover', url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80' },
  { label: 'Interior Sample', url: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&auto=format&fit=crop&q=80' },
  { label: 'Back Cover Spine', url: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=600&auto=format&fit=crop&q=80' },
  { label: 'Fantasy Edition', url: 'https://images.unsplash.com/photo-1618666012174-83b441c0bc76?w=600&auto=format&fit=crop&q=80' }
];

export const ImageUploader = ({ images = [], onChange, minImages = 3, maxImages = 6 }) => {
  const [urlInput, setUrlInput] = useState('');
  const [showPresets, setShowPresets] = useState(false);

  const handleAddUrl = (e) => {
    e?.preventDefault();
    if (!urlInput.trim()) return;
    if (images.length >= maxImages) return;

    onChange([...images, urlInput.trim()]);
    setUrlInput('');
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result;
        if (base64 && images.length < maxImages) {
          onChange((prev) => [...prev, base64]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemove = (index) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleSelectPreset = (url) => {
    if (images.includes(url)) return;
    if (images.length >= maxImages) return;
    onChange([...images, url]);
  };

  const slots = ['Front Cover Photo', 'Back Cover Photo', 'Interior / Sample Page', 'Extra View 1', 'Extra View 2', 'Extra View 3'];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-emerald-800" />
            Product Images <span className="text-rose-500">*</span>
          </label>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload up to {maxImages} high-resolution photos (Minimum {minImages} recommended for customer storefront).
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowPresets(!showPresets)}
          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-md px-2.5 py-1.5 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          {showPresets ? 'Hide Sample Presets' : 'Sample Book Covers'}
        </button>
      </div>

      {/* Preset Pickers */}
      {showPresets && (
        <div className="p-3 bg-slate-50 border border-emerald-300 rounded-md animate-in fade-in duration-200">
          <p className="text-xs font-bold text-slate-700 mb-2">Click to quickly attach demo covers:</p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {PRESET_BOOK_COVERS.map((preset, idx) => {
              const isSelected = images.includes(preset.url);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(preset.url)}
                  disabled={isSelected || images.length >= maxImages}
                  className={`group relative border rounded-md overflow-hidden text-left transition-all ${
                    isSelected
                      ? 'border-emerald-600 ring-2 ring-emerald-500/20 opacity-60'
                      : 'border-slate-300 hover:border-slate-800'
                  }`}
                >
                  <img src={preset.url} alt={preset.label} className="w-full h-16 object-cover" />
                  <span className="block text-[10px] font-bold text-slate-700 truncate px-1 py-0.5 bg-white border-t border-slate-200">
                    {preset.label}
                  </span>
                  {isSelected && (
                    <div className="absolute top-1 right-1 bg-emerald-800 text-white rounded-xs p-0.5">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Image Slots Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Array.from({ length: Math.max(3, images.length + (images.length < maxImages ? 1 : 0)) }).slice(0, maxImages).map((_, index) => {
          const imgUrl = images[index];
          const slotLabel = slots[index] || `Photo ${index + 1}`;

          if (imgUrl) {
            return (
              <div
                key={index}
                className="relative group aspect-3/4 border-2 border-slate-300 rounded-md overflow-hidden bg-slate-50 transition-all"
              >
                <img src={imgUrl} alt={slotLabel} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-white bg-black/80 rounded-xs px-1.5 py-0.5">
                      {slotLabel}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemove(index)}
                      className="p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xs transition-colors"
                      title="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {index === 0 && (
                    <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/90 rounded-xs px-2 py-0.5 self-start">
                      Main Cover
                    </span>
                  )}
                </div>
              </div>
            );
          }

          return (
            <label
              key={index}
              className="relative aspect-3/4 border-2 border-dashed border-slate-300 hover:border-slate-800 rounded-md bg-slate-50 hover:bg-slate-100 transition-all flex flex-col items-center justify-center p-4 cursor-pointer text-center group"
            >
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="sr-only"
              />
              <div className="w-8 h-8 bg-white border border-slate-300 rounded-md text-slate-600 group-hover:text-slate-950 flex items-center justify-center mb-2 transition-colors">
                <Plus className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800">
                {slotLabel}
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5">Upload image</span>
            </label>
          );
        })}
      </div>

      {/* URL Direct Add Bar */}
      <div className="flex gap-2 pt-1">
        <input
          type="url"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="Or paste direct image URL (https://...)"
          className="flex-1 text-xs px-3.5 py-2.5 border border-slate-300 rounded-md focus:outline-hidden focus:border-slate-900 bg-white"
        />
        <button
          type="button"
          onClick={handleAddUrl}
          disabled={!urlInput.trim() || images.length >= maxImages}
          className="px-4 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
        >
          <Upload className="w-3.5 h-3.5" />
          Add URL
        </button>
      </div>

      {images.length < minImages && (
        <p className="text-[11px] font-bold text-amber-700">
          ⚠️ Please add at least {minImages - images.length} more image(s) to reach the recommended minimum of {minImages}.
        </p>
      )}
    </div>
  );
};
