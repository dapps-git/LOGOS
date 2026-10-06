'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import GoogleAuthButton from '../../../components/GoogleAuthButton';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    referralCode: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showReferralInput, setShowReferralInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-detect and preserve referral code across page reloads
  React.useEffect(() => {
    try {
      const codeFromQuery = searchParams.get('ref') || searchParams.get('referralCode');
      const codeFromStorage = typeof window !== 'undefined' ? localStorage.getItem('logos_referral_code') : null;
      const effectiveCode = (codeFromQuery || codeFromStorage || '').trim().toUpperCase();

      if (effectiveCode) {
        setFormData((prev) => ({ ...prev, referralCode: effectiveCode }));
        setShowReferralInput(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem('logos_referral_code', effectiveCode);
          sessionStorage.setItem('logos_referral_code', effectiveCode);
          document.cookie = `logos_ref=${effectiveCode}; path=/; max-age=2592000; SameSite=Lax`;
        }
      }
    } catch {}
  }, [searchParams]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Phone validation (10 digits)
    const cleanPhone = String(formData.phone || '').replace(/\D/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length < 10) {
      setError('Please provide a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      await register({
        ...formData,
        phone: cleanPhone
      });
      if (typeof window !== 'undefined') {
        localStorage.removeItem('logos_referral_code');
      }
      router.push(redirect);
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 w-full max-w-[410px] bg-white/95 sm:bg-white/90 backdrop-blur-md rounded-xl p-5 sm:p-7 shadow-2xl shadow-slate-900/15 border border-white/80 my-auto">
      {/* LOGOS Logo & Title */}
      <div className="text-center mb-4">
        <Link href="/" className="inline-block transition-transform hover:scale-105">
          <img
            src="/logo.png"
            alt="LOGOS Books"
            className="h-8 sm:h-9 w-auto mx-auto object-contain"
          />
        </Link>
        <h1 className="text-lg sm:text-xl font-normal text-slate-900 tracking-tight mt-1.5">
          Create Account
        </h1>
        {redirect === '/checkout' && (
          <p className="text-[11px] text-[#1E3A8A] font-medium mt-1 bg-blue-50/70 border border-blue-100 rounded-md py-1 px-2">
            Sign up to complete your purchase
          </p>
        )}
      </div>

      {error && (
        <div className="mb-3 p-2.5 bg-red-50 border border-red-100 text-red-600 text-[11px] rounded-lg flex items-center gap-2">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-2.5">
        <div>
          <label className="block text-[10px] font-medium text-slate-700 mb-0.5 tracking-wider uppercase">
            Full Name
          </label>
          <input
            type="text"
            required
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Aifa Sana"
            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-light text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] transition-all"
          />
        </div>

        <div>
          <label className="block text-[10px] font-medium text-slate-700 mb-0.5 tracking-wider uppercase">
            Email Address
          </label>
          <input
            type="email"
            required
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-light text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] transition-all"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-0.5">
            <label className="block text-[10px] font-medium text-slate-700 tracking-wider uppercase">
              Mobile Number <span className="text-rose-500">*</span>
            </label>
            <span className="text-[9px] text-slate-400">10 digits required</span>
          </div>
          <input
            type="tel"
            required
            maxLength={10}
            name="phone"
            value={formData.phone}
            onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
            placeholder="9876543210"
            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-light text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] transition-all"
          />
        </div>

        <div>
          <label className="block text-[10px] font-medium text-slate-700 mb-0.5 tracking-wider uppercase">
            Password <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-light text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-[10px] px-1"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {/* Referral Code Section */}
        <div className="pt-0.5">
          {!showReferralInput ? (
            <button
              type="button"
              onClick={() => setShowReferralInput(true)}
              className="text-[10px] text-[#1E3A8A] hover:underline font-light flex items-center gap-1"
            >
              <span>+ Have a friend&apos;s referral code? (15% OFF)</span>
            </button>
          ) : (
            <div className="p-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-lg space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-semibold text-emerald-900 tracking-wider uppercase">
                  Friend&apos;s Referral Code
                </label>
                <span className="text-[10px] text-emerald-700 font-semibold bg-white px-2 py-0.5 rounded border border-emerald-200 shadow-2xs">
                  15% OFF 1st Order
                </span>
              </div>
              <input
                type="text"
                name="referralCode"
                value={formData.referralCode}
                onChange={(e) => setFormData((prev) => ({ ...prev, referralCode: e.target.value.toUpperCase() }))}
                placeholder="LOGOS-XXXXX"
                className="w-full px-3 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-mono uppercase text-emerald-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-semibold"
              />
              <p className="text-[9.5px] text-emerald-700/80 font-normal">
                You will receive 15% discount on your first book order!
              </p>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-1.5 py-2.5 px-4 bg-[#1E3A8A] hover:bg-[#152e72] text-white rounded-lg text-xs font-medium tracking-wide transition-all shadow-md shadow-blue-950/20 hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-3 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <span className="relative px-2.5 bg-white text-[10px] font-light text-slate-400">
          or continue with
        </span>
      </div>

      {/* Google Sign In */}
      <GoogleAuthButton text="Sign up with Google" referralCode={formData.referralCode} />

      {/* Login Link */}
      <div className="mt-3.5 text-center text-[11px] font-light text-slate-500">
        Already have an account?{' '}
        <Link
          href={`/auth/login${redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
          className="text-[#1E3A8A] font-medium hover:underline"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-3 sm:p-4 bg-[#F8FAFC] selection:bg-[#1E3A8A] selection:text-white overflow-hidden">
      {/* Background with Bookstore Imagery */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src="/auth_bg.jpg"
          alt="LOGOS Study & Reading Room"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px]" />
      </div>

      <Suspense fallback={<div className="text-slate-400 text-xs">Loading...</div>}>
        <SignupForm />
      </Suspense>
    </div>
  );
}
