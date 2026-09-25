'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';
import { useStoreData } from '@/context/StoreDataContext';
import { useToast } from '@/context/ToastContext';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  Star,
  AlertTriangle,
  Package
} from 'lucide-react';

export default function ProductsPage() {
  const { books = [], deleteBook, updateBook } = useStoreData();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [themeFilter, setThemeFilter] = useState('ALL');
  const [stockFilter, setStockFilter] = useState('ALL');
  const [previewBook, setPreviewBook] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Filter themes
  const themes = ['ALL', ...Array.from(new Set(books.map((b) => b.theme).filter(Boolean)))];

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title?.toLowerCase().includes(search.toLowerCase()) ||
      book.author?.toLowerCase().includes(search.toLowerCase()) ||
      book.publisher?.toLowerCase().includes(search.toLowerCase()) ||
      book.sku?.toLowerCase().includes(search.toLowerCase());

    const matchesTheme = themeFilter === 'ALL' || book.theme === themeFilter;

    const matchesStock =
      stockFilter === 'ALL' ||
      (stockFilter === 'in_stock' && book.stock > 5) ||
      (stockFilter === 'low_stock' && book.stock > 0 && book.stock <= 5) ||
      (stockFilter === 'out_of_stock' && book.stock === 0);

    return matchesSearch && matchesTheme && matchesStock;
  });

  const handleDelete = (id) => {
    deleteBook(id);
    setDeleteConfirmId(null);
    showToast('Book removed from catalog successfully', 'info');
  };

  const handleToggleActive = (book) => {
    updateBook(book._id, { isActive: !book.isActive });
    showToast(`Book marked as ${!book.isActive ? 'Active' : 'Inactive'}`, 'success');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Products Catalog</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Manage books, cover images, languages, themes, stock quantities, and pricing.
            </p>
          </div>

          <Link
            href="/products/add"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-md shadow-xs transition-all active:scale-95 w-fit"
          >
            <Plus className="w-4 h-4" />
            Add New Product
          </Link>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 bg-white border border-slate-200 rounded-md flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by title, author, publisher, SKU..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-md focus:border-slate-900 focus:bg-white text-xs font-medium outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={themeFilter}
              onChange={(e) => setThemeFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-xs font-semibold text-slate-700 focus:outline-hidden"
            >
              {themes.map((t) => (
                <option key={t} value={t}>
                  {t === 'ALL' ? 'All Themes / Genres' : t}
                </option>
              ))}
            </select>

            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-xs font-semibold text-slate-700 focus:outline-hidden"
            >
              <option value="ALL">All Stock Levels</option>
              <option value="in_stock">In Stock (&gt;5)</option>
              <option value="low_stock">Low Stock (≤5)</option>
              <option value="out_of_stock">Out of Stock (0)</option>
            </select>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4 font-bold min-w-[240px]">Product</th>
                  <th className="py-3 px-4 font-bold min-w-[140px]">Author & Publisher</th>
                  <th className="py-3 px-4 font-bold min-w-[140px]">Theme & Languages</th>
                  <th className="py-3 px-4 font-bold text-right min-w-[100px]">Price / Rate</th>
                  <th className="py-3 px-4 font-bold text-center min-w-[100px]">Stock</th>
                  <th className="py-3 px-4 font-bold text-center min-w-[90px]">Status</th>
                  <th className="py-3 px-4 font-bold text-right min-w-[110px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBooks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No books found in catalog matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredBooks.map((book) => {
                    const cover = book.images?.[0];
                    const photosCount = book.images?.length || 0;

                    return (
                      <tr key={book._id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Product Title + Photos count */}
                        <td className="py-3 px-4 align-middle">
                          <div className="flex items-center gap-3">
                            <div className="relative flex-shrink-0">
                              {cover ? (
                                <img
                                  src={cover}
                                  alt={book.title || book.name}
                                  className="w-10 h-14 object-cover border border-slate-300 rounded-xs"
                                />
                              ) : (
                                <div className="w-10 h-14 bg-slate-100 border border-slate-300 rounded-xs flex items-center justify-center text-slate-400">
                                  <Package className="w-5 h-5" />
                                </div>
                              )}
                              {photosCount > 1 && (
                                <span className="absolute -bottom-1 -right-1 bg-slate-900 text-white text-[9px] font-bold px-1 py-0.2 rounded-xs">
                                  {photosCount}📷
                                </span>
                              )}
                            </div>
                            <div className="min-w-0 max-w-xs">
                              <p className="font-bold text-slate-900 truncate">{book.title || book.name}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5 font-mono">SKU: {book.sku || 'N/A'}</p>
                              <div className="flex items-center gap-1 mt-1">
                                {book.isBestSeller && (
                                  <span className="text-[9px] font-bold text-amber-800 bg-amber-50 px-1 py-0.5 border border-amber-200 rounded-xs flex items-center gap-0.5">
                                    <Star className="w-2.5 h-2.5 fill-amber-700" /> Best Seller
                                  </span>
                                )}
                                {book.isNewArrival && (
                                  <span className="text-[9px] font-bold text-blue-800 bg-blue-50 px-1 py-0.5 border border-blue-200 rounded-xs">
                                    New
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Author & Publisher */}
                        <td className="py-3 px-4 text-slate-600 align-middle">
                          <p className="font-bold text-slate-800">{book.author || 'N/A'}</p>
                          <p className="text-[11px] text-slate-500">{book.publisher || 'N/A'}</p>
                        </td>

                        {/* Theme & Languages */}
                        <td className="py-3 px-4 align-middle">
                          <span className="inline-block font-bold text-slate-800 bg-slate-100 px-2 py-0.5 border border-slate-200 rounded-xs text-[10px] uppercase mb-1">
                            {book.theme || 'General'}
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {book.languages?.map((lang, idx) => (
                              <span key={idx} className="text-[10px] text-slate-600 bg-slate-50 px-1.5 py-0.2 border border-slate-200 rounded-xs">
                                {lang}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Price */}
                        <td className="py-3 px-4 text-right align-middle">
                          <div className="space-y-0.5">
                            <p className="font-bold text-slate-900 text-sm">
                              ₹{book.discountPrice || book.price || 0}
                            </p>
                            {book.discountPrice && book.discountPrice < book.price && (
                              <p className="text-[10px] text-slate-400 line-through">
                                ₹{book.price} ({book.discountPercent}% off)
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Stock */}
                        <td className="py-3 px-4 text-center align-middle whitespace-nowrap">
                          <Badge
                            variant={
                              book.stock === 0
                                ? 'danger'
                                : book.stock <= 5
                                ? 'warning'
                                : 'success'
                            }
                          >
                            {book.stock || 0} left
                          </Badge>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4 text-center align-middle whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(book)}
                            className="cursor-pointer"
                          >
                            <Badge variant={book.isActive !== false ? 'success' : 'default'}>
                              {book.isActive !== false ? 'Active' : 'Inactive'}
                            </Badge>
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right align-middle whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => setPreviewBook(book)}
                              className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
                              title="Preview Book"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <Link
                              href={`/products/add?editId=${book._id}`}
                              className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
                              title="Edit Book"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Link>

                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(book._id)}
                              className="p-1.5 rounded-md text-rose-600 hover:text-rose-800 hover:bg-rose-50 border border-slate-200 transition-colors"
                              title="Delete Book"
                            >
                              <Trash2 className="w-4 h-4" />
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

        {/* Book Preview Modal */}
        {previewBook && (
          <Modal
            isOpen={Boolean(previewBook)}
            onClose={() => setPreviewBook(null)}
            title={previewBook.title || previewBook.name}
            subtitle={`By ${previewBook.author || 'Author'} | Publisher: ${previewBook.publisher || 'Publisher'}`}
            maxWidth="max-w-3xl"
          >
            <div className="space-y-6">
              {/* Images Gallery Preview */}
              <div>
                <p className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Book Photos ({previewBook.images?.length || 0} Attached):</p>
                <div className="grid grid-cols-3 gap-3">
                  {previewBook.images?.map((img, i) => (
                    <div key={i} className="aspect-3/4 border border-slate-300 rounded-md bg-slate-50 overflow-hidden">
                      <img src={img} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Details Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-md text-xs">
                <div>
                  <p className="text-slate-500 font-medium">Rate / Price</p>
                  <p className="text-sm font-bold text-slate-900">₹{previewBook.discountPrice || previewBook.price || 0}</p>
                </div>
                <div>
                  <p className="text-slate-500 font-medium">Stock Available</p>
                  <p className="text-sm font-bold text-slate-900">{previewBook.stock || 0} Copies</p>
                </div>
                <div>
                  <p className="text-slate-500 font-medium">Theme / Genre</p>
                  <p className="text-sm font-bold text-slate-900">{previewBook.theme || 'General'}</p>
                </div>
                <div>
                  <p className="text-slate-500 font-medium">Page Count</p>
                  <p className="text-sm font-bold text-slate-900">{previewBook.pageCount || 0} Pages</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">Description / Synopsis:</p>
                <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 border border-slate-200 rounded-md">
                  {previewBook.description || 'No description provided.'}
                </p>
              </div>
            </div>
          </Modal>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmId && (
          <Modal
            isOpen={Boolean(deleteConfirmId)}
            onClose={() => setDeleteConfirmId(null)}
            title="Delete Book from Catalog"
            maxWidth="max-w-md"
          >
            <div className="space-y-4">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-rose-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-600" />
                <p>Are you sure you want to permanently remove this book from the catalog?</p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 text-xs font-bold border border-slate-300 rounded-md text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-md shadow-xs"
                >
                  Delete Book
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AdminLayout>
  );
}
