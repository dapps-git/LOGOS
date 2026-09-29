'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function AboutUsPage() {
  const [inquiryForm, setInquiryForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Publishing Inquiry',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 w-full pt-24 sm:pt-28 pb-16">
        {/* 1. Hero & Breadcrumbs Section */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-6 font-normal">
            <Link href="/" className="hover:text-slate-700 transition-colors">Home</Link>
            <span>›</span>
            <span className="text-[#1044A5] font-medium">About Us</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Heading & Text */}
            <div className="lg:col-span-7 space-y-6">
              {/* Location / Established Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF3FE] border border-blue-100 text-[#1044A5] text-[11px] font-bold tracking-wide uppercase">
                <svg className="w-3.5 h-3.5 text-[#1044A5] fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                <span>ESTABLISHED IN 2012 • KERALA, INDIA</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-slate-900 tracking-tight leading-[1.18]">
                Reading is not just a<br />
                habit—<br />
                <span className="text-[#1044A5]">it’s a transformative<br className="hidden sm:inline" /> journey.</span>
              </h1>

              {/* Paragraphs */}
              <div className="space-y-3.5 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                <p>
                  At <strong className="text-slate-900 font-bold">Logos Books</strong>, we believe that literature, language, and culture are the soul of our society. Since our inception in 2012, we have been committed to nurturing a vibrant culture of reading, intellectual dialogue, and literary excellence.
                </p>
                <p>
                  We are a pioneering publishing house and bookstore chain based in Kerala, India, driven by the vision of creating a more informed and enlightened society. With over <strong>1,000+ titles in Malayalam</strong> from both renowned literary legends and promising new voices, our collection stands as a testimony to the richness and depth of Malayalam literature.
                </p>
              </div>

              {/* 3 Stats Boxes Matching Screenshot */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                {/* 1. Inception Year */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-[#F4F8FC] border border-blue-50 flex items-center gap-3.5 shadow-2xs">
                  <div className="w-10 h-10 rounded-xl bg-blue-100/70 text-[#1044A5] flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-[#1044A5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-lg sm:text-xl font-extrabold text-slate-900 block leading-tight font-mono">2012</span>
                    <span className="text-[11px] text-slate-500 font-medium">Inception Year</span>
                  </div>
                </div>

                {/* 2. Published Titles */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-[#F4F8FC] border border-blue-50 flex items-center gap-3.5 shadow-2xs">
                  <div className="w-10 h-10 rounded-xl bg-blue-100/70 text-[#1044A5] flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-[#1044A5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-lg sm:text-xl font-extrabold text-slate-900 block leading-tight font-mono">1000+</span>
                    <span className="text-[11px] text-slate-500 font-medium">Published Titles</span>
                  </div>
                </div>

                {/* 3. National & Global Awards */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-[#F4F8FC] border border-blue-50 flex items-center gap-3.5 shadow-2xs">
                  <div className="w-10 h-10 rounded-xl bg-blue-100/70 text-[#1044A5] flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-[#1044A5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-lg sm:text-xl font-extrabold text-slate-900 block leading-tight">National</span>
                    <span className="text-[11px] text-slate-500 font-medium">&amp; Global Awards</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Visual Books Image Matching Screenshot */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200/90 bg-white">
                <img
                  src="/about-books-hero.jpg"
                  alt="Logos Books Publishing & Reading Showcase"
                  className="w-full h-auto object-cover rounded-3xl"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/banner.png';
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Message from the Director (Dark Warm Terracotta Section matching Screenshot) */}
        <div className="w-full my-12 bg-[#4E2412] text-white py-14 px-4 sm:px-8 shadow-inner">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Director Photo on Left */}
            <div className="md:col-span-4 lg:col-span-3 flex justify-center md:justify-start">
              <div className="w-48 sm:w-56 md:w-full max-w-[240px] aspect-square rounded-2xl overflow-hidden shadow-2xl border-2 border-[#D4A373]/30">
                <img
                  src="/director-tejaswini.jpg"
                  alt="Tejaswini Ajith - Director, Logos Books"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/banner.png';
                  }}
                />
              </div>
            </div>

            {/* Director Quote & Details on Right */}
            <div className="md:col-span-8 lg:col-span-9 space-y-4">
              <div>
                <span className="text-[11px] font-semibold tracking-widest uppercase text-[#D4A373] block mb-1">
                  MESSAGE FROM THE DIRECTOR
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white uppercase">
                  TEJASWINI AJITH
                </h2>
                <p className="text-[11px] font-medium tracking-wider uppercase text-[#D4A373]/80">
                  DIRECTOR, LOGOS BOOKS
                </p>
              </div>

              <div className="space-y-3.5 text-xs sm:text-sm text-amber-50/90 leading-relaxed font-light">
                <p>
                  At Logos Books, we see book publishing not merely as a business— but as a divine cultural responsibility. Literature, language, and culture are the soul of any society, and we are deeply committed to preserving, promoting, and nurturing them through the power of the written word.
                </p>
                <p>
                  Every book we publish carries a part of our collective conscience. We believe that publishing is a sacred act, one that shapes minds, preserves values, and builds bridges across generations. It is our humble contribution to a more thoughtful and enriched world.
                </p>
                <p>
                  We stand firmly for quality and timelessness, because a book is not bound by time—a book is forever. And the words it carries, the thoughts it inspires, and the change it brings, are eternal.
                </p>
                <p>
                  On behalf of the entire Logos Books family, I thank our readers, writers, partners, and supporters for believing in our journey. Let us continue to celebrate the joy of reading, the richness of language, and the spirit of culture—together.
                </p>
              </div>

              <div className="pt-2">
                <p className="text-base font-bold text-amber-200 tracking-wide font-serif italic">
                  Let’s read. Let’s rise.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Why Choose Logos Books? (Checklist & Spread Art matching Screenshot 2) */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 my-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left: Checklist */}
            <div className="lg:col-span-7 space-y-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Why Choose Logos Books?
              </h2>

              <div className="space-y-3.5">
                {[
                  'Award-winning content curated with care',
                  'More than 1000 published titles',
                  'Support for both established and new voices',
                  'Diverse services beyond publishing and bookselling',
                  'Modern bookstore concepts blending reading, lifestyle, and community',
                  'Trusted partners in storytelling, education, and cultural promotion',
                  'Library setting concepts and modern library furnitures'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-50 text-[#1044A5] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-xs sm:text-sm text-slate-700 font-normal leading-relaxed">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Book Artwork Showcase */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl overflow-hidden shadow-lg border border-slate-200 bg-white p-3">
                <img
                  src="/book3.png"
                  alt="Logos Book Cover Artwork"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/banner.png';
                  }}
                  className="w-full h-auto object-cover rounded-2xl"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 4. Our Vision & Quality Statement */}
        <div id="vision" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 my-14">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Vision Card */}
            <div className="bg-gradient-to-br from-[#0B1528] to-[#102447] text-white rounded-3xl p-7 sm:p-9 shadow-lg relative overflow-hidden flex flex-col justify-between">
              <div className="space-y-4">
                <span className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold uppercase tracking-wider border border-blue-400/30">
                  OUR VISION
                </span>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  A Beacon of Enlightenment
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                  To be a beacon of enlightenment, enriching lives through the transformative power of literature. We aspire to foster a society where reading is not merely an activity but a path to greater knowledge, empathy, and positive change.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-white/10 flex items-center gap-3 text-xs text-blue-200">
                <span>📚 1000+ Malayalam Classics</span>
                <span>•</span>
                <span>✨ Enlightening Minds</span>
              </div>
            </div>

            {/* Quality Statement Card */}
            <div className="bg-white rounded-3xl p-7 sm:p-9 border border-slate-200/90 shadow-sm space-y-4">
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold uppercase tracking-wider border border-emerald-200">
                QUALITY STATEMENT
              </span>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Excellence in Every Page
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                At Logos Books, quality is not an option—it is our foundation. We believe that a book is a timeless creation that deserves the highest standards in content, design, language, and production.
              </p>

              {/* 5 Quality Promises */}
              <div className="space-y-2 pt-2 text-xs text-slate-700">
                <p className="font-semibold text-slate-900 text-xs">Our quality promise includes:</p>
                <ul className="space-y-1.5 pl-1">
                  <li className="flex items-start gap-2">
                    <span className="text-[#1044A5] font-bold">1.</span>
                    <span>Meticulous content selection from renowned and emerging authors</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#1044A5] font-bold">2.</span>
                    <span>Rigorous editing and proofreading to uphold literary standards</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#1044A5] font-bold">3.</span>
                    <span>Aesthetic and durable design for long-lasting reader engagement</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#1044A5] font-bold">4.</span>
                    <span>Sustainable and ethical publishing practices</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#1044A5] font-bold">5.</span>
                    <span>Deep respect for language, tradition, and creativity</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Core Services / Pillars Grid (Matching Screenshot 3) */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 my-14">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1044A5]">OUR COMPREHENSIVE ECOSYSTEM</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              End-to-End Literary Services
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              From creative publishing to bookstore experiences and modern library architecture.
            </p>
          </div>

          {/* 3 Top Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* 1. Publishing */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all space-y-3">
              <h3 className="text-base font-bold text-slate-900">Publishing</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-light">
                We bring meaningful stories to life. Our publishing division supports:
              </p>
              <ol className="text-xs text-slate-700 space-y-1.5 pl-4 list-decimal">
                <li>Celebrated Malayalam writers</li>
                <li>Emerging talents with fresh voices</li>
                <li>High-quality literature across genres including fiction, non-fiction, poetry, essays, and children’s books</li>
              </ol>
            </div>

            {/* 2. Bookstore Chain (Highlighted warm peach tint) */}
            <div className="bg-[#FFF5EB] rounded-3xl p-6 sm:p-7 border border-amber-200/90 shadow-2xs hover:shadow-md transition-all space-y-3">
              <h3 className="text-base font-bold text-slate-900">Bookstore Chain</h3>
              <p className="text-xs text-slate-700 leading-relaxed font-light">
                We create immersive reading environments through:
              </p>
              <ol className="text-xs text-slate-800 space-y-1.5 pl-4 list-decimal">
                <li>Anchor Bookstores offering a wide variety of titles</li>
                <li>Kids’ Corners filled with joy and imagination</li>
                <li>Ladies’ Boutiques &amp; Fancy Corners blending books with lifestyle and aesthetics</li>
                <li>Café-style Reading Spaces that invite readers to stay, sip, and explore</li>
              </ol>
            </div>

            {/* 3. Distribution */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all space-y-3">
              <h3 className="text-base font-bold text-slate-900">Distribution</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-light">
                We curate and distribute select titles from a wide range of publishers. Our distribution network connects enthusiasts, readers, and collectors with literary works that matter—whether mainstream or niche, classic or contemporary.
              </p>
            </div>
          </div>

          {/* 2 Bottom Cards with Icons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 4. Library Services */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#1044A5] flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">Library Services</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We design and build libraries that feel like home and function like community anchors:
              </p>
              <ol className="text-xs text-slate-700 space-y-1.5 pl-4 list-decimal">
                <li>Personalized home or office libraries</li>
                <li>Institutional and public libraries</li>
                <li>Library-friendly interior planning and custom furniture solutions</li>
                <li>From layout design to book curation and furnishing, we offer end-to-end solutions to bring the joy of reading into any space.</li>
              </ol>
            </div>

            {/* 5. Consulting Services */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">Consulting Services</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We support individuals and organizations through our specialized literary consultancy:
              </p>
              <ol className="text-xs text-slate-700 space-y-1.5 pl-4 list-decimal">
                <li>Translation services and multilingual publishing</li>
                <li>Book publishing and distribution (print, e-book, audiobook)</li>
                <li>Marketing, branding, and author promotion</li>
                <li>Book launches, media interviews, and literary events</li>
                <li>Event management and content curation for book-centric gatherings</li>
              </ol>
            </div>
          </div>
        </div>

        {/* 6. Reach Us Through (Contact & Publishing Desk) */}
        <div id="contact" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 my-14">
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Left Column: Contact Info Details */}
              <div className="lg:col-span-6 space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1044A5]">GET IN TOUCH</span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                    Reach Us Through
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Have a manuscript to publish, need library design, or want to explore our book collections? We&apos;d love to connect.
                  </p>
                </div>

                {/* Address Card */}
                <div className="p-4 rounded-2xl bg-[#F0F5FF] flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-[#1044A5] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900">Headquarters &amp; Publishing Office</h4>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      Logos books, Near GHS, River road, Vilayur Post,<br />
                      Pattambi via, Palakkad dist. Kerala 679309
                    </p>
                  </div>
                </div>

                {/* Phone Numbers */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Phone Inquiries</span>
                  <div className="flex flex-wrap gap-3">
                    {['8086126024', '8281291849', '8089762480'].map((phone) => (
                      <a
                        key={phone}
                        href={`tel:+91${phone}`}
                        className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-[#1044A5] hover:bg-[#1044A5] hover:text-white transition-all shadow-2xs"
                      >
                        📞 +91 {phone}
                      </a>
                    ))}
                  </div>
                </div>

                {/* Emails */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">General Inquiries</span>
                    <a
                      href="mailto:logospmna@gmail.com"
                      className="text-xs font-medium text-slate-800 hover:text-[#1044A5] hover:underline truncate block mt-0.5"
                    >
                      logospmna@gmail.com
                    </a>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200/70">
                    <span className="text-[10px] text-blue-700 font-bold uppercase tracking-wider block">Publishing Submissions</span>
                    <a
                      href="mailto:publishinglogosbooks@gmail.com"
                      className="text-xs font-medium text-[#1044A5] hover:underline truncate block mt-0.5"
                    >
                      publishinglogosbooks@gmail.com
                    </a>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Inquiry Form */}
              <div className="lg:col-span-6 bg-[#FAFBFD] p-6 sm:p-8 rounded-3xl border border-slate-200/80">
                <h3 className="text-base font-bold text-slate-900 mb-1">Send a Message / Manuscript Inquiry</h3>
                <p className="text-xs text-slate-500 mb-4">
                  Fill in your details and our editorial desk will respond within 24–48 hours.
                </p>

                {submitted ? (
                  <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto text-lg font-bold">
                      ✓
                    </div>
                    <h4 className="text-sm font-bold text-emerald-900">Message Received</h4>
                    <p className="text-xs text-emerald-700">
                      Thank you for reaching out to Logos Books. Our editorial team will connect with you soon.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1 uppercase">Full Name</label>
                      <input
                        type="text"
                        required
                        value={inquiryForm.name}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                        placeholder="Your full name"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1044A5]/20 focus:border-[#1044A5]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1 uppercase">Email Address</label>
                        <input
                          type="email"
                          required
                          value={inquiryForm.email}
                          onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                          placeholder="yourname@gmail.com"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1044A5]/20 focus:border-[#1044A5]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1 uppercase">Phone Number</label>
                        <input
                          type="tel"
                          required
                          value={inquiryForm.phone}
                          onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                          placeholder="+91 98765 43210"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1044A5]/20 focus:border-[#1044A5]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1 uppercase">Inquiry Type</label>
                      <select
                        value={inquiryForm.subject}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, subject: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1044A5]/20 focus:border-[#1044A5]"
                      >
                        <option value="Publishing Inquiry">Book Publishing / Manuscript Submission</option>
                        <option value="Library Design">Library Architecture &amp; Setting</option>
                        <option value="Book Distribution">Distribution &amp; Bulk Orders</option>
                        <option value="Literary Events">Event Management &amp; Consultancy</option>
                        <option value="General Inquiry">General Feedback / Inquiries</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1 uppercase">Message / Book Synopsis</label>
                      <textarea
                        required
                        rows={3}
                        value={inquiryForm.message}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                        placeholder="Tell us about your manuscript, requirements, or query..."
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1044A5]/20 focus:border-[#1044A5]"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-[#1044A5] hover:bg-[#0c3986] text-white rounded-xl text-xs font-semibold tracking-wide transition-all shadow-md shadow-blue-900/15"
                    >
                      Send Message
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
