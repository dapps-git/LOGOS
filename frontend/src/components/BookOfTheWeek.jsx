'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchBookOfTheWeek, fetchSpotlightBook, optimizeImageUrl, getBookCoverImage } from '@/lib/api';
import { FeaturedBookSpotlightSkeleton } from '@/components/Skeletons';

export const BookOfTheWeek = () => {
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadBookOfTheWeek = async () => {
      try {
        let live = await fetchBookOfTheWeek().catch(() => null);
        if (!live || !live.title) {
          live = await fetchSpotlightBook().catch(() => null);
        }

        if (isMounted) {
          if (live && live.title) {
            setBook({
              id: live._id || live.id,
              title: live.title || live.name || live.titleMalayalam,
              author: live.author || 'LOGOS Author',
              description: live.spotlightDescription || live.description || '',
              image: getBookCoverImage(live) || '/featured_parajitha.png',
              slug: live.slug || live._id
            });
          } else {
            setBook({
              id: 'kannakile-chirikal',
              title: 'കണക്കിലെ ചിരികൾ - Kannakile Chirikal',
              author: 'അമിത് കുമാർ',
              description: 'ഒരു ബാങ്കുദ്യോഗസ്ഥന്റെ അനുഭവക്കുറിപ്പുകൾ നിറഞ്ഞ രസകരമായ പുസ്തകം.',
              image: '/featured_parajitha.png',
              slug: 'kannakile-chirikal'
            });
          }
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) setLoading(false);
      }
    };

    loadBookOfTheWeek();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) return <FeaturedBookSpotlightSkeleton />;
  if (!book) return null;

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-8 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 items-center">
        {/* Left: Featured Book Image (Direct floating cover, no outer box) */}
        <div className="flex justify-center items-center">
          <Link href={`/books/${book.slug || book.id}`} className="block">
            <div className="relative max-w-[340px] sm:max-w-[420px] w-full flex items-center justify-center transition-transform duration-300 hover:scale-[1.02]">
              <img
                src={optimizeImageUrl(book.image, { width: 500, quality: 'auto' })}
                alt={`${book.title} - ${book.author}`}
                referrerPolicy="no-referrer"
                loading="lazy"
                crossOrigin="anonymous"
                className="max-h-[440px] sm:max-h-[500px] w-auto max-w-full object-contain filter drop-shadow-xl select-none"
                onError={(e) => {
                  if (!e.currentTarget.dataset.failed) {
                    e.currentTarget.dataset.failed = 'true';
                    e.currentTarget.src = '/book-placeholder.svg';
                  }
                }}
              />
            </div>
          </Link>
        </div>

        {/* Right: Book Details & CTA */}
        <div className="flex flex-col justify-center space-y-3.5">
          {/* Small Category Title */}
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#224494]">
            Book of the Week
          </span>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif text-slate-900 tracking-tight leading-tight">
            {book.title}
          </h2>

          <p className="text-base sm:text-lg font-bold text-slate-800">
            {book.author}
          </p>

          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed text-justify malayalam-desc line-clamp-4">
            {book.description}
          </p>

          <div className="pt-2">
            <Link
              href={`/books/${book.slug || book.id}`}
              className="inline-flex items-center justify-center bg-[#224494] hover:bg-[#1a3678] text-white px-8 py-2.5 rounded-full font-medium text-xs sm:text-sm transition-all shadow-sm active:scale-95"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookOfTheWeek;
