'use client';

import React from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useStoreData } from '@/context/StoreDataContext';
import {
  BarChart3,
  TrendingUp,
  ShoppingBag,
  Download
} from 'lucide-react';

export default function ReportsPage() {
  const { books = [], orders = [], customers = [] } = useStoreData();

  const totalSales = orders.reduce((sum, o) => sum + (Number(o.finalTotal) || Number(o.totalAmount) || 0), 0);
  const avgOrderValue = orders.length > 0 ? Math.round(totalSales / orders.length) : 0;

  // Genre breakdown calculated from actual books
  const genreCounts = {};
  books.forEach((b) => {
    const genre = b.theme || b.category || 'General';
    genreCounts[genre] = (genreCounts[genre] || 0) + 1;
  });

  const genreList = Object.entries(genreCounts).map(([genre, count]) => {
    const percent = books.length > 0 ? Math.round((count / books.length) * 100) : 0;
    return { genre, count, percent };
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Store Analytics & Reports</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Comprehensive financial breakdown, sales volume trends, and genre demand metrics.
            </p>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-md text-xs font-bold shadow-2xs transition-colors"
          >
            <Download className="w-4 h-4" />
            Export / Print Report
          </button>
        </div>

        {/* 3 Analytics KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="p-5 rounded-md bg-white border border-slate-200 shadow-2xs space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase">Gross Revenue</span>
            <h3 className="text-3xl font-extrabold text-slate-900">₹{totalSales.toLocaleString('en-IN')}</h3>
            <p className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" /> From {orders.length} total orders
            </p>
          </div>

          <div className="p-5 rounded-md bg-white border border-slate-200 shadow-2xs space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase">Average Order Value (AOV)</span>
            <h3 className="text-3xl font-extrabold text-slate-900">₹{avgOrderValue.toLocaleString('en-IN')}</h3>
            <p className="text-[11px] text-slate-500 mt-1">Based on {orders.length} completed transactions</p>
          </div>

          <div className="p-5 rounded-md bg-white border border-slate-200 shadow-2xs space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase">Catalog Volume</span>
            <h3 className="text-3xl font-extrabold text-emerald-800">{books.length} Titles</h3>
            <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-1">
              <ShoppingBag className="w-3.5 h-3.5" /> Across {customers.length} registered readers
            </p>
          </div>
        </div>

        {/* Category Performance Breakdown */}
        <div className="bg-white rounded-md border border-slate-200 p-6 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Catalog Breakdown by Theme / Genre</h3>

          {genreList.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No product genres recorded in catalog yet.
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              {genreList.map((item, idx) => (
                <div key={idx} className="space-y-1.5 text-xs">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>{item.genre}</span>
                    <span className="text-slate-900">{item.count} titles ({item.percent}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                      style={{ width: `${Math.max(5, item.percent)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
