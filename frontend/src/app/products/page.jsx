'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { fetchBooksPaginated, fetchFilterOptions, optimizeImageUrl, getBookCoverImage } from '../../lib/api';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { CatalogGridSkeleton } from '../../components/Skeletons';
import {
  Search,
  Filter,
  X,
  Heart,
  ShoppingCart,
  Star,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Check
} from 'lucide-react';

const PRICE_RANGES = [
  { label: 'Price Range', min: 0, max: Infinity },
  { label: 'Under ₹100', min: 0, max: 100 },
  { label: '₹100 - ₹300', min: 100, max: 300 },
  { label: '₹300 - ₹500', min: 300, max: 500 },
  { label: 'Above ₹500', min: 500, max: Infinity }
];

const DEFAULT_CATEGORIES = [
  'All Categories',
  'Self-Help',
  'Books',
  'Novel',
  'Cinema & Politics',
  'Humour',
  'Poetry',
  'Biography'
];

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toggleWishlist, isBookInWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [books, setBooks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 18, totalPages: 1, totalItems: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [addedItems, setAddedItems] = useState({}); // bookId → true when just added

  const isInitialMount = useRef(true);
  const requestIdRef = useRef(0);

  const handleAddToCart = async (book) => {
    const id = book?._id || book?.id || book?.slug;
    if (!id) return;
    const ok = await addToCart(book, 1);
    if (ok !== false) {
      setAddedItems((prev) => ({ ...prev, [id]: true }));
      setTimeout(() => setAddedItems((prev) => ({ ...prev, [id]: false })), 2000);
    }
  };

  // Filters State
  const [collectionFilter, setCollectionFilter] = useState(searchParams.get('collection') || searchParams.get('filter') || 'ALL');
  const [selectedTheme, setSelectedTheme] = useState(searchParams.get('theme') || 'ALL');
  const [selectedAuthor, setSelectedAuthor] = useState(searchParams.get('author') || 'ALL');
  const [selectedPriceRangeIndex, setSelectedPriceRangeIndex] = useState(0);
  const [priceSlider, setPriceSlider] = useState(500);
  const [selectedLanguage, setSelectedLanguage] = useState('ALL');
  const [selectedAvailability, setSelectedAvailability] = useState('ALL');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'featured');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || searchParams.get('q') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  // Available filters from backend
  const [availableThemes, setAvailableThemes] = useState(['ALL', ...DEFAULT_CATEGORIES.slice(1)]);
  const [availableAuthors, setAvailableAuthors] = useState(['ALL']);

  // Instant debounce search input (120ms for real-time live filtering as typing)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 120);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Load distinct filter options on mount
  useEffect(() => {
    let isCancelled = false;
    async function loadOptions() {
      try {
        const opts = await fetchFilterOptions();
        if (isCancelled || !opts) return;
        if (Array.isArray(opts.themes) && opts.themes.length > 0) {
          const merged = Array.from(new Set([...DEFAULT_CATEGORIES.slice(1), ...opts.themes.filter(Boolean)]));
          setAvailableThemes(['ALL', ...merged]);
        }
        if (Array.isArray(opts.authors) && opts.authors.length > 0) {
          const cleanAuthors = Array.from(new Set(opts.authors.map((a) => (a || '').trim()).filter(Boolean))).sort();
          setAvailableAuthors(['ALL', ...cleanAuthors]);
        }
      } catch (e) {
        console.warn('[ProductsPage] failed loading filter options:', e);
      }
    }
    loadOptions();
    return () => {
      isCancelled = true;
    };
  }, []);

  // Sync URL search params
  useEffect(() => {
    const theme = searchParams.get('theme');
    const author = searchParams.get('author');
    const sort = searchParams.get('sort');
    const q = searchParams.get('search') || searchParams.get('q');
    const collection = searchParams.get('collection') || searchParams.get('filter');

    if (theme) setSelectedTheme(theme);
    if (author) setSelectedAuthor(author);
    if (sort) setSortBy(sort);
    if (q) setSearchQuery(q);
    if (collection) setCollectionFilter(collection);
  }, [searchParams]);

  // Reset to page 1 whenever filters or search query change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setCurrentPage(1);
  }, [debouncedSearch, selectedTheme, selectedAuthor, selectedPriceRangeIndex, priceSlider, selectedLanguage, selectedAvailability, sortBy, collectionFilter]);

  // Fetch paginated books from live API (15 per page)
  useEffect(() => {
    const currentReqId = ++requestIdRef.current;

    async function loadBooks() {
      try {
        setLoading(true);

        const params = {
          page: currentPage,
          limit: 18,
          sortBy
        };

        if (collectionFilter === 'new-arrivals') {
          params.isNewArrival = 'true';
        } else if (collectionFilter === 'bestsellers') {
          params.isBestSeller = 'true';
        } else if (collectionFilter === 'coming-soon' || collectionFilter === 'pre-book') {
          params.isComingSoon = 'true';
        }

        if (debouncedSearch && debouncedSearch.trim()) {
          params.search = debouncedSearch.trim();
        }
        if (selectedTheme !== 'ALL' && selectedTheme !== 'All Categories') {
          params.theme = selectedTheme;
        }
        if (selectedAuthor !== 'ALL' && selectedAuthor !== 'All Authors') {
          params.author = selectedAuthor;
        }
        if (selectedLanguage !== 'ALL') {
          params.language = selectedLanguage;
        }
        if (selectedAvailability !== 'ALL') {
          params.stockStatus = selectedAvailability;
        }

        const priceRange = PRICE_RANGES[selectedPriceRangeIndex] || PRICE_RANGES[0];
        if (selectedPriceRangeIndex > 0) {
          if (priceRange.min > 0) params.minPrice = priceRange.min;

          if (priceRange.max < Infinity) params.maxPrice = priceRange.max;
        }
        if (priceSlider < 500) {
          params.maxPrice = Math.min(params.maxPrice || Infinity, priceSlider);
        }

        const data = await fetchBooksPaginated(params);
        if (currentReqId === requestIdRef.current) {
          const list = Array.isArray(data.books) ? data.books : [];
          setBooks(list);
          setPagination(data.pagination || { page: currentPage, limit: 18, totalPages: 1, totalItems: list.length });

        }
      } catch (err) {
        console.warn('[ProductsPage] loadBooks error:', err);
        if (currentReqId === requestIdRef.current) {
          setBooks([]);
          setPagination({ page: 1, limit: 18, totalPages: 1, totalItems: 0 });
        }
      } finally {
        if (currentReqId === requestIdRef.current) {
          setLoading(false);
        }
      }
    }

    loadBooks();
  }, [currentPage, debouncedSearch, selectedTheme, selectedAuthor, selectedPriceRangeIndex, priceSlider, selectedLanguage, selectedAvailability, sortBy, collectionFilter]);

  const handlePageChange = (newPage) => {
    const total = pagination.totalPages || 1;
    if (newPage < 1 || newPage > total || newPage === currentPage) return;
    setCurrentPage(newPage);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleResetFilters = () => {
    setCollectionFilter('ALL');
    setSelectedTheme('ALL');
    setSelectedAuthor('ALL');
    setSelectedPriceRangeIndex(0);
    setPriceSlider(500);
    setSelectedLanguage('ALL');
    setSelectedAvailability('ALL');
    setSearchQuery('');
    setSortBy('featured');
    setCurrentPage(1);
  };

  const activeFiltersCount =
    (collectionFilter !== 'ALL' ? 1 : 0) +
    (selectedTheme !== 'ALL' && selectedTheme !== 'All Categories' ? 1 : 0) +
    (selectedAuthor !== 'ALL' && selectedAuthor !== 'All Authors' ? 1 : 0) +
    (selectedPriceRangeIndex !== 0 ? 1 : 0) +
    (priceSlider < 500 ? 1 : 0) +
    (selectedLanguage !== 'ALL' ? 1 : 0) +
    (selectedAvailability !== 'ALL' ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  const totalPages = pagination.totalPages || 1;
  const totalItems = pagination.totalItems || books.length;

  const renderPaginationButtons = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push('...');
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return pages.map((p, idx) => {
      if (p === '...') {
        return (
          <span key={`ellipsis-${idx}`} className="px-2 py-1 text-slate-400 text-xs select-none">
            •••
          </span>
        );
      }
      const isActive = p === currentPage;
      return (
        <button
          key={`page-${p}`}
          type="button"
          onClick={() => handlePageChange(p)}
          className={`min-w-[32px] h-8 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${isActive
              ? 'bg-[#1E3A8A] text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 shadow-2xs'
            }`}
        >
          {p}
        </button>
      );
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      {/* Main Container Starting from Left Side (No Excessive Spacing) */}
      <main className="flex-1 w-full px-3 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-16">
        <div className="w-full space-y-4">

          {/* Quick Collection Switcher Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setCollectionFilter('ALL')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                collectionFilter === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              All Books
            </button>
            <button
              type="button"
              onClick={() => setCollectionFilter('new-arrivals')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                collectionFilter === 'new-arrivals'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-50'
              }`}
            >
              <span>🚀 New Arrivals</span>
            </button>
            <button
              type="button"
              onClick={() => setCollectionFilter('bestsellers')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                collectionFilter === 'bestsellers'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-amber-800 border border-amber-200 hover:bg-amber-50'
              }`}
            >
              <span>🔥 Bestsellers</span>
            </button>
          </div>

          {/* Search & Multi-Filter Control Bar */}
          <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-200/90 shadow-2xs">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-3">

              {/* Search Input Bar */}
              <div className="relative w-full lg:flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by book name, author, keywords, or ISBN..."
                  className="w-full pl-11 pr-12 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-[#1E3A8A] focus:bg-white focus:ring-2 focus:ring-[#1E3A8A]/10 transition-all"
                />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  {loading && searchQuery && (
                    <div className="w-3.5 h-3.5 border-2 border-[#1E3A8A] border-t-transparent rounded-full animate-spin" />
                  )}
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Right Controls: Sort By + Author Dropdown + Genre Dropdown + Price Range Dropdown + Count Pill */}
              <div className="hidden sm:flex flex-wrap items-center gap-2.5 shrink-0 w-full lg:w-auto justify-end">

                {/* Sort By Dropdown */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500 whitespace-nowrap">Sort:</span>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="pl-3 pr-7 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-[#1E3A8A] appearance-none cursor-pointer shadow-2xs"
                    >
                      <option value="featured">Featured</option>
                      <option value="newest">Newest</option>
                      <option value="bestsellers">Bestseller</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="rating">Top Rated</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Author Dropdown */}
                <div className="relative">
                  <select
                    value={selectedAuthor}
                    onChange={(e) => setSelectedAuthor(e.target.value)}
                    className="pl-3 pr-7 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-[#1E3A8A] appearance-none cursor-pointer shadow-2xs max-w-[150px] truncate"
                  >
                    <option value="ALL">All Authors</option>
                    {availableAuthors.filter((a) => a !== 'ALL').map((author) => (
                      <option key={author} value={author}>
                        {author}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Genre Dropdown */}
                <div className="relative">
                  <select
                    value={selectedTheme}
                    onChange={(e) => setSelectedTheme(e.target.value)}
                    className="pl-3 pr-7 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-[#1E3A8A] appearance-none cursor-pointer shadow-2xs max-w-[150px] truncate"
                  >
                    <option value="ALL">All Genres</option>
                    {availableThemes.filter((t) => t !== 'ALL').map((theme) => (
                      <option key={theme} value={theme}>
                        {theme}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Price Range Dropdown */}
                <div className="relative">
                  <select
                    value={selectedPriceRangeIndex}
                    onChange={(e) => setSelectedPriceRangeIndex(Number(e.target.value))}
                    className="pl-3 pr-7 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-[#1E3A8A] appearance-none cursor-pointer shadow-2xs"
                  >
                    {PRICE_RANGES.map((r, idx) => (
                      <option key={r.label} value={idx}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Total Books Blue Pill Badge */}
                <span className="text-xs font-semibold text-[#1E3A8A] bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 whitespace-nowrap shadow-2xs">
                  {totalItems} Books
                </span>
              </div>

              {/* Mobile Filter Button */}
              <div className="flex sm:hidden items-center justify-between w-full gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(true)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 shadow-2xs"
                >
                  <Filter className="w-3.5 h-3.5 text-[#1E3A8A]" />
                  <span>Filter Books {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
                </button>
                <span className="text-xs font-semibold text-[#1E3A8A] bg-blue-50 px-3 py-2 rounded-xl border border-blue-100">
                  {totalItems} Books
                </span>
              </div>

            </div>
          </div>

          {/* Product Cards Grid: 6 in One Row on Laptop/Desktop (xl:grid-cols-6) */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-6 gap-3 sm:gap-4">
              {Array.from({ length: 18 }).map((_, idx) => (
                <div
                  key={`catalog-skel-${idx}`}
                  className="bg-white rounded-2xl border border-slate-200/90 p-2.5 sm:p-3 flex flex-col justify-between shadow-2xs"
                >
                  <div className="aspect-[3/4] w-full bg-slate-100 rounded-xl animate-pulse mb-2.5 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-slate-400/40 animate-pulse" />
                  </div>
                  <div className="space-y-2 mt-auto">
                    <div className="h-3.5 bg-slate-200 rounded-sm w-4/5 animate-pulse" />
                    <div className="h-3 bg-slate-150 rounded-sm w-1/2 animate-pulse" />
                    <div className="flex items-center justify-between pt-1">
                      <div className="h-4 bg-slate-200 rounded-sm w-16 animate-pulse" />
                      <div className="h-3 bg-slate-150 rounded-sm w-8 animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : books.length === 0 ? (
            /* Empty Catalog State */
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/80 shadow-xs max-w-lg mx-auto my-8">
              <div className="w-14 h-14 bg-blue-50 text-[#1E3A8A] rounded-full flex items-center justify-center mx-auto mb-3.5">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-1">
                No books match your criteria
              </h3>
              <p className="text-xs font-normal text-slate-400 mb-6">
                Try clearing some filters or searching with different keywords.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1E3A8A] hover:bg-[#152e72] text-white rounded-full text-xs font-medium tracking-wide transition-all shadow-sm active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-6 gap-3 sm:gap-4">
              {books.map((book) => {
                const bookId = book._id || book.id;
                const title = book.title || book.name || book.titleMalayalam || 'LOGOS Book';
                const author = book.author || 'LOGOS Publications';
                const price = Number(book.discountPrice || book.salePrice || book.price || 299);
                const originalPrice = book.discountPrice && Number(book.discountPrice) < Number(book.price)
                  ? Number(book.price)
                  : null;
                const image = getBookCoverImage(book);
                const inWishlist = isBookInWishlist(bookId);
                const discountPercent = originalPrice && originalPrice > price
                  ? Math.round(((originalPrice - price) / originalPrice) * 100)
                  : 0;
                const rating = book.rating ? Number(book.rating).toFixed(1) : '5.0';
                const reviewsCount = book.reviewsCount ? `${(book.reviewsCount / 1000).toFixed(1)}k` : '0.1k';

                const rawStock = book.stock !== undefined && book.stock !== null ? Number(book.stock) : null;
                const isOutOfStock = (rawStock !== null && !isNaN(rawStock))
                  ? rawStock <= 0
                  : (book.stockStatus === 'out_of_stock');

                // Determine Top-Left Badge: Pre-Book > Out of Stock > Book of the Week > Bestseller > New > Discount
                const isPreBookBook = Boolean(book.isComingSoon || book.isPreBook);
                const showBookOfTheWeek = !isOutOfStock && !isPreBookBook && book.isBookOfTheWeek;
                const showBestseller = !isOutOfStock && !isPreBookBook && book.isBestSeller && !showBookOfTheWeek;
                const showNew = !isOutOfStock && !isPreBookBook && book.isNewArrival && !book.isBestSeller && !showBookOfTheWeek;
                const showDiscount = !isOutOfStock && !isPreBookBook && discountPercent > 0 && !showBestseller && !showNew && !showBookOfTheWeek;

                return (
                  <div
                    key={`card-${bookId}`}
                    onClick={(e) => {
                      if (e.target.closest('button') || e.target.closest('a')) return;
                      router.push(`/books/${book.slug || bookId}`);
                    }}
                    className="group bg-white rounded-2xl border border-slate-200/90 hover:border-blue-300 shadow-2xs hover:shadow-md transition-all duration-200 p-2.5 sm:p-3 flex flex-col justify-between cursor-pointer active:scale-[0.98]"
                  >
                    {/* Book Cover Image Container (Portrait 3:4 Aspect Ratio) */}
                    <div className="relative aspect-[3/4] w-full bg-[#f8fafc] rounded-xl overflow-hidden mb-2.5 border border-slate-100 flex items-center justify-center p-2 group-hover:bg-[#f1f5f9] transition-colors">
                      <Link href={`/books/${book.slug || bookId}`} className="block w-full h-full">
                        <img
                          src={optimizeImageUrl(image, { width: 450, quality: 'auto' })}
                          alt={title}
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          onError={(e) => {
                            if (!e.currentTarget.dataset.failed) {
                              e.currentTarget.dataset.failed = 'true';
                              if (e.currentTarget.src !== image && image && image.startsWith('http')) {
                                e.currentTarget.src = image;
                              } else {
                                e.currentTarget.src = '/book-placeholder.svg';
                              }
                            }
                          }}
                          className={`w-full h-full object-contain object-center drop-shadow-sm group-hover:scale-105 transition-transform duration-300 select-none ${isOutOfStock ? 'opacity-50 grayscale' : ''}`}
                        />
                      </Link>

                      {/* Top-Left Badges with reduced border-radius */}
                      {isPreBookBook && (
                        <span className="absolute top-2 left-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs tracking-tight">
                          Pre-Book
                        </span>
                      )}
                      {!isPreBookBook && isOutOfStock && (
                        <span className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs tracking-tight">
                          Out of Stock
                        </span>
                      )}
                      {isPreBookBook && (
                        <span className="absolute top-2 right-10 sm:right-11 bg-black/50 backdrop-blur-xs text-white border border-white/25 text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-xs tracking-tight pointer-events-none">
                          ⏳ 2-3 WEEKS
                        </span>
                      )}
                      {showBookOfTheWeek && (
                        <span className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs tracking-tight">
                          Book of Week 👑
                        </span>
                      )}
                      {showBestseller && (
                        <span className="absolute top-2 left-2 bg-[#f59e0b] text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs tracking-tight">
                          Bestseller
                        </span>
                      )}
                      {showNew && (
                        <span className="absolute top-2 left-2 bg-[#10b981] text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs tracking-tight">
                          New
                        </span>
                      )}
                      {showDiscount && (
                        <span className="absolute top-2 left-2 bg-[#f43f5e] text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs tracking-tight">
                          {discountPercent}% OFF
                        </span>
                      )}

                      {/* Top-Right Wishlist Heart Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleWishlist(book);
                        }}
                        className={`absolute top-2 right-2 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center shadow-xs border border-slate-200/70 backdrop-blur-md transition-all z-10 ${inWishlist
                            ? 'bg-white text-rose-500 shadow-rose-200'
                            : 'bg-white/90 text-slate-400 hover:text-rose-500 hover:bg-white'
                          }`}
                        title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${inWishlist ? 'fill-rose-500 text-rose-500' : ''
                            }`}
                        />
                      </button>
                    </div>

                    {/* Book Metadata, Rating & Purchase Row */}
                    <div className="space-y-1 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Title */}
                        <Link href={`/books/${book.slug || bookId}`} className="block">
                          <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#1E3A8A] transition-colors line-clamp-1 leading-snug">
                            {title}
                          </h3>
                        </Link>

                        {/* Author */}
                        <p className="text-[11px] font-normal text-slate-500 truncate mt-0.5">
                          {author}
                        </p>

                        {/* Star Rating Row */}
                        <div className="flex items-center gap-1 text-[11px] font-medium text-slate-600 mt-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="font-bold text-slate-800">{rating}</span>
                          <span className="text-slate-400">({reviewsCount})</span>
                        </div>
                      </div>

                      {/* Price & Add to Cart Button */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                        <div className="flex items-baseline gap-1.5 shrink-0">
                          <span className="text-sm sm:text-base font-bold text-[#1E3A8A]">
                            ₹ {price.toFixed(0)}
                          </span>
                          {originalPrice && originalPrice > price && (
                            <span className="text-[11px] text-slate-400 line-through">
                              ₹ {originalPrice.toFixed(0)}
                            </span>
                          )}
                        </div>

                        {isPreBookBook ? (
                          <button
                            type="button"
                            onClick={() => handleAddToCart(book)}
                            className={`px-2.5 py-1 rounded-full text-white text-[10px] font-bold shadow-xs shrink-0 transition-all active:scale-95 cursor-pointer flex items-center gap-1 ${
                              addedItems[book?._id || book?.id || book?.slug]
                                ? 'bg-emerald-600'
                                : 'bg-amber-600 hover:bg-amber-700'
                            }`}
                            title="Pre-Book this title (Ships in 2-3 weeks)"
                          >
                            {addedItems[book?._id || book?.id || book?.slug] ? (
                              <>
                                <Check className="w-3 h-3" />
                                <span>Pre-Booked!</span>
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="w-3 h-3" />
                                <span>Pre-Book</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={isOutOfStock}
                            onClick={() => !isOutOfStock && handleAddToCart(book)}
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full text-white flex items-center justify-center shadow-xs shrink-0 transition-all ${isOutOfStock
                                ? 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-60'
                                : addedItems[book?._id || book?.id || book?.slug]
                                  ? 'bg-emerald-500 hover:bg-emerald-600 active:scale-95 cursor-pointer'
                                  : 'bg-[#1E3A8A] hover:bg-[#152e72] active:scale-95 cursor-pointer'
                              }`}
                            title={isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                          >
                            {isOutOfStock ? (
                              <span className="text-[10px] font-bold">✕</span>
                            ) : addedItems[book?._id || book?.id || book?.slug] ? (
                              <Check className="w-3.5 h-3.5" />
                            ) : (
                              <ShoppingCart className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Bar */}
          {totalPages > 1 && (
            <div className="mt-8 pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-slate-500 font-medium order-2 sm:order-1">
                Showing{' '}
                <span className="font-bold text-slate-800">
                  {Math.min((currentPage - 1) * 15 + 1, totalItems)}
                </span>{' '}
                to{' '}
                <span className="font-bold text-slate-800">
                  {Math.min(currentPage * 15, totalItems)}
                </span>{' '}
                of <span className="font-bold text-slate-800">{totalItems}</span> books
              </p>

              <div className="flex items-center gap-1.5 order-1 sm:order-2">
                <button
                  type="button"
                  disabled={currentPage <= 1 || loading}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer shadow-2xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Previous</span>
                </button>

                {renderPaginationButtons()}

                <button
                  type="button"
                  disabled={currentPage >= totalPages || loading}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer shadow-2xs"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Filter Modal Drawer */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex justify-end lg:hidden">
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
                    className="text-slate-400 hover:text-slate-700 p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mobile Categories */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                    Category &amp; Genre
                  </label>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {availableThemes.map((theme) => {
                      const isSelected =
                        theme === 'ALL'
                          ? selectedTheme === 'ALL' || selectedTheme === 'All Categories'
                          : selectedTheme.toLowerCase() === theme.toLowerCase();
                      return (
                        <button
                          key={theme}
                          type="button"
                          onClick={() => {
                            setSelectedTheme(theme);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left ${isSelected
                              ? 'bg-blue-50 text-[#1E3A8A] font-bold'
                              : 'text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                          <span>{theme === 'ALL' ? 'All Categories' : theme}</span>
                          {isSelected && <Check className="w-4 h-4 text-[#1E3A8A]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile Price */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                    Price Range
                  </label>
                  <div className="space-y-1">
                    {PRICE_RANGES.map((range, idx) => (
                      <button
                        key={range.label}
                        type="button"
                        onClick={() => setSelectedPriceRangeIndex(idx)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left ${selectedPriceRangeIndex === idx
                            ? 'bg-blue-50 text-[#1E3A8A] font-bold'
                            : 'text-slate-700 hover:bg-slate-50'
                          }`}
                      >
                        <span>{range.label}</span>
                        {selectedPriceRangeIndex === idx && <Check className="w-4 h-4 text-[#1E3A8A]" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-2">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition-colors"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="flex-1 py-2.5 px-3 bg-[#1E3A8A] hover:bg-[#152e72] text-white rounded-xl text-xs font-medium transition-colors"
                >
                  Apply
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
