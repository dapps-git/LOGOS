import React from 'react';

export default function ProductsLoading() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="w-full h-20 sm:h-24 bg-white border-b border-slate-100 mb-6" />
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6">
        {/* Header Skeleton */}
        <div className="mb-6 space-y-2">
          <div className="h-8 bg-slate-200 rounded w-48 animate-pulse" />
          <div className="h-4 bg-slate-150 rounded w-80 animate-pulse" />
        </div>

        {/* Filter bar skeleton */}
        <div className="h-14 bg-white border border-slate-200 rounded-2xl mb-6 animate-pulse" />

        {/* Product Cards Grid Skeleton (6 in one row) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-6 gap-3 sm:gap-4">
          {Array.from({ length: 18 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200/90 p-2.5 sm:p-3 flex flex-col justify-between"
            >
              <div className="aspect-[3/4] w-full bg-slate-100 rounded-xl mb-2.5 animate-pulse" />
              <div className="space-y-1.5 flex-1">
                <div className="h-4 bg-slate-200 rounded w-4/5 animate-pulse" />
                <div className="h-3 bg-slate-150 rounded w-1/2 animate-pulse" />
                <div className="h-3 bg-slate-150 rounded w-1/3 animate-pulse" />
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between mt-2">
                <div className="h-4 bg-slate-200 rounded w-16 animate-pulse" />
                <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

