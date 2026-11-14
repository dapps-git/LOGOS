'use client';

import React, { useState, useEffect } from 'react';
import {
  Star,
  PenSquare,
  Image as ImageIcon,
  CheckCircle2,
  X,
  ArrowRight,
  ShieldCheck,
  UploadCloud,
  ChevronDown,
  ChevronUp,
  MessageSquare
} from 'lucide-react';
import { fetchBookReviews, submitBookReview } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export const ProductReviews = ({ book }) => {
  const { user } = useAuth();
  const bookId = book?._id || book?.id;

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [activeEnlargedImage, setActiveEnlargedImage] = useState(null);

  // Form State
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [reviewImages, setReviewImages] = useState([]);
  const [isConvertingImage, setIsConvertingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  // Update customer name if user logs in
  useEffect(() => {
    if (user?.name && !customerName) {
      setCustomerName(user.name);
    }
  }, [user]);

  // Load reviews on mount or book change
  const loadReviews = async () => {
    if (!bookId) return;
    try {
      setLoading(true);
      const data = await fetchBookReviews(bookId);
      // Sort: High star rating / positive reviews come first
      const sorted = Array.isArray(data)
        ? [...data].sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0) || new Date(b.createdAt) - new Date(a.createdAt))
        : [];
      setReviews(sorted);
    } catch (err) {
      console.warn('[ProductReviews] Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [bookId]);

  // Convert uploaded image to WebP format using HTML5 Canvas
  const convertImageToWebp = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            const maxDim = 1200;

            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Export explicitly in WebP format
            const webpDataUrl = canvas.toDataURL('image/webp', 0.85);
            resolve(webpDataUrl);
          } catch (canvasErr) {
            // Fallback to original data URL if canvas WebP fails
            resolve(readerEvent.target.result);
          }
        };
        img.onerror = () => reject(new Error('Failed to load image for WebP conversion'));
        img.src = readerEvent.target.result;
      };
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(file);
    });
  };

  const handleImageFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsConvertingImage(true);
    setFeedbackMsg(null);

    try {
      const convertedList = [];
      for (const file of files) {
        if (!file.type.startsWith('image/')) continue;
        const webpUrl = await convertImageToWebp(file);
        convertedList.push(webpUrl);
      }

      setReviewImages((prev) => [...prev, ...convertedList].slice(0, 3));
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: 'Error processing photo. Please try a different image.' });
    } finally {
      setIsConvertingImage(false);
      e.target.value = '';
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setReviewImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedbackMsg(null);

    const nameToUse = (customerName || user?.name || '').trim();
    if (!nameToUse) {
      setFeedbackMsg({ type: 'error', text: 'Please enter your name.' });
      return;
    }

    if (!comment.trim()) {
      setFeedbackMsg({ type: 'error', text: 'Please write a review comment.' });
      return;
    }

    if (rating < 1 || rating > 5) {
      setFeedbackMsg({ type: 'error', text: 'Please select a star rating between 1 and 5.' });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        bookId: book?._id || bookId,
        rating: Number(rating),
        customerName: nameToUse,
        title: title.trim(),
        comment: comment.trim(),
        images: reviewImages
      };

      const newReview = await submitBookReview(payload);

      setFeedbackMsg({
        type: 'success',
        text: 'Thank you! Your review has been published successfully.'
      });

      // Insert new review at the top and sort
      setReviews((prev) => {
        const updated = [newReview, ...prev];
        return updated.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0) || new Date(b.createdAt) - new Date(a.createdAt));
      });

      // Reset form
      setRating(5);
      setTitle('');
      setComment('');
      setReviewImages([]);
      setShowForm(false);
    } catch (err) {
      setFeedbackMsg({
        type: 'error',
        text: err.message || 'Failed to submit review. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculations for summary
  const totalCount = reviews.length;
  const avgRating = totalCount > 0
    ? (reviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / totalCount).toFixed(1)
    : (book?.rating ? Number(book.rating).toFixed(1) : '5.0');

  // Reviews to display: first 4, or all if showAll is true
  const displayedReviews = showAll ? reviews : reviews.slice(0, 4);
  const ratingLabels = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent'
  };

  return (
    <section className="mt-8 pt-8 border-t border-slate-200">
      {/* Header & Write Review Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Customer Reviews & Ratings
            </h2>
            <span className="bg-blue-50 text-[#1E3A8A] text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-100">
              {totalCount}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Genuine reader ratings and verified reviews for this book
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowForm((prev) => !prev);
            setFeedbackMsg(null);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1B365D] hover:bg-[#142c4c] text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          <PenSquare className="w-4 h-4" />
          <span>{showForm ? 'Cancel Review' : 'Write a Review'}</span>
        </button>
      </div>

      {/* Success / Error Message Banner */}
      {feedbackMsg && (
        <div
          className={`p-3.5 mb-6 rounded-lg text-xs sm:text-sm font-medium flex items-center justify-between ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <span>{feedbackMsg.text}</span>
          <button
            type="button"
            onClick={() => setFeedbackMsg(null)}
            className="text-slate-400 hover:text-slate-700 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Write Review Form Card */}
      {showForm && (
        <div className="bg-slate-50/80 border border-blue-200/80 rounded-xl p-5 sm:p-7 mb-8 shadow-xs animate-in fade-in duration-200">
          <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
            <PenSquare className="w-4 h-4 text-[#1E3A8A]" />
            Share Your Experience
          </h3>
          <p className="text-xs text-slate-500 mb-5">
            Your review helps other readers discover great books. Photos will automatically be converted to high-performance WebP.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Rating Stars Selector (1 to 5) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Overall Rating <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((starValue) => {
                  const isFilled = (hoverRating || rating) >= starValue;
                  return (
                    <button
                      key={starValue}
                      type="button"
                      onClick={() => setRating(starValue)}
                      onMouseEnter={() => setHoverRating(starValue)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 text-slate-300 hover:scale-110 transition-transform focus:outline-hidden"
                      title={`${starValue} Star${starValue > 1 ? 's' : ''}`}
                    >
                      <Star
                        className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                          isFilled ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  );
                })}
                <span className="ml-3 text-xs sm:text-sm font-semibold text-slate-700">
                  {ratingLabels[hoverRating || rating]} ({hoverRating || rating} / 5)
                </span>
              </div>
            </div>

            {/* Reviewer Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Your Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Rahul Nair"
                  required
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-md text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:border-[#1E3A8A]"
                />
              </div>

              {/* Review Headline / Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Headline (Optional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Masterpiece! Must read for everyone"
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-md text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:border-[#1E3A8A]"
                />
              </div>
            </div>

            {/* Comment Body */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Your Review <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What did you like about this book? How was the writing style, translation, or print quality?"
                rows={4}
                required
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-md text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:border-[#1E3A8A] leading-relaxed"
              />
            </div>

            {/* Image Upload with Auto-WebP Conversion */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Upload Photos (Optional - Converted to WebP)</span>
                <span className="text-[11px] text-slate-400 font-normal">Max 3 images</span>
              </label>

              <div className="flex flex-wrap items-center gap-3">
                {/* Existing Uploaded WebP Thumbnails */}
                {reviewImages.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    className="relative w-16 h-16 rounded-lg border border-slate-200 overflow-hidden group shadow-2xs bg-white"
                  >
                    <img
                      src={imgUrl}
                      alt={`Review photo ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 bg-black/70 hover:bg-rose-600 text-white rounded-full p-0.5 transition-colors cursor-pointer"
                      title="Remove image"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <span className="absolute bottom-0 left-0 right-0 bg-blue-900/80 text-[8px] text-white text-center font-mono py-0.5">
                      WebP
                    </span>
                  </div>
                ))}

                {/* Upload Button */}
                {reviewImages.length < 3 && (
                  <label className="w-24 h-16 rounded-lg border-2 border-dashed border-slate-300 hover:border-[#1E3A8A] bg-white flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors p-2 text-center text-slate-500 hover:text-[#1E3A8A]">
                    {isConvertingImage ? (
                      <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <UploadCloud className="w-4 h-4" />
                        <span className="text-[10px] font-semibold leading-tight">Add Photo</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageFileChange}
                      disabled={isConvertingImage}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Submit Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-md text-xs sm:text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isConvertingImage}
                className="px-6 py-2 bg-[#1B365D] hover:bg-[#142c4c] disabled:opacity-60 text-white rounded-md text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Submit Review</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Review Ratings Quick Overview Bar */}
      {reviews.length > 0 && (
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 sm:p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {avgRating}
            </div>
            <div>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(Number(avgRating))
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                Based on {totalCount} verified reader review{totalCount > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            <span>✨ Filtered: Positive & Highest rated reviews first</span>
          </div>
        </div>
      )}

      {/* Reviews Cards List (Displays 4 Initially) */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="p-4 bg-slate-50 rounded-xl animate-pulse h-28" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-10 px-4 bg-slate-50/70 border border-dashed border-slate-200 rounded-xl">
          <MessageSquare className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-60" />
          <p className="text-sm font-semibold text-slate-700">No reviews yet for this title.</p>
          <p className="text-xs text-slate-500 mt-1">Be the first reader to share your thoughts!</p>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="mt-3.5 inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#1B365D] text-white text-xs font-semibold rounded-md shadow-2xs hover:bg-[#142c4c] transition-colors"
          >
            <PenSquare className="w-3.5 h-3.5" />
            Write the First Review
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedReviews.map((rev, index) => {
            const revRating = Math.max(1, Math.min(5, Number(rev.rating) || 5));
            const formattedDate = rev.createdAt
              ? new Date(rev.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })
              : 'Recent';

            return (
              <div
                key={rev._id || index}
                className="p-4 sm:p-5 bg-white border border-slate-200 rounded-xl shadow-2xs hover:border-slate-300 transition-colors"
              >
                {/* Review Header: User Info & Rating */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-[#1E3A8A] shrink-0">
                      {(rev.customerName || 'R').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-slate-900">
                          {rev.customerName || 'LOGOS Reader'}
                        </span>
                        {rev.isVerifiedPurchase && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded-full font-medium border border-emerald-200">
                            <ShieldCheck className="w-3 h-3 text-emerald-700" />
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {formattedDate}
                      </span>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex items-center gap-1 bg-amber-50/70 border border-amber-200/60 px-2 py-0.5 rounded-md w-fit">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= revRating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] font-bold text-amber-800 ml-1">
                      {revRating}.0
                    </span>
                  </div>
                </div>

                {/* Review Headline if provided */}
                {rev.title && (
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 mb-1">
                    {rev.title}
                  </h4>
                )}

                {/* Review Body Comment */}
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                  {rev.comment}
                </p>

                {/* Review Photo Attachments (WebP Format) */}
                {Array.isArray(rev.images) && rev.images.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 mt-3 pt-2 border-t border-slate-100">
                    {rev.images.map((img, imgIdx) => (
                      <button
                        key={imgIdx}
                        type="button"
                        onClick={() => setActiveEnlargedImage(img)}
                        className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-md overflow-hidden border border-slate-200 hover:opacity-90 transition-opacity bg-slate-50 cursor-pointer group"
                        title="Click to view full image"
                      >
                        <img
                          src={img}
                          alt="Review attachment"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Button to See All Reviews of that Product (->) */}
      {reviews.length > 4 && (
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-blue-200 bg-blue-50/70 hover:bg-blue-100/70 text-[#1E3A8A] font-bold text-xs sm:text-sm transition-all group cursor-pointer shadow-2xs"
          >
            <span>
              {showAll
                ? 'Show Top 4 Reviews Only'
                : `See All Reviews (${reviews.length})`}
            </span>
            <ArrowRight className={`w-4 h-4 transition-transform ${showAll ? '-rotate-90' : 'group-hover:translate-x-1'}`} />
          </button>
        </div>
      )}

      {/* Full-Screen Image Lightbox Preview */}
      {activeEnlargedImage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setActiveEnlargedImage(null)}
        >
          <div className="relative max-w-2xl max-h-[90vh] flex flex-col items-center">
            <button
              type="button"
              onClick={() => setActiveEnlargedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-slate-300 p-1 cursor-pointer"
              title="Close image"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={activeEnlargedImage}
              alt="Enlarged review photo"
              className="max-w-full max-h-[80vh] object-contain rounded-lg border border-white/20 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default ProductReviews;

