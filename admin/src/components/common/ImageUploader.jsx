'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Plus, Sparkles, Check, AlertCircle } from 'lucide-react';

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Guarantee array type
  const safeImages = Array.isArray(images) ? images : [];

  const handleAddUrl = (e) => {
    e?.preventDefault();
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (safeImages.length >= maxImages) return;

    const nextList = [...safeImages, trimmed];
    onChange?.(nextList);
    setUrlInput('');
  };

  const processFiles = async (filesList) => {
    const files = Array.from(filesList || []).filter((f) => f.type.startsWith('image/'));
    if (!files.length) return;

    setIsProcessing(true);
    try {
      const readPromises = files.map((file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            resolve(event.target?.result);
          };
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(file);
        });
      });

      const results = await Promise.all(readPromises);
      const validResults = results.filter(Boolean);

      const availableSlots = maxImages - safeImages.length;
      const toAdd = validResults.slice(0, availableSlots);

      if (toAdd.length > 0) {
        const nextList = [...safeImages, ...toAdd];
        onChange?.(nextList);
      }
    } catch (err) {
      console.error('[ImageUploader] Error reading file:', err);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileInputChange = (e) => {
    processFiles(e.target.files);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer?.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleRemove = (index) => {
    const updated = safeImages.filter((_, i) => i !== index);
    onChange?.(updated);
  };

  const handleSelectPreset = (url) => {
    if (safeImages.includes(url)) return;
    if (safeImages.length >= maxImages) return;
    onChange?.([...safeImages, url]);
  };

  const slots = [
    'Front Cover Photo',
    'Back Cover Photo',
    'Interior / Sample Page',
    'Extra View 1',
    'Extra View 2',
    'Extra View 3'
  ];

  // Number of slot boxes to show: at least 3, or current count + 1 up to maxImages
  const totalSlotsCount = Math.min(maxImages, Math.max(minImages, safeImages.length + (safeImages.length < maxImages ? 1 : 0)));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-[#1E3A8A]" />
            Product Images <span className="text-rose-500">*</span>
          </label>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload up to {maxImages} high-resolution photos (Minimum {minImages} recommended for storefront).
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowPresets(!showPresets)}
          className="inline-flex items-center gap-1 text-xs font-bold text-[#1E3A8A] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md px-2.5 py-1.5 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          {showPresets ? 'Hide Sample Presets' : 'Sample Book Covers'}
        </button>
      </div>

      {/* Preset Pickers */}
      {showPresets && (
        <div className="p-3 bg-slate-50 border border-blue-200 rounded-md animate-in fade-in duration-200">
          <p className="text-xs font-bold text-slate-700 mb-2">Click to quickly attach demo covers:</p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {PRESET_BOOK_COVERS.map((preset, idx) => {
              const isSelected = safeImages.includes(preset.url);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(preset.url)}
                  disabled={isSelected || safeImages.length >= maxImages}
                  className={`group relative border rounded-md overflow-hidden text-left transition-all ${
                    isSelected
                      ? 'border-[#1E3A8A] ring-2 ring-blue-500/20 opacity-60'
                      : 'border-slate-300 hover:border-slate-800'
                  }`}
                >
                  <img src={preset.url} alt={preset.label} className="w-full h-16 object-cover" />
                  <span className="block text-[10px] font-bold text-slate-700 truncate px-1 py-0.5 bg-white border-t border-slate-200">
                    {preset.label}
                  </span>
                  {isSelected && (
                    <div className="absolute top-1 right-1 bg-[#1E3A8A] text-white rounded-xs p-0.5">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Hidden Master File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Image Slots Grid */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`grid grid-cols-2 sm:grid-cols-3 gap-3 p-1 rounded-xl transition-all ${
          dragOver ? 'ring-2 ring-[#1E3A8A] bg-blue-50/40' : ''
        }`}
      >
        {Array.from({ length: totalSlotsCount }).map((_, index) => {
          const imgUrl = safeImages[index];
          const slotLabel = slots[index] || `Photo ${index + 1}`;

          if (imgUrl) {
            return (
              <div
                key={`filled-${index}`}
                className="relative group aspect-3/4 border-2 border-slate-300 rounded-md overflow-hidden bg-slate-100 transition-all shadow-2xs"
              >
                <img
                  src={imgUrl}
                  alt={slotLabel}
                  className="w-full h-full object-cover select-none"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/book1.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-white bg-black/80 rounded-xs px-1.5 py-0.5">
                      {slotLabel}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemove(index)}
                      className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-md transition-colors"
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
              key={`empty-${index}`}
              className="relative aspect-3/4 border-2 border-dashed border-slate-300 hover:border-[#1E3A8A] rounded-md bg-slate-50 hover:bg-blue-50/40 transition-all flex flex-col items-center justify-center p-4 cursor-pointer text-center group"
            >
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileInputChange}
                className="sr-only"
              />
              <div className="w-8 h-8 bg-white border border-slate-300 group-hover:border-[#1E3A8A] rounded-md text-slate-600 group-hover:text-[#1E3A8A] flex items-center justify-center mb-2 transition-colors shadow-2xs">
                <Plus className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-[#1E3A8A] transition-colors">
                {slotLabel}
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5">
                {isProcessing ? 'Reading photo...' : 'Click or drop photo'}
              </span>
            </label>
          );
        })}
      </div>

      {/* URL Direct Add Bar */}
      <div className="flex gap-2 pt-1">
        <input
          type="text"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddUrl();
            }
          }}
          placeholder="Or paste direct image URL (/book1.jpg, https://...)"
          className="flex-1 text-xs px-3.5 py-2.5 border border-slate-300 rounded-md focus:outline-hidden focus:border-[#1E3A8A] bg-white"
        />
        <button
          type="button"
          onClick={handleAddUrl}
          disabled={!urlInput.trim() || safeImages.length >= maxImages}
          className="px-4 py-2 text-xs font-bold bg-[#1E3A8A] hover:bg-[#152e72] text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
        >
          <Upload className="w-3.5 h-3.5" />
          Add URL
        </button>
      </div>

      {/* Progress & Validation Messages */}
      {safeImages.length < minImages && (
        <p className="text-[11px] font-bold text-amber-700 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>
            Please add at least {minImages - safeImages.length} more image(s) to reach the recommended minimum of {minImages}.
          </span>
        </p>
      )}
    </div>
  );
};

export default ImageUploader;
