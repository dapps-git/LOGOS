'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, ArrowRight, Heart } from 'lucide-react';
import { fetchBestSellers } from '@/lib/api';
import { useWishlist } from '@/context/WishlistContext';

const DEFAULT_BESTSELLER_BOOKS = [
  {
    id: 'bs-1',
    title: 'കമ്മ്യൂണിസ്റ്റ് ഹീറോ',
    author: 'പി.ടി. പ്രദീഷ്',
    price: 94.00,
    originalPrice: 160.00,
    rating: '5.4',
    image: '/bestseller1.png',
    href: '/books/communist-hero'
  },
  {
    id: 'bs-2',
    title: 'കുമ്പളമ്പറമ്പിലെ കുമ്പുളുമൂസുകൾ',
    author: 'ദാമോദർ രാധാകൃഷ്ണൻ',
    price: 64.00,
    originalPrice: 110.00,
    rating: '5.4',
    image: '/bestseller2.png',
    href: '/books/kumbalamparambile-kumbulumusukal'
  },
  {
    id: 'bs-3',
    title: 'മിലുപ്പ എന്ന കുതിര',
    author: 'സന്തോഷ് ഏച്ചിക്കാനം',
    price: 112.00,
    originalPrice: 180.00,
    rating: '5.4',
    image: '/bestseller3.png',
    href: '/books/miluppa-enna-kuthira'
  },
  {
    id: 'bs-4',
    title: 'രണ്ടുപക്ഷം',
    author: 'യു .കെ .കുമാരൻ',
    price: 80.00,
    originalPrice: 140.00,
    rating: '5.4',
    image: '/bestseller4.png',
    href: '/books/randupaksham'
  }
];

export const Bestsellers = () => {
  const [books, setBooks] = useState(DEFAULT_BESTSELLER_BOOKS);
  const { toggleWishlist, isBookInWishlist } = useWishlist();

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const liveBooks = await fetchBestSellers();
        if (Array.isArray(liveBooks) && liveBooks.length > 0) {
          const formatted = liveBooks.map((b) => ({
            id: b._id,
            title: b.title || b.name,
            author: b.author,
            price: Number(b.discountPrice || b.price || 0),
            originalPrice: b.discountPrice ? Number(b.price) : null,
            rating: b.rating ? String(b.rating) : '5.4',
            image: (b.images && b.images[0]) || '/bestseller1.png',
            href: `/books/${b.slug || b._id}`
          }));
          setBooks(formatted.slice(0, 8));
        }
      } catch (err) {
        console.warn('[Bestsellers] Live fetch fallback:', err);
      }
    };

    loadBooks();
  }, []);

  return (
    <section className="py-10 sm:py-14 px-4 sm:px-8 max-w-6xl mx-auto">
      {/* Section Header */}
      <div className="flex items-end justify-between gap-4 pb-6 sm:pb-8">
        <div>
          <p className="text-xs sm:text-sm font-medium text-[#4361ee] tracking-tight">
            Most loved
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-slate-900 tracking-tight mt-1">
            Bestsellers
          </h2>
        </div>

        <Link
          href="/products?sort=bestsellers"
          className="p-1.5 text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-full transition-all flex-shrink-0 group mb-0.5"
          title="View all books"
        >
          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Book Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {books.map((book) => (
          <Link
            key={book.id}
            href={book.href}
            className="group flex flex-col justify-between transition-all"
          >
            {/* Book Image Showcase Container */}
            <div className="relative aspect-3/4 w-full overflow-hidden bg-[#f0f0f0] rounded-xs transition-transform duration-300 group-hover:scale-[1.02]">
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
    </section>
  );
};
