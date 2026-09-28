'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { customerResetPassword } from '../../../lib/api';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const qEmail = searchParams.get('email');
    if (qEmail) setEmail(qEmail);
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await customerResetPassword(email, otp, newPassword);
      setSuccess(true);
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please check your OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 w-full max-w-[420px] bg-white/95 backdrop-blur-md rounded-2xl p-7 sm:p-9 shadow-2xl shadow-black/40 border border-white/40">
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
          Set New Password
        </h1>
      </div>

      {error && (
        <div className="mb-5 p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl flex items-center gap-2">
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-5 p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
          <span>Password reset successfully! Redirecting to login...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[11px] font-medium text-slate-700 mb-1 tracking-wider uppercase">
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-light text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] transition-all"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-700 mb-1 tracking-wider uppercase">
            6-Digit OTP Code
          </label>
          <input
            type="text"
            required
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="123456"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono tracking-widest text-center text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] transition-all"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-700 mb-1 tracking-wider uppercase">
            New Password
          </label>
          <input
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 6 characters"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-light text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={loading || success}
          className="w-full mt-2 py-3 px-4 bg-[#1E3A8A] hover:bg-[#152e72] text-white rounded-xl text-xs font-medium tracking-wide transition-all shadow-md shadow-blue-950/20 hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            'Update Password'
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-xs font-light text-slate-500">
        <Link
          href="/auth/login"
          className="text-[#1E3A8A] font-medium hover:underline"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-slate-950 selection:bg-[#1E3A8A] selection:text-white overflow-hidden">
      {/* Background with Atmospheric Bookstore Imagery */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1507842229458-5742445e43c7?q=80&w=2000&auto=format&fit=crop"
          alt="Logos Bookstore Ambiance"
          fill
          priority
          className="object-cover object-center scale-105 filter brightness-[0.38] contrast-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-slate-950/80 backdrop-blur-[2px]" />
      </div>

      <Suspense fallback={<div className="text-white text-xs">Loading...</div>}>
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}
