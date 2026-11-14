'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { HeroBanner } from '@/components/HeroBanner';
import { NewArrivals } from '@/components/NewArrivals';
import { BookOfTheWeek } from '@/components/BookOfTheWeek';
import { Bestsellers } from '@/components/Bestsellers';
import { AuthorSpotlight } from '@/components/AuthorSpotlight';
import { ComboOfferBanner } from '@/components/ComboOfferBanner';
import { FeaturedAuthors } from '@/components/FeaturedAuthors';
import { ComingSoon } from '@/components/ComingSoon';
import { HandpickedReads } from '@/components/HandpickedReads';
import { LatestNews } from '@/components/LatestNews';
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

        {/* 3. Book of the Week (Spotlight Showcase) */}
        <BookOfTheWeek />

        {/* 4. Bestsellers (Most loved) */}
        <Bestsellers />

        {/* 5. Author Spotlight (Meet the author - രാജേഷ് കെ.ആർ) */}
        <AuthorSpotlight />

        {/* 6. Combo Offer Banner (BUY 1 GET 2) */}
        <ComboOfferBanner />

        {/* 8. Featured Authors (The voices behind the pages) */}
        <FeaturedAuthors />

        {/* 8b. Coming Soon & Pre-Orders (Upcoming Titles) */}
        <ComingSoon />

        {/* 9. Handpicked Reads (From our editors' desks - 01, 02, 03) */}
        <HandpickedReads />

        {/* 9b. Latest News & Blog Articles (Literary Journal & Video Stories) */}
        <LatestNews />

      </main>

      {/* 11. Footer (Logos Book) */}
      <Footer />
    </div>
  );
}
