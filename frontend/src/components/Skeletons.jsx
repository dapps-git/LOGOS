import React from 'react';

/**
 * Premium Shimmer Placeholder for Book Cards (Used in New Arrivals & Bestsellers)
 */
export const BookCardSkeleton = () => {
  return (
    <div className="flex flex-col justify-between h-full group">
      {/* Book Cover Container */}
      <div className="relative aspect-3/4 w-full overflow-hidden bg-slate-100 rounded-xs mb-3">
        <div className="w-full h-full shimmer-effect" />
        {/* Wishlist Heart circle skeleton */}
        <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/70 shimmer-effect" />
      </div>

      {/* Book Details */}
      <div className="space-y-2 mt-auto">
        {/* Title */}
        <div className="h-4 bg-slate-200 rounded-xs w-5/6 shimmer-effect" />
        {/* Author */}
        <div className="h-3 bg-slate-150 rounded-xs w-1/2 shimmer-effect" />
        
        {/* Price & Rating */}
        <div className="flex items-center justify-between pt-1">
          <div className="h-4 bg-slate-200 rounded-xs w-16 shimmer-effect" />
          <div className="h-3.5 bg-slate-150 rounded-xs w-10 shimmer-effect" />
        </div>
      </div>
    </div>
  );
};

/**
 * Grid of Book Card Skeletons
 */
export const BookGridSkeleton = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <BookCardSkeleton key={idx} />
      ))}
    </div>
  );
};

/**
 * Hero Banner Skeleton
 */
export const HeroBannerSkeleton = () => {
  return (
    <div className="relative w-full aspect-[3/4] sm:aspect-[1748/900] min-h-[460px] sm:min-h-[360px] md:min-h-[480px] bg-slate-100 overflow-hidden">
      <div className="w-full h-full shimmer-effect" />
      
      {/* Subtle overlay shapes suggesting banner elements */}
      <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-16 max-w-xl space-y-4 pointer-events-none opacity-40">
        <div className="h-6 sm:h-9 bg-slate-300/60 rounded-xs w-3/4 shimmer-effect" />
        <div className="h-4 sm:h-6 bg-slate-300/40 rounded-xs w-1/2 shimmer-effect" />
        <div className="h-3 sm:h-4 bg-slate-300/30 rounded-xs w-2/3 shimmer-effect" />
      </div>
    </div>
  );
};

/**
 * Author Card Skeleton (Matching FeaturedAuthors layout)
 */
export const AuthorCardSkeleton = () => {
  return (
    <div className="flex flex-col items-center text-center space-y-3">
      <div className="relative aspect-3/4 w-full overflow-hidden bg-slate-150 rounded-xs">
        <div className="w-full h-full shimmer-effect" />
      </div>
      <div className="h-3.5 bg-slate-200 rounded-xs w-24 shimmer-effect" />
    </div>
  );
};

/**
 * Grid of Author Skeletons
 */
export const AuthorGridSkeleton = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <AuthorCardSkeleton key={idx} />
      ))}
    </div>
  );
};

/**
 * Author Spotlight Skeleton
 */
export const AuthorSpotlightSkeleton = () => {
  return (
    <section className="py-12 sm:py-16 px-4 sm:px-8 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 items-center">
        {/* Left: Author Portrait Skeleton */}
        <div className="flex justify-center items-center">
          <div className="relative max-w-[340px] w-full aspect-[4/5] rounded-md overflow-hidden bg-slate-150 shadow-sm">
            <div className="w-full h-full shimmer-effect" />
          </div>
        </div>

        {/* Right: Bio and CTA Skeleton */}
        <div className="space-y-4">
          <div className="h-3.5 bg-slate-200 rounded-xs w-28 shimmer-effect" />
          <div className="h-8 sm:h-10 bg-slate-250 rounded-xs w-3/4 shimmer-effect" />
          <div className="space-y-2 pt-2">
            <div className="h-3.5 bg-slate-150 rounded-xs w-full shimmer-effect" />
            <div className="h-3.5 bg-slate-150 rounded-xs w-11/12 shimmer-effect" />
            <div className="h-3.5 bg-slate-150 rounded-xs w-4/5 shimmer-effect" />
          </div>
          <div className="h-10 bg-[#1E3A8A]/20 rounded-full w-36 shimmer-effect mt-4" />
        </div>
      </div>
    </section>
  );
};

/**
 * Author's Best Books Skeleton
 */
