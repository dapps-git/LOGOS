'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { fetchBooks } from '../../lib/api';
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
  const searchParams = useSearchParams();
  const { toggleWishlist, isBookInWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [rawBooks, setRawBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [addedItems, setAddedItems] = useState({});  // bookId → true when just added

  const handleAddToCart = async (book) => {
    const id = book?._id || book?.id || book?.slug;
    if (!id) return;
    const ok = await addToCart(book, 1);
    if (ok !== false) {
      setAddedItems((prev) => ({ ...prev, [id]: true }));
      setTimeout(() => setAddedItems((prev) => ({ ...prev, [id]: false })), 2000);
    }
  };

  // Collapsible sidebar accordion sections
  const [catOpen, setCatOpen] = useState(true);
  const [authorOpen, setAuthorOpen] = useState(true);
  const [priceOpen, setPriceOpen] = useState(true);
  const [langOpen, setLangOpen] = useState(true);
  const [availOpen, setAvailOpen] = useState(true);

  // Filters State
  const [selectedTheme, setSelectedTheme] = useState(searchParams.get('theme') || 'ALL');
  const [selectedAuthor, setSelectedAuthor] = useState(searchParams.get('author') || 'ALL');
  const [selectedPriceRangeIndex, setSelectedPriceRangeIndex] = useState(0);
  const [priceSlider, setPriceSlider] = useState(500);
  const [selectedLanguage, setSelectedLanguage] = useState('ALL');
  const [selectedAvailability, setSelectedAvailability] = useState('ALL');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'featured');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || searchParams.get('q') || '');

  // Load books from live API
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const live = await fetchBooks({ limit: 500 });
        if (Array.isArray(live) && live.length > 0) {
          const validBooks = live.filter((b) => {
            const img = (b.images && b.images[0]) || b.coverImage;
            return img && img !== '/book-placeholder.svg' && !img.includes('placeholder');
          });
          setRawBooks(validBooks);
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

      // Price Dropdown match
      if (selectedPriceRangeIndex > 0) {
        if (price < priceRange.min || price > priceRange.max) {
          return false;
        }
      }

      // Price Slider match (if adjusted below 500)
      if (priceSlider < 500 && price > priceSlider) {
        return false;
      }

      // Language match
      if (selectedLanguage !== 'ALL') {
        const langs = Array.isArray(b.languages) ? b.languages.map((l) => l.toLowerCase()) : ['malayalam'];
        if (!langs.includes(selectedLanguage.toLowerCase())) return false;
      }

      // Availability match
      if (selectedAvailability === 'in_stock') {
        if (b.stockStatus === 'out_of_stock' || b.stock === 0) return false;
      } else if (selectedAvailability === 'out_of_stock') {
        if (b.stockStatus !== 'out_of_stock' && b.stock > 0) return false;
      }

      // Search Query match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = (b.title || '').toLowerCase().includes(q);
        const nameMatch = (b.name || '').toLowerCase().includes(q);
        const malayalamMatch = (b.titleMalayalam || '').toLowerCase().includes(q);
        const authorMatch = (b.author || '').toLowerCase().includes(q);
        const descMatch = (b.description || '').toLowerCase().includes(q);
        const isbnMatch = (b.isbn || '').toLowerCase().includes(q);
        if (!titleMatch && !nameMatch && !malayalamMatch && !authorMatch && !descMatch && !isbnMatch) return false;
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
      // Default: prioritize real cover images & bestsellers
      list.sort((a, b) => {
        const aBest = a.isBestSeller ? 1 : 0;
        const bBest = b.isBestSeller ? 1 : 0;
        if (bBest !== aBest) return bBest - aBest;
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
    }

    return list;
  }, [rawBooks, selectedTheme, selectedAuthor, selectedPriceRangeIndex, priceSlider, selectedLanguage, selectedAvailability, sortBy, searchQuery]);

  const handleResetFilters = () => {
    setSelectedTheme('ALL');
    setSelectedAuthor('ALL');
    setSelectedPriceRangeIndex(0);
    setPriceSlider(500);
    setSelectedLanguage('ALL');
    setSelectedAvailability('ALL');
    setSearchQuery('');
    setSortBy('featured');
  };

  const activeFiltersCount =
    (selectedTheme !== 'ALL' && selectedTheme !== 'All Categories' ? 1 : 0) +
    (selectedAuthor !== 'ALL' && selectedAuthor !== 'All Authors' ? 1 : 0) +
    (selectedPriceRangeIndex !== 0 ? 1 : 0) +
    (priceSlider < 500 ? 1 : 0) +
    (selectedLanguage !== 'ALL' ? 1 : 0) +
    (selectedAvailability !== 'ALL' ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      {/* Main Container Starting from Left Side (No Excessive Spacing) */}
      <main className="flex-1 w-full px-3 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-16">
        <div className="w-full space-y-4">
          
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
                  placeholder="Search by title, author, genre, or ISBN..."
                  className="w-full pl-11 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-[#1E3A8A] focus:bg-white focus:ring-2 focus:ring-[#1E3A8A]/10 transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
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
                  {filteredBooks.length} Books
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
                  {filteredBooks.length} Books
                </span>
              </div>

            </div>
          </div>

          {/* Product Cards Grid: 6 in One Row on Laptop/Desktop (xl:grid-cols-6) */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-6 gap-3 sm:gap-4">
              {Array.from({ length: 12 }).map((_, idx) => (
                <div key={idx} className="aspect-[3/4] bg-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredBooks.length === 0 ? (
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
                {filteredBooks.map((book) => {
                  const bookId = book._id || book.id;
                  const title = book.title || book.name || book.titleMalayalam || 'LOGOS Book';
                  const author = book.author || 'LOGOS Publications';
                  const price = Number(book.discountPrice || book.salePrice || book.price || 299);
                  const originalPrice = book.discountPrice && Number(book.discountPrice) < Number(book.price)
                    ? Number(book.price)
                    : null;
                  const image = (book.images && book.images[0]) || book.coverImage || book.image || '/book-placeholder.svg';
                  const inWishlist = isBookInWishlist(bookId);
                  const discountPercent = originalPrice && originalPrice > price
                    ? Math.round(((originalPrice - price) / originalPrice) * 100)
                    : 0;
                  const rating = book.rating ? Number(book.rating).toFixed(1) : '5.0';
                  const reviewsCount = book.reviewsCount ? `${(book.reviewsCount / 1000).toFixed(1)}k` : '0.1k';

                  // Determine Top-Left Badge: Bestseller > New > Discount
                  const showBestseller = book.isBestSeller;
                  const showNew = book.isNewArrival && !book.isBestSeller;
                  const showDiscount = discountPercent > 0 && !showBestseller && !showNew;

                  return (
                    <div
                      key={`card-${bookId}`}
                      className="group bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 shadow-2xs hover:shadow-md transition-all duration-300 p-2.5 sm:p-3 flex flex-col justify-between"
                    >
                      {/* Book Cover Image Container (Portrait 3:4 Aspect Ratio) */}
                      <div className="relative aspect-[3/4] w-full bg-[#f8fafc] rounded-xl overflow-hidden mb-2.5 border border-slate-100 flex items-center justify-center p-2 group-hover:bg-[#f1f5f9] transition-colors">
                        <Link href={`/books/${book.slug || bookId}`} className="block w-full h-full">
                          <img
                            src={image}
                            alt={title}
                            referrerPolicy="no-referrer"
                            loading="lazy"
                            crossOrigin="anonymous"
                            onError={(e) => {
                              if (!e.currentTarget.dataset.failed) {
                                e.currentTarget.dataset.failed = 'true';
                                e.currentTarget.src = '/book-placeholder.svg';
                              }
                            }}
                            className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-300 select-none"
                          />
                        </Link>

                        {/* Top-Left Badges with reduced border-radius */}
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
                          className={`absolute top-2 right-2 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center shadow-xs border border-slate-200/70 backdrop-blur-md transition-all z-10 ${
                            inWishlist
                              ? 'bg-white text-rose-500 shadow-rose-200'
                              : 'bg-white/90 text-slate-400 hover:text-rose-500 hover:bg-white'
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

                          <button
                            type="button"
                            onClick={() => handleAddToCart(book)}
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full text-white flex items-center justify-center shadow-xs hover:shadow-sm active:scale-95 shrink-0 transition-all ${
                              addedItems[book?._id || book?.id || book?.slug]
                                ? 'bg-emerald-500 hover:bg-emerald-600'
                                : 'bg-[#1E3A8A] hover:bg-[#152e72]'
                            }`}
                            title="Add to Cart"
                          >
                            {addedItems[book?._id || book?.id || book?.slug]
                              ? <Check className="w-3.5 h-3.5" />
                              : <ShoppingCart className="w-3.5 h-3.5" />
                            }
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left ${
                            isSelected
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
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left ${
                          selectedPriceRangeIndex === idx
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
