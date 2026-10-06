'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { fetchBooks } from '../../lib/api';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  Heart,
  ShoppingCart,
  Star,
  ChevronDown,
  RotateCcw,
  Check,
  BookOpen
} from 'lucide-react';

const FALLBACK_CATALOG = [];

const PRICE_RANGES = [
  { label: 'All Prices', min: 0, max: Infinity },
  { label: 'Under ₹ 200', min: 0, max: 200 },
  { label: '₹ 200 – ₹ 500', min: 200, max: 500 },
  { label: '₹ 500 – ₹ 1000', min: 500, max: 1000 },
  { label: 'Above ₹ 1000', min: 1000, max: Infinity }
];

const DEFAULT_CATEGORIES = [
  'All Categories',
  'Self-Help',
  'Books',
  'Novel',
  'Cinema & Politics',
  'Humour',
  'Poetry',
  'Biography',
  'Philosophy'
];

function ProductsContent() {
  const searchParams = useSearchParams();
  const { toggleWishlist, isBookInWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [rawBooks, setRawBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filters State initialized from URL params if available
  const [selectedTheme, setSelectedTheme] = useState(searchParams.get('theme') || 'ALL');
  const [selectedAuthor, setSelectedAuthor] = useState(searchParams.get('author') || 'ALL');
  const [selectedPriceRangeIndex, setSelectedPriceRangeIndex] = useState(0);
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'featured');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || searchParams.get('q') || '');

  // Load books from live API
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const live = await fetchBooks();
        if (Array.isArray(live)) {
          setRawBooks(live);
        }
      } catch (err) {
        console.warn('[ProductsPage] fallback to local catalog:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Sync URL params if user changes navigation
  useEffect(() => {
    const theme = searchParams.get('theme');
    const author = searchParams.get('author');
    const sort = searchParams.get('sort');
    const q = searchParams.get('search') || searchParams.get('q');

    if (theme) setSelectedTheme(theme);
    if (author) setSelectedAuthor(author);
    if (sort) setSortBy(sort);
    if (q) setSearchQuery(q);
  }, [searchParams]);

  // Extract unique categories & authors
  const availableThemes = useMemo(() => {
    const set = new Set(DEFAULT_CATEGORIES.slice(1));
    rawBooks.forEach((b) => {
      if (b.theme) set.add(b.theme);
      if (b.category && b.category !== 'Books') set.add(b.category);
      if (b.genre && b.genre !== 'Books') set.add(b.genre);
    });
    return ['ALL', ...Array.from(set)];
  }, [rawBooks]);

  const availableAuthors = useMemo(() => {
    const set = new Set();
    rawBooks.forEach((b) => {
      if (b.author) set.add(b.author);
    });
    return ['ALL', ...Array.from(set)];
  }, [rawBooks]);

  // Filtered & Sorted books
  const filteredBooks = useMemo(() => {
    const priceRange = PRICE_RANGES[selectedPriceRangeIndex] || PRICE_RANGES[0];

    let list = rawBooks.filter((b) => {
      const price = Number(b.discountPrice || b.salePrice || b.price || 0);

      // Category match
      if (selectedTheme !== 'ALL' && selectedTheme !== 'All Categories') {
        const themeMatch = (b.theme || '').toLowerCase() === selectedTheme.toLowerCase();
        const catMatch = (b.category || '').toLowerCase() === selectedTheme.toLowerCase();
        const genreMatch = (b.genre || '').toLowerCase() === selectedTheme.toLowerCase();
        if (!themeMatch && !catMatch && !genreMatch) return false;
      }

      // Author match
      if (selectedAuthor !== 'ALL' && selectedAuthor !== 'All Authors') {
        const cleanA = (b.author || '').trim().toLowerCase();
        const cleanSel = selectedAuthor.trim().toLowerCase();
        if (cleanA !== cleanSel && !cleanA.includes(cleanSel) && !cleanSel.includes(cleanA)) return false;
      }

      // Price match
      if (price < priceRange.min || price > priceRange.max) {
        return false;
      }

      // Search Query match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = (b.title || '').toLowerCase().includes(q);
        const malayalamMatch = (b.titleMalayalam || '').toLowerCase().includes(q);
        const authorMatch = (b.author || '').toLowerCase().includes(q);
        const descMatch = (b.description || '').toLowerCase().includes(q);
        if (!titleMatch && !malayalamMatch && !authorMatch && !descMatch) return false;
      }

      return true;
    });

    // Sorting
    if (sortBy === 'price-low' || sortBy === 'price_asc') {
      list.sort((a, b) => (a.discountPrice || a.price || 0) - (b.discountPrice || b.price || 0));
    } else if (sortBy === 'price-high' || sortBy === 'price_desc') {
      list.sort((a, b) => (b.discountPrice || b.price || 0) - (a.discountPrice || a.price || 0));
    } else if (sortBy === 'newest' || sortBy === 'new') {
      list.sort((a, b) => (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0));
    } else if (sortBy === 'bestsellers' || sortBy === 'bestseller') {
      list.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
    } else if (sortBy === 'rating') {
      list.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
    } else {
      // Default: show books with real cover images first
      list.sort((a, b) => {
        const aHas = a.images && a.images.length > 0 && a.images[0] && a.images[0] !== '/book-placeholder.svg' ? 1 : 0;
        const bHas = b.images && b.images.length > 0 && b.images[0] && b.images[0] !== '/book-placeholder.svg' ? 1 : 0;
        return bHas - aHas;
      });
    }

    return list;
  }, [rawBooks, selectedTheme, selectedAuthor, selectedPriceRangeIndex, sortBy, searchQuery]);

  const handleResetFilters = () => {
    setSelectedTheme('ALL');
    setSelectedAuthor('ALL');
    setSelectedPriceRangeIndex(0);
    setSearchQuery('');
    setSortBy('featured');
  };

  const activeFiltersCount =
    (selectedTheme !== 'ALL' && selectedTheme !== 'All Categories' ? 1 : 0) +
    (selectedAuthor !== 'ALL' && selectedAuthor !== 'All Authors' ? 1 : 0) +
    (selectedPriceRangeIndex !== 0 ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs font-medium text-[#1E3A8A] mb-3">
          <Link href="/" className="hover:underline">Home</Link>
          <span className="text-slate-400 font-normal">›</span>
          <span className="text-slate-600 font-normal">All Books &amp; Literature</span>
        </nav>

        {/* Compact Hero Banner with Atmosphere Art */}
        <div className="relative bg-gradient-to-r from-blue-50/70 via-white to-blue-50/50 rounded-2xl py-3.5 px-4 sm:py-4 sm:px-6 lg:py-4 lg:px-7 border border-blue-100/60 shadow-xs mb-4 sm:mb-5 overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div className="max-w-lg">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Explore Bookstore Catalog
              </h1>
              <p className="text-xs sm:text-[13px] font-normal text-slate-500 mt-1 leading-relaxed">
                Discover curated Malayalam classics, contemporary novels, world philosophy, and bestsellers.
              </p>
            </div>

            {/* Right Books & Plant Art Presentation (Compact) */}
            <div className="relative flex items-center justify-center md:justify-end shrink-0">
              <div className="relative max-w-[150px] sm:max-w-[180px] w-full">
                <img
                  src="/catalog_hero_art.jpg"
                  alt="Great Books Better Minds"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/combo_banner.png';
                  }}
                  className="w-full h-20 sm:h-24 object-cover rounded-xl drop-shadow-2xs select-none"
                />
                {/* Handwritten Cursive Badge */}
                <div className="absolute -top-2.5 -left-3 sm:-top-3 sm:-left-4 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full border border-blue-200/80 shadow-xs transform -rotate-4">
                  <span className="text-[10px] sm:text-xs font-serif italic font-bold text-[#1E3A8A] tracking-wide whitespace-nowrap">
                    Great Books Better Minds ✨
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Control Bar */}
        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-xs mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Input Bar */}
            <div className="relative w-full sm:flex-1 max-w-2xl">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, Malayalam name, author..."
                className="w-full pl-11 pr-4 py-2.5 bg-[#FAFBFD] border border-slate-200 rounded-full text-xs font-normal text-slate-800 placeholder-slate-400 outline-none focus:border-[#1E3A8A] focus:bg-white focus:ring-2 focus:ring-[#1E3A8A]/10 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Desktop Sort & Book Count */}
            <div className="hidden sm:flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-normal text-slate-500 whitespace-nowrap">
                  Sort By:
                </span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="pl-3.5 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-[#1E3A8A] appearance-none cursor-pointer shadow-2xs"
                  >
                    <option value="featured">Featured / Recommended</option>
                    <option value="newest">New Arrivals</option>
                    <option value="bestsellers">Bestsellers</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Customer Rating</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Total Books Pill */}
              <span className="text-xs font-medium text-slate-700 bg-slate-50 px-3.5 py-2 rounded-full border border-slate-200">
                {filteredBooks.length} Books
              </span>
            </div>
          </div>

          {/* Mobile Filter & Sort Controls Row */}
          <div className="flex sm:hidden items-center justify-between gap-2 pt-3 mt-2 border-t border-slate-100">
            {/* Filter Trigger Button */}
            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 shadow-2xs active:scale-95"
            >
              <Filter className="w-3.5 h-3.5 text-[#1E3A8A]" />
              <span>Filter {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
              <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
            </button>

            {/* Mobile Sort Dropdown */}
            <div className="flex-1 relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full pl-3 pr-7 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none appearance-none shadow-2xs"
              >
                <option value="featured">Sort: Featured</option>
                <option value="newest">Sort: New</option>
                <option value="bestsellers">Sort: Bestsellers</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Mobile Category Pills Scroll Row */}
        <div className="flex lg:hidden items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedTheme('ALL')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 shadow-2xs ${
              selectedTheme === 'ALL' || selectedTheme === 'All Categories'
                ? 'bg-rose-600 text-white shadow-rose-200'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
            }`}
          >
            <span>All</span>
            <span className="text-[10px] opacity-90 font-mono">({rawBooks.length})</span>
          </button>

          {availableThemes.filter((t) => t !== 'ALL').map((theme) => {
            const isSelected = selectedTheme.toLowerCase() === theme.toLowerCase();
            return (
              <button
                key={theme}
                type="button"
                onClick={() => setSelectedTheme(theme)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border shadow-2xs ${
                  isSelected
                    ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                {theme}
              </button>
            );
          })}
        </div>

        {/* Active Filters Summary Pill Row */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-5 animate-in fade-in">
            <span className="text-xs font-medium text-slate-500">Active Filters:</span>

            {selectedTheme !== 'ALL' && selectedTheme !== 'All Categories' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-[#1E3A8A] rounded-full text-xs font-medium border border-blue-100">
                Category: {selectedTheme}
                <button type="button" onClick={() => setSelectedTheme('ALL')} className="hover:text-red-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedAuthor !== 'ALL' && selectedAuthor !== 'All Authors' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-[#1E3A8A] rounded-full text-xs font-medium border border-blue-100">
                Author: {selectedAuthor}
                <button type="button" onClick={() => setSelectedAuthor('ALL')} className="hover:text-red-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedPriceRangeIndex !== 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-[#1E3A8A] rounded-full text-xs font-medium border border-blue-100">
                Price: {PRICE_RANGES[selectedPriceRangeIndex].label}
                <button type="button" onClick={() => setSelectedPriceRangeIndex(0)} className="hover:text-red-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-[#1E3A8A] rounded-full text-xs font-medium border border-blue-100">
                &ldquo;{searchQuery}&rdquo;
                <button type="button" onClick={() => setSearchQuery('')} className="hover:text-red-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-medium text-rose-600 hover:underline ml-1 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset All
            </button>
          </div>
        )}

        {/* Main Catalog Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* LEFT: Desktop Filter Sidebar (3 cols) */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6 sticky top-24">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#1E3A8A]" />
                  <span>Filter Books</span>
                </h3>
                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-[11px] font-medium text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* 1. Category & Genre Filter */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  CATEGORY &amp; GENRE
                </label>
                <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                  {/* All Categories Option */}
                  <button
                    type="button"
                    onClick={() => setSelectedTheme('ALL')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors text-left ${
                      selectedTheme === 'ALL' || selectedTheme === 'All Categories'
                        ? 'bg-blue-50 text-[#1E3A8A] font-bold'
                        : 'text-slate-600 hover:bg-slate-50 font-medium'
                    }`}
                  >
                    <span>All Categories</span>
                    {(selectedTheme === 'ALL' || selectedTheme === 'All Categories') && (
                      <Check className="w-4 h-4 text-[#1E3A8A]" />
                    )}
                  </button>

                  {/* Individual Categories with Radio Dot */}
                  {availableThemes.filter((t) => t !== 'ALL').map((theme) => {
                    const isSelected = selectedTheme.toLowerCase() === theme.toLowerCase();
                    return (
                      <button
                        key={theme}
                        type="button"
                        onClick={() => setSelectedTheme(theme)}
                        className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs transition-colors text-left ${
                          isSelected
                            ? 'text-[#1E3A8A] font-bold'
                            : 'text-slate-600 hover:bg-slate-50 font-medium'
                        }`}
                      >
                        <span
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'border-[#1E3A8A] bg-[#1E3A8A]'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </span>
                        <span className="truncate">{theme}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Author Filter Dropdown */}
              <div className="space-y-2.5 pt-4 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  AUTHOR
                </label>
                <div className="relative">
                  <select
                    value={selectedAuthor}
                    onChange={(e) => setSelectedAuthor(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-[#1E3A8A] appearance-none cursor-pointer"
                  >
                    <option value="ALL">All Authors</option>
                    {availableAuthors.filter((a) => a !== 'ALL').map((author) => (
                      <option key={author} value={author}>
                        {author}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* 3. Price Range Filter */}
              <div className="space-y-2.5 pt-4 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  PRICE RANGE
                </label>
                <div className="space-y-1.5">
                  {PRICE_RANGES.map((range, idx) => {
                    const isSelected = selectedPriceRangeIndex === idx;
                    return (
                      <label
                        key={range.label}
                        onClick={() => setSelectedPriceRangeIndex(idx)}
                        className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs cursor-pointer transition-colors ${
                          isSelected
                            ? 'text-[#1E3A8A] font-bold'
                            : 'text-slate-600 hover:bg-slate-50 font-medium'
                        }`}
                      >
                        <span
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'border-[#1E3A8A] bg-[#1E3A8A]'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </span>
                        <span>{range.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          {/* RIGHT: Books Catalog Grid (9 cols) */}
          <div className="lg:col-span-9 space-y-6">
            {filteredBooks.length === 0 ? (
              /* Empty Search / Filter State */
              <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/80 shadow-xs max-w-lg mx-auto my-8">
                <div className="w-14 h-14 bg-blue-50 text-[#1E3A8A] rounded-full flex items-center justify-center mx-auto mb-3.5">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-1">
                  No books match your filters
                </h3>
                <p className="text-xs font-normal text-slate-400 mb-6">
                  Try adjusting the category, author, price range, or search keyword.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1E3A8A] hover:bg-[#152e72] text-white rounded-full text-xs font-medium tracking-wide transition-all shadow-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            ) : (
              <>
                {/* 1. DESKTOP GRID (Hidden on mobile) */}
                <div className="hidden lg:grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-4.5">
                  {filteredBooks.map((book) => {
                    const bookId = book._id || book.id;
                    const title = book.title || book.titleMalayalam || 'LOGOS Book';
                    const author = book.author || 'LOGOS Publications';
                    const price = Number(book.discountPrice || book.salePrice || book.price || 299);
                    const originalPrice = Number(book.price || (price + 50));
                    const image = book.coverImage || book.image || (book.images && book.images[0]) || '/book-placeholder.svg';
                    const inWishlist = isBookInWishlist(bookId);
                    const discountPercent = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
                    const rating = book.rating ? Number(book.rating).toFixed(1) : '4.6';
                    const reviewsCount = book.reviewsCount || 128;

                    return (
                      <div
                        key={`desktop-${bookId}`}
                        className="group bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-300 p-3 flex flex-col justify-between"
                      >
                        {/* Book Image Showcase Container */}
                        <div className="relative aspect-4/3 w-full bg-slate-100 rounded-lg overflow-hidden mb-2.5 border border-slate-100">
                          <Link href={`/books/${book.slug || bookId}`} className="block w-full h-full">
                            <img
                              src={image}
                              alt={title}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '/book-placeholder.svg';
                              }}
                              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                            />
                          </Link>

                          {/* Discount Badge */}
                          {discountPercent > 0 && (
                            <span className="absolute top-2 left-2 bg-[#1E3A8A] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                              {discountPercent}% OFF
                            </span>
                          )}

                          {/* Wishlist Heart Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleWishlist(book);
                            }}
                            className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center backdrop-blur-md transition-all z-10 shadow-xs ${
                              inWishlist
                                ? 'bg-white text-rose-500 shadow-rose-200'
                                : 'bg-white/85 text-slate-400 hover:text-rose-500 hover:bg-white'
                            }`}
                            title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                          >
                            <Heart
                              className={`w-3.5 h-3.5 ${
                                inWishlist ? 'fill-rose-500 text-rose-500' : ''
                              }`}
                            />
                          </button>
                        </div>

                        {/* Details & CTA */}
                        <div className="space-y-1 flex-1 flex flex-col justify-between">
                          <div>
                            <Link href={`/books/${book.slug || bookId}`} className="block">
                              <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#1E3A8A] transition-colors line-clamp-1 leading-snug">
                                {title}
                              </h3>
                            </Link>
                            <p className="text-[11px] font-normal text-slate-500 truncate mt-0.5">
                              {author}
                            </p>

                            {/* Star Rating Row */}
                            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-600 mt-1">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span className="font-bold text-slate-800">{rating}</span>
                              <span className="text-slate-400">({reviewsCount})</span>
                            </div>
                          </div>

                          {/* Price & Add to Cart Row */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                            <div className="flex items-baseline gap-1.5 shrink-0">
                              <span className="text-sm sm:text-base font-bold text-[#1E3A8A]">
                                ₹ {price.toFixed(0)}
                              </span>
                              {originalPrice > price && (
                                <span className="text-[11px] text-slate-400 line-through">
                                  ₹ {originalPrice.toFixed(0)}
                                </span>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => addToCart(book, 1)}
                              className="w-8 h-8 rounded-full bg-[#1E3A8A] hover:bg-[#152e72] text-white flex items-center justify-center shadow-xs hover:shadow-sm active:scale-95 shrink-0 transition-all"
                              title="Add to Cart"
                            >
                              <ShoppingCart className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 2. MOBILE LIST VIEW (Horizontal cards as shown in mobile screenshot) */}
                <div className="lg:hidden space-y-3">
                  {filteredBooks.map((book) => {
                    const bookId = book._id || book.id;
                    const title = book.title || book.titleMalayalam || 'LOGOS Book';
                    const author = book.author || 'LOGOS Publications';
                    const price = Number(book.discountPrice || book.salePrice || book.price || 299);
                    const originalPrice = Number(book.price || (price + 50));
                    const image = book.coverImage || book.image || (book.images && book.images[0]) || '/book-placeholder.svg';
                    const inWishlist = isBookInWishlist(bookId);
                    const discountPercent = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
                    const rating = book.rating ? Number(book.rating).toFixed(1) : '4.6';
                    const reviewsCount = book.reviewsCount || 128;

                    return (
                      <div
                        key={`mobile-${bookId}`}
                        className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-2xs flex items-center gap-3 hover:shadow-xs transition-all"
                      >
                        {/* Book Image (Left) */}
                        <div className="relative w-24 sm:w-28 aspect-3/4 shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-slate-100">
                          <Link href={`/books/${book.slug || bookId}`} className="block w-full h-full">
                            <img
                              src={image}
                              alt={title}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '/book-placeholder.svg';
                              }}
                              className="w-full h-full object-cover object-center"
                            />
                          </Link>

                          {/* Discount Badge */}
                          {discountPercent > 0 && (
                            <span className="absolute top-1.5 left-1.5 bg-[#1E3A8A] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-xs">
                              {discountPercent}% OFF
                            </span>
                          )}

                          {/* Wishlist Heart Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleWishlist(book);
                            }}
                            className={`absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-xs ${
                              inWishlist
                                ? 'bg-white text-rose-500'
                                : 'bg-white/85 text-slate-400'
                            }`}
                            title="Wishlist"
                          >
                            <Heart
                              className={`w-3 h-3 ${
                                inWishlist ? 'fill-rose-500 text-rose-500' : ''
                              }`}
                            />
                          </button>
                        </div>

                        {/* Book Details (Right) */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <Link href={`/books/${book.slug || bookId}`} className="block">
                            <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1 leading-snug">
                              {title}
                            </h3>
                          </Link>
                          <p className="text-[11px] font-normal text-slate-500 truncate">
                            {author}
                          </p>

                          {/* Star Rating */}
                          <div className="flex items-center gap-1 text-[11px] font-medium text-slate-600 pt-0.5">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span className="font-bold text-slate-800">{rating}</span>
                            <span className="text-slate-400">({reviewsCount})</span>
                          </div>

                          {/* Price & Add to Cart Row */}
                          <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100/60 mt-1">
                            <div className="flex items-baseline gap-1">
                              <span className="text-sm font-bold text-[#1E3A8A]">
                                ₹ {price.toFixed(0)}
                              </span>
                              {originalPrice > price && (
                                <span className="text-[10px] text-slate-400 line-through">
                                  ₹ {originalPrice.toFixed(0)}
                                </span>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => addToCart(book, 1)}
                              className="w-7 h-7 rounded-full bg-[#1E3A8A] hover:bg-[#152e72] text-white flex items-center justify-center shadow-xs active:scale-95 shrink-0 transition-all"
                              title="Add to Cart"
                            >
                              <ShoppingCart className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile Filter Modal Drawer */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex justify-end lg:hidden">
            <div className="bg-white w-full max-w-xs h-full flex flex-col justify-between p-5 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-200">
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Filter className="w-4 h-4 text-[#1E3A8A]" />
                    <span>Filter Books</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setMobileFilterOpen(false)}
                    className="p-1 text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mobile Category Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                    CATEGORY
                  </label>
                  <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTheme('ALL');
                        setMobileFilterOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left ${
                        selectedTheme === 'ALL' || selectedTheme === 'All Categories'
                          ? 'bg-blue-50 text-[#1E3A8A] font-bold'
                          : 'text-slate-600 font-medium'
                      }`}
                    >
                      <span>All Categories</span>
                      {(selectedTheme === 'ALL' || selectedTheme === 'All Categories') && (
                        <Check className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {availableThemes.filter((t) => t !== 'ALL').map((theme) => {
                      const isSelected = selectedTheme.toLowerCase() === theme.toLowerCase();
                      return (
                        <button
                          key={theme}
                          type="button"
                          onClick={() => {
                            setSelectedTheme(theme);
                            setMobileFilterOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs text-left ${
                            isSelected
                              ? 'bg-blue-50 text-[#1E3A8A] font-bold'
                              : 'text-slate-600 font-medium'
                          }`}
                        >
                          <span>{theme}</span>
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile Author Filter */}
                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                    AUTHOR
                  </label>
                  <div className="relative">
                    <select
                      value={selectedAuthor}
                      onChange={(e) => {
                        setSelectedAuthor(e.target.value);
                      }}
                      className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none"
                    >
                      <option value="ALL">All Authors</option>
                      {availableAuthors.filter((a) => a !== 'ALL').map((author) => (
                        <option key={author} value={author}>
                          {author}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Mobile Price Range Filter */}
                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                    PRICE RANGE
                  </label>
                  <div className="space-y-1">
                    {PRICE_RANGES.map((range, idx) => (
                      <label
                        key={range.label}
                        onClick={() => setSelectedPriceRangeIndex(idx)}
                        className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs cursor-pointer ${
                          selectedPriceRangeIndex === idx
                            ? 'bg-blue-50 text-[#1E3A8A] font-bold'
                            : 'text-slate-600 font-medium'
                        }`}
                      >
                        <span>{range.label}</span>
                        <input
                          type="radio"
                          name="price-mobile"
                          checked={selectedPriceRangeIndex === idx}
                          onChange={() => setSelectedPriceRangeIndex(idx)}
                          className="text-[#1E3A8A] w-3.5 h-3.5"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons in Mobile Drawer */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-full py-2.5 bg-[#1E3A8A] text-white rounded-xl text-xs font-medium shadow-sm active:scale-95"
                >
                  Apply Filters ({filteredBooks.length} Results)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleResetFilters();
                    setMobileFilterOpen(false);
                  }}
                  className="w-full py-2 text-slate-500 hover:text-slate-800 text-xs font-medium"
                >
                  Reset All Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
          <div className="w-8 h-8 border-3 border-[#1E3A8A] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
