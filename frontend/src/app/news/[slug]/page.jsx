'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { fetchNewsBySlug, optimizeImageUrl } from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import {
  Calendar,
  Eye,
  ArrowLeft,
  Share2,
  Tag,
  BookOpen,
  Play,
  Check,
  Clock
} from 'lucide-react';

export default function NewsDetailPage() {
  const params = useParams();
  const slug = params?.slug;

  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let isMounted = true;

    async function load() {
      try {
        setLoading(true);
        const data = await fetchNewsBySlug(slug);
        if (isMounted && data?.article) {
          setArticle(data.article);
          setRelated(data.related || []);
        }
      } catch (err) {
        console.warn('[NewsDetailPage] error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/i);
    return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1` : null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-between">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-12 w-full animate-pulse space-y-6">
          <div className="h-6 w-32 bg-slate-200 rounded-full" />
          <div className="h-10 w-3/4 bg-slate-200 rounded-lg" />
          <div className="h-96 bg-slate-200 rounded-3xl" />
          <div className="space-y-3">
            <div className="h-4 bg-slate-200 rounded-sm" />
            <div className="h-4 bg-slate-200 rounded-sm" />
            <div className="h-4 w-2/3 bg-slate-200 rounded-sm" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-between">
        <Navbar />
        <main className="max-w-md mx-auto px-4 py-20 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Article Not Found</h2>
          <p className="text-xs text-slate-500 mb-6">
            The article you are looking for may have been moved or removed.
          </p>
          <Link
            href="/news"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1E3A8A] text-white text-xs font-bold rounded-full"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to All Stories
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const isVideo = article.mediaType === 'video';
  const ytEmbed = isVideo && article.videoUrl ? getYouTubeEmbedUrl(article.videoUrl) : null;

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        {/* Back Button & Category Breadcrumb */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <Link
            href="/news"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#1E3A8A] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Stories</span>
          </Link>

          <span className="text-xs font-bold text-[#1E3A8A] bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            {article.category}
          </span>
        </div>

        {/* Article Headline */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-tight mb-4">
          {article.title}
        </h1>

        {/* Byline, Date & Views */}
        <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-y border-slate-200 text-xs text-slate-500 mb-6">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-800">By {article.author}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(article.publishedAt || article.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" /> {article.viewsCount || 0} views
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-bold text-slate-700 cursor-pointer shadow-2xs"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Share2 className="w-3 h-3" />}
              <span>{copied ? 'Link Copied!' : 'Share'}</span>
            </button>
          </div>
        </div>

        {/* Featured Media (Video Player or WebP Image) */}
        <div className="mb-8 rounded-3xl overflow-hidden bg-slate-900 border border-slate-200 shadow-sm">
          {isVideo ? (
            ytEmbed ? (
              <div className="aspect-[16/9] w-full">
                <iframe
                  src={ytEmbed}
                  title={article.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>
            ) : article.videoUrl ? (
              <video
                controls
                playsInline
                src={article.videoUrl}
                poster={optimizeImageUrl(article.thumbnailUrl, { width: 1200 })}
                className="w-full aspect-[16/9] object-contain bg-black"
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <img
                src={optimizeImageUrl(article.thumbnailUrl || article.mediaUrl, { width: 1200 })}
                alt={article.title}
                className="w-full max-h-[500px] object-cover"
              />
            )
          ) : article.mediaUrl ? (
            <img
              src={optimizeImageUrl(article.mediaUrl, { width: 1400 })}
              alt={article.title}
              className="w-full max-h-[550px] object-cover"
            />
          ) : null}
        </div>

        {/* Summary Excerpt Box */}
        {article.summary && (
          <div className="p-5 rounded-2xl bg-amber-50/70 border-l-4 border-amber-500 mb-8 text-sm sm:text-base text-amber-950 italic leading-relaxed">
            &ldquo;{article.summary}&rdquo;
          </div>
        )}

        {/* Full Article Content */}
        <article className="prose prose-slate max-w-none text-slate-800 text-sm sm:text-base leading-relaxed space-y-4">
          {article.content.split('\n\n').map((paragraph, idx) => (
            <p key={idx} className="whitespace-pre-line">
              {paragraph}
            </p>
          ))}
        </article>

        {/* Tags */}
        {Array.isArray(article.tags) && article.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-6 mt-8 border-t border-slate-200">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" /> Tags:
            </span>
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-full transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Related Stories */}
        {related.length > 0 && (
          <div className="mt-14 pt-8 border-t border-slate-200">
            <h3 className="text-lg font-black text-slate-900 mb-6">Related Stories</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {related.map((rel) => (
                <Link
                  key={rel._id}
                  href={`/news/${rel.slug || rel._id}`}
                  className="group bg-white rounded-2xl border border-slate-200 p-3 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="aspect-[16/10] rounded-xl overflow-hidden bg-slate-100 mb-3">
                    <img
                      src={optimizeImageUrl(rel.thumbnailUrl || rel.mediaUrl, { width: 400 })}
                      alt={rel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#1E3A8A] uppercase">
                      {rel.category}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-2 mt-1 group-hover:text-[#1E3A8A]">
                      {rel.title}
                    </h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

