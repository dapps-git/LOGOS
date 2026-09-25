'use client';

import React from 'react';
import Link from 'next/link';
import { Star, ArrowRight } from 'lucide-react';

const HANDPICKED_BOOKS = [
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

        <Link
          href="/books?featured=handpicked"
          className="p-1.5 text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-full transition-all flex-shrink-0 group mb-0.5"
          title="Meet all the authors"
        >
          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* 3-Column Staggered Book Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 items-end pt-4">
        {HANDPICKED_BOOKS.map((book) => (
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
