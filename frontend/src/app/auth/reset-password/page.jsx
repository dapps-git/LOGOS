'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { customerResetPassword } from '../../../lib/api';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';

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
    <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-200/60 border border-slate-100">
      <div className="text-center mb-8">
        <span className="inline-block px-3 py-1 bg-blue-50 text-[#1E3A8A] text-xs font-medium rounded-full mb-3 tracking-wide">
          NEW PASSWORD
        </span>
        <h1 className="text-2xl sm:text-3xl font-normal text-slate-900 tracking-tight">
          Reset Password
        </h1>
        <p className="text-sm font-light text-slate-500 mt-2">
          Enter the OTP sent to your email along with your new password.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3.5 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl flex items-center gap-2">
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
          <span>Password reset successfully! Redirecting to login...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-normal text-slate-700 mb-1.5 uppercase tracking-wider">
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-3 bg-[#FAFBFD] border border-slate-200 rounded-xl text-sm font-light text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-normal text-slate-700 mb-1.5 uppercase tracking-wider">
            6-Digit OTP Code
          </label>
          <input
            type="text"
            required
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="123456"
            className="w-full px-4 py-3 bg-[#FAFBFD] border border-slate-200 rounded-xl text-sm font-mono tracking-widest text-center text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-normal text-slate-700 mb-1.5 uppercase tracking-wider">
            New Password
          </label>
          <input
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 6 characters"
            className="w-full px-4 py-3 bg-[#FAFBFD] border border-slate-200 rounded-xl text-sm font-light text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={loading || success}
          className="w-full mt-2 py-3.5 px-6 bg-[#1E3A8A] hover:bg-[#152e72] text-white rounded-xl text-sm font-medium tracking-wide transition-all shadow-md shadow-blue-900/10 hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            'Update Password'
          )}
        </button>
      </form>

      <div className="mt-8 text-center text-xs font-light text-slate-500">
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
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-28">
        <Suspense fallback={<div className="text-center py-10">Loading...</div>}>
          <ResetPasswordContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
