'use client';

import React from 'react';
import { Star } from 'lucide-react';

const REVIEWS = [
  {
    id: 'rev-1',
    author: 'Joseph',
    rating: 4.5,
    avatar: '/testimonial_avatar.png',
    text: '“I bought an e-book for my weekend trip and ended up finishing it in two days. The whole process was quick and easy.”'
  },
  {
    id: 'rev-2',
    author: 'Joseph',
    rating: 4.5,
    avatar: '/testimonial_avatar.png',
    text: '“I bought an e-book for my weekend trip and ended up finishing it in two days. The whole process was quick and easy.”'
  },
  {
    id: 'rev-3',
    author: 'Joseph',
    rating: 4.5,
    avatar: '/testimonial_avatar.png',
    text: '“I bought an e-book for my weekend trip and ended up finishing it in two days. The whole process was quick and easy.”'
  }
];

export const Testimonials = () => {
  return (
    <section className="py-12 sm:py-16 px-4 sm:px-8 max-w-6xl mx-auto">
      {/* Section Header with Divider */}
      <div className="pb-8">
        <p className="text-xs sm:text-sm font-medium text-[#4361ee] tracking-tight">
          Our community
        </p>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-slate-900 tracking-tight mt-1">
          What Our Person’s Say
        </h2>
        <div className="w-full border-b border-slate-200 mt-4" />
      </div>

      {/* 3 Review Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {REVIEWS.map((review, idx) => (
          <div
            key={`${review.id}-${idx}`}
            className="border border-slate-300/80 rounded-2xl p-6 sm:p-7 bg-white shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-400 transition-colors"
          >
            {/* Header: User Avatar, Name & Rating */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={review.avatar}
                  alt={review.author}
                  className="w-10 h-10 rounded-full object-cover select-none border border-slate-200"
                />
                <span className="text-xs sm:text-sm font-semibold text-slate-900">
                  {review.author}
                </span>
              </div>

              <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-700">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>({review.rating})</span>
              </div>
            </div>

            {/* Testimonial Quote */}
            <p className="text-xs sm:text-sm text-slate-700 font-serif leading-relaxed italic">
              {review.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
