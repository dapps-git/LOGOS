'use client';

import React from 'react';
import Link from 'next/link';
import { Star } from 'lucide-react';

export const AuthorBestBooks = () => {
  return (
    <section className="py-10 sm:py-14 px-4 sm:px-8 max-w-6xl mx-auto">
      {/* Centered Heading */}
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-slate-900 text-center tracking-tight pb-8 sm:pb-10">
        Author’s Best Book
      </h2>

      {/* 2-Column Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {/* Card 1 */}
        <Link
          href="/books/ghadolkachan"
          className="group flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors"
        >
          <div className="w-full sm:w-44 aspect-4/3 flex-shrink-0 overflow-hidden rounded-md bg-slate-100">
            <img
              src="/author_best1.png"
              alt="ഘടോൽക്കചൻ"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          <div className="flex-1 space-y-2 text-left">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#4361ee] transition-colors">
                ഘടോൽക്കചൻ
              </h3>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-700">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>(5.4)</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed malayalam-desc">
              പാണ്ഡവർക്കായി ധീരമായി പോരാടിയ ഘടോൽക്കചൻ കർണ്ണന്റെ ആയുധത്താൽ വീരമൃത്യു വരിക്കുന്നു.
            </p>
          </div>
        </Link>

        {/* Card 2 */}
        <Link
          href="/books/ghadolkachan-rakshasaparvam"
          className="group flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors"
        >
          <div className="w-full sm:w-44 aspect-4/3 flex-shrink-0 overflow-hidden rounded-md bg-slate-100">
            <img
              src="/author_best2.png"
              alt="ഘടോൽക്കചൻ - രാക്ഷസപർവ്വം"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          <div className="flex-1 space-y-2 text-left">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#4361ee] transition-colors">
                ഘടോൽക്കചൻ - രാക്ഷസപർവ്വം
              </h3>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-700">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>(5.4)</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed malayalam-desc">
              ഘടോൽക്കചൻ പാണ്ഡവർക്കായി പോരാടിയ ധീരനായ യോദ്ധാവായിരുന്നു
            </p>
          </div>
        </Link>
      </div>
    </section>
  );
};
