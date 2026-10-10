'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchBanners } from '@/lib/api';
import { HeroBannerSkeleton } from '@/components/Skeletons';

export const HeroBanner = () => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

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
        }
      } catch (err) {
        if (isMounted) {
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

  const currentBanner = banners.length > 0 ? banners[currentIndex] : null;
  const bannerImage = currentBanner?.image || '/banner.png';
  const mobileBannerImage = currentBanner?.mobileImage || bannerImage;
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
          alt="LOGOS Banner"
          referrerPolicy="no-referrer"
          loading="eager"
          crossOrigin="anonymous"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/banner.png';
          }}
          className="w-full h-full object-cover object-center block select-none transition-all duration-700 animate-in fade-in"
        />
      </picture>
    </div>
  );

  if (loading) {
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
