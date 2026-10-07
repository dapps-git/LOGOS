'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, Heart } from 'lucide-react';
import { fetchFeaturedBooks, fetchBooks } from '@/lib/api';
import { useWishlist } from '@/context/WishlistContext';
import { HandpickedSkeleton } from '@/components/Skeletons';

export const HandpickedReads = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toggleWishlist, isBookInWishlist } = useWishlist();

  useEffect(() => {
    let isMounted = true;
    const loadBooks = async () => {
      try {
        const [liveBooks, allBooks] = await Promise.all([
          fetchFeaturedBooks().catch(() => []),
          fetchBooks({ limit: 40 }).catch(() => [])
        ]);

        if (isMounted) {
          const pool = [...(Array.isArray(liveBooks) ? liveBooks : []), ...(Array.isArray(allBooks) ? allBooks : [])];
          const map = new Map();
          pool.forEach((b) => {
            if (b && b._id && !map.has(b._id)) map.set(b._id, b);
          });
          const uniqueBooks = Array.from(map.values());

          // Prioritize books with real cover images
          const sorted = uniqueBooks.sort((a, b) => {
            const aHas = a.images && a.images.length > 0 && a.images[0] && a.images[0] !== '/book-placeholder.svg' ? 1 : 0;
            const bHas = b.images && b.images.length > 0 && b.images[0] && b.images[0] !== '/book-placeholder.svg' ? 1 : 0;
            return bHas - aHas;
          });

          if (sorted.length > 0) {
            const formatted = sorted.slice(0, 3).map((b, idx) => ({
              num: `0${idx + 1}`,
              id: b._id,
              title: b.title || b.name,
              author: b.author,
              price: Number(b.discountPrice || b.price || 0),
              originalPrice: b.discountPrice ? Number(b.price) : null,
              rating: b.rating ? String(b.rating) : '5.0',
              image: (b.images && b.images[0]) || '/book-placeholder.svg',
              href: `/books/${b.slug || b._id}`,
              prominent: idx === 1
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
    <section className="py-10 sm:py-14 px-4 sm:px-8 max-w-6xl mx-auto">
      {/* Section Header */}
      <div className="flex items-end justify-between gap-4 pb-6 sm:pb-8">
        <div>
          <p className="text-xs sm:text-sm font-medium text-[#4361ee] tracking-tight">
            From our editors&apos; desks
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-slate-900 tracking-tight mt-1">
            Handpicked Reads
          </h2>
        </div>
      </div>

      {/* 3-Column Staggered Book Showcase */}
      {loading ? (
        <HandpickedSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 items-end pt-4">
          {books.map((book) => (
            <Link
              key={book.id}
              href={book.href}
              className={`group flex flex-col transition-all ${
                book.prominent ? '-translate-y-2 sm:-translate-y-4' : ''
              }`}
            >
              {/* Number Index (01, 02, 03) */}
              <span className="text-xl sm:text-2xl font-serif text-[#224494] font-semibold mb-2 block">
                {book.num}
              </span>

              {/* Book Image Showcase Container */}
              <div className="relative aspect-3/4 w-full overflow-hidden bg-slate-100 rounded-xs transition-transform duration-300 group-hover:scale-[1.02] shadow-sm">
                <img
                  src={book.image}
                  alt={book.title}
                  className="w-full h-full object-cover object-center"
                />
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
              <div className="pt-3 space-y-1 text-left">
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
