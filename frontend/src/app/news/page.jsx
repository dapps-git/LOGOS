'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchNews, optimizeImageUrl } from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import {
  Calendar,
  Eye,
  Play,
  ArrowRight,
  Search,
  Sparkles,
  BookOpen,
  Video,
  Clock,
  Share2
} from 'lucide-react';

const CATEGORIES = [
  'ALL',
  'Book Launch',
  'Literary News',
  'Author Spotlight',
  'Events',
  'Reviews & Press'
];

export default function NewsPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        setLoading(true);
        const data = await fetchNews({
          category: selectedCategory !== 'ALL' ? selectedCategory : '',
          search: search.trim()
        });
        if (isMounted) {
          setArticles(data?.articles || []);
        }
      } catch (err) {
        if (isMounted) setArticles([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      load();
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [selectedCategory, search]);

  const featuredArticle = articles.find((a) => a.isFeatured) || articles[0];
  const gridArticles = articles.filter((a) => a._id !== featuredArticle?._id);

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        {/* Page Title Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-bold text-[#1E3A8A] uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100 inline-block mb-3">
            LOGOS Literary Journal & News
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            Stories, Interviews & Updates
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 font-normal">
            Discover book releases, deep-dive author interviews, literary festivals, and behind-the-scenes stories from LOGOS Books.
          </p>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#1E3A8A] text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat === 'ALL' ? 'All Stories' : cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search news & stories..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-full text-xs text-slate-800 outline-none focus:border-[#1E3A8A] shadow-2xs"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="space-y-6">
            <div className="w-full h-80 sm:h-96 bg-slate-200/70 rounded-3xl animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-72 bg-slate-200/70 rounded-2xl animate-pulse" />
              ))}
            </div>
          </div>
        ) : articles.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs max-w-md mx-auto my-12">
            <div className="w-14 h-14 bg-blue-50 text-[#1E3A8A] rounded-full flex items-center justify-center mx-auto mb-3.5">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">No articles found</h3>
            <p className="text-xs text-slate-500 mb-4">
              Check back soon for new literary stories, interviews, and updates from LOGOS Books.
            </p>
            {selectedCategory !== 'ALL' && (
              <button
                type="button"
                onClick={() => setSelectedCategory('ALL')}
                className="text-xs font-bold text-[#1E3A8A] underline cursor-pointer"
              >
                View all stories
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-10">
            {/* Featured Hero Story */}
            {featuredArticle && (
              <article className="group relative bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 grid grid-cols-1 lg:grid-cols-12">
                <div className="relative lg:col-span-7 aspect-[16/9] lg:aspect-auto min-h-[280px] sm:min-h-[360px] bg-slate-900 overflow-hidden">
                  <img
                    src={optimizeImageUrl(featuredArticle.thumbnailUrl || featuredArticle.mediaUrl, { width: 1200 })}
                    alt={featuredArticle.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.src = '/book-placeholder.svg';
                    }}
                  />
                  {featuredArticle.mediaType === 'video' && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-white/90 text-[#1E3A8A] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 fill-current ml-1" />
                      </div>
                    </div>
                  )}
                  <span className="absolute top-4 left-4 bg-[#1E3A8A] text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    {featuredArticle.category}
                  </span>
                </div>

                <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 font-medium mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(featuredArticle.publishedAt || featuredArticle.createdAt).toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span>{featuredArticle.author}</span>
                    </div>

                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 leading-tight group-hover:text-[#1E3A8A] transition-colors">
                      <Link href={`/news/${featuredArticle.slug || featuredArticle._id}`}>
                        {featuredArticle.title}
                      </Link>
                    </h2>

                    <p className="mt-3 text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                      {featuredArticle.summary || featuredArticle.content}
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      href={`/news/${featuredArticle.slug || featuredArticle._id}`}
                      className="inline-flex items-center gap-2 text-xs font-bold text-[#1E3A8A] hover:text-[#152e72] transition-colors"
                    >
                      <span>{featuredArticle.mediaType === 'video' ? 'Watch Story' : 'Read Full Article'}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{featuredArticle.viewsCount || 0} views</span>
                    </div>
                  </div>
                </div>
              </article>
            )}

            {/* Grid of Other Articles */}
            {gridArticles.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {gridArticles.map((art) => {
                  const isVideo = art.mediaType === 'video';
                  const thumb = art.thumbnailUrl || art.mediaUrl;

                  return (
                    <article
                      key={art._id}
                      className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                    >
                      <div>
                        {/* Media Thumbnail */}
                        <div className="relative aspect-[16/10] bg-slate-900 overflow-hidden">
                          <Link href={`/news/${art.slug || art._id}`}>
                            <img
                              src={optimizeImageUrl(thumb, { width: 600 })}
                              alt={art.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.currentTarget.src = '/book-placeholder.svg';
                              }}
                            />
                            {isVideo && (
                              <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                                <div className="w-10 h-10 rounded-full bg-white/90 text-[#1E3A8A] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                  <Play className="w-4 h-4 fill-current ml-0.5" />
                                </div>
                              </div>
                            )}
                          </Link>
                          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-slate-800 text-[10px] font-bold px-2.5 py-0.5 rounded-md shadow-xs">
                            {art.category}
                          </span>
                        </div>

                        {/* Article Info */}
                        <div className="p-4 sm:p-5">
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium mb-2">
                            <span>{new Date(art.publishedAt || art.createdAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{art.author}</span>
                          </div>

                          <h3 className="text-base font-bold text-slate-900 group-hover:text-[#1E3A8A] transition-colors line-clamp-2 leading-snug">
                            <Link href={`/news/${art.slug || art._id}`}>{art.title}</Link>
                          </h3>

                          <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                            {art.summary || art.content}
                          </p>
                        </div>
                      </div>

                      <div className="p-4 sm:p-5 pt-0 border-t border-slate-50 flex items-center justify-between mt-auto">
                        <Link
                          href={`/news/${art.slug || art._id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1E3A8A] hover:underline"
                        >
                          <span>{isVideo ? 'Watch' : 'Read'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>

                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Eye className="w-3 h-3" /> {art.viewsCount || 0}
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

