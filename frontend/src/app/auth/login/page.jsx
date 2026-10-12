'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import GoogleAuthButton from '../../../components/GoogleAuthButton';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push(redirect);
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 w-full max-w-[420px] bg-white rounded-3xl p-6 sm:p-8 shadow-2xl shadow-slate-900/10 border border-slate-100 my-auto">
      {/* Logos Logo */}
      <div className="text-center mb-4">
        <Link href="/" className="inline-block transition-transform hover:scale-105">
          <img
            src="/logo.png"
            alt="LOGOS Books"
            className="h-10 sm:h-12 w-auto mx-auto object-contain"
          />
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-2.5">
          Welcome Back
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-light">
          Sign in to continue your learning journey
        </p>

        {redirect === '/checkout' && (
          <p className="text-[11px] text-[#1044A5] font-medium mt-2 bg-blue-50/80 border border-blue-100 rounded-lg py-1 px-2.5">
            Please sign in to proceed with your order
          </p>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Address */}
        <div>
          <label className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-slate-500" />
            <span>Email Address</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              required
              autoFocus={false}
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full pl-10 pr-3.5 py-2.5 bg-[#FAFBFD] border border-slate-200 rounded-xl text-[16px] sm:text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1044A5]/20 focus:border-[#1044A5] transition-all"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Password</span>
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-xs text-[#1044A5] hover:underline font-medium"
            >
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              autoFocus={false}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-2.5 bg-[#FAFBFD] border border-slate-200 rounded-xl text-[16px] sm:text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1044A5]/20 focus:border-[#1044A5] transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Remember me */}
        <div className="flex items-center gap-2 pt-0.5">
          <input
            type="checkbox"
            id="rememberMe"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 text-[#1044A5] rounded border-slate-300 focus:ring-[#1044A5] cursor-pointer"
          />
          <label htmlFor="rememberMe" className="text-xs text-slate-600 select-none cursor-pointer">
            Remember me
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-[#1044A5] hover:bg-[#0c3986] text-white rounded-xl text-sm font-semibold tracking-wide transition-all shadow-md shadow-blue-900/15 hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-5 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <span className="relative px-3 bg-white text-xs font-light text-slate-400">
          or continue with
        </span>
      </div>

      {/* Google Sign In (With Full Text matching Mockup) */}
      <GoogleAuthButton
        text="Continue with Google"
        showText={true}
        redirect={redirect}
      />

      {/* Signup Link */}
      <div className="mt-5 text-center text-xs text-slate-500 font-light">
        Don&apos;t have an account?{' '}
        <Link
          href={`/auth/signup${redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
          className="text-[#1044A5] font-semibold hover:underline"
        >
          Create Account
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-amber-50/40 via-slate-50 to-blue-50/30 selection:bg-[#1044A5] selection:text-white overflow-hidden">
      {/* Background with Warm Ambient Texture */}
      <div className="absolute inset-0 z-0 overflow-hidden opacity-35">
        <img
          src="/auth_bg.jpg"
          alt="LOGOS Books"
          className="w-full h-full object-cover object-center filter blur-xs"
        />
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px]" />
      </div>

      <Suspense fallback={<div className="text-slate-400 text-xs">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
