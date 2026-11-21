'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchBanners, optimizeImageUrl } from '@/lib/api';
import { HeroBannerSkeleton } from '@/components/Skeletons';

export const HeroBanner = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch active hero banners from API
  useEffect(() => {
    let isMounted = true;
    try {
      localStorage.removeItem('logos_cached_hero_banners');
    } catch {}

    async function load() {
      try {
        const data = await fetchBanners();
        if (isMounted && Array.isArray(data)) {
          const heroBanners = data.filter(
            (b) => b.isActive !== false && (b.position === 'hero' || !b.position)
          );
          setBanners(heroBanners);
        }
      } catch (err) {
        console.warn('[LOGOS] Error loading hero banners:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // 3-Second Auto-Transition between dynamic banners
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [banners.length]);

  // Pre-cache next banner slide in browser memory (skipping data URLs)
  useEffect(() => {
    if (banners.length <= 1 || typeof window === 'undefined') return;
    const nextIdx = (currentIndex + 1) % banners.length;
    const nextImgUrl = optimizeImageUrl(banners[nextIdx]?.image, { width: 1920 });
    if (nextImgUrl && !nextImgUrl.startsWith('data:')) {
      const img = new Image();
      img.src = nextImgUrl;
    }
  }, [currentIndex, banners]);

  if (loading && banners.length === 0) {
    return <HeroBannerSkeleton />;
  }

  if (!banners || banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex] || banners[0];
  const bannerImage = optimizeImageUrl(currentBanner?.image, { width: 1920, quality: 'auto' });
  const bannerLink = currentBanner?.link || null;

  if (!bannerImage) return null;

  const content = (
    <div className="relative w-full aspect-[16/9] sm:aspect-[16/9] md:aspect-auto md:h-[100dvh] md:min-h-[100svh] overflow-hidden select-none bg-slate-900 flex items-center justify-center">
      <img
        key={currentBanner?._id || currentIndex}
        src={bannerImage}
        alt={currentBanner?.title || 'LOGOS Banner'}
        referrerPolicy="no-referrer"
        loading="eager"
        fetchPriority="high"
        decoding="async"
        className="w-full h-full object-cover object-center block select-none transition-opacity duration-500 animate-in fade-in"
      />

      {/* Slide Navigation Dots if multiple banners exist */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-black/40 backdrop-blur-xs px-3 py-1.5 rounded-full">
          {banners.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                currentIndex === idx ? 'w-6 bg-white' : 'w-1.5 bg-white/60 hover:bg-white/90'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <section className="relative w-full pt-16 sm:pt-20 md:pt-0 md:h-[100dvh] md:min-h-[100svh] overflow-hidden bg-white">
      {bannerLink ? (
        <Link href={bannerLink} className="block w-full h-full">
          {content}
        </Link>
      ) : (
        content
      )}
    </section>
  );
};
