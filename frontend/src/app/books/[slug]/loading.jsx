import React from 'react';

export default function BookDetailLoading() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      {/* Top Navbar Placeholder spacing */}
      <div className="w-full h-20 sm:h-24 bg-white border-b border-slate-100" />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center gap-2 mb-6">
          <div className="h-3.5 bg-slate-200 rounded w-12 animate-pulse" />
          <span className="text-slate-300">&gt;</span>
          <div className="h-3.5 bg-slate-200 rounded w-14 animate-pulse" />
          <span className="text-slate-300">&gt;</span>
          <div className="h-3.5 bg-slate-200 rounded w-32 animate-pulse" />
        </div>

        {/* Main Product Card Skeleton */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-10 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Column: Image Skeleton */}
            <div className="lg:col-span-5 flex flex-col items-center w-full">
              <div className="w-full max-w-[340px] sm:max-w-[400px] aspect-[3/4] bg-slate-100 rounded-xl animate-pulse border border-slate-200/60 shadow-xs" />
              <div className="flex gap-2.5 justify-center mt-5 pt-3 border-t border-slate-100 w-full">
                {[1, 2, 3].map((idx) => (
                  <div key={idx} className="w-14 h-20 bg-slate-100 rounded-md animate-pulse border border-slate-200" />
                ))}
              </div>
            </div>

            {/* Right Column: Details Skeleton */}
            <div className="lg:col-span-7 flex flex-col space-y-4 w-full">
              {/* Badge */}
              <div className="h-5 bg-slate-200 rounded w-24 animate-pulse" />

              {/* Title */}
              <div className="space-y-2">
                <div className="h-7 bg-slate-200 rounded w-4/5 animate-pulse" />
                <div className="h-7 bg-slate-200 rounded w-2/3 animate-pulse" />
              </div>

              {/* Price & Rating */}
              <div className="flex items-center gap-3 pt-1">
                <div className="h-8 bg-slate-200 rounded w-28 animate-pulse" />
                <div className="h-4 bg-slate-150 rounded w-16 animate-pulse" />
                <div className="h-4 bg-slate-150 rounded w-20 animate-pulse" />
              </div>

              {/* Specification Rows */}
              <div className="space-y-2.5 py-4 border-t border-slate-100">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="grid grid-cols-[130px_1fr] items-center gap-4">
                    <div className="h-3.5 bg-slate-200 rounded w-20 animate-pulse" />
                    <div className="h-3.5 bg-slate-150 rounded w-40 animate-pulse" />
                  </div>
                ))}
              </div>

              {/* About description */}
              <div className="pt-2 space-y-2 border-t border-slate-100">
                <div className="h-4 bg-slate-200 rounded w-32 animate-pulse" />
                <div className="h-3.5 bg-slate-150 rounded w-full animate-pulse" />
                <div className="h-3.5 bg-slate-150 rounded w-5/6 animate-pulse" />
                <div className="h-3.5 bg-slate-150 rounded w-3/4 animate-pulse" />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex gap-3">
                <div className="h-12 bg-slate-200 rounded-lg flex-1 animate-pulse" />
                <div className="h-12 bg-slate-200 rounded-lg flex-1 animate-pulse" />
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

