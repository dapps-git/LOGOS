'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const AUTHORS = [
  {
    id: 'fa-1',
    name: 'ഏണസ്റ്റ് ഹെമിങ് വേ',
    image: '/author_hemingway.png',
    href: '/authors/ernest-hemingway',
    font: 'font-sans'
  },
  {
    id: 'fa-2',
    name: 'വിനീഷ് കെ.എൻ',
    image: '/author_vineesh.png',
    href: '/authors/vineesh-kn',
    font: 'font-sans'
  },
  {
    id: 'fa-3',
    name: 'Meera Jackson',
    image: '/author_meera.png',
    href: '/authors/meera-jackson',
    font: 'font-serif'
  },
  {
    id: 'fa-4',
    name: 'Fab Jackson',
    image: '/author_fab.png',
    href: '/authors/fab-jackson',
    font: 'font-serif'
  }
];

export const FeaturedAuthors = () => {
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

        <Link
          href="/authors"
          className="p-1.5 text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-full transition-all flex-shrink-0 group mb-0.5"
          title="Meet all the authors"
        >
          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* 4 Authors Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
        {AUTHORS.map((author) => (
          <Link
            key={author.id}
            href={author.href}
            className="group flex flex-col items-center text-center space-y-3"
          >
            {/* Portrait Image Container */}
            <div className="relative aspect-3/4 w-full overflow-hidden bg-slate-100 rounded-xs transition-transform duration-300 group-hover:scale-[1.02]">
              <img
                src={author.image}
                alt={author.name}
                className="w-full h-full object-cover object-center"
              />
            </div>

            {/* Author Name */}
            <h3
              className={`text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#4361ee] transition-colors leading-snug ${author.font}`}
            >
              {author.name}
            </h3>
          </Link>
        ))}
      </div>
    </section>
  );
};
