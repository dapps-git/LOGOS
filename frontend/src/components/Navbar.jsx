'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown, Search, User, ShoppingBag, Heart, Menu, X, Gift, Package, LogOut, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { fetchBookSuggestions } from '../lib/api';

export const Navbar = () => {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef(null);

  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);
  const mobileSearchInputRef = useRef(null);

  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    const handleGlobalKeyDown = (e) => {
      // Shortcut Ctrl+K / Cmd+K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
          setShowSuggestions(true);
        } else {
          setMobileSearchOpen(true);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, []);

  // Debounced search suggestions fetch
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSuggestions([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetchBookSuggestions(searchQuery.trim());
        setSuggestions(Array.isArray(res) ? res : []);
      } catch (err) {
        setSuggestions([]);
      } finally {
        setSearchLoading(false);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e, customQuery) => {
    if (e && e.preventDefault) e.preventDefault();
    const queryToSearch = customQuery !== undefined ? customQuery : searchQuery;
    if (!queryToSearch || !queryToSearch.trim()) return;

    setShowSuggestions(false);
    setMobileSearchOpen(false);
    setMobileMenuOpen(false);
    router.push(`/products?search=${encodeURIComponent(queryToSearch.trim())}`);
  };

  const handleSelectBook = (book) => {
    setShowSuggestions(false);
    setMobileSearchOpen(false);
    setMobileMenuOpen(false);
    router.push(`/books/${book.slug || book._id}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        e.preventDefault();
        handleSelectBook(suggestions[selectedIndex]);
      } else {
        handleSearchSubmit(e);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Books', href: '/products' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact Us', href: '/contact' }
  ];

  return (
    <header className="fixed top-2 sm:top-4 left-0 right-0 z-50 px-3 sm:px-6 lg:px-8 max-w-6xl mx-auto pointer-events-none">
      {/* Capsule Pill Floating Container */}
      <nav className="pointer-events-auto bg-white/95 backdrop-blur-md rounded-full shadow-lg shadow-slate-900/5 border border-slate-100/80 px-4 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-3 sm:gap-4 transition-all">
        {/* Logo */}
        <Link href="/" className="flex items-center flex-shrink-0">
          <img
            src="/logo.png"
            alt="LOGOS Books"
            className="h-8 sm:h-10 md:h-11 w-auto object-contain"
          />
        </Link>

        {/* Center Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-5 lg:gap-7 flex-shrink-0">
          {navLinks.map((link) => (
            <div key={link.name} className="relative group">
              <Link
                href={link.href}
                className="text-[13px] font-normal flex items-center gap-1 transition-colors text-slate-600 hover:text-slate-950"
              >
                <span>{link.name}</span>
                {link.hasDropdown && (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-transform group-hover:rotate-180" />
                )}
              </Link>

              {link.hasDropdown && (
                <div className="absolute top-full left-0 mt-3 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50">
                  {link.items?.map((item) => (
                    <Link
                      key={item}
                      href={link.href}
                      className="block px-3.5 py-2 text-xs font-light text-slate-700 hover:text-[#1E3A8A] hover:bg-blue-50/60 rounded-xl transition-colors"
                    >
                      {item}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Desktop Search Bar */}
        <div className="relative hidden md:block flex-1 max-w-[210px] lg:max-w-[290px]" ref={searchContainerRef}>
          <form onSubmit={handleSearchSubmit} className="relative w-full flex items-center">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 pointer-events-none transition-colors" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
                setSelectedIndex(-1);
              }}
              onFocus={() => {
                if (searchQuery.trim().length >= 2) setShowSuggestions(true);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search books, authors, ISBN..."
              className="w-full pl-9 pr-12 py-1.5 bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-xs text-slate-800 placeholder-slate-400 rounded-full border border-transparent focus:border-[#1E3A8A]/40 focus:ring-2 focus:ring-[#1E3A8A]/10 outline-none transition-all duration-200"
            />
            <div className="absolute right-2.5 flex items-center gap-1">
              {searchLoading ? (
                <div className="w-3.5 h-3.5 border-2 border-[#1E3A8A] border-t-transparent rounded-full animate-spin" />
              ) : searchQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSuggestions([]);
                    setShowSuggestions(false);
                  }}
                  className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                  title="Clear"
                >
                  <X className="w-3 h-3" />
                </button>
              ) : (
                <span className="hidden lg:inline-block text-[9px] text-slate-400 font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs">
                  ⌘K
                </span>
              )}
            </div>
          </form>

          {/* Desktop Suggestions Popover */}
          {showSuggestions && searchQuery.trim().length >= 2 && (
            <div className="absolute left-0 right-0 top-full mt-2 w-[330px] -left-12 lg:left-0 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                <span>Top Results</span>
                {searchLoading ? <span>Searching...</span> : <span>{suggestions.length} found</span>}
              </div>

              <div className="max-h-[320px] overflow-y-auto space-y-1">
                {suggestions.length > 0 ? (
                  suggestions.map((item, idx) => (
                    <button
                      key={item._id || item.slug || idx}
                      type="button"
                      onClick={() => handleSelectBook(item)}
                      className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition-colors ${
                        selectedIndex === idx ? 'bg-blue-50 text-[#1E3A8A]' : 'hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <img
                        src={item.coverImage || '/book-placeholder.svg'}
                        alt={item.title}
                        className="w-8 h-11 object-cover rounded shadow-2xs flex-shrink-0 bg-slate-100"
                        onError={(e) => {
                          e.currentTarget.src = '/book-placeholder.svg';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{item.title || item.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{item.author || 'LOGOS'}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {item.matchedBy && (
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-medium ${
                                item.matchedBy === 'ISBN'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                                  : item.matchedBy === 'Author'
                                  ? 'bg-purple-50 text-purple-700 border border-purple-200/60'
                                  : item.matchedBy === 'Keyword'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                  : 'bg-blue-50 text-[#1E3A8A] border border-blue-200/60'
                              }`}
                            >
                              {item.matchedBy === 'ISBN' && item.isbn ? `ISBN: ${item.isbn}` : item.matchedBy}
                            </span>
                          )}
                          {(item.discountPrice || item.price) && (
                            <span className="text-[11px] font-semibold text-slate-900 ml-auto">
                              ₹{item.discountPrice || item.price}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                ) : !searchLoading ? (
                  <div className="px-3 py-4 text-center">
                    <p className="text-xs text-slate-500">No direct matches</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Press Enter to search catalog</p>
                  </div>
                ) : null}
              </div>

              <div className="pt-1.5 mt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleSearchSubmit()}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-[#1E3A8A] hover:bg-blue-50/70 rounded-xl transition-colors"
                >
                  <span className="truncate">View all results for &quot;{searchQuery}&quot;</span>
                  <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Icon Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 text-slate-700 flex-shrink-0">
          {/* Mobile Search Button */}
          <button
            type="button"
            onClick={() => {
              setMobileSearchOpen((prev) => !prev);
              setTimeout(() => mobileSearchInputRef.current?.focus(), 100);
            }}
            className={`p-2 rounded-full transition-colors md:hidden ${
              mobileSearchOpen ? 'text-[#1E3A8A] bg-blue-50' : 'hover:text-[#1E3A8A] hover:bg-slate-100'
            }`}
            title="Search"
            aria-label="Search books"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Wishlist Link */}
          <Link
            href="/wishlist"
            className="p-2 hover:text-[#1E3A8A] hover:bg-slate-100 rounded-full transition-colors relative"
            title="Wishlist"
          >
            <Heart className="w-4 h-4" />
            {mounted && wishlistCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-mono font-medium rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart Link */}
          <Link
            href="/cart"
            className="p-2 hover:text-[#1E3A8A] hover:bg-slate-100 rounded-full transition-colors relative"
            title="Shopping Cart"
          >
            <ShoppingBag className="w-4 h-4" />
            {mounted && itemCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-[#1E3A8A] text-white text-[10px] font-mono font-medium rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>

          {/* User Account Menu */}
          <div className="relative" ref={userDropdownRef}>
            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen((prev) => !prev)}
                  className="p-1 flex items-center gap-1.5 hover:bg-slate-100 rounded-full transition-colors active:scale-95"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-[#1E3A8A] text-xs font-semibold flex items-center justify-center shadow-2xs border border-blue-200">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <ChevronDown
                    className={`w-3 h-3 text-slate-500 hidden sm:block transition-transform duration-200 ${
                      userDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Card */}
                {userDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-slate-200/90 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2.5 border-b border-slate-100 mb-1 bg-slate-50/50 rounded-t-md">
                      <p className="text-xs font-semibold text-slate-900 truncate">{user?.name || 'LOGOS Reader'}</p>
                      <p className="text-[10px] font-light text-slate-500 truncate">{user?.email}</p>
                      {user?.referralRewardBalance > 0 && (
                        <span className="inline-block mt-1 text-[10px] text-emerald-700 font-mono bg-emerald-50 px-2 py-0.5 rounded-sm border border-emerald-200/60 font-medium">
                          ₹{user.referralRewardBalance} Wallet Rewards
                        </span>
                      )}
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-normal text-slate-700 hover:text-[#1E3A8A] hover:bg-blue-50/80 rounded-md transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span>My Profile</span>
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-normal text-slate-700 hover:text-[#1E3A8A] hover:bg-blue-50/80 rounded-md transition-colors"
                    >
                      <Package className="w-3.5 h-3.5 text-slate-500" />
                      <span>Orders & Tracking</span>
                    </Link>
                    <Link
                      href="/profile?tab=referrals"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-normal text-slate-700 hover:text-[#1E3A8A] hover:bg-blue-50/80 rounded-md transition-colors"
                    >
                      <Gift className="w-3.5 h-3.5 text-slate-500" />
                      <span>Referral Program</span>
                    </Link>

                    <div className="my-1 border-t border-slate-100" />

                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-md transition-colors text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-[#1E3A8A] hover:bg-[#152e72] text-white rounded-full text-xs font-medium transition-all shadow-sm"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle Bar */}
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(!mobileMenuOpen);
              if (mobileSearchOpen) setMobileSearchOpen(false);
            }}
            className="p-1 text-slate-800 hover:text-slate-950 md:hidden outline-none focus:outline-none transition-transform active:scale-95 ml-0.5"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 stroke-[2.2]" />}
          </button>
        </div>
      </nav>

      {/* Mobile Quick Search Bar Dropdown */}
      {mobileSearchOpen && (
        <div className="pointer-events-auto md:hidden mt-2 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-100 p-2.5 animate-in fade-in slide-in-from-top-2">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              ref={mobileSearchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              placeholder="Search books, authors, ISBN..."
              className="w-full pl-9 pr-9 py-2 bg-slate-50 text-xs text-slate-800 rounded-full border border-slate-200 focus:border-[#1E3A8A] focus:bg-white outline-none"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSuggestions([]);
                }}
                className="absolute right-3 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setMobileSearchOpen(false)}
                className="absolute right-3 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Mobile Live Suggestions */}
          {showSuggestions && searchQuery.trim().length >= 2 && suggestions.length > 0 && (
            <div className="mt-2 pt-2 border-t border-slate-100 max-h-56 overflow-y-auto space-y-1">
              {suggestions.map((item) => (
                <button
                  key={item._id || item.slug}
                  type="button"
                  onClick={() => handleSelectBook(item)}
                  className="w-full flex items-center gap-2.5 p-2 rounded-xl text-left hover:bg-slate-50 text-slate-800 transition-colors"
                >
                  <img
                    src={item.coverImage || '/book-placeholder.svg'}
                    alt={item.title}
                    className="w-7 h-10 object-cover rounded shadow-2xs flex-shrink-0 bg-slate-100"
                    onError={(e) => {
                      e.currentTarget.src = '/book-placeholder.svg';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{item.title || item.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{item.author || 'LOGOS'}</p>
                  </div>
                  <span className="text-xs font-semibold text-slate-900">
                    ₹{item.discountPrice || item.price}
                  </span>
                </button>
              ))}
            </div>
          )}

          {searchQuery.trim().length >= 2 && (
            <button
              type="button"
              onClick={() => handleSearchSubmit()}
              className="w-full mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-[#1E3A8A]"
            >
              <span>Search catalog for &quot;{searchQuery}&quot;</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto md:hidden mt-2 bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-100 p-5 space-y-4 animate-in fade-in slide-in-from-top-2">
          {/* Quick Search inside Drawer */}
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search books, authors, keywords, ISBN..."
              className="w-full pl-9 pr-16 py-2 bg-slate-50 text-xs text-slate-800 rounded-xl border border-slate-200 focus:border-[#1E3A8A] focus:bg-white outline-none"
            />
            <button
              type="submit"
              className="absolute right-1 px-3 py-1 bg-[#1E3A8A] text-white text-[11px] font-medium rounded-lg hover:bg-[#152e72] transition-colors"
            >
              Search
            </button>
          </form>

          {/* Mobile User Status */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            {isAuthenticated ? (
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-xs font-normal text-slate-800"
              >
                <div className="w-6 h-6 rounded-full bg-blue-100 text-[#1E3A8A] text-xs flex items-center justify-center">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <span>{user?.name || 'Account'}</span>
              </Link>
            ) : (
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-medium text-[#1E3A8A]"
              >
                Sign In / Join LOGOS
              </Link>
            )}

            <div className="flex items-center gap-3">
              <Link
                href="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-light text-slate-600 flex items-center gap-1"
              >
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                <span>({wishlistCount})</span>
              </Link>
              <Link
                href="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-light text-slate-600 flex items-center gap-1"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-[#1E3A8A]" />
                <span>({itemCount})</span>
              </Link>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-xs font-light text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {isAuthenticated && (
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 text-xs text-rose-600 font-light"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
