'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function VisionPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
          <Link href="/" className="hover:text-slate-700 transition-colors">Home</Link>
          <span>›</span>
          <Link href="/about" className="hover:text-slate-700 transition-colors">About Us</Link>
          <span>›</span>
          <span className="text-[#1044A5] font-medium">Our Vision &amp; Quality</span>
        </div>

        {/* Hero Banner */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1044A5] bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
            LOGOS BOOKS PHILOSOPHY
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
            Our Vision &amp; Quality Promise
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Enriching minds, preserving heritage, and upholding literary excellence.
          </p>
        </div>

        {/* Vision Card */}
        <div className="bg-gradient-to-br from-[#0B1528] to-[#102447] text-white rounded-3xl p-8 sm:p-12 shadow-xl mb-10 relative overflow-hidden">
          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="text-xs uppercase tracking-widest text-blue-300 font-bold block">
              OUR VISION
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-snug">
              To be a beacon of enlightenment, enriching lives through the transformative power of literature.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed font-light">
              We aspire to foster a society where reading is not merely an activity but a path to greater knowledge, empathy, and positive change. Through over 1,000+ Malayalam titles and diverse cultural initiatives, Logos Books stands as an enduring pillar for intellectual growth.
            </p>
          </div>
        </div>

        {/* Quality Statement Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-sm space-y-6">
          <div>
            <span className="text-xs uppercase tracking-widest text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full inline-block mb-3">
              QUALITY STATEMENT
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Quality is Not an Option—It is Our Foundation
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2 font-normal">
              We believe that a book is a timeless creation, and therefore, it deserves the highest standards in content, design, language, and production. From manuscript to final print, we ensure that each step is guided by integrity, precision, and deep respect for literature and its cultural value.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {[
              { num: '01', title: 'Meticulous Content Selection', desc: 'Curated from celebrated literary masters and promising emerging voices.' },
              { num: '02', title: 'Rigorous Editing & Proofreading', desc: 'Upholding strict literary, grammatical, and typographical standards.' },
              { num: '03', title: 'Aesthetic & Durable Design', desc: 'Crafted for timeless beauty, tactile enjoyment, and long-lasting reader engagement.' },
              { num: '04', title: 'Sustainable & Ethical Publishing', desc: 'Guided by ecological responsibility and fair author partnerships.' },
              { num: '05', title: 'Respect for Language & Culture', desc: 'Preserving the deep nuances and soul of Malayalam tradition and world thought.' }
            ].map((item) => (
              <div key={item.num} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3.5">
                <span className="font-mono text-sm font-bold text-[#1044A5] shrink-0 mt-0.5">{item.num}</span>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">{item.title}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-center">
            <p className="text-xs sm:text-sm font-serif italic text-amber-900">
              &ldquo;We strive to publish books that are not only read—but cherished, preserved, and passed down. At Logos Books, quality is eternal—just like the words we publish.&rdquo;
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
