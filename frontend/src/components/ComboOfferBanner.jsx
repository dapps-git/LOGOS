'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchBanners } from '@/lib/api';
import { ComboOfferBannerSkeleton } from '@/components/Skeletons';

export const ComboOfferBanner = () => {
  const [dealBanner, setDealBanner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const data = await fetchBanners();
        if (isMounted) {
          if (Array.isArray(data) && data.length > 0) {
            const banner = data.find(
              (b) => b.isActive !== false && (b.position === 'deal_of_day' || b.position === 'featured' || b.position === 'bottom')
            );
            if (banner) {
              setDealBanner(banner);
            } else {
              setDealBanner({
                title: 'BUY 1 GET 2 SPECIAL COMBO',
                image: '/combo_banner.png',
                link: '/products'
              });
            }
          } else {
            setDealBanner({
              title: 'BUY 1 GET 2 SPECIAL COMBO',
              image: '/combo_banner.png',
              link: '/products'
            });
          }
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setDealBanner({
            title: 'BUY 1 GET 2 SPECIAL COMBO',
            image: '/combo_banner.png',
            link: '/products'
          });
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) return <ComboOfferBannerSkeleton />;
  if (!dealBanner) return null;

  return (
    <section className="w-full my-8 sm:my-12 overflow-hidden">
      <Link href={dealBanner.link || '/products'} className="block relative w-full group">
        <img
          src={dealBanner.image || '/combo_banner.png'}
          alt={dealBanner.title || 'Special Combo Offer'}
          onError={(e) => {
            e.currentTarget.src = '/combo_banner.png';
          }}
          className="w-full h-auto object-cover select-none transition-transform duration-500 group-hover:scale-[1.01]"
        />
      </Link>
    </section>
  );
};