export const AuthorBestBooksSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
      {Array.from({ length: 2 }).map((_, idx) => (
        <div
          key={`author-best-${idx}`}
          className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-xl border border-slate-100"
        >
          <div className="w-full sm:w-44 aspect-4/3 flex-shrink-0 overflow-hidden rounded-md bg-slate-150">
            <div className="w-full h-full shimmer-effect" />
          </div>
          <div className="flex-1 space-y-2.5 text-left w-full pt-1">
            <div className="h-4 bg-slate-200 rounded-xs w-3/4 shimmer-effect" />
            <div className="h-3 bg-slate-150 rounded-xs w-full shimmer-effect" />
            <div className="h-3 bg-slate-150 rounded-xs w-5/6 shimmer-effect" />
            <div className="h-3 bg-slate-150 rounded-xs w-2/3 shimmer-effect" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Catalog Page Grid Skeleton (Desktop + Mobile)
 */
export const CatalogGridSkeleton = ({ count = 8 }) => {
  return (
    <div className="space-y-6">
      {/* Desktop Grid */}
      <div className="hidden lg:grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-4.5">
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={`desk-skel-${idx}`}
            className="bg-white rounded-2xl border border-slate-200/90 p-3.5 flex flex-col justify-between shadow-2xs"
          >
            <div className="relative aspect-[3/4] w-full bg-slate-100 rounded-xl overflow-hidden mb-3">
              <div className="w-full h-full shimmer-effect" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 rounded-xs w-5/6 shimmer-effect" />
              <div className="h-3 bg-slate-150 rounded-xs w-1/2 shimmer-effect" />
              <div className="flex items-center justify-between pt-2">
                <div className="h-5 bg-slate-200 rounded-xs w-16 shimmer-effect" />
                <div className="w-8 h-8 rounded-full bg-slate-150 shimmer-effect" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Card Row Skeleton */}
      <div className="block lg:hidden space-y-3">
        {Array.from({ length: Math.min(count, 4) }).map((_, idx) => (
          <div
            key={`mob-skel-${idx}`}
            className="bg-white rounded-xl p-3 border border-slate-200 flex gap-3.5 items-center"
          >
            <div className="w-20 h-28 bg-slate-150 rounded-md shrink-0 overflow-hidden">
              <div className="w-full h-full shimmer-effect" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded-xs w-4/5 shimmer-effect" />
              <div className="h-3 bg-slate-150 rounded-xs w-1/2 shimmer-effect" />
              <div className="h-4 bg-slate-200 rounded-xs w-20 shimmer-effect" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Handpicked Reads Skeleton (3 items)
 */
export const HandpickedSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 items-end pt-4">
      {Array.from({ length: 3 }).map((_, idx) => (
        <div
          key={`handpicked-skel-${idx}`}
          className={`flex flex-col space-y-3 ${idx === 1 ? '-translate-y-2 sm:-translate-y-4' : ''}`}
        >
          <div className="h-6 bg-slate-200 rounded-xs w-8 shimmer-effect" />
          <div className="aspect-3/4 w-full bg-slate-150 rounded-xs overflow-hidden shadow-xs">
            <div className="w-full h-full shimmer-effect" />
          </div>
          <div className="space-y-2 pt-1">
            <div className="h-4 bg-slate-200 rounded-xs w-4/5 shimmer-effect" />
            <div className="flex items-center justify-between pt-1">
              <div className="h-4 bg-slate-200 rounded-xs w-16 shimmer-effect" />
              <div className="h-3.5 bg-slate-150 rounded-xs w-10 shimmer-effect" />
            </div>
            <div className="h-3 bg-slate-150 rounded-xs w-1/2 shimmer-effect" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Featured Book Spotlight Skeleton
 */
export const FeaturedBookSpotlightSkeleton = () => {
  return (
    <section className="py-12 sm:py-16 px-4 sm:px-8 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 items-center">
        <div className="flex justify-center items-center">
          <div className="relative max-w-[420px] w-full aspect-[4/5] rounded-md overflow-hidden bg-slate-100 shadow-sm">
            <div className="w-full h-full shimmer-effect" />
          </div>
        </div>
        <div className="flex flex-col justify-center space-y-4">
          <div className="h-8 sm:h-10 bg-slate-200 rounded-xs w-3/4 shimmer-effect" />
          <div className="h-4 bg-slate-150 rounded-xs w-1/3 shimmer-effect" />
          <div className="space-y-2 pt-2">
            <div className="h-3.5 bg-slate-100 rounded-xs w-full shimmer-effect" />
            <div className="h-3.5 bg-slate-100 rounded-xs w-11/12 shimmer-effect" />
            <div className="h-3.5 bg-slate-100 rounded-xs w-4/5 shimmer-effect" />
          </div>
          <div className="h-10 bg-[#224494]/20 rounded-full w-32 shimmer-effect mt-2" />
        </div>
      </div>
    </section>
  );
};

/**
 * Combo Offer Banner Skeleton
 */
export const ComboOfferBannerSkeleton = () => {
  return (
    <div className="w-full my-8 sm:my-12 overflow-hidden">
      <div className="w-full aspect-[1200/350] min-h-[140px] sm:min-h-[220px] bg-slate-100 rounded-none overflow-hidden">
        <div className="w-full h-full shimmer-effect" />
      </div>
    </div>
  );
};


