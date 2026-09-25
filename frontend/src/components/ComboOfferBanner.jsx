'use client';

import React from 'react';
import Link from 'next/link';

export const ComboOfferBanner = () => {
  return (
    <section className="w-full my-8 sm:my-12 overflow-hidden">
      <Link href="/offers/combo" className="block relative w-full group">
        <img
          src="/combo_banner.png"
          alt="COMBO OFFER - BUY 1 GET 2"
          className="w-full h-auto object-cover select-none transition-transform duration-500 group-hover:scale-[1.01]"
        />
      </Link>
    </section>
  );
};
