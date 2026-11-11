'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFBFD] text-slate-800">
      <Navbar />

      <main className="flex-1 w-full pt-28 sm:pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6 font-light">
            <Link href="/" className="hover:text-slate-700 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[#1044A5] font-medium">Terms &amp; Conditions</span>
          </nav>

          <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-xs border border-slate-200/80">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1044A5] mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Legal Agreement</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mb-2">
              Terms &amp; Conditions
            </h1>
            <p className="text-xs text-slate-400 mb-8">Last revised: October 2026</p>

            <div className="space-y-6 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <section>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-2">1. Overview &amp; Acceptance</h2>
                <p>
                  Welcome to <strong>LOGOS Books</strong> (logosbooks.in). By accessing our website, browsing our catalog, or placing an order, you agree to comply with and be bound by the following Terms and Conditions of service. If you do not agree with any part of these terms, please do not use our services.
                </p>
              </section>

              <section>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-2">2. Catalog &amp; Book Availability</h2>
                <p>
                  We strive to present our inventory, cover art, book summaries, and pricing with absolute accuracy. However, availability may fluctuate during high-demand literary releases. In the rare event that a book you purchased becomes unavailable, our team will promptly notify you and process an immediate full refund or provide a replacement title of your choice.
                </p>
              </section>

              <section>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-2">3. Orders, Pricing &amp; Payments</h2>
                <p>
                  All prices listed on the storefront are in Indian Rupees (INR) and inclusive of applicable taxes. We accept online payments securely processed via <strong>Razorpay</strong> (UPI, Credit/Debit Cards, Net Banking, Wallets) as well as <strong>Cash on Delivery (COD)</strong> for eligible delivery pin codes.
                </p>
              </section>

              <section>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-2">4. Shipping &amp; Delivery</h2>
                <p>
                  Orders are processed and dispatched within 24 to 48 business hours. Deliveries within Kerala typically take 2 to 4 business days, while deliveries across other Indian states take 4 to 7 business days. Delivery timelines are subject to courier handling and regional transit conditions.
                </p>
              </section>

              <section>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-2">5. Returns, Replacements &amp; Refunds</h2>
                <p>
                  Customers may request a return or replacement within <strong>7 days of delivery</strong> for books that arrive damaged, misprinted, or defective. Once verified, refunds are credited directly back to the original UPI / bank account via Razorpay, or processed via bank transfer for COD orders.
                </p>
              </section>

              <section>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-2">6. Intellectual Property Rights</h2>
                <p>
                  All content, book excerpts, images, trademarks, and imprints displayed on LOGOS Books are the intellectual property of LOGOS Books or their respective copyrighted authors and publishers. Unauthorized reproduction or commercial redistribution is strictly prohibited.
                </p>
              </section>

              <section>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-2">7. Contact &amp; Support</h2>
                <p>
                  For any questions or legal inquiries regarding these terms, please contact our administrative desk:
                </p>
                <div className="pt-2 text-xs text-slate-700 space-y-1">
                  <p><strong>Email:</strong> publishinglogosbooks@gmail.com</p>
                  <p><strong>Phone:</strong> +91 80861 26024 / +91 82812 91849</p>
                  <p><strong>Headquarters:</strong> LOGOS Books, Kerala, India</p>
                </div>
              </section>
            </div>

            <div className="pt-8 mt-8 border-t border-slate-100">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#1044A5] hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Storefront
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
