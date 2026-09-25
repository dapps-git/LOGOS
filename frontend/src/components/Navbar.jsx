'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown, Search, User, ShoppingBag, Menu, X } from 'lucide-react';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '/', active: true },
    {
      name: 'Book',
      href: '/books',
      hasDropdown: true,
      items: ['Fiction', 'Non-Fiction', 'Classics', 'Bestsellers', 'New Releases']
    },
    {
      name: 'Category',
      href: '/categories',
      hasDropdown: true,
      items: ['Novels', 'Poetry', 'Philosophy', 'Science', 'Self-Help', 'History']
    },
    {
      name: 'Author',
      href: '/authors',
      hasDropdown: true,
      items: ['V. T. Pratheesh', 'Ernest Hemingway', 'Ajish Gangadharan', 'Jisa John', 'K. Raghunathan']
    },
    {
      name: 'Age',
      href: '/age-groups',
      hasDropdown: true,
      items: ['All Ages', 'Children (0-8)', 'Young Adult (9-17)', 'Adult (18+)']
    }
  ];

  return (
    <header className="absolute top-3 sm:top-6 left-0 right-0 z-50 px-3 sm:px-8 max-w-6xl mx-auto">
      {/* Capsule Pill Floating Container */}
      <nav className="bg-white rounded-full shadow-md border border-slate-100/60 px-5 sm:px-7 py-2.5 sm:py-3 flex items-center justify-between transition-all">
        {/* Logo */}
        <Link href="/" className="flex items-center flex-shrink-0">
          <img
            src="/logo.png"
            alt="LOGOS Books"
            className="h-10 sm:h-12 md:h-14 w-auto object-contain"
          />
        </Link>

        {/* Center Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          {navLinks.map((link) => (
            <div key={link.name} className="relative group">
              <Link
                href={link.href}
                className={`text-[13px] lg:text-sm font-semibold flex items-center gap-1 transition-colors ${
                  link.active
                    ? 'text-slate-950 font-bold'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                <span>{link.name}</span>
                {link.hasDropdown && (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-transform group-hover:rotate-180" />
                )}
              </Link>

              {/* Dropdown Menu */}
              {link.hasDropdown && (
                <div className="absolute top-full left-0 mt-3 w-48 bg-white rounded-xl shadow-xl border border-slate-100 p-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50">
                  {link.items?.map((item) => (
                    <Link
                      key={item}
                      href={`${link.href}?q=${encodeURIComponent(item)}`}
                      className="block px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-950 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      {item}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right Icon Actions (Desktop shows all; Mobile shows only toggle bar) */}
        <div className="flex items-center gap-2 sm:gap-4 text-slate-700">
          <button
            type="button"
            className="hidden md:flex p-1.5 hover:text-slate-950 hover:bg-slate-100 rounded-full transition-colors"
            title="Search catalog"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            type="button"
            className="hidden md:flex p-1.5 hover:text-slate-950 hover:bg-slate-100 rounded-full transition-colors"
            title="Account"
          >
            <User className="w-4 h-4" />
          </button>

          <Link
            href="/cart"
            className="hidden md:flex p-1.5 hover:text-slate-950 hover:bg-slate-100 rounded-full transition-colors relative"
            title="Cart"
          >
            <ShoppingBag className="w-4 h-4" />
          </Link>

          {/* Mobile Menu Toggle Bar */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 text-slate-800 hover:text-slate-950 md:hidden outline-none focus:outline-none transition-transform active:scale-95"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 stroke-[2.2]" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 space-y-3 animate-in fade-in slide-in-from-top-2">
          {/* Mobile Search & Quick Actions */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-slate-700">
            <Link
              href="/account"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-1.5 text-xs font-semibold hover:text-slate-950"
            >
              <User className="w-4 h-4" />
              <span>Account</span>
            </Link>

            <Link
              href="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-1.5 text-xs font-semibold hover:text-slate-950"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Cart</span>
            </Link>
          </div>

          {/* Navigation Links */}
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 rounded-lg transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
};
