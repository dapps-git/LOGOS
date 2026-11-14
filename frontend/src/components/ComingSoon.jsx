'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Clock,
  Sparkles,
  Heart,
  ShoppingCart,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Truck
} from 'lucide-react';
import { fetchComingSoonBooks, fetchBooks, optimizeImageUrl, getBookCoverImage } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

export const ComingSoon = () => {
  const router = useRouter();
  const { addToCart } = useCart();
  const { toggleWishlist, isBookInWishlist } = useWishlist();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedIds, setAddedIds] = useState({});

  useEffect(() => {
    let isMounted = true;
    const loadComingSoon = async () => {
      try {
        let list = await fetchComingSoonBooks().catch(() => []);
        if (!Array.isArray(list) || list.length === 0) {
          list = await fetchBooks({ isComingSoon: true, limit: 4 }).catch(() => []);
        }
        if (!Array.isArray(list) || list.length === 0) {
          list = await fetchBooks({ isPreBook: true, limit: 4 }).catch(() => []);
        }

        if (isMounted) {
          setBooks(Array.isArray(list) ? list : []);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) setLoading(false);
      }
    };

    loadComingSoon();
    return () => {
      isMounted = false;
    };
  }, []);

  const handlePreBook = async (book) => {
    const id = book?._id || book?.id || book?.slug;
    if (!id) return;
    const ok = await addToCart(book, 1);
    if (ok !== false) {
      setAddedIds((prev) => ({ ...prev, [id]: true }));
      setTimeout(() => setAddedIds((prev) => ({ ...prev, [id]: false })), 2000);
      router.push('/checkout');
    }
  };

  const handleAddToCart = async (book) => {
    const id = book?._id || book?.id || book?.slug;
    if (!id) return;
    const ok = await addToCart(book, 1);
    if (ok !== false) {
      setAddedIds((prev) => ({ ...prev, [id]: true }));
      setTimeout(() => setAddedIds((prev) => ({ ...prev, [id]: false })), 2000);
    }
  };

  if (!loading && books.length === 0) return null;

  return (
    <section className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 sm:mb-8 pb-4 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200 mb-1.5">
            <Clock className="w-3 h-3" />
            Upcoming Releases &amp; Pre-Orders
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Coming Soon
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Pre-book now to receive your reserved first edition upon launch.
          </p>
        </div>

        {/* View All Coming Soon Link */}
        <Link
          href="/products?collection=coming-soon"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#1E3A8A] hover:text-[#152e72] group shrink-0"
        >
          <span>View All Coming Soon</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Grid: 2 columns on mobile, 4 on desktop */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-white rounded-2xl border border-slate-200 p-3 animate-pulse">
              <div className="aspect-[3/4] bg-slate-100 rounded-xl mb-3" />
              <div className="h-4 bg-slate-200 rounded w-4/5 mb-2" />
              <div className="h-3 bg-slate-150 rounded w-1/2 mb-3" />
              <div className="h-8 bg-slate-200 rounded-lg" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
          {books.slice(0, 4).map((book) => {
            const bookId = book._id || book.id;
            const title = book.title || book.name || book.titleMalayalam || 'Coming Soon';
            const author = book.author || 'LOGOS Publications';
            const price = Number(book.discountPrice || book.price || 0);
            const originalPrice = book.discountPrice && Number(book.discountPrice) < Number(book.price) ? Number(book.price) : null;
            const cover = getBookCoverImage(book);
            const inWishlist = isBookInWishlist(bookId);
            const isAdded = addedIds[bookId];

            return (
              <div
                key={bookId}
                className="group bg-white rounded-2xl border border-slate-200/90 hover:border-purple-300 shadow-2xs hover:shadow-md transition-all duration-200 p-2.5 sm:p-3.5 flex flex-col justify-between"
              >
                {/* Book Cover Image Container */}
                <div className="relative aspect-[3/4] w-full bg-[#FAF5FF]/60 rounded-xl overflow-hidden mb-2.5 border border-purple-100/70 flex items-center justify-center p-2 group-hover:bg-[#F3E8FF]/60 transition-colors">
                  <Link href={`/books/${book.slug || bookId}`} className="block w-full h-full">
                    <img
                      src={optimizeImageUrl(cover, { width: 450, quality: 'auto' })}
                      alt={title}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      onError={(e) => {
                        if (!e.currentTarget.dataset.failed) {
                          e.currentTarget.dataset.failed = 'true';
                          e.currentTarget.src = '/book-placeholder.svg';
                        }
                      }}
                      className="w-full h-full object-contain object-center drop-shadow-sm group-hover:scale-105 transition-transform duration-300 select-none"
                    />
                  </Link>

                  {/* Left Pre-Book Ribbon Badge */}
                  <span className="absolute top-2 left-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-xs tracking-tight pointer-events-none">
                    PRE-BOOK
                  </span>

                  {/* Requested Small Transparent Right Badge on Book Cover */}
                  <span className="absolute top-2 right-10 bg-black/45 backdrop-blur-xs text-white border border-white/20 text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-xs tracking-tight flex items-center gap-1 pointer-events-none">
                    <Clock className="w-2.5 h-2.5 text-amber-300" />
                    2-3 WEEKS
                  </span>

                  {/* Wishlist Heart Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleWishlist(book);
                    }}
                    className={`absolute top-2 right-2 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center shadow-xs border border-slate-200/70 backdrop-blur-md transition-all z-10 ${
                      inWishlist
                        ? 'bg-white text-rose-500 shadow-rose-200'
                        : 'bg-white/90 text-slate-400 hover:text-rose-500 hover:bg-white'
                    }`}
                    title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  >
                    <Heart className={`w-3.5 h-3.5 ${inWishlist ? 'fill-rose-500 text-rose-500' : ''}`} />
                  </button>
                </div>

                {/* Details Breakdown */}
                <div className="space-y-1.5 flex-1 flex flex-col justify-between">
                  <div>
                    <Link href={`/books/${book.slug || bookId}`} className="block">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-purple-700 transition-colors line-clamp-1 leading-snug">
                        {title}
                      </h3>
                    </Link>
                    <p className="text-[11px] font-normal text-slate-500 truncate mt-0.5">
                      {author}
                    </p>

                    {/* Delivery notice */}
                    <div className="inline-flex items-center gap-1 text-[10px] text-amber-800 bg-amber-50/80 px-1.5 py-0.5 rounded-md border border-amber-200/60 mt-1">
                      <Truck className="w-3 h-3 text-amber-700 shrink-0" />
                      <span className="truncate">Dispatch in ~2–3 weeks</span>
                    </div>
                  </div>

                  {/* Price & Pre-Book Button */}
                  <div className="pt-2 border-t border-slate-100 mt-2 space-y-2">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm sm:text-base font-extrabold text-slate-900">
                        ₹{price.toFixed(0)}
                      </span>
                      {originalPrice && (
                        <span className="text-[11px] text-slate-400 line-through">
                          ₹{originalPrice.toFixed(0)}
                        </span>
                      )}
                    </div>

                    {/* Action: Pre-Book Button (same flow, directs to payment & delivery address) */}
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => handlePreBook(book)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-2.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
                      >
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span>Pre-Book</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAddToCart(book)}
                        className="w-8 h-8 rounded-xl border border-purple-200 hover:bg-purple-50 text-purple-700 flex items-center justify-center transition-colors shrink-0"
                        title="Add to Pre-Order Cart"
                      >
                        {isAdded ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <ShoppingCart className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View All Coming Soon Button at the End (->) */}
      <div className="mt-8 text-center">
        <Link
          href="/products?collection=coming-soon"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-purple-300 bg-purple-50/70 hover:bg-purple-100/70 text-purple-900 font-bold text-xs sm:text-sm transition-all group shadow-2xs cursor-pointer"
        >
          <span>View All Coming Soon Books</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
};

export default ComingSoon;

