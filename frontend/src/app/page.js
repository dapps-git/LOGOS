'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { HeroBanner } from '@/components/HeroBanner';
import { NewArrivals } from '@/components/NewArrivals';
import { FeaturedBookSpotlight } from '@/components/FeaturedBookSpotlight';
import { Bestsellers } from '@/components/Bestsellers';
import { AuthorSpotlight } from '@/components/AuthorSpotlight';
import { AuthorBestBooks } from '@/components/AuthorBestBooks';
import { ComboOfferBanner } from '@/components/ComboOfferBanner';
import { FeaturedAuthors } from '@/components/FeaturedAuthors';
import { HandpickedReads } from '@/components/HandpickedReads';
import { Testimonials } from '@/components/Testimonials';
import { Footer } from '@/components/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col selection:bg-blue-100 selection:text-blue-900">
      {/* Floating Capsule Header */}
      <Navbar />

      {/* Main Page Flow */}
      <main className="flex-1">
        {/* 1. Full Hero Banner */}
        <HeroBanner />

        {/* 2. New Arrivals (Fresh from the press) */}
        <NewArrivals />

        {/* 3. Featured Book Spotlight (പരാജിതനായകർ) */}
        <FeaturedBookSpotlight />

        {/* 4. Bestsellers (Most loved) */}
        <Bestsellers />

        {/* 5. Author Spotlight (Meet the author - രാജേഷ് കെ.ആർ) */}
        <AuthorSpotlight />

        {/* 6. Author's Best Book (ഘടോൽക്കചൻ) */}
        <AuthorBestBooks />

        {/* 7. Combo Offer Banner (BUY 1 GET 2) */}
        <ComboOfferBanner />

        {/* 8. Featured Authors (The voices behind the pages) */}
        <FeaturedAuthors />

        {/* 9. Handpicked Reads (From our editors' desks - 01, 02, 03) */}
        <HandpickedReads />

        {/* 10. Testimonials (What Our Person’s Say) */}
        <Testimonials />
      </main>

      {/* 11. Footer (Logos Book) */}
      <Footer />
    </div>
  );
}
