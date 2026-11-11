'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Truck, Package, ShieldCheck, MapPin } from 'lucide-react';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFBFD] text-slate-800">
      <Navbar />

      <main className="flex-1 w-full pt-28 sm:pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6 font-light">
            <Link href="/" className="hover:text-slate-700 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[#1044A5] font-medium">Shipping &amp; Delivery</span>
          </nav>

          <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-xs border border-slate-200/80">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1044A5] mb-2">
              <Truck className="w-4 h-4" />
              <span>Reliable Pan-India Delivery</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mb-2">
              Shipping &amp; Delivery Policy
            </h1>
            <p className="text-xs text-slate-400 mb-8">Fast, secure, and moisture-protected book packaging</p>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
              <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100 flex items-start gap-2.5">
                <Truck className="w-4 h-4 text-[#1044A5] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">FREE Shipping</h4>
                  <p className="text-[11px] text-slate-600">On all online prepaid orders</p>
                </div>
              </div>
              <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-start gap-2.5">
                <Package className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">24-48 Hours Dispatch</h4>
                  <p className="text-[11px] text-slate-600">From our Kerala fulfillment hub</p>
                </div>
              </div>
              <div className="p-3.5 bg-purple-50/60 rounded-xl border border-purple-100 flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Pan-India Reach</h4>
                  <p className="text-[11px] text-slate-600">Kerala, Tamil Nadu, Karnataka &amp; all states</p>
                </div>
              </div>
            </div>

            <div className="space-y-6 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <section>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-2">1. Delivery Charges &amp; Free Shipping</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                    <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Payment Method</th>
                        <th className="p-2.5">Order Value</th>
                        <th className="p-2.5">Shipping Fee</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600">
                      <tr>
                        <td className="p-2.5 font-medium text-slate-900">Online Prepaid (UPI / Razorpay / Cards)</td>
                        <td className="p-2.5">Any amount</td>
                        <td className="p-2.5 text-emerald-600 font-bold">FREE (₹0)</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium text-slate-900">Cash on Delivery (COD)</td>
                        <td className="p-2.5">₹1,000 or more</td>
                        <td className="p-2.5 text-emerald-600 font-bold">FREE (₹0)</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium text-slate-900">Cash on Delivery (COD)</td>
                        <td className="p-2.5">Under ₹1,000</td>
                        <td className="p-2.5 text-slate-700">Nominal 2% handling fee</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-2">2. Delivery Timelines</h2>
                <p>
                  We partner with top-tier courier networks including <strong>India Post Speed Post</strong>, <strong>DTDC</strong>, and <strong>Professional Couriers</strong> to reach every corner of India:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 pt-2">
                  <li><strong>Within Kerala:</strong> Typically delivered within <strong>2 to 4 business days</strong>.</li>
                  <li><strong>South India (Tamil Nadu, Karnataka, Andhra, Telangana):</strong> Typically <strong>3 to 5 business days</strong>.</li>
                  <li><strong>Rest of India:</strong> Typically <strong>4 to 7 business days</strong>.</li>
                  <li>Remote rural locations serviced via India Post may take up to 8 business days.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-2">3. Real-Time Tracking</h2>
                <p>
                  As soon as your package is dispatched from our warehouse, you will receive an automatic dispatch SMS and email containing your active courier tracking number (AWB) and live tracking link. You can also monitor real-time delivery status under your <Link href="/profile" className="text-[#1044A5] underline font-medium">Account Orders</Link> tab.
                </p>
              </section>

              <section>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-2">4. Damage-Proof Packaging</h2>
                <p>
                  Every book edition is wrapped in heavy-gauge water-resistant bubble lining and enclosed in rigid corrugated book mailers. This guarantees pristine book corners, clean dust jackets, and zero moisture damage during transit.
                </p>
              </section>

              <section>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-2">5. Delivery Support &amp; Queries</h2>
                <p>
                  Have questions about an upcoming parcel delivery? Contact our fulfillment desk:
                </p>
                <div className="pt-2 text-xs text-slate-700 space-y-1">
                  <p><strong>Dispatch Support:</strong> publishinglogosbooks@gmail.com</p>
                  <p><strong>Track via WhatsApp:</strong> +91 80861 26024</p>
                  <p><strong>Working Hours:</strong> Monday – Saturday (9:30 AM – 6:30 PM)</p>
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

