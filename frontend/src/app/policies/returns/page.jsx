'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, RotateCcw, CheckCircle2, Clock, HelpCircle } from 'lucide-react';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';

export default function ReturnsPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFBFD] text-slate-800">
      <Navbar />

      <main className="flex-1 w-full pt-28 sm:pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6 font-light">
            <Link href="/" className="hover:text-slate-700 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[#1044A5] font-medium">Return &amp; Refund Policy</span>
          </nav>

          <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-xs border border-slate-200/80">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1044A5] mb-2">
              <RotateCcw className="w-4 h-4" />
              <span>Reader Guarantee &amp; Satisfaction</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mb-2">
              Return &amp; Refund Policy
            </h1>
            <p className="text-xs text-slate-400 mb-8">Fair, transparent, and reader-first</p>

            {/* Quick Highlights Box */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
              <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100 flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#1044A5] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">7-Day Window</h4>
                  <p className="text-[11px] text-slate-600">From the date of parcel delivery</p>
                </div>
              </div>
              <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Full UPI/Bank Refund</h4>
                  <p className="text-[11px] text-slate-600">Instant gateway credit</p>
                </div>
              </div>
              <div className="p-3.5 bg-purple-50/60 rounded-xl border border-purple-100 flex items-start gap-2.5">
                <RotateCcw className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Free Replacement</h4>
                  <p className="text-[11px] text-slate-600">For damaged or wrong books</p>
                </div>
              </div>
            </div>

            <div className="space-y-6 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <section>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-2">1. 7-Day Return Eligibility</h2>
                <p>
                  We take pride in packaging each book with exceptional care. However, if your book arrives in any of the following conditions, you are entitled to a full return or complimentary replacement within <strong>7 days of delivery</strong>:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 pt-2">
                  <li>Damaged cover, torn pages, or transit breakage.</li>
                  <li>Manufacturing defect, missing chapters, or upside-down binding.</li>
                  <li>Incorrect title or quantity received compared to your order invoice.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-2">2. How to Request a Return</h2>
                <p>
                  Returning an item is quick and automated directly through your account:
                </p>
                <ol className="list-decimal pl-5 space-y-1.5 pt-2">
                  <li>Log in and open your <Link href="/profile" className="text-[#1044A5] underline font-medium">My Orders</Link> page.</li>
                  <li>Click on the specific delivered order and press <strong>&ldquo;Request Return / Replacement&rdquo;</strong>.</li>
                  <li>Select your reason (e.g. damaged copy, misprint, wrong item) and submit.</li>
                  <li>Our support team will review your request within 24 business hours and schedule a reverse courier pickup.</li>
                </ol>
              </section>

              <section>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-2">3. Refund Processing &amp; Timelines</h2>
                <p>
                  Once your return is verified:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 pt-2">
                  <li><strong>Prepaid Orders (UPI / Razorpay / Net Banking):</strong> Refunds are credited automatically back to the original source account. UPI refunds typically reflect within <strong>2 to 4 hours</strong>, while debit/credit cards reflect within 1 to 3 banking days.</li>
                  <li><strong>Cash on Delivery (COD) Orders:</strong> Our support desk will contact you to collect your preferred UPI ID or Bank Account (IFSC) details for direct NEFT/IMPS transfer within 24 to 48 hours.</li>
                  <li><strong>Wallet Credits:</strong> Any loyalty or referral bonus credits redeemed on the order are automatically restored to your wallet.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-2">4. Order Cancellation Policy</h2>
                <p>
                  You can cancel an order free of charge anytime <strong>before it is dispatched</strong>. To cancel, navigate to your order details page and click &ldquo;Cancel Order&rdquo;. If the order was prepaid online, our system automatically triggers an instant full refund through Razorpay.
                </p>
              </section>

              <section>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-2">5. Need Immediate Assistance?</h2>
                <p>
                  If you need urgent assistance with an active return or refund query, our support team is available from 9:30 AM to 6:30 PM (Mon - Sat):
                </p>
                <div className="pt-2 text-xs text-slate-700 space-y-1">
                  <p><strong>Support Email:</strong> publishinglogosbooks@gmail.com</p>
                  <p><strong>WhatsApp Support:</strong> +91 80861 26024</p>
                  <p><strong>Customer Care:</strong> +91 82812 91849</p>
                </div>
              </section>
            </div>

            <div className="pt-8 mt-8 border-t border-slate-100 flex items-center justify-between">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#1044A5] hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Storefront
              </Link>
              <Link
                href="/faq"
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900"
              >
                <HelpCircle className="w-3.5 h-3.5" /> View FAQ
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

