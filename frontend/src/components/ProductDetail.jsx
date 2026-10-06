'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Star, ShoppingCart, Zap, Check, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';

export const ProductDetail = ({ book }) => {
  const router = useRouter();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { toggleWishlist, isBookInWishlist } = useWishlist();

  const bookId = book?._id || book?.id || 'book-demo';
  const inWishlist = isBookInWishlist(bookId);

  const images = book?.gallery && book.gallery.length > 0 ? book.gallery : [
    book?.coverImage || '/product_detail_main.png',
    '/product_thumb1.png',
    '/product_thumb2.png'
  ];

  const [selectedImage, setSelectedImage] = useState(images[0]);
  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddToCart = async () => {
    if (book) {
      await addToCart(book, 1);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2200);
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      router.push('/auth/login?redirect=/checkout');
      return;
    }
    if (book) {
      await addToCart(book, 1);
      router.push('/checkout');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 mb-6 font-light">
        <Link href="/" className="hover:text-slate-900 transition-colors">
          Home
        </Link>
        <span>&gt;</span>
        <Link href="/#collections" className="hover:text-slate-900 transition-colors">
          Books
        </Link>
        <span>&gt;</span>
        <span className="text-slate-900 font-normal truncate max-w-xs sm:max-w-md">
          {book?.titleMalayalam || book?.title || 'Book Details'}
        </span>
      </nav>

      {/* Main Product Card Container */}
      <div className="border border-slate-200/80 rounded-xl p-6 sm:p-10 bg-white shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Gallery & Mockups */}
          <div className="lg:col-span-5 flex flex-col items-center">
            {/* Main Stage Image */}
            <div className="relative w-full aspect-square sm:aspect-4/3 flex items-center justify-center bg-slate-50 rounded-lg overflow-hidden p-3 border border-slate-100">
              <img
                src={selectedImage}
                alt={book?.title || 'Book Cover'}
                className="w-full h-full object-contain select-none transition-all duration-300"
              />
              {/* Wishlist Button */}
              <button
                type="button"
                onClick={() => book && toggleWishlist(book)}
                className={`absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center shadow-md backdrop-blur-sm transition-all ${
                  inWishlist
                    ? 'bg-rose-50 text-rose-600'
                    : 'bg-white/90 text-slate-400 hover:text-rose-500'
                }`}
                title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart className={`w-4 h-4 ${inWishlist ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>
            </div>

            {/* Thumbnail Selectors */}
            {images.length > 1 && (
              <div className="flex items-center gap-4 mt-6 justify-center">
                {images.map((thumb, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(thumb)}
                    className={`w-16 sm:w-20 aspect-3/4 rounded-lg overflow-hidden border-2 transition-all p-1 bg-white hover:scale-105 ${
                      selectedImage === thumb
                        ? 'border-[#1E3A8A] shadow-md'
                        : 'border-slate-200 hover:border-slate-300 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={thumb}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Book Metadata, Specs & Purchase CTA */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            {/* Header: Status, Title, Price, Rating */}
            <div className="space-y-3">
              {/* In Stock Badge */}
              <span className="inline-block bg-emerald-50 text-emerald-700 text-[11px] font-medium px-2.5 py-0.5 rounded uppercase tracking-wider">
                IN STOCK
              </span>

              {/* Book Title */}
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight leading-tight">
                {book?.titleMalayalam || book?.title || 'LOGOS Book'}
              </h1>

              {/* Price & Rating Row */}
              <div className="flex items-center gap-4 pt-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-normal text-rose-600 font-mono">
                    ₹{(book?.salePrice || book?.price || 616).toFixed(2)}
                  </span>
                  {(book?.originalPrice || (book?.price || 616) + 120) > (book?.salePrice || book?.price || 616) && (
                    <span className="text-sm sm:text-base text-slate-400 line-through font-mono">
                      ₹{(book?.originalPrice || (book?.price || 616) + 120).toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-slate-700 font-light text-xs sm:text-sm pl-3 border-l border-slate-200">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-medium">({book?.rating || '4.8'})</span>
                </div>
              </div>
            </div>

            {/* Book Specifications List */}
            <div className="space-y-2 text-xs sm:text-sm text-slate-800 font-light">
              <div className="flex items-start">
                <span className="font-normal w-28 flex-shrink-0 text-slate-900">Author</span>
                <span className="text-slate-700">: {book?.author || 'LOGOS Author'}</span>
              </div>
              <div className="flex items-start">
                <span className="font-normal w-28 flex-shrink-0 text-slate-900">Language</span>
                <span className="text-slate-700">: {book?.language || 'Malayalam'}</span>
              </div>
              <div className="flex items-start">
                <span className="font-normal w-28 flex-shrink-0 text-slate-900">Theme / Genre</span>
                <span className="text-slate-700">: {book?.theme || book?.genre || 'Literature, Fiction'}</span>
              </div>
              <div className="flex items-start">
                <span className="font-normal w-28 flex-shrink-0 text-slate-900">Publisher</span>
                <span className="text-slate-700">: {book?.publisher || 'LOGOS BOOKS'}</span>
              </div>
              <div className="flex items-start">
                <span className="font-normal w-28 flex-shrink-0 text-slate-900">Edition</span>
                <span className="text-slate-700">: {book?.edition || '1st Edition'}</span>
              </div>
              <div className="flex items-start">
                <span className="font-normal w-28 flex-shrink-0 text-slate-900">ISBN 13</span>
                <span className="text-slate-700 font-mono">: {book?.isbn || '9789347536090'}</span>
              </div>
              <div className="flex items-start">
                <span className="font-normal w-28 flex-shrink-0 text-slate-900">Pages</span>
                <span className="text-slate-700">: {book?.pages || '146'} pages</span>
              </div>
            </div>

            {/* About the Book Description */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h3 className="font-normal text-xs sm:text-sm text-slate-900 uppercase tracking-wider">
                About the Book :
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed text-justify malayalam-desc font-light">
                {book?.description ||
                  "മലയാള സാഹിത്യത്തിലെ പ്രശസ്തമായ ഈ പുസ്തകം വായനക്കാർക്ക് ആഴത്തിലുള്ള അനുഭവം സമ്മാനിക്കുന്നു."}
              </p>
            </div>

            {/* CTA Buttons Row - In mobile view placed in one line */}
            <div className="flex flex-row items-center gap-2.5 sm:gap-4 pt-4 w-full">
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 min-w-0 inline-flex items-center justify-center gap-1.5 sm:gap-2 border border-[#1E3A8A] text-[#1E3A8A] hover:bg-blue-50 py-3 px-2 sm:px-7 rounded-lg font-medium text-xs sm:text-sm transition-all active:scale-95 shadow-xs whitespace-nowrap"
              >
                {addedToCart ? (
                  <>
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 flex-shrink-0" />
                    <span className="text-emerald-700 truncate">Added!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate">Add to Cart</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                className="flex-1 min-w-0 inline-flex items-center justify-center gap-1.5 sm:gap-2 bg-[#1E3A8A] hover:bg-[#152e72] text-white py-3 px-2 sm:px-8 rounded-lg font-medium text-xs sm:text-sm transition-all shadow-md shadow-blue-900/10 active:scale-95 whitespace-nowrap"
              >
                <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate">Buy Now</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
