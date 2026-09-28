'use client';

import React from 'react';
import Link from 'next/link';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function WishlistPage() {
  const { books, count, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = async (book) => {
    await addToCart(book, 1);
    await toggleWishlist(book);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-3.5 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16">
        {/* Sleek Minimal Header */}
        <div className="flex items-center justify-between gap-3 mb-5 sm:mb-6 pb-3 border-b border-slate-200/80">
          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              className="p-1.5 -ml-1.5 text-slate-500 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors"
              title="Back to store"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-lg sm:text-xl font-normal text-slate-900 tracking-tight flex items-center gap-2">
              <span>My Wishlist</span>
              <span className="text-[11px] font-mono font-medium px-2 py-0.5 bg-blue-50 text-[#1E3A8A] rounded-full">
                {count} {count === 1 ? 'book' : 'books'}
              </span>
            </h1>
          </div>

          <Link
            href="/"
            className="text-xs font-light text-[#1E3A8A] hover:underline"
          >
            Explore Books
          </Link>
        </div>

        {books.length === 0 ? (
          /* Clean Empty State */
          <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center border border-slate-100 shadow-sm max-w-md mx-auto my-8 sm:my-12">
            <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-3.5">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h2 className="text-base sm:text-lg font-normal text-slate-800 mb-1">Your wishlist is empty</h2>
            <p className="text-xs font-light text-slate-400 mb-5">
              Tap the heart icon on any book across our store to save it here.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-2.5 bg-[#1E3A8A] hover:bg-[#152e72] text-white rounded-full text-xs font-medium tracking-wide transition-all shadow-sm"
            >
              Discover Books
            </Link>
          </div>
        ) : (
          /* Horizontal Row Cards Container (Image Left, Details Right) */
          <div className="space-y-3.5 sm:space-y-4">
            {books.map((book) => {
              const bookId = book._id || book.id;
              const title = book.titleMalayalam || book.title || 'LOGOS Book';
              const price = book.salePrice || book.price || 299;
              const original = book.originalPrice || price + 60;
              const author = book.author || 'LOGOS Publications';
              const image = book.coverImage || book.image || (book.images && book.images[0]) || '/book1.jpg';

              return (
                <div
                  key={bookId}
                  className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-3.5 sm:gap-6 group"
                >
                  {/* LEFT: Book Cover Thumbnail */}
                  <Link
                    href={`/books/${book.slug || bookId}`}
                    className="shrink-0 relative w-20 sm:w-28 aspect-3/4 bg-[#f1f3f7] rounded-xl overflow-hidden border border-slate-100/80"
                  >
                    <img
                      src={image}
                      alt={title}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/book1.jpg';
                      }}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>

                  {/* RIGHT: Details & Actions */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
                    {/* Top Info */}
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link href={`/books/${book.slug || bookId}`} className="block">
                          <h3 className="text-xs sm:text-base font-normal text-slate-900 group-hover:text-[#1E3A8A] transition-colors line-clamp-2 leading-snug">
                            {title}
                          </h3>
                        </Link>
                        {/* Remove Trash Button */}
                        <button
                          type="button"
                          onClick={() => toggleWishlist(book)}
                          className="p-1 text-slate-400 hover:text-red-500 transition-colors shrink-0"
                          title="Remove from wishlist"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>

                      <p className="text-[11px] sm:text-xs font-light text-slate-400 truncate mt-0.5">
                        {author}
                      </p>
                    </div>

                    {/* Bottom Row: Price & Move to Cart CTA */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2 border-t border-slate-50">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm sm:text-base font-medium text-slate-900 font-mono">
                          ₹{Number(price).toFixed(0)}
                        </span>
                        {original > price && (
                          <span className="text-[11px] sm:text-xs font-light text-slate-400 line-through font-mono">
                            ₹{Number(original).toFixed(0)}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleMoveToCart(book)}
                        className="py-1.5 sm:py-2 px-3 sm:px-4 bg-[#1E3A8A] hover:bg-[#152e72] text-white text-[11px] sm:text-xs font-medium rounded-xl transition-all shadow-sm shadow-blue-900/10 active:scale-95 flex items-center gap-1.5"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <span>Move to Cart</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
