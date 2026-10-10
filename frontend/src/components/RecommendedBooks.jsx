'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, Heart } from 'lucide-react';
import { fetchBooks, fetchNewArrivals } from '@/lib/api';
import { useWishlist } from '@/context/WishlistContext';

export const RecommendedBooks = ({ currentBook }) => {
  const [books, setBooks] = useState([]);
  const [recommendationLabel, setRecommendationLabel] = useState('Recommended For You');
  const [recommendationTag, setRecommendationTag] = useState('Based on You');
  const [loading, setLoading] = useState(true);
  const { toggleWishlist, isBookInWishlist } = useWishlist();

  useEffect(() => {
    let isMounted = true;

    const generateRecommendations = async () => {
      try {
        const currentId = currentBook?._id || currentBook?.id;
        const currentSlug = currentBook?.slug;
        const currentGenre = currentBook?.theme || currentBook?.genre;
        const currentAuthor = currentBook?.author;

        // 1. Check user's browsing profile from localStorage
        let preferredGenre = currentGenre;
        try {
          const viewedHistory = JSON.parse(localStorage.getItem('logos_recently_viewed') || '[]');
          if (viewedHistory.length > 0) {
            const genresCount = {};
            viewedHistory.forEach((item) => {
              const g = item.genre || item.theme;
              if (g) genresCount[g] = (genresCount[g] || 0) + 1;
            });
            const topGenre = Object.keys(genresCount).sort((a, b) => genresCount[b] - genresCount[a])[0];
            if (topGenre) preferredGenre = topGenre;
          }
        } catch {}

        let candidates = [];

        // 2. Query books by genre / theme matching algorithm
        if (preferredGenre) {
          try {
            const genreMatches = await fetchBooks({ genre: preferredGenre, limit: 12 });
            if (Array.isArray(genreMatches) && genreMatches.length > 0) {
              candidates = genreMatches.filter(
                (b) => String(b._id || b.id) !== String(currentId) && b.slug !== currentSlug
              );
              if (candidates.length > 0 && isMounted) {
                setRecommendationLabel(`More in ${preferredGenre}`);
                setRecommendationTag('Curated For You');
              }
            }
          } catch {}
        }

        // 3. If candidates < 4 and author exists, look for same author
        if (candidates.length < 4 && currentAuthor) {
          try {
            const authorMatches = await fetchBooks({ author: currentAuthor, limit: 6 });
            if (Array.isArray(authorMatches) && authorMatches.length > 0) {
              const filteredAuthor = authorMatches.filter(
                (b) => String(b._id || b.id) !== String(currentId) && b.slug !== currentSlug
              );
              // Avoid duplicates
              const existingIds = new Set(candidates.map((c) => String(c._id || c.id)));
              filteredAuthor.forEach((b) => {
                if (!existingIds.has(String(b._id || b.id))) {
                  candidates.push(b);
                }
              });
            }
          } catch {}
        }

        // 4. Fill remaining slots with new arrivals / trending
        if (candidates.length < 4) {
          try {
            const newArrivals = await fetchNewArrivals();
            if (Array.isArray(newArrivals)) {
              const existingIds = new Set(candidates.map((c) => String(c._id || c.id)));
              if (currentId) existingIds.add(String(currentId));

              newArrivals.forEach((b) => {
                const id = String(b._id || b.id);
                if (!existingIds.has(id) && b.slug !== currentSlug) {
                  candidates.push(b);
                  existingIds.add(id);
                }
              });
            }
          } catch {}
        }

        if (isMounted) {
          const formatted = candidates.slice(0, 4).map((b) => ({
            id: b._id || b.id,
            title: b.title || b.name,
            author: b.author,
            price: Number(b.discountPrice || b.price || 0),
            originalPrice: b.discountPrice ? Number(b.price) : (b.originalPrice ? Number(b.originalPrice) : null),
            rating: b.rating ? String(b.rating) : '5.0',
            image: (b.images && b.images[0]) || b.image || '/book-placeholder.svg',
            href: `/books/${b.slug || b._id || b.id}`
          }));

          setBooks(formatted);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) setLoading(false);
      }
    };

    generateRecommendations();
    return () => {
      isMounted = false;
    };
  }, [currentBook?._id, currentBook?.id, currentBook?.slug, currentBook?.theme, currentBook?.genre, currentBook?.author]);

  if (!loading && books.length === 0) return null;

  return (
    <section className="py-10 sm:py-14 px-4 sm:px-8 max-w-6xl mx-auto">
      {/* Section Header */}
      <div className="flex items-end justify-between gap-4 pb-6 sm:pb-8">
        <div>
          <p className="text-xs sm:text-sm font-medium text-[#4361ee] tracking-tight">
            {recommendationTag}
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-slate-900 tracking-tight mt-1">
            {recommendationLabel}
          </h2>
        </div>
      </div>

      {/* 4-Column Book Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {books.map((book) => (
          <Link
            key={book.id}
            href={book.href}
            className="group flex flex-col justify-between transition-all"
          >
            {/* Book Image Showcase Container */}
            <div className="relative aspect-3/4 w-full overflow-hidden bg-slate-100 rounded-xs transition-transform duration-300 group-hover:scale-[1.02]">
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
