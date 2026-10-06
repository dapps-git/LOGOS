'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchBanners } from '@/lib/api';

export const ComboOfferBanner = () => {
  const [dealBanner, setDealBanner] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const data = await fetchBanners();
        if (isMounted && Array.isArray(data)) {
          const banner = data.find(
            (b) => b.isActive !== false && (b.position === 'deal_of_day' || b.position === 'featured')
          );
          if (banner) {
            setDealBanner(banner);
          }
        }
      } catch (err) {}
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  if (!dealBanner) {
    return null;
  }

  return (
    <section className="w-full my-8 sm:my-12 overflow-hidden">
      <Link href={dealBanner.link || '/books'} className="block relative w-full group">
        <img
          src={dealBanner.image}
          alt={dealBanner.title || 'Special Offer'}
          className="w-full h-auto object-cover select-none transition-transform duration-500 group-hover:scale-[1.01]"
        />
      </Link>
    </section>
  );
};
