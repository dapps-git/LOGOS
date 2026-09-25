'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Star, ShoppingCart, Zap, Check } from 'lucide-react';

export const ProductDetail = ({ book }) => {
  const images = book?.gallery || [
    '/product_detail_main.png',
    '/product_thumb1.png',
    '/product_thumb2.png'
  ];

  const [selectedImage, setSelectedImage] = useState(images[0]);
  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddToCart = () => {
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 mb-6 font-medium">
        <Link href="/" className="hover:text-slate-900 transition-colors">
          Home
        </Link>
        <span>&gt;</span>
        <Link href="/categories/novel" className="hover:text-slate-900 transition-colors">
          Novel
        </Link>
        <span>&gt;</span>
        <span className="text-slate-900 font-semibold truncate max-w-xs sm:max-w-md">
          {book?.title || 'Mani muzagunadth aarkuveendi'}
        </span>
      </nav>

      {/* Main Product Card Container */}
      <div className="border border-slate-200/90 rounded-3xl p-6 sm:p-10 bg-white shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Gallery & Mockups */}
          <div className="lg:col-span-5 flex flex-col items-center">
            {/* Main Stage Image */}
            <div className="w-full aspect-square sm:aspect-4/3 flex items-center justify-center bg-slate-50 rounded-2xl overflow-hidden p-2">
              <img
                src={selectedImage}
                alt={book?.title || 'Book Cover'}
                className="w-full h-full object-contain select-none transition-all duration-300"
              />
            </div>

            {/* Thumbnail Selectors */}
            <div className="flex items-center gap-4 mt-6 justify-center">
              {images.slice(1).map((thumb, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(thumb)}
                  className={`w-20 sm:w-24 aspect-3/4 rounded-xl overflow-hidden border-2 transition-all p-1 bg-white hover:scale-105 ${
                    selectedImage === thumb
                      ? 'border-[#224494] shadow-md'
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
          </div>

          {/* Right Column: Book Metadata, Specs & Purchase CTA */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            {/* Header: Status, Title, Price, Rating */}
            <div className="space-y-3">
              {/* In Stock Badge */}
              <span className="inline-block bg-[#e8f5e9] text-[#2e7d32] text-[11px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
                IN STOCK
              </span>

              {/* Book Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-slate-900 tracking-tight leading-tight">
                {book?.title || 'Mani Muzhangunnathu Aarkku Vendi'}
              </h1>

              {/* Price & Rating Row */}
              <div className="flex items-center gap-4 pt-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-xl sm:text-2xl font-bold text-rose-600">
                    ₹{(book?.price || 616.00).toFixed(2)}
                  </span>
                  <span className="text-sm sm:text-base text-slate-400 line-through">
                    ₹{(book?.originalPrice || 860.00).toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-slate-700 font-semibold text-xs sm:text-sm pl-2 border-l border-slate-200">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>({book?.rating || '5.4'})</span>
                </div>
              </div>
            </div>

            {/* Book Specifications List */}
            <div className="space-y-2 text-xs sm:text-sm text-slate-800">
              <div className="flex items-start">
                <span className="font-bold w-28 flex-shrink-0 text-slate-900">Author</span>
                <span className="text-slate-700">: {book?.author || 'Ernest Hemingway'}</span>
              </div>
              <div className="flex items-start">
                <span className="font-bold w-28 flex-shrink-0 text-slate-900">Language</span>
                <span className="text-slate-700">: {book?.language || 'Malayalam'}</span>
              </div>
              <div className="flex items-start">
                <span className="font-bold w-28 flex-shrink-0 text-slate-900">Theme</span>
                <span className="text-slate-700">: {book?.theme || 'Historical Fiction, War Literature'}</span>
              </div>
              <div className="flex items-start">
                <span className="font-bold w-28 flex-shrink-0 text-slate-900">Publisher</span>
                <span className="text-slate-700">: {book?.publisher || 'LOGOS BOOKS'}</span>
              </div>
              <div className="flex items-start">
                <span className="font-bold w-28 flex-shrink-0 text-slate-900">Edition</span>
                <span className="text-slate-700">: {book?.edition || '1'}</span>
              </div>
              <div className="flex items-start">
                <span className="font-bold w-28 flex-shrink-0 text-slate-900">ISBN 13</span>
                <span className="text-slate-700">: {book?.isbn || '9789347536090'}</span>
              </div>
              <div className="flex items-start">
                <span className="font-bold w-28 flex-shrink-0 text-slate-900">Pages</span>
                <span className="text-slate-700">: {book?.pages || '146'}</span>
              </div>
            </div>

            {/* About the Book Description */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                About the Book :
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed text-justify malayalam-desc font-sans">
                {book?.description ||
                  "Mani Muzhangunnathu Aarkkuvendi is the Malayalam translation of Ernest Hemingway's celebrated novel For Whom the Bell Tolls. Set against the backdrop of the Spanish Civil War, the novel follows Robert Jordan, an American volunteer fighting alongside the Republican forces. The story brings together themes of love, war, sacrifice, courage, death, and human relationships. Hemingway presents the emotional and psychological experiences of people caught in the middle of conflict."}
              </p>
            </div>

            {/* CTA Buttons Row */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                type="button"
                onClick={handleAddToCart}
                className="inline-flex items-center justify-center gap-2 border border-emerald-500 text-emerald-700 hover:bg-emerald-50 px-7 py-2.5 rounded-full font-medium text-xs sm:text-sm transition-all active:scale-95"
              >
                {addedToCart ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Added to Cart</span>
                  </>
                ) : (
                  <span>Add to Cart</span>
                )}
              </button>

              <Link
                href="/checkout"
                className="inline-flex items-center justify-center gap-2 bg-[#224494] hover:bg-[#1a3678] text-white px-8 py-2.5 rounded-full font-medium text-xs sm:text-sm transition-all shadow-sm active:scale-95"
              >
                Buy Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
