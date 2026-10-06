'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchAuthors } from '@/lib/api';

export const FeaturedAuthors = () => {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const live = await fetchAuthors();
        if (isMounted) {
          if (Array.isArray(live) && live.length > 0) {
            setAuthors(
              live.map((a, idx) => ({
                id: a._id || `auth-${idx}`,
                name: a.name || a,
                image: a.image || a.photo || '/placeholder-author.png',
                href: `/products?author=${encodeURIComponent(a.name || a)}`
              }))
            );
          } else {
            setAuthors([]);
          }
          setLoading(false);
        }
      } catch (e) {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  if (!loading && authors.length === 0) return null;

  return (
    <section className="py-10 sm:py-14 px-4 sm:px-8 max-w-6xl mx-auto">
      {/* Section Header */}
      <div className="flex items-end justify-between gap-4 pb-6 sm:pb-8">
        <div>
          <p className="text-xs sm:text-sm font-medium text-[#4361ee] tracking-tight">
            The voices behind the pages
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-slate-900 tracking-tight mt-1">
            Featured Authors
          </h2>
        </div>
      </div>

      {/* Authors Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
        {authors.map((author) => (
          <Link
            key={author.id}
            href={author.href}
            className="group flex flex-col items-center text-center space-y-3"
          >
            <div className="relative aspect-3/4 w-full overflow-hidden bg-slate-100 rounded-xs transition-transform duration-300 group-hover:scale-[1.02]">
              <img
                src={author.image}
                alt={author.name}
                className="w-full h-full object-cover object-center"
              />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#4361ee] transition-colors leading-snug">
              {author.name}
            </h3>
          </Link>
        ))}
      </div>
    </section>
  );
};
