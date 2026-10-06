'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { customerForgotPassword } from '../../../lib/api';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const data = await customerForgotPassword(email);
      setMessage(data.message || 'Verification code sent to your email!');
      if (data.otp || data.otpPreview) {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('logos_reset_otp', data.otp || data.otpPreview);
        }
      }
      setTimeout(() => {
        router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
      }, 1200);
    } catch (err) {
      setError(err.message || 'Could not send reset code. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-3 sm:p-4 bg-[#F8FAFC] selection:bg-[#1E3A8A] selection:text-white overflow-hidden">
      {/* Bookstore Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src="/auth_bg.jpg"
          alt="LOGOS Study & Reading Room"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px]" />
      </div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-[390px] bg-white/95 sm:bg-white/90 backdrop-blur-md rounded-xl p-5 sm:p-7 shadow-2xl shadow-slate-900/15 border border-white/80 my-auto">
        {/* LOGOS Logo */}
        <div className="text-center mb-5">
          <Link href="/" className="inline-block transition-transform hover:scale-105">
            <img
              src="/logo.png"
              alt="LOGOS Books"
              className="h-8 sm:h-9 w-auto mx-auto object-contain"
            />
          </Link>
          <h1 className="text-lg sm:text-xl font-normal text-slate-900 tracking-tight mt-2">
            Reset Password
          </h1>
          <p className="text-xs font-light text-slate-500 mt-1">
            Enter your registered email to receive a 6-digit OTP code
          </p>
        </div>

        {error && (
          <div className="mb-4 p-2.5 bg-red-50 border border-red-100 text-red-600 text-xs rounded-lg flex items-center gap-2">
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="mb-4 p-2.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs rounded-lg flex items-center gap-2">
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[10px] font-medium text-slate-700 mb-1 tracking-wider uppercase">
              Registered Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-light text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 bg-[#1E3A8A] hover:bg-[#152e72] text-white rounded-lg text-xs font-medium tracking-wide transition-all shadow-md shadow-blue-950/20 hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Send OTP Code'
            )}
          </button>
        </form>

        <div className="mt-5 text-center text-xs font-light text-slate-500">
          Remember your password?{' '}
          <Link
            href="/auth/login"
            className="text-[#1E3A8A] font-medium hover:underline"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
