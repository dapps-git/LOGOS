'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchBanners, optimizeImageUrl } from '@/lib/api';
import { HeroBannerSkeleton } from '@/components/Skeletons';

export const HeroBanner = () => {
  // Instant SWR state: Load cached banners from session if available
  const [banners, setBanners] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = sessionStorage.getItem('logos_cached_hero_banners');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return [];
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = sessionStorage.getItem('logos_cached_hero_banners');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return false;
        }
      } catch {}
    }
    return true;
  });

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const data = await fetchBanners();
        if (isMounted && Array.isArray(data)) {
          const heroBanners = data.filter(
            (b) => b.isActive !== false && (b.position === 'hero' || !b.position)
          );
          setBanners(heroBanners);
          try {
            sessionStorage.setItem('logos_cached_hero_banners', JSON.stringify(heroBanners));
          } catch {}
        }
      } catch (err) {
        if (isMounted && banners.length === 0) {
          setBanners([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // 3-Second Auto-Transition
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [banners.length]);

  // Pre-cache next banner slide in browser memory
  useEffect(() => {
    if (banners.length <= 1 || typeof window === 'undefined') return;
    const nextIdx = (currentIndex + 1) % banners.length;
    const nextImgUrl = optimizeImageUrl(banners[nextIdx]?.image, { width: 1920 });
    if (nextImgUrl) {
      const img = new Image();
      img.src = nextImgUrl;
    }
  }, [currentIndex, banners]);

  const currentBanner = banners.length > 0 ? banners[currentIndex] : null;
  const rawBannerImage = currentBanner?.image || '/banner.png';
  const rawMobileBannerImage = currentBanner?.mobileImage || rawBannerImage;

  // Cloudinary compressed image URLs (WebP/AVIF auto formats)
  const bannerImage = optimizeImageUrl(rawBannerImage, { width: 1920, quality: 'auto' });
  const mobileBannerImage = optimizeImageUrl(rawMobileBannerImage, { width: 768, quality: 'auto' });
  const bannerLink = currentBanner?.link || null;

  const content = (
    <div className="relative w-full h-[100dvh] min-h-[100svh] overflow-hidden select-none bg-slate-900 flex items-center justify-center">
      <picture key={bannerImage} className="w-full h-full block">
        {/* Mobile-specific image (< 768px) */}
        {mobileBannerImage !== bannerImage && (
          <source media="(max-width: 767px)" srcSet={mobileBannerImage} />
        )}
        {/* Desktop image (default / fallback) */}
        <img
          src={bannerImage}
          alt={currentBanner?.title || 'LOGOS Banner'}
          referrerPolicy="no-referrer"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          crossOrigin="anonymous"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/banner.png';
          }}
          className="w-full h-full object-cover object-center block select-none transition-opacity duration-500 animate-in fade-in"
        />
      </picture>
    </div>
  );

  if (loading && banners.length === 0) {
    return <HeroBannerSkeleton />;
  }

  if (banners.length === 0) {
    return null;
  }

  return (
    <section className="relative w-full h-[100dvh] min-h-[100svh] overflow-hidden bg-white">
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
