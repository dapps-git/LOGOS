'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchBanners } from '@/lib/api';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
          if (heroBanners.length > 0) {
            setBanners(heroBanners);
          }
        }
      } catch (err) {
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [banners.length]);

  const currentBanner = banners.length > 0 ? banners[currentIndex] : null;
  const bannerImage = currentBanner?.image || '/banner.png';
  const bannerAlt = currentBanner?.title || 'ഋതുക്കളെ തോൽപ്പിച്ച മരം - വി. ടി. പ്രതീഷ്';
  const bannerLink = currentBanner?.link || null;

  const content = (
    <div className="relative w-full overflow-hidden select-none group">
      <img
        src={bannerImage}
        alt={bannerAlt}
        className="w-full h-auto block select-none transition-opacity duration-500"
      />

      {banners.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setCurrentIndex((prev) => (prev + 1) % banners.length);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/20 backdrop-blur-xs px-2.5 py-1 rounded-full">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`h-2 rounded-full transition-all ${
                  idx === currentIndex ? 'w-6 bg-white' : 'w-2 bg-white/50'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );

  if (loading) {
    return <HeroBannerSkeleton />;
  }

  return (
    <section className="relative w-full overflow-hidden bg-white">
      {bannerLink ? (
        <Link href={bannerLink} className="block w-full">
          {content}
        </Link>
      ) : (
        content
      )}
    </section>
  );
};
