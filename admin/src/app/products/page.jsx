'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  FileSpreadsheet,
  Sparkles,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { BulkImportModal } from '@/components/products/BulkImportModal';
import { apiClient } from '@/api/client';

export default function ProductsPage() {
  const { deleteBook, updateBook } = useStoreData();
  const { showToast } = useToast();

  const [mounted, setMounted] = useState(false);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [themeFilter, setThemeFilter] = useState('ALL');
  const [stockFilter, setStockFilter] = useState('ALL');
  const [featureFilter, setFeatureFilter] = useState('ALL');
  const [authorFilter, setAuthorFilter] = useState('ALL');

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    totalPages: 1,
    totalItems: 0
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const [filterOptions, setFilterOptions] = useState({ themes: ['ALL'], authors: ['ALL'] });
  const [counts, setCounts] = useState({
    total: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0
  });

  const [previewBook, setPreviewBook] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [migratingImages, setMigratingImages] = useState(false);
  const [syncingStock, setSyncingStock] = useState(false);

  const fetchRequestIdRef = useRef(0);

  // Helper to resolve genuine book cover image prioritizing real uploads over placeholders
  const getAdminBookCover = (b) => {
    if (!b) return '/book-placeholder.svg';
    const images = Array.isArray(b.images) ? b.images : [];
    // Priority 1: Genuine non-placeholder photo from images array
    const realFromImages = images.find(
      (img) => typeof img === 'string' && img.trim() && !img.includes('placeholder')
    );
    if (realFromImages) return realFromImages;

    // Priority 2: Genuine non-placeholder from coverImage or image
    const realFromCover = [b.coverImage, b.image].find(
      (img) => typeof img === 'string' && img.trim() && !img.includes('placeholder')
    );
    if (realFromCover) return realFromCover;

    return images[0] || b.coverImage || b.image || '/book-placeholder.svg';
  };

  // Helper to optimize image thumbnail delivery
  const optimizeAdminImage = (url) => {
    if (!url || typeof url !== 'string') return '/book-placeholder.svg';
    if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
      if (url.includes('/upload/f_') || url.includes('/upload/w_')) {
        return url.replace(/\/upload\/[^/]+\//, '/upload/f_webp,q_auto,w_100,c_limit/');
      }
      return url.replace('/upload/', '/upload/f_webp,q_auto,w_100,c_limit/');
    }
    if (url.includes('googleusercontent.com/d/') || url.includes('googleusercontent.com/')) {
      return `${url.split('=')[0]}=w100-rw`;
    }
    return url;
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Debounce search input (220ms) for snappy typing without flooding network
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 220);
    return () => clearTimeout(timer);
  }, [search]);

  // Load distinct filter options & summary counts once on mount
  useEffect(() => {
    let active = true;
    apiClient('/books/filters/options')
      .then((res) => {
        if (!active) return;
        if (res?.options) {
          setFilterOptions({
            themes: ['ALL', ...(res.options.themes || [])],
            authors: ['ALL', ...(res.options.authors || [])]
          });
        }
        if (res?.counts) {
          setCounts(res.counts);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  // Server-side paginated book loader
  const loadBooks = useCallback(async () => {
    const currentRequestId = ++fetchRequestIdRef.current;
    setLoading(true);

    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(itemsPerPage),
        includeInactive: 'true'
      });

      if (debouncedSearch.trim()) params.append('search', debouncedSearch.trim());
      if (themeFilter !== 'ALL') params.append('theme', themeFilter);
      if (stockFilter !== 'ALL') params.append('stockStatus', stockFilter);
      if (authorFilter !== 'ALL') params.append('author', authorFilter);

      if (featureFilter === 'bestsellers') params.append('isBestSeller', 'true');
      else if (featureFilter === 'handpicked') params.append('isHandpicked', 'true');
      else if (featureFilter === 'featured_spotlight') params.append('isFeatured', 'true');
      else if (featureFilter === 'new_arrivals') params.append('isNewArrival', 'true');
      else if (featureFilter === 'author_spotlight') params.append('isAuthorSpotlight', 'true');

      const data = await apiClient(`/books?${params.toString()}`);

      if (currentRequestId === fetchRequestIdRef.current && Array.isArray(data?.books)) {
        setBooks(data.books);
        if (data.pagination) {
          setPagination(data.pagination);
        }
      }
    } catch (err) {
      console.warn('[ProductsPage] Failed to fetch books:', err);
    } finally {
      if (currentRequestId === fetchRequestIdRef.current) {
        setLoading(false);
      }
    }
  }, [currentPage, debouncedSearch, themeFilter, stockFilter, featureFilter, authorFilter]);

  // Reset to page 1 whenever filters or search query change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, themeFilter, stockFilter, featureFilter, authorFilter]);

  // Trigger paginated fetch
  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  const handleDelete = async (id) => {
    try {
      await deleteBook(id);
      setBooks((prev) => prev.filter((b) => b._id !== id));
      setDeleteConfirmId(null);
      showToast('Book removed from catalog successfully', 'info');
      if (books.length <= 1 && currentPage > 1) {
        setCurrentPage((p) => p - 1);
      } else {
        loadBooks();
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete book', 'error');
    }
  };

  const handleToggleActive = async (book) => {
    const newActive = !book.isActive;
    setBooks((prev) => prev.map((b) => (b._id === book._id ? { ...b, isActive: newActive } : b)));
    try {
      await updateBook(book._id, { isActive: newActive });
      showToast(`Book marked as ${newActive ? 'Active' : 'Inactive'}`, 'success');
    } catch {
      showToast('Failed to update book status', 'error');
      loadBooks();
    }
  };

  const handleToggleNewArrival = async (book) => {
    const newArrival = !book.isNewArrival;
    setBooks((prev) => prev.map((b) => (b._id === book._id ? { ...b, isNewArrival: newArrival } : b)));
    try {
      await updateBook(book._id, { isNewArrival: newArrival });
      showToast(`Book ${newArrival ? 'marked as New Arrival' : 'removed from New Arrivals'}`, 'success');
    } catch {
      showToast('Failed to update New Arrival badge', 'error');
      loadBooks();
    }
  };

  const handleToggleBookOfTheWeek = async (book) => {
    const newStatus = !book.isBookOfTheWeek;
    setBooks((prev) => prev.map((b) => (b._id === book._id ? { ...b, isBookOfTheWeek: newStatus } : b)));
    try {
      await updateBook(book._id, { isBookOfTheWeek: newStatus });
      showToast(`Book ${newStatus ? 'marked as Book of the Week 👑' : 'removed from Book of the Week'}`, 'success');
    } catch {
      showToast('Failed to update Book of the Week badge', 'error');
      loadBooks();
    }
  };

  const handleToggleComingSoon = async (book) => {
    const newStatus = !book.isComingSoon;
    setBooks((prev) => prev.map((b) => (b._id === book._id ? { ...b, isComingSoon: newStatus, isPreBook: newStatus } : b)));
    try {
      await updateBook(book._id, { isComingSoon: newStatus, isPreBook: newStatus });
      showToast(`Book ${newStatus ? 'marked as Coming Soon / Pre-Book ⏳' : 'removed from Coming Soon'}`, 'success');
    } catch {
      showToast('Failed to update Coming Soon badge', 'error');
      loadBooks();
    }
  };

  const handleConvertImagesToWebp = async () => {
    if (!confirm('This will convert all book images into WebP format and store them in Cloudinary for ultra-fast loading. Proceed?')) return;
    try {
      setMigratingImages(true);
      showToast('Converting images to Cloudinary WebP... please wait', 'info');
      const res = await apiClient('/books/admin/convert-images-to-webp');
      if (res?.success) {
        showToast(res.message || 'Images converted to WebP successfully!', 'success');
        loadBooks();
      } else {
        showToast(res?.message || 'Failed to convert images', 'error');
      }
    } catch (e) {
      showToast(`Error converting images: ${e.message}`, 'error');
    } finally {
      setMigratingImages(false);
    }
  };

  const handleSyncStock = async () => {
    try {
      setSyncingStock(true);
      showToast('Auditing and reconciling stock status across catalog...', 'info');
      const res = await apiClient('/books/admin/sync-stock');
      if (res?.success) {
        showToast(res.message || 'Stock levels and statuses synchronized successfully!', 'success');
        loadBooks();
      } else {
        showToast(res?.message || 'Sync completed', 'info');
      }
    } catch (e) {
      showToast(`Error synchronizing stock: ${e.message}`, 'error');
    } finally {
      setSyncingStock(false);
    }
  };

  const totalPages = pagination.totalPages || 1;
  const totalItems = pagination.totalItems || books.length;

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

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleSyncStock}
              disabled={syncingStock}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-bold text-xs rounded-md shadow-xs transition-all active:scale-95 cursor-pointer"
              title="Audit and synchronize stock levels and stockStatus across all catalog titles"
            >
              {syncingStock ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Reconciling...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Reconcile Stock</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleConvertImagesToWebp}
              disabled={migratingImages}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-sky-700 hover:bg-sky-800 disabled:opacity-60 text-white font-bold text-xs rounded-md shadow-xs transition-all active:scale-95 cursor-pointer"
              title="Convert all catalog images to high-performance WebP stored in Cloudinary"
            >
              {migratingImages ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Converting...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Convert Images to WebP</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setBulkModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-md shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Import Excel / CSV
            </button>

            <Link
              href="/products/add"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-md shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add New Product
            </Link>
          </div>
        </div>

        {/* Quick Filter Pills (1-Click Highlights Bar) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setFeatureFilter('ALL')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              featureFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            All Books <span className="text-[10px] opacity-75 font-mono">({counts.total || totalItems})</span>
          </button>

          <button
            type="button"
            onClick={() => setFeatureFilter(featureFilter === 'bestsellers' ? 'ALL' : 'bestsellers')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              featureFilter === 'bestsellers'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            🔥 Bestsellers
          </button>

          <button
            type="button"
            onClick={() => setFeatureFilter(featureFilter === 'handpicked' ? 'ALL' : 'handpicked')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              featureFilter === 'handpicked'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            ✨ Handpicked
          </button>

          <button
            type="button"
            onClick={() => setFeatureFilter(featureFilter === 'featured_spotlight' ? 'ALL' : 'featured_spotlight')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              featureFilter === 'featured_spotlight'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'bg-purple-50 text-purple-900 border border-purple-200 hover:bg-purple-100'
            }`}
          >
            🌟 Featured Spotlight
          </button>

          <button
            type="button"
            onClick={() => setFeatureFilter(featureFilter === 'new_arrivals' ? 'ALL' : 'new_arrivals')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              featureFilter === 'new_arrivals'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100'
            }`}
          >
            🚀 New Arrivals
          </button>

          <button
            type="button"
            onClick={() => setStockFilter(stockFilter === 'out_of_stock' ? 'ALL' : 'out_of_stock')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              stockFilter === 'out_of_stock'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'bg-rose-50 text-rose-900 border border-rose-200 hover:bg-rose-100'
            }`}
          >
            ⚠️ Out of Stock <span className="text-[10px] opacity-75 font-mono">({counts.outOfStock || 0})</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 bg-white border border-slate-200 rounded-md flex flex-col lg:flex-row items-center gap-3">
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

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Author Filter Dropdown */}
            <select
              value={authorFilter}
              onChange={(e) => setAuthorFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-xs font-semibold text-slate-700 focus:outline-hidden max-w-[160px] truncate"
            >
              <option value="ALL">All Authors</option>
              {filterOptions.authors.filter((a) => a !== 'ALL').map((auth) => (
                <option key={auth} value={auth}>
                  {auth}
                </option>
              ))}
            </select>

            {/* Theme Filter Dropdown */}
            <select
              value={themeFilter}
              onChange={(e) => setThemeFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-xs font-semibold text-slate-700 focus:outline-hidden max-w-[140px] truncate"
            >
              <option value="ALL">All Themes</option>
              {filterOptions.themes.filter((t) => t !== 'ALL').map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            {/* Stock Filter Dropdown */}
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-xs font-semibold text-slate-700 focus:outline-hidden"
            >
              <option value="ALL">All Stock ({counts.total || totalItems})</option>
              <option value="in_stock">In Stock ({counts.inStock || 0})</option>
              <option value="low_stock">Low Stock ({counts.lowStock || 0})</option>
              <option value="out_of_stock">Out of Stock ({counts.outOfStock || 0})</option>
            </select>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white border border-slate-200 rounded-md overflow-hidden relative">
          {loading && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-2xs flex items-center justify-center z-10">
              <div className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-full shadow-lg text-xs font-bold animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                <span>Loading page {currentPage}...</span>
              </div>
            </div>
          )}

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
                {loading && books.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-[#1E3A8A]" />
                        <span className="text-sm font-medium">Loading books catalog...</span>
                      </div>
                    </td>
                  </tr>
                ) : books.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No books found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  books.map((book) => {
                    const cover = getAdminBookCover(book);
                    const photosCount = (book.images?.length) || (book.coverImage ? 1 : 0);

                    return (
                      <tr key={book._id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Product Title + Photos count */}
                        <td className="py-3 px-4 align-middle">
                          <div className="flex items-center gap-3">
                            <div className="relative flex-shrink-0">
                              <img
                                src={optimizeAdminImage(cover)}
                                alt={book.title || book.name}
                                referrerPolicy="no-referrer"
                                loading="lazy"
                                crossOrigin="anonymous"
                                onError={(e) => {
                                  if (!e.currentTarget.dataset.failed) {
                                    e.currentTarget.dataset.failed = 'true';
                                    e.currentTarget.src = '/book-placeholder.svg';
                                  }
                                }}
                                className="w-10 h-14 object-cover border border-slate-200 rounded-lg shadow-2xs bg-slate-50"
                              />
                              {photosCount > 1 && (
                                <span className="absolute -bottom-1 -right-1 bg-[#1E3A8A] text-white text-[9px] font-mono font-medium px-1 py-0.2 rounded-md">
                                  {photosCount}📷
                                </span>
                              )}
                            </div>
                            <div className="min-w-0 max-w-xs">
                              <p className="font-semibold text-slate-900 truncate">{book.title || book.name}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5 font-mono">SKU: {book.sku || 'N/A'}</p>
                              <div className="flex flex-wrap items-center gap-1 mt-1">
                                {book.isBestSeller && (
                                  <span className="text-[9px] font-medium text-amber-800 bg-amber-50 px-1.5 py-0.5 border border-amber-200 rounded-full flex items-center gap-0.5">
                                    <Star className="w-2.5 h-2.5 fill-amber-700" /> Best Seller
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleToggleNewArrival(book)}
                                  className={`text-[9px] font-medium px-1.5 py-0.5 border rounded-full transition-all cursor-pointer ${
                                    book.isNewArrival
                                      ? 'text-blue-800 bg-blue-50 border-blue-200 hover:bg-blue-100 shadow-2xs font-semibold'
                                      : 'text-slate-400 bg-slate-50 border-slate-200 hover:border-blue-300 hover:text-blue-600'
                                  }`}
                                  title={book.isNewArrival ? 'Click to remove from New Arrivals' : 'Click to add to New Arrivals'}
                                >
                                  {book.isNewArrival ? '🚀 New Arrival' : '+ New Arrival'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleBookOfTheWeek(book)}
                                  className={`text-[9px] font-medium px-1.5 py-0.5 border rounded-full transition-all cursor-pointer ${
                                    book.isBookOfTheWeek
                                      ? 'text-amber-900 bg-amber-100 border-amber-300 hover:bg-amber-200 shadow-2xs font-bold'
                                      : 'text-slate-400 bg-slate-50 border-slate-200 hover:border-amber-300 hover:text-amber-700'
                                  }`}
                                  title={book.isBookOfTheWeek ? 'Click to remove from Book of the Week' : 'Click to set as Book of the Week'}
                                >
                                  {book.isBookOfTheWeek ? '👑 Book of Week' : '+ Book of Week'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleComingSoon(book)}
                                  className={`text-[9px] font-medium px-1.5 py-0.5 border rounded-full transition-all cursor-pointer ${
                                    book.isComingSoon
                                      ? 'text-purple-900 bg-purple-100 border-purple-300 hover:bg-purple-200 shadow-2xs font-bold'
                                      : 'text-slate-400 bg-slate-50 border-slate-200 hover:border-purple-300 hover:text-purple-700'
                                  }`}
                                  title={book.isComingSoon ? 'Click to remove from Coming Soon' : 'Click to set as Coming Soon / Pre-Book'}
                                >
                                  {book.isComingSoon ? '⏳ Pre-Book' : '+ Pre-Book'}
                                </button>
                                {book.isFeatured && (
                                  <span className="text-[9px] font-medium text-purple-800 bg-purple-50 px-1.5 py-0.5 border border-purple-200 rounded-full">
                                    Spotlight
                                  </span>
                                )}
                                {book.isHandpicked && (
                                  <span className="text-[9px] font-medium text-emerald-800 bg-emerald-50 px-1.5 py-0.5 border border-emerald-200 rounded-full">
                                    Handpicked
                                  </span>
                                )}
                                {(book.isAuthorSpotlight || book.isBestAuthor) && (
                                  <span className="text-[9px] font-medium text-indigo-800 bg-indigo-50 px-1.5 py-0.5 border border-indigo-200 rounded-full">
                                    Author Spotlight
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

          {/* Admin Table Server-Side Pagination Controls (15 items per page) */}
          {totalItems > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-600">
              <div className="text-slate-500">
                Showing <span className="font-semibold text-slate-800">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                <span className="font-semibold text-slate-800">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{' '}
                <span className="font-semibold text-slate-800">{totalItems}</span> products
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentPage((p) => Math.max(1, p - 1));
                      if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 border border-slate-200 rounded-md bg-white text-slate-700 font-semibold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs"
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                      .map((p, idx, arr) => {
                        const prev = arr[idx - 1];
                        return (
                          <React.Fragment key={p}>
                            {prev && p - prev > 1 && <span className="px-1 text-slate-400">...</span>}
                            <button
                              type="button"
                              onClick={() => {
                                setCurrentPage(p);
                                if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className={`min-w-[32px] h-8 px-2 rounded-md font-bold text-xs cursor-pointer transition-colors ${
                                currentPage === p
                                  ? 'bg-slate-900 text-white shadow-xs'
                                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              {p}
                            </button>
                          </React.Fragment>
                        );
                      })}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setCurrentPage((p) => Math.min(totalPages, p + 1));
                      if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 border border-slate-200 rounded-md bg-white text-slate-700 font-semibold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
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

        {/* Bulk Import Modal */}
        <BulkImportModal
          isOpen={bulkModalOpen}
          onClose={() => setBulkModalOpen(false)}
        />
      </div>
    </AdminLayout>
  );
}

