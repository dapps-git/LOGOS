'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

export const HeroSliderPreview = ({ banners = [] }) => {
  const activeBanners = banners.filter((b) => b.isActive !== false && (b.position === 'hero' || !b.position)).slice(0, 5);
  const displayBanners = activeBanners.length > 0 ? activeBanners : banners.slice(0, 3);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 3-Second Auto-Transition
  useEffect(() => {
    if (!mounted || !isPlaying || displayBanners.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayBanners.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [mounted, isPlaying, displayBanners.length]);

  if (!mounted || !displayBanners.length) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Live Home Hero Banner Simulation (3-Second Auto-Transition)
          </h4>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 hover:bg-slate-100 rounded-sm transition-colors text-slate-600 flex items-center gap-1 text-[11px] border border-slate-200 cursor-pointer"
            title={isPlaying ? 'Pause simulation' : 'Play simulation'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <span className="text-slate-300">|</span>
          <span className="text-[11px] font-bold text-slate-700">
            Slide {currentIndex + 1} of {displayBanners.length}
          </span>
        </div>
      </div>

      {/* Pure Banner Graphic Simulation Viewport */}
      <div className="relative aspect-16/7 sm:aspect-21/8 overflow-hidden rounded-md border border-slate-200 group bg-slate-900 shadow-xs">
        {displayBanners.map((banner, idx) => (
          <div
            key={banner._id || idx}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <img
              src={banner.image}
              alt="Hero Banner"
              className="w-full h-full object-cover object-center block"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
