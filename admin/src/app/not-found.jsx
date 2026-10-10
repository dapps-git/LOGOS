import React from 'react';
import Link from 'next/link';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 mb-4 shadow-xs">
        <FileQuestion className="w-7 h-7" />
      </div>

      <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-1">
        Page Not Found
      </h2>
      <p className="text-xs text-slate-500 max-w-sm mb-6">
        The admin page or resource you are looking for does not exist or has been moved.
      </p>

      <Link
        href="/"
        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-md shadow-xs transition-all active:scale-95"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Return to Dashboard
      </Link>
    </div>
  );
}
