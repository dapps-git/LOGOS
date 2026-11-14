'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Star,
  ShoppingCart,
  Heart,
  ArrowRight,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Award
} from 'lucide-react';
import { fetchBookOfTheWeek, fetchBooks, optimizeImageUrl, getBookCoverImage } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

export const BookOfTheWeek = () => {
  const router = useRouter();
  const { addToCart } = useCart();
  const { toggleWishlist, isBookInWishlist } = useWishlist();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadBookOfTheWeek = async () => {
      try {
        let live = await fetchBookOfTheWeek().catch(() => null);
        if (!live || !live.title) {
          const list = await fetchBooks({ isBookOfTheWeek: true, limit: 1 }).catch(() => []);
          if (Array.isArray(list) && list.length > 0) {
            live = list[0];
          }
        }
        if (!live || !live.title) {
          const featured = await fetchBooks({ isFeaturedSpotlight: true, limit: 1 }).catch(() => []);
          if (Array.isArray(featured) && featured.length > 0) {
            live = featured[0];
          }
        }
        if (!live || !live.title) {
          const fallback = await fetchBooks({ limit: 1 }).catch(() => []);
          if (Array.isArray(fallback) && fallback.length > 0) {
            live = fallback[0];
          }
        }

        if (isMounted) {
          setBook(live);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) setLoading(false);
      }
    };

    loadBookOfTheWeek();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddToCart = async () => {
    if (!book || isAdding) return;
    setIsAdding(true);
    const ok = await addToCart(book, 1);
    setIsAdding(false);
    if (ok !== false) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2200);
    }
  };

  const handleBuyNow = async () => {
    if (!book) return;
    await addToCart(book, 1);
    router.push('/checkout');
  };

  if (loading) {
    return (
      <section className="py-12 sm:py-16 px-4 sm:px-8 max-w-6xl mx-auto">
        <div className="bg-gradient-to-br from-amber-50/40 via-white to-slate-50 border border-amber-200/60 rounded-3xl p-6 sm:p-10 shadow-sm animate-pulse">
          <div className="h-6 bg-amber-200/60 rounded-full w-36 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-5 flex justify-center">
              <div className="w-64 sm:w-72 aspect-[3/4] bg-slate-200 rounded-2xl" />
            </div>
            <div className="md:col-span-7 space-y-4">
              <div className="h-8 bg-slate-200 rounded w-4/5" />
              <div className="h-5 bg-slate-200 rounded w-1/2" />
              <div className="h-6 bg-slate-200 rounded w-28" />
              <div className="h-20 bg-slate-200 rounded w-full" />
              <div className="h-12 bg-slate-200 rounded-xl w-48" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!book) return null;

  const bookId = book._id || book.id;
  const title = book.title || book.name || book.titleMalayalam || 'Book of the Week';
  const author = book.author || 'LOGOS Author';
  const publisher = book.publisher || 'LOGOS Publications';
  const price = Number(book.discountPrice || book.price || 0);
  const originalPrice = book.discountPrice && Number(book.discountPrice) < Number(book.price) ? Number(book.price) : null;
  const discountPercent = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const rating = book.rating ? Number(book.rating).toFixed(1) : '5.0';
  const cover = getBookCoverImage(book);
  const inWishlist = isBookInWishlist(bookId);

  const rawStock = book.stock !== undefined && book.stock !== null ? Number(book.stock) : null;
  const isOutOfStock = (rawStock !== null && !isNaN(rawStock)) ? rawStock <= 0 : (book.stockStatus === 'out_of_stock');

  return (
    <section className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Decorative Container */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#FFFDF7] via-white to-[#F8FAFC] border-2 border-amber-300/70 rounded-3xl shadow-md p-6 sm:p-10 lg:p-12">
        {/* Subtle Ambient Gold Glow Background */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-amber-200/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-100/30 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header: Pill Badge + Title */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8 pb-4 border-b border-amber-100">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xs">
              <Award className="w-3.5 h-3.5" />
              Book of the Week
            </span>
            <span className="hidden sm:inline-block text-xs font-semibold text-amber-800/80 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/60">
              LOGOS Editor&apos;s Pick
            </span>
          </div>

          <Link
            href={`/books/${book.slug || bookId}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1E3A8A] hover:text-[#152e72] hover:underline transition-colors"
          >
            <span>Explore Book Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Spotlight Showcase Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Book Cover Presentation */}
          <div className="md:col-span-5 flex flex-col items-center justify-center">
            <div className="relative group">
              <Link href={`/books/${book.slug || bookId}`} className="block">
                <div className="relative w-56 sm:w-64 md:w-72 aspect-[3/4] rounded-2xl overflow-hidden bg-slate-50 border border-slate-200/90 shadow-xl group-hover:shadow-2xl group-hover:-translate-y-1 transition-all duration-300 flex items-center justify-center p-3">
                  <img
                    src={optimizeImageUrl(cover, { width: 600, quality: 'auto' })}
                    alt={title}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    onError={(e) => {
                      if (!e.currentTarget.dataset.failed) {
                        e.currentTarget.dataset.failed = 'true';
                        e.currentTarget.src = '/book-placeholder.svg';
                      }
                    }}
                    className={`w-full h-full object-contain drop-shadow-md select-none transition-transform duration-300 group-hover:scale-105 ${isOutOfStock ? 'opacity-60 grayscale' : ''}`}
                  />

                  {/* Ribbon Badge */}
                  <span className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-yellow-600 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-md shadow-xs flex items-center gap-1 tracking-tight">
                    <Sparkles className="w-3 h-3" />
                    WEEK&apos;S PICK
                  </span>
                </div>
              </Link>

              {/* Wishlist Heart Button Floating */}
              <button
                type="button"
                onClick={() => toggleWishlist(book)}
                className={`absolute -top-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center shadow-md border border-slate-200 transition-all z-10 ${
                  inWishlist
                    ? 'bg-white text-rose-500 shadow-rose-100'
                    : 'bg-white/95 text-slate-400 hover:text-rose-500 hover:bg-white'
                }`}
                title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                <Heart className={`w-5 h-5 ${inWishlist ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>
            </div>
          </div>

          {/* Right Column: Book Information & Actions */}
          <div className="md:col-span-7 flex flex-col space-y-4 text-left">
            {/* Rating & Stock Pill */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-900 px-2.5 py-0.5 rounded-full text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{rating} / 5.0</span>
              </div>

              {isOutOfStock ? (
                <span className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  Out of Stock
                </span>
              ) : (
                <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Available in Stock
                </span>
              )}

              {book.theme && (
                <span className="bg-slate-100 text-slate-700 text-xs font-medium px-2.5 py-0.5 rounded-full border border-slate-200">
                  {book.theme}
                </span>
              )}
            </div>

            {/* Title & Author */}
            <div>
              <Link href={`/books/${book.slug || bookId}`}>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 hover:text-[#1E3A8A] transition-colors leading-tight">
                  {title}
                </h3>
              </Link>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
                By <span className="text-slate-900 font-bold">{author}</span> • <span className="text-slate-500 font-normal">{publisher}</span>
              </p>
            </div>

            {/* Price Box */}
            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">
                ₹{price}
              </span>
              {originalPrice && (
                <>
                  <span className="text-sm sm:text-base text-slate-400 line-through">
                    ₹{originalPrice}
                  </span>
                  <span className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                    {discountPercent}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Description Synopsis */}
            {book.description && (
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed line-clamp-3 sm:line-clamp-4 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/70">
                {book.description}
              </p>
            )}

            {/* Key Trust Signals */}
            <div className="grid grid-cols-2 gap-2 text-slate-600 text-[11px] pt-1">
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Fast & Reliable Dispatch</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>100% Genuine Publisher Copy</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock || isAdding}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#1B365D] hover:bg-[#142c4c] disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                {justAdded ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
                  </>
                )}
              </button>

              {!isOutOfStock && (
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  <span>Buy Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              <Link
                href={`/books/${book.slug || bookId}`}
                className="px-4 py-3 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition-colors"
              >
                More Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookOfTheWeek;

