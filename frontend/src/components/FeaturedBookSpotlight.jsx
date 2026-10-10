'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchSpotlightBook } from '@/lib/api';
import { FeaturedBookSpotlightSkeleton } from '@/components/Skeletons';

export const FeaturedBookSpotlight = () => {
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadFeaturedAuthorBook = async () => {
      try {
        const liveBook = await fetchSpotlightBook();
        if (isMounted) {
          if (liveBook && liveBook.title) {
            setBook({
              title: liveBook.title,
              author: liveBook.author,
              description: liveBook.description,
              image: liveBook.image || (liveBook.images && liveBook.images[0]) || '/featured_parajitha.png',
              slug: liveBook.slug || liveBook._id
            });
          } else {
            setBook({
              title: 'പരാജിതനായകർ',
              author: 'ടി. അനീഷ്',
              description: 'തമിഴ് സിനിമയും രാഷ്ട്രീയവും തമ്മിലുള്ള ആഴത്തിലുള്ള ബന്ധം വ്യക്തമാക്കുന്നതാണ് ഈ പുസ്തകം. എം.ജി.ആർ, ജയലളിത തുടങ്ങിയവർ തമിഴ് രാഷ്ട്രീയത്തിൽ വലിയ വിജയങ്ങൾ കൊയ്തപ്പോൾ, രാഷ്ട്രീയത്തിൽ പരാജയപ്പെടുകയോ അല്ലെങ്കിൽ വലിയ ചലനങ്ങൾ സൃഷ്ടിക്കാൻ കഴിയാതെ പോവുകയോ ചെയ്ത ശിവാജി ഗണേശൻ, വിജയകാന്ത്, കമൽ ഹാസൻ, രജനീകാന്ത് തുടങ്ങിയ താരങ്ങളുടെ രാഷ്ട്രീയ ശ്രമങ്ങളെയും അവരുടെ സിനിമകളെയും ഈ പുസ്തകം വിലയിരുത്തുന്നു.',
              image: '/featured_parajitha.png',
              slug: 'parajithanayakar'
            });
          }
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) setLoading(false);
      }
    };

    loadFeaturedAuthorBook();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) return <FeaturedBookSpotlightSkeleton />;
  if (!book) return null;

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-8 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 items-center">
        {/* Left: Featured Book Image (Direct showcase, no outer box container) */}
        <div className="flex justify-center items-center">
          <div className="relative max-w-[360px] sm:max-w-[440px] w-full flex items-center justify-center transition-transform duration-300 hover:scale-[1.02]">
            <img
              src={book.image}
              alt={`${book.title} - ${book.author}`}
              referrerPolicy="no-referrer"
              loading="lazy"
              crossOrigin="anonymous"
              className="max-h-[460px] sm:max-h-[520px] w-auto max-w-full object-contain filter drop-shadow-xl select-none"
              onError={(e) => {
                if (!e.currentTarget.dataset.failed) {
                  e.currentTarget.dataset.failed = 'true';
                  e.currentTarget.src = '/featured_parajitha.png';
                }
              }}
            />
          </div>
        </div>

        {/* Right: Book Details & CTA */}
        <div className="flex flex-col justify-center space-y-4">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif text-slate-900 tracking-tight leading-tight">
            {book.title}
          </h2>

          <p className="text-base sm:text-lg font-bold text-slate-800">
            {book.author}
          </p>

          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed text-justify malayalam-desc">
            {book.description}
          </p>

          <div className="pt-2">
            <Link
              href={`/products?search=${encodeURIComponent(book.title)}`}
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

export default FeaturedBookSpotlight;
