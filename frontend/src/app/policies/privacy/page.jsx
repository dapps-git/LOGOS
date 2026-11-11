'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Lock, ShieldCheck } from 'lucide-react';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFBFD] text-slate-800">
      <Navbar />

      <main className="flex-1 w-full pt-28 sm:pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6 font-light">
            <Link href="/" className="hover:text-slate-700 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[#1044A5] font-medium">Privacy Policy</span>
          </nav>

          <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-xs border border-slate-200/80">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1044A5] mb-2">
              <Lock className="w-4 h-4" />
              <span>Data Protection &amp; Confidentiality</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mb-2">
              Privacy Policy
            </h1>
            <p className="text-xs text-slate-400 mb-8">Last updated: October 2026</p>

            <div className="space-y-6 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <section>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-2">1. Commitment to Your Privacy</h2>
                <p>
                  At <strong>LOGOS Books</strong> (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;), we deeply respect the privacy of every reader and customer who visits our platform. This Privacy Policy outlines what information we collect, how it is used, and the stringent security measures in place to protect your personal details.
                </p>
              </section>

              <section>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-2">2. Information We Collect</h2>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li><strong>Account &amp; Contact Details:</strong> Name, email address, phone number, and password (securely hashed via bcrypt).</li>
                  <li><strong>Shipping &amp; Delivery Information:</strong> Full recipient name, street address, post office, city, state, and 6-digit postal PIN code.</li>
                  <li><strong>Order History &amp; Preferences:</strong> Books purchased, wishlist titles, reviews submitted, and coupon or referral rewards balance.</li>
                  <li><strong>Technical Logs:</strong> Device type, browser user-agent, and anonymized session identifiers for cart synchronization.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-2">3. Payment Information &amp; Razorpay Security</h2>
                <p>
                  We prioritize absolute payment security. <strong>LOGOS Books never stores your credit card numbers, debit card PINs, CVVs, or Net Banking credentials on our servers.</strong> All online transactions are handled through <strong>Razorpay</strong>, an RBI-regulated, PCI-DSS Level 1 compliant payment gateway that encrypts data end-to-end using 256-bit SSL protocols.
                </p>
              </section>

              <section>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-2">4. How We Use Your Data</h2>
                <p>
                  We utilize your information strictly to provide a seamless literary experience:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 pt-2">
                  <li>Processing, packaging, and dispatching your book orders.</li>
                  <li>Sending real-time order confirmation, delivery updates, and tracking links via SMS/Email.</li>
                  <li>Delivering customer support, processing returns, and issuing automatic gateway refunds.</li>
                  <li>Calculating referral discount savings and loyalty credits for your account.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-2">5. Data Sharing &amp; Third Parties</h2>
                <p>
                  We will <strong>never sell, rent, or trade your personal data</strong> to third-party advertisers. Information is disclosed solely to trusted partners necessary for order fulfillment:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 pt-2">
                  <li><strong>Logistics Partners:</strong> India Post and reputable courier services for delivering physical parcels to your doorstep.</li>
                  <li><strong>Payment Gateway:</strong> Razorpay for verifying signatures and processing refunds securely.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-2">6. Cookies &amp; Local Storage</h2>
                <p>
                  We use lightweight browser storage solely for keeping you authenticated across sessions and retaining items in your shopping bag and wishlist. No tracking scripts or invasive third-party ad pixels are loaded.
                </p>
              </section>

              <section>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-2">7. Your Rights &amp; Contact</h2>
                <p>
                  You have the right to access, update, or request the deletion of your account profile at any time by visiting your <Link href="/profile" className="text-[#1044A5] underline font-medium">Profile Dashboard</Link> or emailing us at:
                </p>
                <div className="pt-2 text-xs text-slate-700 space-y-1">
                  <p><strong>Privacy Officer:</strong> LOGOS Books Support Team</p>
                  <p><strong>Email:</strong> publishinglogosbooks@gmail.com</p>
                  <p><strong>Direct Helpline:</strong> +91 80861 26024</p>
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

