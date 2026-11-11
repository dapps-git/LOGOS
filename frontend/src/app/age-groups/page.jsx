'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, BookOpen, Heart, Users, GraduationCap, Compass } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const AGE_GROUPS_DATA = [
  {
    range: '0 – 6 Years',
    title: 'Early Childhood & Picture Books',
    titleMalayalam: 'ശൈശവ വായന',
    icon: Sparkles,
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description: 'Vibrant illustrated picture books, foundational Malayalam rhymes, and tender bedtime stories to ignite a lifelong wonder for words.',
    highlights: ['Illustrated Malayalam alphabet', 'Animal fables & bedtime tales', 'Sensory & rhythm books'],
    targetQuery: '/products?search=കഥ'
  },
  {
    range: '7 – 12 Years',
    title: 'Middle Grade & Young Explorers',
    titleMalayalam: 'ബാലസാഹിത്യം',
    icon: Compass,
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    description: 'Thrilling adventure tales, Indian folklore, puzzle books, and character-building stories that build independent reading habits.',
    highlights: ['Adventure & mystery novellas', 'Kerala folklore & Panchatantra', 'Curiosity & science stories'],
    targetQuery: '/products?search=കുട്ടി'
  },
  {
    range: '13 – 18 Years',
    title: 'Young Adults & Teens',
    titleMalayalam: 'കൗമാര വായന',
    icon: GraduationCap,
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    description: 'Engaging coming-of-age stories, youth poetry, inspirational biographies, and accessible introductions to science and culture.',
    highlights: ['Motivational biographies', 'Modern teen fiction & fantasy', 'Contemporary verse & essays'],
    targetQuery: '/products?theme=Novel'
  },
  {
    range: '18+ Years',
    title: 'Adults & Lifelong Readers',
    titleMalayalam: 'സാഹിത്യ പ്രേമികൾ',
    icon: BookOpen,
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    description: 'Celebrated Malayalam novels, serious philosophical essays, cinema and political discourse, and international classics in translation.',
    highlights: ['Prize-winning Malayalam fiction', 'Political treatises & history', 'Classic poetry & philosophy'],
    targetQuery: '/products'
  }
];

export default function AgeGroupsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFBFD] text-slate-800">
      <Navbar />

      <main className="flex-1 w-full pt-28 sm:pt-32 pb-24 px-4 sm:px-8 max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6 font-light">
          <Link href="/" className="hover:text-slate-700 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-[#1044A5] font-medium">Age Groups</span>
        </nav>

        {/* Header */}
        <header className="mb-10 text-center sm:text-left pb-6 border-b border-slate-200">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#1044A5] mb-2 border border-blue-100">
            <Users className="w-3.5 h-3.5" />
            <span>Reads for Every Stage of Life</span>
          </span>
          <h1 className="text-2xl sm:text-4xl font-serif font-bold text-slate-900 tracking-tight">
            Browse Books by Age
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Whether choosing an enchanting bedtime story for a toddler or diving into serious literary discourse as an adult, find the perfect edition tailored for each age and reading milestone.
          </p>
        </header>

        {/* Age Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {AGE_GROUPS_DATA.map((group) => {
            const GroupIcon = group.icon;

            return (
              <div
                key={group.range}
                className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 hover:border-[#1044A5]/40 hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Top Bar */}
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono border ${group.badgeColor}`}>
                      {group.range}
                    </span>
                    <span className="text-xs font-serif font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      {group.titleMalayalam}
                    </span>
                  </div>

                  {/* Title & Icon */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1044A5] flex items-center justify-center shrink-0 mt-0.5">
                      <GroupIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                        {group.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {group.description}
                      </p>
                    </div>
                  </div>

                  {/* Highlights Bullet Pills */}
                  <div className="pt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Key Highlights:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {group.highlights.map((h) => (
                        <span
                          key={h}
                          className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/60 text-[11px] text-slate-700 font-light"
                        >
                          ✓ {h}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Explore Button */}
                <div className="pt-5 mt-5 border-t border-slate-100">
                  <Link
                    href={group.targetQuery}
                    className="w-full py-2.5 px-4 bg-slate-900 hover:bg-[#1044A5] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    <span>Explore {group.range} Collection</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer recommendation banner */}
        <div className="mt-12 p-6 bg-blue-50/70 border border-blue-100 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900">Need personalized recommendations?</h4>
            <p className="text-xs text-slate-600">
              Our literary team is happy to recommend titles for schools, home libraries, or gifts.
            </p>
          </div>
          <Link
            href="/contact"
            className="px-4 py-2 bg-[#1044A5] hover:bg-[#0c3986] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors shrink-0"
          >
            Contact Our Curators
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

