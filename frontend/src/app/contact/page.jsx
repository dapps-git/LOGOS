'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import ContactSection from '@/components/ContactSection';

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800">
      <Navbar />

      {/* Main content with proper top padding to clear floating pill navbar */}
      <main className="flex-1 w-full pt-28 sm:pt-36 pb-20">
        <ContactSection showHeading={true} />
      </main>

      <Footer />
    </div>
  );
}
