'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Feather, BookOpen, ArrowRight, UserCheck } from 'lucide-react';
import { fetchAuthors } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AuthorsPage() {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const live = await fetchAuthors();
        if (isMounted) {
          if (Array.isArray(live) && live.length > 0) {
            setAuthors(live.filter((a) => a && a.name));
          } else {
            setAuthors([]);
          }
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setAuthors([]);
          setLoading(false);
        }
      }
    }
    load();
    return () => { isMounted = false; };
  }, []);

  const filteredAuthors = authors.filter((a) =>
    (a.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (a.bio || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFBFD] text-slate-800">
      <Navbar />

      <main className="flex-1 w-full pt-28 sm:pt-32 pb-24 px-4 sm:px-8 max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6 font-light">
          <Link href="/" className="hover:text-slate-700 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-[#1044A5] font-medium">Authors</span>
        </nav>

        {/* Header Banner */}
        <header className="mb-8 sm:mb-10 text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-slate-200">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#1044A5] mb-2 border border-blue-100">
              <Feather className="w-3.5 h-3.5" />
              <span>Voices of LOGOS</span>
            </span>
            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-slate-900 tracking-tight">
              Featured Authors
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
              Meet the visionary novelists, poets, essayists, and translators shaping the heart of Malayalam and Indian literature.
            </p>
          </div>

          {/* Quick Search */}
          <div className="w-full sm:w-72 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search author..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1044A5]/20 focus:border-[#1044A5] shadow-xs"
            />
          </div>
        </header>

        {/* Authors Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="aspect-3/4 w-full bg-slate-200 rounded-xl" />
                <div className="h-4 bg-slate-200 rounded w-3/4 mx-auto" />
                <div className="h-3 bg-slate-200 rounded w-1/2 mx-auto" />
              </div>
            ))}
          </div>
        ) : filteredAuthors.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl text-center border border-slate-200 max-w-md mx-auto">
            <UserCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800">No authors found</p>
            <p className="text-xs text-slate-500 mt-1">Try searching with a different name or spelling.</p>
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="mt-4 text-xs font-semibold text-[#1044A5] underline"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredAuthors.map((author) => {
              const authorName = author.name || 'LOGOS Author';
              const authorImage = author.photo || author.image || '/author_rajesh.png';
              const targetUrl = `/products?author=${encodeURIComponent(authorName)}`;

              return (
                <div
                  key={author._id || author.id || authorName}
                  className="group bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/80 hover:border-[#1044A5]/30 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    {/* Portrait container */}
                    <div className="relative aspect-3/4 w-full overflow-hidden bg-slate-100 rounded-xl mb-3 shadow-xs">
                      <img
                        src={authorImage}
                        alt={authorName}
                        loading="lazy"
                        className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>

                    {/* Details */}
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#1044A5] transition-colors line-clamp-1">
                      {authorName}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {author.bio || author.description || 'Distinguished author published by LOGOS Books.'}
                    </p>
                  </div>

                  {/* Explore Link */}
                  <Link
                    href={targetUrl}
                    className="mt-3.5 pt-3 border-t border-slate-100 w-full inline-flex items-center justify-between text-[11px] sm:text-xs font-semibold text-[#1044A5] group-hover:underline"
                  >
                    <span>Explore Titles</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

