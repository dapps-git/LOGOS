'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchSpotlightBook } from '@/lib/api';

export const FeaturedBookSpotlight = () => {
  const [book, setBook] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const loadFeaturedAuthorBook = async () => {
      try {
        const liveBook = await fetchSpotlightBook();
        if (isMounted && liveBook && liveBook.title) {
          setBook({
            title: liveBook.title,
            author: liveBook.author,
            description: liveBook.description,
            image: liveBook.image || (liveBook.images && liveBook.images[0]) || '/book-placeholder.svg',
            slug: liveBook.slug || liveBook._id
          });
        }
      } catch (err) {}
    };

    loadFeaturedAuthorBook();
    return () => {
      isMounted = false;
    };
  }, []);

  if (!book) return null;

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-8 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 items-center">
        {/* Left: 3D Book Presentation Image */}
        <div className="flex justify-center items-center">
          <div className="relative max-w-[420px] w-full transition-transform duration-300 hover:scale-[1.02]">
            <img
              src={book.image}
              alt={`${book.title} - ${book.author}`}
              className="w-full h-auto object-contain select-none"
              onError={(e) => {
                e.currentTarget.src = '/featured_parajitha.png';
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
