'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchRecentNews, optimizeImageUrl } from '@/lib/api';
import { ArrowRight, Calendar, Play, Eye, BookOpen, Video } from 'lucide-react';

export const LatestNews = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const data = await fetchRecentNews(3);
        if (isMounted && Array.isArray(data)) {
          setArticles(data);
        }
      } catch (err) {
        if (isMounted) setArticles([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  if (!loading && articles.length === 0) return null;

  return (
    <section className="w-full my-12 sm:my-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
        <div>
          <span className="text-[11px] font-bold text-[#1E3A8A] uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100 inline-block mb-2">
            Literary Journal & News
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Latest Stories & Author Interviews
          </h2>
        </div>

        <Link
          href="/news"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1E3A8A] hover:text-[#152e72] group transition-colors"
        >
          <span>Explore All News & Stories</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Grid of 3 News Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-80 bg-slate-200/60 rounded-2xl animate-pulse" />
          ))
        ) : (
          articles.map((art) => {
            const isVideo = art.mediaType === 'video';
            const thumb = art.thumbnailUrl || art.mediaUrl || '/book-placeholder.svg';

            return (
              <article
                key={art._id}
                className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[16/10] bg-slate-900 overflow-hidden">
                    <Link href={`/news/${art.slug || art._id}`}>
                      <img
                        src={optimizeImageUrl(thumb, { width: 600 })}
                        alt={art.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 select-none"
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
                    <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-slate-800 text-[10px] font-bold px-2.5 py-0.5 rounded-md shadow-xs">
                      {art.category}
                    </span>
                  </div>

                  <div className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium mb-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(art.publishedAt || art.createdAt).toLocaleDateString()}
                      </span>
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
                    <span>{isVideo ? 'Watch Story' : 'Read Article'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Eye className="w-3 h-3" /> {art.viewsCount || 0}
                  </span>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
};

