'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import GoogleAuthButton from '../../../components/GoogleAuthButton';

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
  const [showReferralInput, setShowReferralInput] = useState(false);
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
    <div className="relative min-h-screen flex items-center justify-center p-3 sm:p-4 bg-[#F8FAFC] selection:bg-[#1E3A8A] selection:text-white overflow-hidden">
      {/* Background with User Provided Bookstore Desk Imagery */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src="/auth_bg.jpg"
          alt="LOGOS Study & Reading Room"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px]" />
      </div>

      {/* Main Auth Card (Compact & Streamlined) */}
      <div className="relative z-10 w-full max-w-[400px] bg-white/95 sm:bg-white/90 backdrop-blur-md rounded-2xl p-5 sm:p-7 shadow-2xl shadow-slate-900/15 border border-white/80 my-auto">
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
        </div>

        {error && (
          <div className="mb-3 p-2.5 bg-red-50 border border-red-100 text-red-600 text-[11px] rounded-xl flex items-center gap-2">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-2.5">
          {/* Row 1: Name & Phone (2 Cols for compact space) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-medium text-slate-700 mb-0.5 tracking-wider uppercase">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-light text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-slate-700 mb-0.5 tracking-wider uppercase">
                Phone <span className="text-slate-400 lowercase">(optional)</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Mobile no."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-light text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] transition-all"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-[10px] font-medium text-slate-700 mb-0.5 tracking-wider uppercase">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-light text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] transition-all"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-[10px] font-medium text-slate-700 mb-0.5 tracking-wider uppercase">
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
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-light text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] transition-all"
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

          {/* Collapsible Referral Code Toggle */}
          <div className="pt-0.5">
            {!showReferralInput ? (
              <button
                type="button"
                onClick={() => setShowReferralInput(true)}
                className="text-[11px] text-[#1E3A8A] hover:underline flex items-center gap-1 font-light"
              >
                <span>+ Have a friend&apos;s referral code? (15% OFF)</span>
              </button>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <label className="text-[10px] font-medium text-slate-700 tracking-wider uppercase">
                    Referral Code
                  </label>
                  <span className="text-[10px] text-emerald-600 font-medium">15% OFF 1st Order</span>
                </div>
                <input
                  type="text"
                  name="referralCode"
                  value={formData.referralCode}
                  onChange={handleChange}
                  placeholder="LOGOS-XXXX"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono uppercase text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] transition-all"
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-1.5 py-2.5 px-4 bg-[#1E3A8A] hover:bg-[#152e72] text-white rounded-xl text-xs font-medium tracking-wide transition-all shadow-md shadow-blue-950/20 hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
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
