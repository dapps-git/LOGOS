'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, Heart } from 'lucide-react';
import { fetchFeaturedBooks } from '@/lib/api';
import { useWishlist } from '@/context/WishlistContext';

const DEFAULT_HANDPICKED_BOOKS = [
  {
    num: '01',
    id: 'hp-1',
    title: 'ദൈവമെന്ന മനുഷ്യൻ',
    author: 'വിനീഷ് കെ.എൻ',
    price: 104.00,
    originalPrice: 180.00,
    rating: '5.4',
    image: '/handpicked1.png',
    href: '/books/daivamanna-manushyan'
  },
  {
    num: '02',
    id: 'hp-2',
    title: 'മണിമുഴങ്ങുന്നത് ആർക്കുവേണ്ടി',
    author: 'ഏണസ്റ്റ് ഹെമിങ് വേ',
    price: 616.00,
    originalPrice: 860.00,
    rating: '5.4',
    image: '/handpicked2.png',
    href: '/books/manimuzhangunnathu-aarkkuvendi',
    prominent: true
  },
  {
    num: '03',
    id: 'hp-3',
    title: 'കണക്കിലെ ചിരികൾ',
    author: 'അമിത് കുമാർ',
    price: 178.00,
    originalPrice: 270.00,
    rating: '5.4',
    image: '/handpicked3.png',
    href: '/books/kanakkile-chirikal'
  }
];

export const HandpickedReads = () => {
  const [books, setBooks] = useState(DEFAULT_HANDPICKED_BOOKS);
  const { toggleWishlist, isBookInWishlist } = useWishlist();

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const liveBooks = await fetchFeaturedBooks();
        if (Array.isArray(liveBooks) && liveBooks.length >= 3) {
          const formatted = liveBooks.slice(0, 3).map((b, idx) => ({
            num: `0${idx + 1}`,
            id: b._id,
            title: b.title || b.name,
            author: b.author,
            price: Number(b.discountPrice || b.price || 0),
            originalPrice: b.discountPrice ? Number(b.price) : null,
            rating: b.rating ? String(b.rating) : '5.4',
            image: (b.images && b.images[0]) || '/handpicked1.png',
            href: `/books/${b.slug || b._id}`,
            prominent: idx === 1
          }));
          setBooks(formatted);
        }
      } catch (err) {
        console.warn('[HandpickedReads] Live fetch fallback:', err);
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
            From our editors&apos; desks
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-slate-900 tracking-tight mt-1">
            Handpicked Reads
          </h2>
        </div>
      </div>

      {/* 3-Column Staggered Book Showcase */}
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
    </section>
  );
};
