'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';

export default function SignupPage() {
  const router = useRouter();
  const { register, loginWithGoogle } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    referralCode: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(formData);
      router.push('/');
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const mockGoogle = {
        name: formData.name || 'Logos Reader',
        email: formData.email || 'reader@logosbooks.com',
        googleId: 'g_' + Math.random().toString(36).substring(2, 9),
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'
      };
      await loginWithGoogle(mockGoogle);
      router.push('/');
    } catch (err) {
      setError(err.message || 'Google Sign-up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-slate-950 selection:bg-[#1E3A8A] selection:text-white overflow-hidden py-10">
      {/* Background with Atmospheric Bookstore Imagery & Gradient Overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1507842229458-5742445e43c7?q=80&w=2000&auto=format&fit=crop"
          alt="Logos Bookstore Ambiance"
          className="w-full h-full object-cover object-center scale-105 filter brightness-[0.38] contrast-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-slate-950/80 backdrop-blur-[2px]" />
      </div>

      {/* Main Auth Card */}
      <div className="relative z-10 w-full max-w-[430px] bg-white/95 backdrop-blur-md rounded-2xl p-7 sm:p-9 shadow-2xl shadow-black/40 border border-white/40">
        {/* LOGOS Logo */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-block transition-transform hover:scale-105">
            <img
              src="/logo.png"
              alt="LOGOS Books"
              className="h-10 sm:h-11 w-auto mx-auto object-contain"
            />
          </Link>
          <h1 className="text-xl sm:text-2xl font-normal text-slate-900 tracking-tight mt-3">
            Create Account
          </h1>
        </div>

        {error && (
          <div className="mb-5 p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1 tracking-wider uppercase">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Your full name"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-light text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1 tracking-wider uppercase">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-light text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1 tracking-wider uppercase">
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-light text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1 tracking-wider uppercase">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-light text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-[11px] px-1"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* Referral Code Field */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-medium text-slate-700 tracking-wider uppercase">
                Referral Code (Optional)
              </label>
              <span className="text-[10px] text-emerald-600 font-medium">
                15% OFF 1st Order
              </span>
            </div>
            <input
              type="text"
              name="referralCode"
              value={formData.referralCode}
              onChange={handleChange}
              placeholder="e.g. LOGOS-XXXX"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono uppercase text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-[#1E3A8A] hover:bg-[#152e72] text-white rounded-xl text-xs font-medium tracking-wide transition-all shadow-md shadow-blue-950/20 hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-4 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <span className="relative px-3 bg-white text-[11px] font-light text-slate-400">
            or continue with
          </span>
        </div>

        {/* Google Sign In */}
        <button
          type="button"
          onClick={handleDemoGoogleLogin}
          disabled={loading}
          className="w-full py-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-normal transition-all flex items-center justify-center gap-2.5 shadow-xs"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Google Account</span>
        </button>

        {/* Login Link */}
        <div className="mt-5 text-center text-xs font-light text-slate-500">
          Already have an account?{' '}
          <Link
            href="/auth/login"
            className="text-[#1E3A8A] font-medium hover:underline"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
