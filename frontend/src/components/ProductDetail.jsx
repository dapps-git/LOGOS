'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Star,
  ShoppingCart,
  Zap,
  Check,
  Heart
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';

export const ProductDetail = ({ book }) => {
  const router = useRouter();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { toggleWishlist, isBookInWishlist } = useWishlist();

  const bookId = book?._id || book?.id || 'book-item';
  const inWishlist = isBookInWishlist(bookId);

  const [quantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const title = book?.title || book?.name || book?.titleMalayalam || 'LOGOS Book';
  const author = book?.author || 'LOGOS Publications';
  const price = Number(book?.discountPrice || book?.salePrice || book?.price || 150);
  const originalPrice = book?.discountPrice && Number(book?.discountPrice) < Number(book?.price)
    ? Number(book?.price)
    : (book?.originalPrice ? Number(book.originalPrice) : null);

  const [failedImages, setFailedImages] = useState({});

  const rawImages = Array.isArray(book?.images) && book.images.length > 0
    ? Array.from(new Set(book.images.filter((img) => typeof img === 'string' && img.trim() && img !== '/book-placeholder.svg')))
    : (book?.coverImage ? [book.coverImage] : (book?.image ? [book.image] : []));

  const initialImagesList = rawImages.length > 0 ? rawImages : ['/book-placeholder.svg'];
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // Filter out any thumbnails that fail to load
  const activeImages = initialImagesList.filter((_, idx) => !failedImages[idx]);
  const imagesList = activeImages.length > 0 ? activeImages : ['/book-placeholder.svg'];
  const currentImage = imagesList[selectedImageIndex] || imagesList[0] || '/book-placeholder.svg';

  const rating = book?.rating ? Number(book.rating).toFixed(0) : '5';
  const pageCount = book?.pageCount || book?.pages || 123;
  const theme = book?.theme || book?.genre || 'Humour';
  const language = (book?.languages && book.languages[0]) || book?.language || 'Malayalam';
  const edition = book?.edition || '1';
  const publisher = book?.publisher || 'LOGOS BOOKS';
  const isbn = book?.isbn || '9789347536100';
  const description = book?.description || `${title} by ${author}.`;

  const handleAddToCart = async () => {
    if (!book || isAdding) return;
    setIsAdding(true);
    try {
      const ok = await addToCart(book, quantity);
      if (ok !== false) {
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2200);
      }
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      router.push('/auth/login?redirect=/checkout');
      return;
    }
    if (book) {
      await addToCart(book, quantity);
      router.push('/checkout');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 mb-5">
        <Link href="/" className="hover:text-blue-600 transition-colors">
          Home
        </Link>
        <span className="text-slate-400">&gt;</span>
        <Link href="/products" className="hover:text-blue-600 transition-colors">
          Books
        </Link>
        <span className="text-slate-400">&gt;</span>
        <span className="text-slate-800 font-medium truncate max-w-[200px] sm:max-w-md">
          {title}
        </span>
      </nav>

      {/* Main Product Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-10 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Direct Book Image Showcase (Expanded width showcase) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="relative w-full max-w-[360px] sm:max-w-[420px] flex items-center justify-center">
              
              {/* Top-Right Wishlist Heart Button */}
              <button
                type="button"
                onClick={() => book && toggleWishlist({
                  id: bookId,
                  _id: bookId,
                  title,
                  author,
                  price,
                  originalPrice,
                  coverImage: currentImage,
                  image: currentImage,
                  slug: book.slug || bookId
                })}
                className={`absolute top-2 right-2 z-10 w-9 h-9 rounded-full flex items-center justify-center bg-white/90 backdrop-blur-xs shadow-md border border-slate-200 transition-all active:scale-95 cursor-pointer ${
                  inWishlist ? 'text-rose-500 shadow-rose-100 border-rose-200' : 'text-slate-400 hover:text-rose-500'
                }`}
                title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                <Heart className={`w-4 h-4 ${inWishlist ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>

              {/* Book Cover Artwork */}
              <img
                src={currentImage}
                alt={title}
                referrerPolicy="no-referrer"
                loading="eager"
                crossOrigin="anonymous"
                onError={(e) => {
                  if (!e.currentTarget.dataset.failed) {
                    e.currentTarget.dataset.failed = 'true';
                    e.currentTarget.src = '/book-placeholder.svg';
                  }
                }}
                className="w-full max-w-[340px] sm:max-w-[400px] h-auto aspect-[3/4] object-contain select-none transition-transform duration-300 hover:scale-[1.02] filter drop-shadow-xl rounded-sm"
              />
            </div>

            {/* Multiple Images Gallery Thumbnails (Only valid images rendered) */}
            {imagesList.length > 1 && (
              <div className="flex flex-wrap gap-2.5 justify-center mt-5 pt-3 border-t border-slate-100 w-full">
                {imagesList.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-14 sm:w-16 h-20 rounded-md overflow-hidden border-2 transition-all p-1 bg-slate-50 flex items-center justify-center cursor-pointer ${
                      selectedImageIndex === idx
                        ? 'border-[#1E3A8A] ring-2 ring-blue-500/20 shadow-xs scale-105'
                        : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${title} photo ${idx + 1}`}
                      className="w-full h-full object-contain"
                      onError={() => {
                        setFailedImages((prev) => ({ ...prev, [idx]: true }));
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Metadata, Specs, Description & Action Buttons */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            
            {/* IN STOCK Badge */}
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase bg-emerald-50 text-emerald-600">
                IN STOCK
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-snug tracking-tight">
              {title}
            </h1>

            {/* Price & Rating Row */}
            <div className="flex items-center gap-3 pt-0.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#DC2626] tracking-tight">
                ₹{price.toFixed(2)}
              </span>
              {originalPrice && originalPrice > price && (
                <span className="text-sm sm:text-base text-slate-400 line-through font-normal">
                  ₹{originalPrice.toFixed(2)}
                </span>
              )}
              <span className="text-slate-300 font-light">|</span>
              <div className="flex items-center gap-1 text-slate-700 text-xs sm:text-sm font-semibold">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-slate-600 font-normal">({rating})</span>
              </div>
            </div>

            {/* Colon-Aligned 2-Column Specification Rows */}
            <div className="space-y-2 py-3 text-xs sm:text-sm text-slate-700 font-normal border-t border-slate-100">
              <div className="grid grid-cols-[130px_1fr] items-baseline">
                <span className="text-slate-500">Author</span>
                <span className="text-slate-800">: {author}</span>
              </div>
              <div className="grid grid-cols-[130px_1fr] items-baseline">
                <span className="text-slate-500">Language</span>
                <span className="text-slate-800">: {language}</span>
              </div>
              <div className="grid grid-cols-[130px_1fr] items-baseline">
                <span className="text-slate-500">Theme / Genre</span>
                <span className="text-slate-800">: {theme}</span>
              </div>
              <div className="grid grid-cols-[130px_1fr] items-baseline">
                <span className="text-slate-500">Publisher</span>
                <span className="text-slate-800">: {publisher}</span>
              </div>
              <div className="grid grid-cols-[130px_1fr] items-baseline">
                <span className="text-slate-500">Edition</span>
                <span className="text-slate-800">: {edition}</span>
              </div>
              <div className="grid grid-cols-[130px_1fr] items-baseline">
                <span className="text-slate-500">ISBN 13</span>
                <span className="text-slate-800 font-mono">: {isbn}</span>
              </div>
              <div className="grid grid-cols-[130px_1fr] items-baseline">
                <span className="text-slate-500">Pages</span>
                <span className="text-slate-800">: {pageCount} pages</span>
              </div>
            </div>

            {/* About the Book */}
            <div className="pt-2 space-y-1.5 border-t border-slate-100">
              <h3 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider">
                ABOUT THE BOOK :
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                {description}
              </p>
            </div>

            {/* Action Buttons: Add to Cart & Buy Now (1 Row on mobile and desktop) */}
            <div className="pt-4 flex flex-row items-center gap-2.5 sm:gap-3 w-full">
              {/* Add to Cart Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isAdding}
                className="flex-1 inline-flex items-center justify-center gap-1.5 sm:gap-2 border-2 border-[#1E3A8A] text-[#1E3A8A] hover:bg-blue-50/70 py-2.5 sm:py-3 px-3 sm:px-6 rounded-lg font-bold text-xs sm:text-sm transition-all active:scale-95 shadow-2xs whitespace-nowrap cursor-pointer disabled:opacity-60"
              >
                {addedToCart ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-emerald-700 font-bold truncate">Added!</span>
                  </>
                ) : isAdding ? (
                  <>
                    <span className="w-4 h-4 border-2 border-[#1E3A8A] border-t-transparent rounded-full animate-spin shrink-0" />
                    <span className="truncate">Adding...</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 shrink-0" />
                    <span className="truncate">Add to Cart</span>
                  </>
                )}
              </button>

              {/* Buy Now Button */}
              <button
                type="button"
                onClick={handleBuyNow}
                className="flex-1 inline-flex items-center justify-center bg-[#1B365D] hover:bg-[#142c4c] text-white py-2.5 sm:py-3 px-3 sm:px-6 rounded-lg font-bold text-xs sm:text-sm transition-all shadow-sm active:scale-95 whitespace-nowrap cursor-pointer"
              >
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

