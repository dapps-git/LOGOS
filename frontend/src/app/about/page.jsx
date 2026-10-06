'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function AboutUsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFBFD] text-slate-800">
      <Navbar />

      <main className="flex-1 w-full pt-32 sm:pt-36 pb-24">
        <div className="max-w-3xl mx-auto px-6 sm:px-8">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-8 font-light">
            <Link href="/" className="hover:text-slate-700 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[#1044A5] font-medium">About Us</span>
          </nav>

          {/* Header Introduction */}
          <header className="mb-12 space-y-4">
            <span className="inline-block text-[11px] font-semibold tracking-widest text-[#1044A5] uppercase">
              Established 2012 • Kerala, India
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Reading is not just a habit—<br />
              <span className="text-[#1044A5]">it is a transformative journey.</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 font-light leading-relaxed pt-2">
              For over a decade, LOGOS Books has nurtured a sanctuary for literature, language, and the living spirit of Malayalam writing.
            </p>
          </header>

          {/* Flowing Story in Pure Literary Prose (Zero Boxes) */}
          <article className="space-y-10 text-sm sm:text-base leading-relaxed text-slate-700 font-light">
            {/* Opening Quote */}
            <div className="border-l-2 border-[#1044A5] pl-6 py-1 italic text-slate-800 text-lg sm:text-xl font-normal">
              &ldquo;Literature, language, and culture are the soul of any society. Through the printed word, we preserve our collective conscience and pass timeless wisdom across generations.&rdquo;
            </div>

            {/* Our Story */}
            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Our Story &amp; Heritage</h2>
              <p>
                Founded in 2012 in the culturally vibrant heartlands of Kerala, LOGOS Books emerged from a profound conviction: that great stories possess the singular power to awaken consciousness, cultivate empathy, and build bridges between minds. What began as a dedicated publishing venture has blossomed into a comprehensive literary ecosystem that touches thousands of readers each day.
              </p>
              <p>
                Today, our catalog features over <strong>1,000+ published titles</strong> spanning celebrated Malayalam classics, thought-provoking philosophical essays, poetry, world literature in translation, and children&apos;s literature. We take equal pride in collaborating with venerated literary figures and providing a compassionate launching pad for visionary debut authors.
              </p>
            </section>

            {/* Director Voice (Clean Literary Section, No Box) */}
            <section className="space-y-4 pt-4 border-t border-slate-200">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-[#1044A5] block">
                Message from Leadership
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Tejaswini Ajith &mdash; <span className="font-light text-slate-500 text-lg">Director, LOGOS Books</span>
              </h2>
              <p className="italic text-slate-800 font-serif text-base sm:text-lg leading-relaxed">
                &ldquo;At Logos Books, we see book publishing not merely as a commerce—but as a sacred cultural responsibility. Literature, language, and culture are the soul of any society, and we are deeply committed to preserving, promoting, and nurturing them through the power of the written word.&rdquo;
              </p>
              <p>
                Every book we publish carries a part of our collective conscience. We believe that publishing shapes minds, preserves authentic values, and builds bridges across generations. We stand firmly for quality and timelessness, because a book is not bound by time—a book is forever. And the words it carries, the thoughts it inspires, and the change it brings, are eternal.
              </p>
              <p className="font-medium text-[#1044A5] font-serif italic text-base">
                Let&apos;s read. Let&apos;s rise.
              </p>
            </section>

            {/* The LOGOS Literary Ecosystem */}
            <section className="space-y-4 pt-4 border-t border-slate-200">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">The LOGOS Ecosystem</h2>
              <p>
                Our dedication extends far beyond traditional publishing. We have conceived a holistic environment designed to keep the joy of reading central to contemporary life:
              </p>
              <p>
                <strong className="text-slate-900 font-medium">Publishing Division:</strong> We work closely with authors through every phase of manuscript development, rigorous fact-checking, editorial craftsmanship, and elegant typographic design to produce heirloom-quality books.
              </p>
              <p>
                <strong className="text-slate-900 font-medium">Curated Bookstore Spaces:</strong> Our warm bookstore spaces, children&apos;s reading hubs, and cafe-style literary corners encourage quiet contemplation, passionate discussion, and casual discovery.
              </p>
              <p>
                <strong className="text-slate-900 font-medium">Library Design &amp; Architecture:</strong> We partner with private residences, schools, universities, and public institutions to conceptualize and craft functional, beautiful library spaces complete with custom furniture and hand-curated collections.
              </p>
              <p>
                <strong className="text-slate-900 font-medium">Distribution Network:</strong> We curate and distribute select titles from a wide range of publishers across Kerala and beyond, connecting enthusiasts, readers, and collectors with literary works that matter.
              </p>
              <p>
                <strong className="text-slate-900 font-medium">Publishing Consultancy:</strong> From authorized Malayalam translations to international rights management, author tours, and literary festival curation, our editorial desk serves as a reliable ally for cultural creators.
              </p>
            </section>

            {/* Quality Commitment */}
            <section className="space-y-3 pt-4 border-t border-slate-200">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Quality in Every Detail</h2>
              <p>
                At Logos Books, quality is our foundation. We believe that a book deserves the highest standards in content, design, language, and production. Every edition bearing the LOGOS imprint is manufactured using archival-grade paper, crisp typography, and durable binding crafted to endure for generations on your shelves.
              </p>
            </section>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}
