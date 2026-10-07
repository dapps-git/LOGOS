import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Terms & Conditions | LOGOS Books',
  description: 'Terms and Conditions for LOGOS Books publication and online bookstore.'
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-6 sm:p-10 rounded-2xl shadow-xs border border-slate-200">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[#1044A5] hover:underline mb-6 font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mb-4">
          Terms &amp; Conditions
        </h1>
        <p className="text-xs text-slate-400 mb-8">Last updated: October 2026</p>

        <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-slate-800 mb-2">1. Overview</h2>
            <p>
              Welcome to LOGOS Books. By accessing our website and placing an order, you agree to comply with and be bound by the following terms and conditions of use.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-800 mb-2">2. Orders &amp; Payments</h2>
            <p>
              All orders placed on our store are subject to product availability and confirmation of order details. We accept Cash on Delivery and online payments via Razorpay.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-800 mb-2">3. Shipping &amp; Delivery</h2>
            <p>
              We strive to dispatch books within 2-3 business days. Estimated delivery times may vary depending on destination pin codes.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-800 mb-2">4. Returns &amp; Refunds</h2>
            <p>
              Customers can request returns for damaged or incorrect books within 7 days of delivery. Approved refunds will be credited back to your original payment method or bank account.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-800 mb-2">5. Contact Information</h2>
            <p>
              For any inquiries regarding your orders or these terms, please contact us at publishinglogosbooks@gmail.com.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
