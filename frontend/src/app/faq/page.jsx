'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { HelpCircle, ChevronDown, ChevronUp, ArrowLeft, Search, MessageSquare, BookOpen, Truck, CreditCard, RotateCcw } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const FAQ_DATA = [
  {
    category: 'Ordering & Payment',
    icon: CreditCard,
    items: [
      {
        q: 'How do I place an order on LOGOS Books?',
        a: 'Simply browse our catalog, select your favorite Malayalam or English titles, and click "Add to Bag" or "Buy Now". When ready, proceed to checkout, enter your delivery address, select your preferred payment method (Online via UPI/Card or Cash on Delivery), and confirm your order.'
      },
      {
        q: 'Which payment methods are accepted?',
        a: 'We accept all major online payment options via our secure Razorpay gateway: UPI (Google Pay, PhonePe, Paytm, BHIM, Cred), Credit and Debit Cards (Visa, MasterCard, RuPay), Net Banking (across 50+ Indian banks), and Cash on Delivery (COD).'
      },
      {
        q: 'Is it safe to pay online on LOGOS Books?',
        a: 'Yes, 100% safe. All transactions are processed through Razorpay, which is an RBI-authorized, PCI-DSS Level 1 compliant gateway. We use 256-bit bank-grade SSL encryption and never store your card PINs or banking credentials on our servers.'
      },
      {
        q: 'How does Cash on Delivery (COD) work?',
        a: 'When you choose Cash on Delivery, you pay the courier delivery agent in cash or via mobile UPI at your doorstep when the parcel arrives. COD is completely FREE for orders of ₹1,000 and above, with a small 2% handling fee for orders under ₹1,000.'
      },
      {
        q: 'How do I apply coupon or referral discount codes?',
        a: 'On the Checkout page, you will find an "Available Coupons" section. You can either tap on any active coupon code or type your friend\'s referral code into the input field and click "Apply". Valid discounts (such as 15% referral bonus) will be automatically deducted from your order total.'
      }
    ]
  },
  {
    category: 'Shipping & Delivery',
    icon: Truck,
    items: [
      {
        q: 'How much does shipping cost?',
        a: 'Shipping is completely FREE (₹0) on all online prepaid orders (UPI, Cards, Net Banking) across India, regardless of cart value. For Cash on Delivery, orders of ₹1,000+ get free shipping.'
      },
      {
        q: 'How long does delivery take?',
        a: 'Orders are processed and dispatched within 24 to 48 hours from our Kerala warehouse. Deliveries within Kerala typically take 2 to 4 business days. For Tamil Nadu, Karnataka, and other Indian states, delivery takes 4 to 7 business days.'
      },
      {
        q: 'How can I track my shipment?',
        a: 'Once your books are dispatched, you will receive an automatic tracking SMS and email with your AWB tracking link. You can also monitor your order in real time by logging into your account and clicking "Orders".'
      },
      {
        q: 'How are the books packaged to prevent transit damage?',
        a: 'Every book is individually wrapped in moisture-resistant bubble wrap and sealed in rigid, heavy-duty cardboard book mailers to prevent corner denting and weather damage during transit.'
      }
    ]
  },
  {
    category: 'Returns & Refunds',
    icon: RotateCcw,
    items: [
      {
        q: 'What is your return policy?',
        a: 'We offer a 7-day return and replacement policy from the date of parcel delivery. If you receive a damaged copy, a book with printing errors or missing pages, or the wrong title, we will replace it free of cost or issue a 100% refund.'
      },
      {
        q: 'How do I request a return or replacement?',
        a: 'Go to your account dashboard -> "Orders", select the delivered order, and click "Request Return / Replacement". Select the issue and submit. Our team will review and organize a reverse pickup within 24 hours.'
      },
      {
        q: 'How quickly will I receive my refund?',
        a: 'For prepaid online orders, refunds are credited automatically back to your original UPI or bank card via Razorpay. UPI refunds usually reflect within 2 to 4 hours, and bank cards within 1 to 3 business days.'
      },
      {
        q: 'Can I cancel an order before it is dispatched?',
        a: 'Yes. You can cancel any order prior to dispatch directly from your "Orders" tab. If already paid online, our system initiates an instant full refund through the gateway.'
      }
    ]
  },
  {
    category: 'Publishing with LOGOS',
    icon: BookOpen,
    items: [
      {
        q: 'Can I submit my book manuscript to LOGOS Books for publication?',
        a: 'Yes! LOGOS Books actively welcomes literary manuscripts in Malayalam and English across Fiction, Novels, Poetry, Philosophy, Essays, and Children\'s literature. Please visit our Contact page or email your manuscript synopsis and sample chapters to publishinglogosbooks@gmail.com.'
      },
      {
        q: 'Does LOGOS publish Malayalam translations of world literature?',
        a: 'Yes. Authorized translation of world classics and contemporary regional masterpieces into Malayalam is one of our core publishing pillars.'
      },
      {
        q: 'Do you offer bulk orders for schools, colleges, and public libraries?',
        a: 'Yes, we provide institutional pricing and custom library curation services for educational institutions and community libraries. Reach out to us via WhatsApp at +91 80861 26024.'
      }
    ]
  }
];

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedIndex, setExpandedIndex] = useState('0-0'); // first item open by default

  const toggleItem = (key) => {
    setExpandedIndex(expandedIndex === key ? null : key);
  };

  const filteredCategories = FAQ_DATA.map((cat) => {
    const matchingItems = cat.items.filter(
      (item) =>
        item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.a.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return { ...cat, items: matchingItems };
  }).filter((cat) => cat.items.length > 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFBFD] text-slate-800">
      <Navbar />

      <main className="flex-1 w-full pt-28 sm:pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6 font-light">
            <Link href="/" className="hover:text-slate-700 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[#1044A5] font-medium">FAQ</span>
          </nav>

          {/* Header */}
          <header className="text-center mb-8 sm:mb-10 space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#1044A5] border border-blue-100">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Help Center &amp; Reader Support</span>
            </span>
            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Find instant answers to common questions about orders, delivery, refunds, and publishing.
            </p>

            {/* Quick Search */}
            <div className="pt-2 max-w-md mx-auto relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search questions (e.g. tracking, COD, refund)..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1044A5]/20 focus:border-[#1044A5] shadow-xs"
              />
            </div>
          </header>

          {/* FAQ Sections */}
          <div className="space-y-8">
            {filteredCategories.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl text-center border border-slate-200">
                <p className="text-sm text-slate-500">No questions matched &ldquo;{searchTerm}&rdquo;.</p>
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="mt-3 text-xs font-semibold text-[#1044A5] underline"
                >
                  Clear search query
                </button>
              </div>
            ) : (
              filteredCategories.map((category, catIdx) => {
                const CategoryIcon = category.icon;
                return (
                  <div key={category.category} className="space-y-3">
                    <div className="flex items-center gap-2 pb-1 border-b border-slate-200/80">
                      <CategoryIcon className="w-4 h-4 text-[#1044A5]" />
                      <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                        {category.category}
                      </h2>
                    </div>

                    <div className="space-y-2.5">
                      {category.items.map((item, itemIdx) => {
                        const key = `${catIdx}-${itemIdx}`;
                        const isOpen = expandedIndex === key;
                        return (
                          <div
                            key={item.q}
                            className={`rounded-xl border transition-all duration-150 overflow-hidden bg-white ${
                              isOpen
                                ? 'border-[#1044A5]/40 shadow-xs'
                                : 'border-slate-200/80 hover:border-slate-300'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => toggleItem(key)}
                              className="w-full p-4 text-left flex items-center justify-between gap-3 cursor-pointer"
                            >
                              <span className={`text-xs sm:text-sm font-semibold transition-colors ${
                                isOpen ? 'text-[#1044A5]' : 'text-slate-900'
                              }`}>
                                {item.q}
                              </span>
                              {isOpen ? (
                                <ChevronUp className="w-4 h-4 text-[#1044A5] shrink-0" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                              )}
                            </button>

                            {isOpen && (
                              <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/40">
                                {item.a}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Contact Support Banner */}
          <div className="mt-12 p-6 bg-gradient-to-r from-blue-900 to-[#070F1E] rounded-2xl text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-sm sm:text-base font-bold">Have another question?</h3>
              <p className="text-xs text-blue-200">
                Our support team is here to assist you via WhatsApp or Email.
              </p>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <a
                href="https://wa.me/918086126024"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp Us</span>
              </a>
              <Link
                href="/contact"
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition-colors border border-white/20"
              >
                Contact Page
              </Link>
            </div>
          </div>

          <div className="pt-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#1044A5] hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Homepage
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

