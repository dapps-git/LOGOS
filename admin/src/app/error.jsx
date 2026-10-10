'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('Admin Error Boundary caught error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-4 shadow-xs">
        <AlertCircle className="w-7 h-7" />
      </div>

      <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">
        Something went wrong
      </h2>
      <p className="text-xs text-slate-500 max-w-md mb-6 leading-relaxed">
        {error?.message || 'An unexpected error occurred while rendering this page.'}
      </p>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-md shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Try Again
        </button>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold rounded-md transition-all cursor-pointer"
        >
          <Home className="w-3.5 h-3.5" />
          Dashboard
        </Link>
      </div>
    </div>
  );
}
