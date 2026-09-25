'use client';

import React, { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Badge } from '@/components/common/Badge';
import { useStoreData } from '@/context/StoreDataContext';
import { useToast } from '@/context/ToastContext';
import {
  Boxes,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  Plus,
  Minus,
  Package
} from 'lucide-react';

export default function InventoryPage() {
  const { books = [], updateBook } = useStoreData();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');

  const inStockCount = books.filter((b) => b.stock > 5).length;
  const lowStockCount = books.filter((b) => b.stock > 0 && b.stock <= 5).length;
  const outOfStockCount = books.filter((b) => (b.stock || 0) === 0).length;
  const totalInventoryValue = books.reduce((sum, b) => sum + ((b.price || 0) * (b.stock || 0)), 0);

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title?.toLowerCase().includes(search.toLowerCase()) ||
      book.author?.toLowerCase().includes(search.toLowerCase()) ||
      book.sku?.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === 'ALL' ||
      (filter === 'in_stock' && book.stock > 5) ||
      (filter === 'low_stock' && book.stock > 0 && book.stock <= 5) ||
      (filter === 'out_of_stock' && (book.stock || 0) === 0);

    return matchesSearch && matchesFilter;
  });

  const handleStockChange = (bookId, newQty) => {
    const qty = Math.max(0, parseInt(newQty, 10) || 0);
    updateBook(bookId, { stock: qty });
    showToast(`Stock updated to ${qty} units`, 'success', 2000);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Stock & Inventory Management</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitor real-time inventory levels, restock alerts, and adjust warehouse quantities.
          </p>
        </div>

        {/* 4 Inventory Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white border border-slate-200 rounded-md space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total SKUs</span>
              <Boxes className="w-5 h-5 text-slate-600" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">{books.length} Titles</h3>
            <p className="text-[11px] text-slate-500">Valuation: ₹{totalInventoryValue.toLocaleString('en-IN')}</p>
          </div>

          <div className="p-5 bg-white border border-emerald-300 rounded-md space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">In Stock</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
            </div>
            <h3 className="text-2xl font-black text-emerald-800">{inStockCount} Items</h3>
            <p className="text-[11px] text-emerald-700">Healthy stock (&gt; 5 units)</p>
          </div>

          <div className="p-5 bg-white border border-amber-300 rounded-md space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Low Stock Alert</span>
              <AlertTriangle className="w-5 h-5 text-amber-700" />
            </div>
            <h3 className="text-2xl font-black text-amber-800">{lowStockCount} Items</h3>
            <p className="text-[11px] text-amber-700">Requires reorder (≤ 5 units)</p>
          </div>

          <div className="p-5 bg-white border border-rose-300 rounded-md space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">Out of Stock</span>
              <XCircle className="w-5 h-5 text-rose-700" />
            </div>
            <h3 className="text-2xl font-black text-rose-800">{outOfStockCount} Items</h3>
            <p className="text-[11px] text-rose-700">Zero inventory remaining</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-4 bg-white border border-slate-200 rounded-md flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, SKU, author..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-md text-xs font-medium outline-hidden focus:border-slate-900 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-md text-xs font-semibold overflow-x-auto w-full sm:w-auto">
            {[
              { id: 'ALL', label: 'All Inventory' },
              { id: 'in_stock', label: `In Stock (${inStockCount})` },
              { id: 'low_stock', label: `Low Stock (${lowStockCount})` },
              { id: 'out_of_stock', label: `Out of Stock (${outOfStockCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`px-3 py-1.5 whitespace-nowrap text-xs font-bold rounded-sm transition-all ${
                  filter === tab.id
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stock Inventory Table */}
        <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4 font-bold min-w-[220px]">Book Title & SKU</th>
                  <th className="py-3 px-4 font-bold min-w-[120px]">Theme</th>
                  <th className="py-3 px-4 font-bold text-right min-w-[100px]">Unit Rate</th>
                  <th className="py-3 px-4 font-bold text-center min-w-[110px]">Status</th>
                  <th className="py-3 px-4 font-bold text-center min-w-[100px]">Stock Count</th>
                  <th className="py-3 px-4 font-bold text-right min-w-[150px]">Adjust Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBooks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No inventory items found.
                    </td>
                  </tr>
                ) : (
                  filteredBooks.map((book) => {
                    const isOut = (book.stock || 0) === 0;
                    const isLow = book.stock > 0 && book.stock <= 5;
                    const cover = book.images?.[0];

                    return (
                      <tr key={book._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 align-middle">
                          <div className="flex items-center gap-3">
                            {cover ? (
                              <img
                                src={cover}
                                alt={book.title || book.name}
                                className="w-9 h-12 object-cover border border-slate-200 rounded-xs flex-shrink-0"
                              />
                            ) : (
                              <div className="w-9 h-12 bg-slate-100 border border-slate-200 rounded-xs flex items-center justify-center flex-shrink-0 text-slate-400">
                                <Package className="w-4 h-4" />
                              </div>
                            )}
                            <div className="min-w-0 max-w-xs">
                              <p className="font-bold text-slate-900 truncate">{book.title || book.name}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5 font-mono">SKU: {book.sku || 'N/A'}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 align-middle">
                          <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 border border-slate-200 rounded-xs text-[10px] uppercase">
                            {book.theme || 'General'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right font-bold text-slate-900 align-middle">
                          ₹{book.discountPrice || book.price || 0}
                        </td>

                        <td className="py-3.5 px-4 text-center align-middle whitespace-nowrap">
                          <Badge variant={isOut ? 'danger' : isLow ? 'warning' : 'success'}>
                            {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                          </Badge>
                        </td>

                        <td className="py-3.5 px-4 text-center font-black text-sm text-slate-900 align-middle">
                          {book.stock || 0}
                        </td>

                        <td className="py-3.5 px-4 text-right align-middle whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleStockChange(book._id, (book.stock || 0) - 1)}
                              disabled={(book.stock || 0) <= 0}
                              className="w-7 h-7 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 flex items-center justify-center font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>

                            <input
                              type="number"
                              min="0"
                              value={book.stock || 0}
                              onChange={(e) => handleStockChange(book._id, e.target.value)}
                              className="w-14 text-center py-1 text-xs font-bold border border-slate-300 rounded-sm bg-white focus:outline-hidden focus:border-slate-900"
                            />

                            <button
                              type="button"
                              onClick={() => handleStockChange(book._id, (book.stock || 0) + 1)}
                              className="w-7 h-7 rounded-sm bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center font-bold text-sm transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
