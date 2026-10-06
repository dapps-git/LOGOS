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
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (!loaded || banners.length === 0) {
    return null;
  }

  const current = banners[currentIndex];

  const content = (
    <div className="relative w-full overflow-hidden group">
      <img
        src={current.image}
        alt={current.title || 'LOGOS Bookstore'}
        className="w-full h-[400px] sm:h-[480px] md:h-[600px] object-cover object-center select-none block transition-opacity duration-700"
      />
      {(current.title || current.subtitle) && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-6 sm:p-12 text-white">
          {current.badge && (
            <span className="inline-block px-3 py-1 bg-amber-500 text-black text-xs font-bold uppercase tracking-wider rounded-sm w-fit mb-3">
              {current.badge}
            </span>
          )}
          {current.title && (
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold font-serif max-w-2xl leading-tight">
              {current.title}
            </h2>
          )}
          {current.subtitle && (
            <p className="text-sm sm:text-lg text-slate-200 mt-2 max-w-xl">
              {current.subtitle}
            </p>
          )}
        </div>
      )}

      {banners.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.preventDefault();
              setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              setCurrentIndex((prev) => (prev + 1) % banners.length);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.preventDefault();
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

  return (
    <section className="relative w-full overflow-hidden bg-slate-900">
      {current.link ? (
        <Link href={current.link} className="block">
          {content}
        </Link>
      ) : (
        content
      )}
    </section>
  );
};
