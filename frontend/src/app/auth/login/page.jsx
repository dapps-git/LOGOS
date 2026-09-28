'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithGoogle } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const mockGoogle = {
        name: 'Logos Reader',
        email: email || 'reader@logosbooks.com',
        googleId: 'g_' + Math.random().toString(36).substring(2, 9),
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'
      };
      await loginWithGoogle(mockGoogle);
      router.push('/');
    } catch (err) {
      setError(err.message || 'Google Sign-in failed');
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

      {/* Main Auth Card (Compact) */}
      <div className="relative z-10 w-full max-w-[390px] bg-white/95 sm:bg-white/90 backdrop-blur-md rounded-2xl p-5 sm:p-7 shadow-2xl shadow-slate-900/15 border border-white/80 my-auto">
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
            Welcome Back
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
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[10px] font-medium text-slate-700 mb-0.5 tracking-wider uppercase">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-light text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] transition-all"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-0.5">
              <label className="block text-[10px] font-medium text-slate-700 tracking-wider uppercase">
                Password
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-[10px] text-[#1E3A8A] hover:underline font-light"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-1.5 py-2.5 px-4 bg-[#1E3A8A] hover:bg-[#152e72] text-white rounded-xl text-xs font-medium tracking-wide transition-all shadow-md shadow-blue-950/20 hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Sign In'
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
        <button
          type="button"
          onClick={handleDemoGoogleLogin}
          disabled={loading}
          className="w-full py-2 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-normal transition-all flex items-center justify-center gap-2 shadow-xs"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
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

        {/* Signup Link */}
        <div className="mt-3.5 text-center text-[11px] font-light text-slate-500">
          Don&apos;t have an account?{' '}
          <Link
            href="/auth/signup"
            className="text-[#1E3A8A] font-medium hover:underline"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
