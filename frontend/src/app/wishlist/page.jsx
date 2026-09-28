'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
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

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-8 pt-28 pb-16">
        {books.length === 0 ? (
          /* Clean Empty Wishlist View */
          <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-slate-100 shadow-sm max-w-lg mx-auto my-8">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-normal text-slate-800 mb-1">Your wishlist is empty</h2>
            <p className="text-xs font-light text-slate-400 mb-6">
              Explore our books and tap the heart icon to save your favorites.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-7 py-3 bg-[#1E3A8A] hover:bg-[#152e72] text-white rounded-full text-xs font-medium tracking-wide transition-all shadow-md shadow-blue-900/10"
            >
              Discover Books
            </Link>
          </div>
        ) : (
          /* Wishlist Grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {books.map((book) => {
              const bookId = book._id || book.id;
              const title = book.titleMalayalam || book.title || 'LOGOS Book';
              const price = book.salePrice || book.price || 299;
              const original = book.originalPrice || price + 60;
              const image = book.coverImage || book.image || '/images/bestsellers/book1.png';
              const author = book.author || 'LOGOS Publications';

              return (
                <div
                  key={bookId}
                  className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Cover Thumbnail */}
                    <div className="relative w-full aspect-[3/4] bg-slate-50 rounded-xl overflow-hidden mb-3 border border-slate-100">
                      <Image
                        src={image}
                        alt={title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => toggleWishlist(book)}
                        className="absolute top-2 right-2 w-7 h-7 bg-white/90 hover:bg-white text-slate-400 hover:text-red-500 rounded-full flex items-center justify-center shadow-sm backdrop-blur-sm transition-colors"
                        title="Remove from wishlist"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Info */}
                    <Link href={`/books/${book.slug || bookId}`}>
                      <h3 className="text-xs sm:text-sm font-normal text-slate-900 hover:text-[#1E3A8A] transition-colors line-clamp-2 h-9 sm:h-10 leading-snug">
                        {title}
                      </h3>
                    </Link>
                    <p className="text-[11px] font-light text-slate-500 truncate mt-0.5">
                      {author}
                    </p>

                    {/* Price */}
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-sm font-medium text-slate-900 font-mono">
                        ₹{price}
                      </span>
                      {original > price && (
                        <span className="text-[11px] font-light text-slate-400 line-through font-mono">
                          ₹{original}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Move to Cart */}
                  <div className="mt-3 pt-2.5 border-t border-slate-50">
                    <button
                      type="button"
                      onClick={() => handleMoveToCart(book)}
                      className="w-full py-2 px-3 bg-[#1E3A8A] hover:bg-[#152e72] text-white text-xs font-medium rounded-xl transition-all shadow-sm shadow-blue-900/10 flex items-center justify-center gap-1.5"
                    >
                      <span>Move to Cart</span>
                    </button>
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
