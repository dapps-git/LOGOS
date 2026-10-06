'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, Search, User, ShoppingBag, Heart, Menu, X, Gift, Package, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef(null);
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
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Books', href: '/products' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact Us', href: '/contact' }
  ];

  return (
    <header className="fixed top-2 sm:top-4 left-0 right-0 z-50 px-3 sm:px-8 max-w-6xl mx-auto pointer-events-none">
      {/* Capsule Pill Floating Container */}
      <nav className="pointer-events-auto bg-white/95 backdrop-blur-md rounded-full shadow-lg shadow-slate-900/5 border border-slate-100/80 px-5 sm:px-7 py-2 sm:py-2.5 flex items-center justify-between transition-all">
        {/* Logo */}
        <Link href="/" className="flex items-center flex-shrink-0">
          <img
            src="/logo.png"
            alt="LOGOS Books"
            className="h-9 sm:h-11 md:h-12 w-auto object-contain"
          />
        </Link>

        {/* Center Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          {navLinks.map((link) => (
            <div key={link.name} className="relative group">
              <Link
                href={link.href}
                className={`text-[13px] font-normal flex items-center gap-1 transition-colors ${
                  link.active
                    ? 'text-slate-900 font-medium'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                <span>{link.name}</span>
                {link.hasDropdown && (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-transform group-hover:rotate-180" />
                )}
              </Link>

              {/* Dropdown Menu */}
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

        {/* Right Icon Actions */}
        <div className="flex items-center gap-2 sm:gap-3 text-slate-700">
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
                  <ChevronDown className={`w-3 h-3 text-slate-500 hidden sm:block transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
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
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 text-slate-800 hover:text-slate-950 md:hidden outline-none focus:outline-none transition-transform active:scale-95 ml-1"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 stroke-[2.2]" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto md:hidden mt-2 bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-100 p-5 space-y-4 animate-in fade-in slide-in-from-top-2">
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
