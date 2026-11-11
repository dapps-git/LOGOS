'use client';

import React from 'react';
import Link from 'next/link';
import { Layers, ArrowRight, BookOpen, Compass, Sparkles } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const CATEGORIES_DATA = [
  {
    title: 'Novel & Fiction',
    titleMalayalam: 'നോവൽ',
    theme: 'Novel',
    description: 'Immersive long-form narratives, contemporary realism, and timeless Malayalam classics that resonate across generations.',
    color: 'from-blue-600 to-indigo-700',
    count: 'Classic & Contemporary'
  },
  {
    title: 'Poetry & Verses',
    titleMalayalam: 'കവിത',
    theme: 'Poetry',
    description: 'Evocative Malayalam and regional poetry capturing the lyrical essence of human emotions, nature, and cultural consciousness.',
    color: 'from-rose-500 to-pink-700',
    count: 'Celebrated Voices'
  },
  {
    title: 'Self-Help & Personal Growth',
    titleMalayalam: 'വ്യക്തിത്വവികാസം',
    theme: 'Self-Help',
    description: 'Actionable wisdom, mental resilience, productivity, and life lessons to inspire personal and professional triumph.',
    color: 'from-emerald-600 to-teal-700',
    count: 'Bestselling Titles'
  },
  {
    title: 'Philosophy & Deep Thought',
    titleMalayalam: 'തത്ത്വചിന്ത',
    theme: 'Books',
    description: 'Profound philosophical explorations, existential reflections, and critical essays for discerning and contemplative minds.',
    color: 'from-amber-600 to-orange-700',
    count: 'Curated Heritage'
  },
  {
    title: 'Cinema & Politics',
    titleMalayalam: 'സിനിമ & രാഷ്ട്രീയം',
    theme: 'Cinema & Politics',
    description: 'Insightful treatises examining the history of Malayalam cinema, political dialogues, socio-economic debates, and cultural movements.',
    color: 'from-purple-600 to-violet-800',
    count: 'Cultural Analyses'
  },
  {
    title: 'Biography & Memoirs',
    titleMalayalam: 'ജീവചരിത്രം',
    theme: 'Biography',
    description: 'Inspiring life stories, candid memoirs, and autobiographies of visionary leaders, social reformers, and trailblazers.',
    color: 'from-cyan-600 to-blue-800',
    count: 'True Stories'
  },
  {
    title: 'Humour & Satire',
    titleMalayalam: 'ഹാസ്യം',
    theme: 'Humour',
    description: 'Witty satires, light-hearted anecdotes, and joyful humor collections celebrating Kerala’s sharp comic tradition.',
    color: 'from-yellow-500 to-amber-600',
    count: 'Delightful Reads'
  },
  {
    title: 'Children’s & Illustrated Tales',
    titleMalayalam: 'ബാലസാഹിത്യം',
    theme: 'Books',
    description: 'Charming bedtime stories, colorful folklore, and illustrated Malayalam tales designed to cultivate an early love for books.',
    color: 'from-emerald-500 to-lime-700',
    count: 'Young Minds'
  },
  {
    title: 'All Literary Titles',
    titleMalayalam: 'എല്ലാ പുസ്തകങ്ങളും',
    theme: 'ALL',
    description: 'Browse the entire LOGOS publication repository spanning over 1,000+ works in Malayalam, English, and Hindi.',
    color: 'from-slate-700 to-slate-900',
    count: 'Full Catalog'
  }
];

export default function CategoriesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFBFD] text-slate-800">
      <Navbar />

      <main className="flex-1 w-full pt-28 sm:pt-32 pb-24 px-4 sm:px-8 max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6 font-light">
          <Link href="/" className="hover:text-slate-700 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-[#1044A5] font-medium">Categories</span>
        </nav>

        {/* Header */}
        <header className="mb-10 text-center sm:text-left pb-6 border-b border-slate-200">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#1044A5] mb-2 border border-blue-100">
            <Layers className="w-3.5 h-3.5" />
            <span>Curated Genres</span>
          </span>
          <h1 className="text-2xl sm:text-4xl font-serif font-bold text-slate-900 tracking-tight">
            Book Categories &amp; Themes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Discover your next favorite read by genre. Every category represents hand-curated excellence across fiction, poetry, philosophy, and learning.
          </p>
        </header>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {CATEGORIES_DATA.map((cat) => {
            const queryUrl = cat.theme === 'ALL' ? '/products' : `/products?theme=${encodeURIComponent(cat.theme)}`;

            return (
              <Link
                key={cat.title}
                href={queryUrl}
                className="group relative bg-white rounded-2xl p-6 border border-slate-200/80 hover:border-[#1044A5]/40 hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden"
              >
                {/* Decorative Accent Glow */}
                <div
                  className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${cat.color} opacity-10 rounded-bl-full transition-transform group-hover:scale-125 duration-300 pointer-events-none`}
                />

                <div className="space-y-3 relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400 font-mono">
                      {cat.count}
                    </span>
                    <span className="text-xs font-serif font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {cat.titleMalayalam}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-[#1044A5] transition-colors tracking-tight">
                    {cat.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed font-light line-clamp-3">
                    {cat.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#1044A5] group-hover:underline">
                  <span>Browse Collection</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Explore More Banner */}
        <div className="mt-14 p-6 sm:p-8 bg-gradient-to-r from-[#1044A5] to-[#0A2558] rounded-2xl text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-1.5 text-center sm:text-left">
            <h3 className="text-lg sm:text-xl font-bold">Looking for a specific author or title?</h3>
            <p className="text-xs sm:text-sm text-blue-100 font-light">
              Explore our comprehensive 15-item paginated catalog with live search across 1,000+ books.
            </p>
          </div>
          <Link
            href="/products"
            className="px-5 py-2.5 bg-white text-[#1044A5] hover:bg-blue-50 rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0"
          >
            Explore Complete Catalog →
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

