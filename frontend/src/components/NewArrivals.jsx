'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, Heart } from 'lucide-react';
import { fetchNewArrivals, fetchBooks } from '@/lib/api';
import { useWishlist } from '@/context/WishlistContext';
import { BookGridSkeleton } from '@/components/Skeletons';

export const NewArrivals = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toggleWishlist, isBookInWishlist } = useWishlist();

  useEffect(() => {
    let isMounted = true;
    const loadBooks = async () => {
      try {
        const [liveBooks, allBooks] = await Promise.all([
          fetchNewArrivals().catch(() => []),
          fetchBooks({ limit: 50 }).catch(() => [])
        ]);

        if (isMounted) {
          const map = new Map();
          // First add new arrivals collection
          if (Array.isArray(liveBooks)) {
            liveBooks.forEach((b) => {
              if (b && b._id) map.set(b._id, { ...b, priority: 2 });
            });
          }
          // Then add all books
          if (Array.isArray(allBooks)) {
            allBooks.forEach((b) => {
              if (b && b._id) {
                const existing = map.get(b._id);
                if (!existing) {
                  map.set(b._id, { ...b, priority: b.isNewArrival ? 2 : 1 });
                }
              }
            });
          }

          const uniqueBooks = Array.from(map.values()).filter((b) => {
            const img = (b.images && b.images[0]) || b.coverImage;
            return img && img !== '/book-placeholder.svg' && !img.includes('placeholder');
          });

          // Sort: new arrival flag first, then real cover images, then newest date
          const sorted = uniqueBooks.sort((a, b) => {
            const aPriority = a.isNewArrival || a.priority === 2 ? 2 : 1;
            const bPriority = b.isNewArrival || b.priority === 2 ? 2 : 1;
            if (bPriority !== aPriority) return bPriority - aPriority;

            const aHasImg = a.images && a.images.length > 0 && a.images[0] && a.images[0] !== '/book-placeholder.svg' ? 1 : 0;
            const bHasImg = b.images && b.images.length > 0 && b.images[0] && b.images[0] !== '/book-placeholder.svg' ? 1 : 0;
            if (bHasImg !== aHasImg) return bHasImg - aHasImg;

            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
          });

          if (sorted.length > 0) {
            const formatted = sorted.slice(0, 6).map((b) => ({
              id: b._id,
              title: b.title || b.name,
              author: b.author,
              price: Number(b.discountPrice || b.price || 0),
              originalPrice: b.discountPrice && Number(b.discountPrice) < Number(b.price) ? Number(b.price) : null,
              rating: b.rating ? String(b.rating) : '5.0',
              image: (b.images && b.images[0]) || b.coverImage || '/book-placeholder.svg',
              href: `/books/${b.slug || b._id}`
            }));
            setBooks(formatted);
          } else {
            setBooks([]);
          }
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) setLoading(false);
      }
    };

    loadBooks();
    return () => {
      isMounted = false;
    };
  }, []);

  if (!loading && books.length === 0) return null;

  return (
    <section className="py-10 sm:py-14 px-3 sm:px-6 lg:px-8 w-full">
      {/* Centered Section Header */}
      <div className="text-center pb-6 sm:pb-8">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-slate-900 tracking-tight">
          New Arrivals
        </h2>
      </div>

      {/* Book Cards Grid: 6 in one row on desktop */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-6 gap-3.5 sm:gap-4">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="aspect-[3/4] bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-6 gap-3.5 sm:gap-4">
          {books.map((book) => (
          <Link
            key={book.id}
            href={book.href}
            className="group flex flex-col justify-between transition-all"
          >
            {/* Book Image Showcase Container */}
            <div className="relative aspect-3/4 w-full overflow-hidden bg-[#f8fafc] rounded-xl border border-slate-100 transition-transform duration-300 group-hover:scale-[1.02]">
              <img
                src={book.image}
                alt={book.title}
                referrerPolicy="no-referrer"
                loading="lazy"
                crossOrigin="anonymous"
                className="w-full h-full object-contain object-center select-none"
                onError={(e) => {
                  if (!e.currentTarget.dataset.failed) {
                    e.currentTarget.dataset.failed = 'true';
                    e.currentTarget.src = '/book-placeholder.svg';
                  }
                }}
              />
              {/* Top-Left Badge with reduced border-radius */}
              <span className="absolute top-2 left-2 bg-[#10b981] text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs tracking-tight pointer-events-none">
                New
              </span>

              {/* Wishlist Heart Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleWishlist({
                    id: book.id,
                    _id: book.id,
                    title: book.title,
                    author: book.author,
                    price: book.price,
                    originalPrice: book.originalPrice,
                    coverImage: book.image,
                    image: book.image,
                    slug: book.href ? book.href.replace('/books/', '') : book.id
                  });
                }}
                className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-sm z-10 ${
                  isBookInWishlist(book.id)
                    ? 'bg-white text-rose-500 shadow-rose-200'
                    : 'bg-white/80 text-slate-400 hover:text-rose-500 hover:bg-white'
                }`}
                title="Wishlist"
              >
                <Heart
                  className={`w-3.5 h-3.5 ${
                    isBookInWishlist(book.id) ? 'fill-rose-500 text-rose-500' : ''
                  }`}
                />
              </button>
            </div>

            {/* Book Metadata & Pricing */}
            <div className="pt-3 space-y-1">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug line-clamp-2 h-9 sm:h-10 flex items-start group-hover:text-[#4361ee] transition-colors">
                {book.title}
              </h3>

              {/* Price & Rating Row */}
              <div className="flex items-center justify-between text-xs pt-1">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-bold text-rose-600 text-xs sm:text-sm">
                    ₹{book.price.toFixed(2)}
                  </span>
                  {book.originalPrice && (
                    <span className="text-[10px] sm:text-xs text-slate-400 line-through">
                      ₹{book.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-slate-700 text-[11px] sm:text-xs font-semibold flex-shrink-0">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>({book.rating})</span>
                </div>
              </div>

              {/* Author Row */}
              <p className="text-[11px] sm:text-xs text-slate-500 truncate pt-0.5">
                {book.author}
              </p>
            </div>
          </Link>
        ))}
      </div>
      )}
    </section>
  );
};
