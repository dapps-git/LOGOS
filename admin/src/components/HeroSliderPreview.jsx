'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, Play, Pause } from 'lucide-react';

export const HeroSliderPreview = ({ banners = [] }) => {
  const activeBanners = banners.filter((b) => b.isActive && b.position === 'hero').slice(0, 5);
  const displayBanners = activeBanners.length > 0 ? activeBanners : banners.slice(0, 3);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying || displayBanners.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayBanners.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [isPlaying, displayBanners.length]);

  if (!displayBanners.length) return null;

  const currentBanner = displayBanners[currentIndex] || displayBanners[0];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? displayBanners.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % displayBanners.length);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Live Home Hero Slider Simulation (3-Slide Auto-Animation)
          </h4>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 hover:bg-slate-100 rounded-sm transition-colors text-slate-600 flex items-center gap-1 text-[11px] border border-slate-200"
            title={isPlaying ? 'Pause auto-slide' : 'Play auto-slide'}
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

      {/* Slider Viewport */}
      <div className="relative aspect-16/7 sm:aspect-21/8 overflow-hidden rounded-md border border-slate-300 group bg-slate-900">
        {/* Background Image with Transition */}
        {displayBanners.map((banner, idx) => (
          <div
            key={banner._id || idx}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <img
              src={banner.image}
              alt={banner.title}
              className="w-full h-full object-cover transform scale-105 transition-transform duration-7000 ease-out"
            />
            {/* Dark & Gradient Overlay for Contrast */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/55 to-transparent" />
          </div>
        ))}

        {/* Slide Content Overlay */}
        <div className="relative z-20 h-full flex flex-col justify-center max-w-xl p-6 sm:p-10 text-white space-y-2 sm:space-y-3">
          {currentBanner.badge && (
            <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold bg-amber-400 text-slate-950 rounded-xs w-fit animate-in slide-in-from-top-2 duration-300 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
              {currentBanner.badge}
            </span>
          )}

          <h3 className="text-xl sm:text-3xl font-black uppercase tracking-tight text-white leading-tight drop-shadow-md">
            {currentBanner.title}
          </h3>

          {currentBanner.subtitle && (
            <p className="text-xs sm:text-sm font-medium text-slate-200 line-clamp-2 drop-shadow-xs">
              {currentBanner.subtitle}
            </p>
          )}

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold bg-emerald-700 hover:bg-emerald-600 text-white rounded-md transition-colors"
            >
              {currentBanner.buttonText || 'Explore Collection'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {currentBanner.discountText && (
              <span className="text-xs font-bold text-amber-300 bg-amber-950/80 border border-amber-500/30 rounded-md px-2.5 py-1.5 backdrop-blur-xs">
                {currentBanner.discountText}
              </span>
            )}
          </div>
        </div>

        {/* Prev / Next Arrows */}
        <button
          type="button"
          onClick={handlePrev}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-30 p-2 bg-black/60 hover:bg-black/80 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-30 p-2 bg-black/60 hover:bg-black/80 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Bottom Slide Indicators */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5">
          {displayBanners.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentIndex ? 'w-6 bg-emerald-400' : 'w-2 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
