'use client';

import React from 'react';
import Link from 'next/link';
import { Star, ArrowRight } from 'lucide-react';

const NEW_ARRIVAL_BOOKS = [
  {
    id: 'na-1',
    title: 'അപരാഹ്നത്തിലെ മരണം',
    author: 'വിവർത്തനം സുരേഷ് , എം . ജി',
    price: 354.00,
    originalPrice: 499.00,
    rating: '5.4',
    image: '/book1.jpg',
    href: '/books/aparahnatthile-maranam'
  },
  {
    id: 'na-2',
    title: 'ഫോർ ജസ്റ്റിസ്',
    author: 'അജീഷ് ഗംഗാധരൻ',
    price: 338.00,
    originalPrice: 495.00,
    rating: '5.4',
    image: '/book2.png',
    href: '/books/four-justice'
  },
  {
    id: 'na-3',
    title: 'ഡാർക്ക് ഫാന്റസി',
    author: 'ജിസ ജോൺ',
    price: 170.00,
    originalPrice: null,
    rating: '5.4',
    image: '/book3.png',
    href: '/books/dark-fantasy'
  },
  {
    id: 'na-4',
    title: 'മുക്തകണ്ഠം വികെഎൻ (HARD BOUND)',
    author: 'കെ. രഘുനാഥൻ',
    price: 432.00,
    originalPrice: 650.00,
    rating: '5.4',
    image: '/book4.png',
    href: '/books/mukthakandam-vkn'
  }
];

export const NewArrivals = () => {
  return (
    <section className="py-10 sm:py-14 px-4 sm:px-8 max-w-6xl mx-auto">
      {/* Section Header */}
      <div className="flex items-end justify-between gap-4 pb-6 sm:pb-8">
        <div>
          <p className="text-xs sm:text-sm font-medium text-[#4361ee] tracking-tight">
            Fresh from the press
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-slate-900 tracking-tight mt-1">
            New Arrivals
          </h2>
        </div>

        <Link
          href="/books"
          className="p-1.5 text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-full transition-all flex-shrink-0 group mb-0.5"
          title="View all new books"
        >
          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* 4-Column Book Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {NEW_ARRIVAL_BOOKS.map((book) => (
          <Link
            key={book.id}
            href={book.href}
            className="group flex flex-col justify-between transition-all"
          >
            {/* Book Image Showcase Container (matching 311x426 aspect ratio) */}
            <div className="relative aspect-3/4 w-full overflow-hidden bg-[#e5e5e5] rounded-xs transition-transform duration-300 group-hover:scale-[1.02]">
              <img
                src={book.image}
                alt={book.title}
                className="w-full h-full object-cover object-center"
              />
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
