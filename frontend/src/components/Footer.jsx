'use client';

import React from 'react';
import Link from 'next/link';

export const Footer = () => {
  return (
    <footer className="bg-[#1e3c8a] text-white pt-14 pb-8 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-14 pb-12">
          {/* Brand Column */}
          <div className="md:col-span-6 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-white">
              Logos Book
            </h2>

            <p className="text-xs sm:text-sm text-blue-100/90 italic font-serif max-w-md leading-relaxed">
              Independent bookselling and publishing for readers across Malayalam, English and Hindi.
            </p>

            {/* Social Links */}
            <div className="pt-3 space-y-2">
              <span className="text-[11px] font-bold tracking-wider uppercase text-blue-200 block">
                Follow Us
              </span>
              <div className="flex items-center gap-3">
                {/* Facebook */}
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-md bg-[#1877F2] flex items-center justify-center text-white hover:opacity-90 transition-opacity"
                  title="Facebook"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-md bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center text-white hover:opacity-90 transition-opacity"
                  title="Instagram"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>

                {/* WhatsApp */}
                <a
                  href="https://whatsapp.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-md bg-[#25D366] flex items-center justify-center text-white hover:opacity-90 transition-opacity"
                  title="WhatsApp"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Books Links */}
          <div className="md:col-span-3 space-y-3">
            <h3 className="text-xs font-bold tracking-wider uppercase text-blue-200">
              Books
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-white/90">
              <li>
                <Link href="/authors" className="hover:text-blue-200 transition-colors">
                  Authors
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-blue-200 transition-colors">
                  Category
                </Link>
              </li>
              <li>
                <Link href="/age-groups" className="hover:text-blue-200 transition-colors">
                  Age
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies Links */}
          <div className="md:col-span-3 space-y-3">
            <h3 className="text-xs font-bold tracking-wider uppercase text-blue-200">
              Policies
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-white/90">
              <li>
                <Link href="/policies/terms" className="hover:text-blue-200 transition-colors">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link href="/policies/privacy" className="hover:text-blue-200 transition-colors">
                  Privacy policy
                </Link>
              </li>
              <li>
                <Link href="/policies/returns" className="hover:text-blue-200 transition-colors">
                  Return &amp; Refund
                </Link>
              </li>
              <li>
                <Link href="/policies/shipping" className="hover:text-blue-200 transition-colors">
                  Shipping &amp; Delivery
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-blue-200 transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Row */}
        <div className="border-t border-white/20 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-blue-100/80 gap-3">
          <p>© 2026 Logos Book. All rights reserved.</p>
          <p>Made for readers, in India.</p>
        </div>
      </div>
    </footer>
  );
};
