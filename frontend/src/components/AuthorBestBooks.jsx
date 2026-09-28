'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { fetchBooks } from '@/lib/api';

const DEFAULT_AUTHOR_BOOKS = [
  {
    id: 'ab-1',
    title: 'ഘടോൽക്കചൻ',
    rating: '5.4',
    description: 'പാണ്ഡവർക്കായി ധീരമായി പോരാടിയ ഘടോൽക്കചൻ കർണ്ണന്റെ ആയുധത്താൽ വീരമൃത്യു വരിക്കുന്നു.',
    image: '/author_best1.png',
    slug: 'ghadolkachan'
  },
  {
    id: 'ab-2',
    title: 'ഘടോൽക്കചൻ - രാക്ഷസപർവ്വം',
    rating: '5.4',
    description: 'ഘടോൽക്കചൻ പാണ്ഡവർക്കായി പോരാടിയ ധീരനായ യോദ്ധാവായിരുന്നു.',
    image: '/author_best2.png',
    slug: 'ghadolkachan-rakshasaparvam'
  }
];

export const AuthorBestBooks = () => {
  const [books, setBooks] = useState(DEFAULT_AUTHOR_BOOKS);

  useEffect(() => {
    const loadAuthorBestBooks = async () => {
      try {
        const liveBooks = await fetchBooks({ author: 'രാജേഷ് കെ.ആർ' });
        if (Array.isArray(liveBooks) && liveBooks.length >= 2) {
          setBooks(
            liveBooks.slice(0, 2).map((b, idx) => ({
              id: b._id,
              title: b.title || b.name,
              rating: b.rating ? String(b.rating) : '5.4',
              description: b.description || DEFAULT_AUTHOR_BOOKS[idx]?.description,
              image: (b.images && b.images[0]) || (idx === 0 ? '/author_best1.png' : '/author_best2.png'),
              slug: b.slug || b._id
            }))
          );
        }
      } catch (err) {
        console.warn('[AuthorBestBooks] Backend fetch fallback:', err);
      }
    };

    loadAuthorBestBooks();
  }, []);

  return (
    <section className="py-10 sm:py-14 px-4 sm:px-8 max-w-6xl mx-auto">
      {/* Centered Heading */}
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-slate-900 text-center tracking-tight pb-8 sm:pb-10">
        Author’s Best Book
      </h2>

      {/* 2-Column Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {books.map((book, idx) => (
          <Link
            key={book.id || idx}
            href={`/books/${book.slug}`}
            className="group flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <div className="w-full sm:w-44 aspect-4/3 flex-shrink-0 overflow-hidden rounded-md bg-slate-100">
              <img
                src={book.image}
                alt={book.title}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.src = idx === 0 ? '/author_best1.png' : '/author_best2.png';
                }}
              />
            </div>

            <div className="flex-1 space-y-2 text-left">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#4361ee] transition-colors">
                  {book.title}
                </h3>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-700">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>({book.rating})</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed malayalam-desc line-clamp-3">
                {book.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default AuthorBestBooks;
