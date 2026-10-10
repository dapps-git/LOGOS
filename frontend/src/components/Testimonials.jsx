'use client';

import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { fetchTestimonials } from '@/lib/api';

const DEFAULT_REVIEWS = [
  {
    id: 'rev-1',
    author: 'Joseph',
    rating: 4.5,
    avatar: '/testimonial_avatar.png',
    text: '“I bought an e-book for my weekend trip and ended up finishing it in two days. The whole process was quick and easy.”'
  },
  {
    id: 'rev-2',
    author: 'Anjali Menon',
    rating: 5.0,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
    text: '“The book quality and fast doorstep delivery exceeded my expectations. Wonderful Malayalam literature collection!”'
  },
  {
    id: 'rev-3',
    author: 'Rahul Krishna',
    rating: 4.8,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
    text: '“Found rare classic novels that were unavailable elsewhere. The packing was excellent and secure.”'
  }
];

export const Testimonials = () => {
  const [reviews, setReviews] = useState(DEFAULT_REVIEWS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetchTestimonials().then((data) => {
      if (isMounted) {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((r, i) => ({
            id: r._id || `rev-${i}`,
            author: r.customerName || (r.customer && r.customer.name) || 'Reader',
            rating: r.rating || 5,
            avatar: r.avatar || (r.customer && r.customer.avatar) || '/testimonial_avatar.png',
            text: r.comment || r.title || ''
          }));
          setReviews(mapped);
        }
        setLoading(false);
      }
    }).catch(() => {
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!loading && reviews.length === 0) return null;

  // Render a Single Review Card Component
  const renderCard = (review, key) => (
    <div
      key={key}
      className="w-[290px] sm:w-[350px] md:w-[370px] shrink-0 border border-slate-300/80 rounded-2xl p-6 sm:p-7 bg-white shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-400 transition-all hover:shadow-md select-none"
    >
      {/* Header: User Avatar, Name & Rating */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={review.avatar}
            alt={review.author}
            className="w-10 h-10 rounded-full object-cover select-none border border-slate-200 shrink-0"
            onError={(e) => {
              e.currentTarget.src = '/testimonial_avatar.png';
            }}
          />
          <span className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
            {review.author}
          </span>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 shrink-0 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>({Number(review.rating).toFixed(1)})</span>
        </div>
      </div>

      {/* Testimonial Quote */}
      <p className="text-xs sm:text-sm text-slate-700 font-serif leading-relaxed italic line-clamp-4">
        {review.text}
      </p>
    </div>
  );

  // Train Animation items (triplicated for seamless continuous loop)
  const isTrainAnimation = reviews.length > 3;
  const loopItems = isTrainAnimation
    ? [...reviews, ...reviews, ...reviews]
    : reviews;

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-8 max-w-6xl mx-auto overflow-hidden">
      {/* Section Header with Divider */}
      <div className="pb-8">
        <p className="text-xs sm:text-sm font-medium text-[#4361ee] tracking-tight">
          Our community
        </p>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-slate-900 tracking-tight mt-1">
            What Our Person’s Say
          </h2>
          {isTrainAnimation && (
            <span className="hidden sm:inline-block text-[11px] text-slate-400 font-medium italic">
              Hover to pause
            </span>
          )}
        </div>
        <div className="w-full border-b border-slate-200 mt-4" />
      </div>

      {/* Train Animation Carousel or Static Grid */}
      {isTrainAnimation ? (
        <div className="relative w-full overflow-hidden py-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          {/* Gradient Fade Edges for smooth aesthetic */}
          <div className="hidden sm:block absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="hidden sm:block absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

          {/* Marquee Train Track */}
          <div className="train-track gap-5 sm:gap-6 py-2">
            {loopItems.map((review, idx) =>
              renderCard(review, `train-${review.id}-${idx}`)
            )}
          </div>
        </div>
      ) : (
        /* Static Grid when 3 or fewer reviews */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review, idx) => (
            <div
              key={`static-${review.id}-${idx}`}
              className="border border-slate-300/80 rounded-2xl p-6 sm:p-7 bg-white shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-400 transition-colors"
            >
              {/* Header: User Avatar, Name & Rating */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={review.avatar}
                    alt={review.author}
                    className="w-10 h-10 rounded-full object-cover select-none border border-slate-200"
                    onError={(e) => {
                      e.currentTarget.src = '/testimonial_avatar.png';
                    }}
                  />
                  <span className="text-xs sm:text-sm font-semibold text-slate-900">
                    {review.author}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>({Number(review.rating).toFixed(1)})</span>
                </div>
              </div>

              {/* Testimonial Quote */}
              <p className="text-xs sm:text-sm text-slate-700 font-serif leading-relaxed italic">
                {review.text}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default Testimonials;
