'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Heart } from 'lucide-react';
import { fetchComingSoonBooks, fetchBooks, optimizeImageUrl, getBookCoverImage } from '@/lib/api';
import { useWishlist } from '@/context/WishlistContext';

export const ComingSoon = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toggleWishlist, isBookInWishlist } = useWishlist();

  useEffect(() => {
    let isMounted = true;
    const loadComingSoon = async () => {
      try {
        let list = await fetchComingSoonBooks().catch(() => []);
        if (!Array.isArray(list) || list.length === 0) {
          list = await fetchBooks({ isComingSoon: true, limit: 6 }).catch(() => []);
        }
        if (!Array.isArray(list) || list.length === 0) {
          list = await fetchBooks({ isPreBook: true, limit: 6 }).catch(() => []);
        }

        // NO DUMMY DATA: only real books explicitly marked coming soon / pre-book
        if (isMounted) {
          const valid = (Array.isArray(list) ? list : []).filter(
            (b) => Boolean(b.isComingSoon || b.isPreBook)
          );
          setBooks(valid);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) setLoading(false);
      }
    };

    loadComingSoon();
    return () => {
      isMounted = false;
    };
  }, []);

  if (!loading && books.length === 0) return null;

  return (
    <section className="py-10 sm:py-14 px-3 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto">
      {/* Section Header with View All -> */}
      <div className="flex items-end justify-between pb-6 sm:pb-8 border-b border-slate-100 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-slate-900 tracking-tight">
            Coming Soon
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Upcoming titles available for pre-booking
          </p>
        </div>

        <Link
          href="/products?collection=coming-soon"
          className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#1E3A8A] hover:text-blue-900 bg-blue-50/80 hover:bg-blue-100/80 px-3.5 sm:px-4 py-2 rounded-full border border-blue-100 transition-all duration-200 shrink-0"
        >
          <span>View All</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Book Cards Grid: identical to New Arrivals & Bestsellers (6 in a row) */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-6 gap-3.5 sm:gap-4">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="aspect-[3/4] bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-6 gap-3.5 sm:gap-4">
          {books.map((book) => {
            const bookId = book._id || book.id;
            const title = book.title || book.name || book.titleMalayalam || 'Coming Soon';
            const author = book.author || 'LOGOS Publications';
            const price = Number(book.discountPrice || book.price || 0);
            const originalPrice = book.discountPrice && Number(book.discountPrice) < Number(book.price) ? Number(book.price) : null;
            const cover = getBookCoverImage(book);
            const inWishlist = isBookInWishlist(bookId);

            return (
              <Link
                key={bookId}
                href={`/books/${book.slug || bookId}`}
                className="group flex flex-col justify-between transition-all"
              >
                {/* Book Image Container */}
                <div className="relative aspect-3/4 w-full overflow-hidden bg-[#f8fafc] rounded-xl border border-slate-100 transition-transform duration-300 group-hover:scale-[1.02]">
                  <img
                    src={optimizeImageUrl(cover, { width: 450, quality: 'auto' })}
                    alt={title}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    className="w-full h-full object-contain object-center drop-shadow-sm select-none"
                    onError={(e) => {
                      if (!e.currentTarget.dataset.failed) {
                        e.currentTarget.dataset.failed = 'true';
                        e.currentTarget.src = '/book-placeholder.svg';
                      }
                    }}
                  />

                  {/* Little Transparent Grey Coming Soon Badge */}
                  <span className="absolute top-2 left-2 bg-slate-900/60 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-md shadow-xs tracking-tight pointer-events-none">
                    Coming Soon
                  </span>

                  {/* Wishlist Heart Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleWishlist({
                        id: bookId,
                        _id: bookId,
                        title,
                        author,
                        price,
                        originalPrice,
                        image: cover,
                        href: `/books/${book.slug || bookId}`
                      });
                    }}
                    className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center shadow-xs border border-slate-200/70 backdrop-blur-md transition-all z-10 ${
                      inWishlist
                        ? 'bg-white text-rose-500 shadow-rose-200'
                        : 'bg-white/90 text-slate-400 hover:text-rose-500 hover:bg-white'
                    }`}
                    title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  >
                    <Heart className={`w-3.5 h-3.5 ${inWishlist ? 'fill-rose-500 text-rose-500' : ''}`} />
                  </button>
                </div>

                {/* Book Details */}
                <div className="mt-2.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-blue-900 transition-colors line-clamp-2 leading-snug">
                      {title}
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 font-normal">
                      {author}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-1.5 pt-1.5 mt-auto">
                    <span className="text-sm sm:text-base font-bold text-slate-900">
                      ₹{price.toFixed(0)}
                    </span>
                    {originalPrice && (
                      <span className="text-[11px] text-slate-400 line-through font-normal">
                        ₹{originalPrice.toFixed(0)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default ComingSoon;
