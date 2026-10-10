'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { fetchBooks } from '@/lib/api';
import { AuthorBestBooksSkeleton } from '@/components/Skeletons';

export const AuthorBestBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadAuthorBestBooks = async () => {
      try {
        const [spotlightBooks, allBooks] = await Promise.all([
          fetchBooks({ isAuthorSpotlight: true }).catch(() => []),
          fetchBooks({ author: 'രാജേഷ് കെ.ആർ' }).catch(() => [])
        ]);

        if (isMounted) {
          const pool = [...(Array.isArray(spotlightBooks) ? spotlightBooks : []), ...(Array.isArray(allBooks) ? allBooks : [])];
          const map = new Map();
          pool.forEach((b) => {
            if (b && (b._id || b.slug) && !map.has(b.slug || b._id)) {
              map.set(b.slug || b._id, b);
            }
          });

          const uniqueBooks = Array.from(map.values());

          if (uniqueBooks.length >= 2) {
            setBooks(
              uniqueBooks.slice(0, 2).map((b, idx) => ({
                id: b._id || `auth-best-${idx}`,
                title: b.title || b.name,
                rating: b.rating ? String(b.rating) : '5.0',
                description: b.description,
                image: (b.images && b.images[0]) || (idx === 0 ? '/author_best1.png' : '/author_best2.png'),
                slug: b.slug || b._id
              }))
            );
          } else {
            setBooks([
              {
                id: 'ghadolkachan',
                title: 'ഘടോൽക്കചൻ',
                rating: '5.4',
                description: 'പാണ്ഡവർക്കായി ധീരമായി പോരാടിയ ഘടോൽക്കചൻ കർണ്ണന്റെ ആയുധത്താൽ വീരമൃത്യു വരിക്കുന്നു. മഹാഭാരതത്തിലെ വ്യത്യസ്തമായ കഥാപാത്രങ്ങളെ ആഴത്തിൽ അവതരിപ്പിക്കുന്ന കൃതി.',
                image: '/author_best1.png',
                slug: 'ghadolkachan'
              },
              {
                id: 'ghadolkachan-rakshasaparvam',
                title: 'ഘടോൽക്കചൻ - രാക്ഷസപർവ്വം',
                rating: '5.4',
                description: 'ഘടോൽക്കചൻ പാണ്ഡവർക്കായി പോരാടിയ ധീരനായ യോദ്ധാവായിരുന്നു. അദ്ദേഹത്തിന്റെ അസാധാരണമായ വീര്യവും ത്യാഗവും ഉൾക്കൊള്ളുന്ന നോവൽ.',
                image: '/author_best2.png',
                slug: 'ghadolkachan-rakshasaparvam'
              }
            ]);
          }
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setBooks([
            {
              id: 'ghadolkachan',
              title: 'ഘടോൽക്കചൻ',
              rating: '5.4',
              description: 'പാണ്ഡവർക്കായി ധീരമായി പോരാടിയ ഘടോൽക്കചൻ കർണ്ണന്റെ ആയുധത്താൽ വീരമൃത്യു വരിക്കുന്നു.',
              image: '/author_best1.png',
              slug: 'ghadolkachan'
            },
            {
              id: 'ghadolkachan-rakshasaparvam',
              title: 'ഘടോൽക്കചൻ - രാക്ഷസപർവ്വം',
              rating: '5.4',
              description: 'ഘടോൽക്കചൻ പാണ്ഡവർക്കായി പോരാടിയ ധീരനായ യോദ്ധാവായിരുന്നു.',
              image: '/author_best2.png',
              slug: 'ghadolkachan-rakshasaparvam'
            }
          ]);
          setLoading(false);
        }
      }
    };

    loadAuthorBestBooks();
    return () => {
      isMounted = false;
    };
  }, []);

  if (!loading && books.length === 0) return null;

  return (
    <section className="py-10 sm:py-14 px-4 sm:px-8 max-w-6xl mx-auto">
      {/* Centered Heading */}
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-slate-900 text-center tracking-tight pb-8 sm:pb-10">
        Author’s Best Book
      </h2>

      {/* 2-Column Cards Grid */}
      {loading ? (
        <AuthorBestBooksSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {books.map((book, idx) => (
            <Link
              key={book.id || idx}
              href={`/books/${book.slug}`}
              className="group flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <div className="w-32 sm:w-40 flex-shrink-0 flex items-center justify-center">
                <img
                  src={book.image}
                  alt={book.title}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  crossOrigin="anonymous"
                  className="w-full h-auto max-h-[200px] object-contain rounded-md shadow-md group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    if (!e.currentTarget.dataset.failed) {
                      e.currentTarget.dataset.failed = 'true';
                      e.currentTarget.src = idx === 0 ? '/author_best1.png' : '/author_best2.png';
                    }
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
      )}
    </section>
  );
};

export default AuthorBestBooks;
