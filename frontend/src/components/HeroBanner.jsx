'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchBanners } from '@/lib/api';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const HeroBanner = () => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const data = await fetchBanners();
        if (isMounted) {
          const heroBanners = Array.isArray(data)
            ? data.filter((b) => b.isActive !== false && (b.position === 'hero' || !b.position))
            : [];
          setBanners(heroBanners);
          setLoaded(true);
        }
      } catch (err) {
        if (isMounted) setLoaded(true);
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

  if (!loaded || banners.length === 0) {
    return null;
  }

  const current = banners[currentIndex];

  const content = (
    <div className="relative w-full overflow-hidden group">
      {/* High-res full banner image displaying exact aspect ratio without cropping or text overlay */}
      <img
        src={current.image}
        alt={current.title || 'LOGOS Bookstore'}
        className="w-full h-auto max-h-[85vh] object-cover sm:object-contain select-none block mx-auto transition-opacity duration-500"
      />

      {/* Slide Navigation Controls for Multi-Banners */}
      {banners.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
            }}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setCurrentIndex((prev) => (prev + 1) % banners.length);
            }}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:gap-2 bg-black/20 backdrop-blur-xs px-2.5 py-1 rounded-full">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`h-1.5 sm:h-2 rounded-full transition-all ${
                  idx === currentIndex ? 'w-5 sm:w-7 bg-white' : 'w-1.5 sm:w-2 bg-white/50'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );

  return (
    <section className="relative w-full overflow-hidden bg-transparent">
      {current.link ? (
        <Link href={current.link} className="block w-full">
          {content}
        </Link>
      ) : (
        content
      )}
    </section>
  );
};
