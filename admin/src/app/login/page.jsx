'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Lock, Mail, ArrowRight, ShieldCheck, Eye, EyeOff, CheckCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, loading } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('logosadmin@gmail.com');
  const [password, setPassword] = useState('LogosAdmin@2026');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      showToast('Admin sign-in successful. Welcome to LOGOS Central Dashboard!', 'success');
      router.push('/');
    } catch (err) {
      showToast(err.message || 'Invalid admin credentials', 'error');
    }
  };

  const handleFillCredentials = (fillEmail, fillPass) => {
    setEmail(fillEmail);
    setPassword(fillPass);
    showToast('Credentials filled. Click Sign In to continue.', 'info');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-3.5 sm:p-6 lg:p-8">
      {/* 2-Column Card Container */}
      <div className="w-full max-w-4xl bg-white rounded-3xl border border-slate-200/80 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        {/* LEFT COLUMN: Atmospheric Bookstore Imagery */}
        <div className="hidden lg:flex lg:col-span-5 relative bg-[#0f172a] text-white flex-col justify-between p-8 overflow-hidden">
          {/* Background Image with Fallback */}
          <img
            src="https://images.unsplash.com/photo-1507842229458-5742445e43c7?q=80&w=1200&auto=format&fit=crop"
            alt="LOGOS Bookstore Architecture"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/banner.png';
            }}
            className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-luminosity scale-105"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B] via-[#1E3A8A]/50 to-transparent" />

          {/* Top Brand Tag */}
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[11px] font-medium tracking-wide text-white border border-white/15">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LOGOS Control Center
            </span>
          </div>

          {/* Bottom Caption */}
          <div className="relative z-10 space-y-2">
            <h2 className="text-xl font-normal text-white leading-snug tracking-tight">
              Curating Stories & Empowering Readers
            </h2>
            <p className="text-xs text-slate-300 font-light leading-relaxed">
              Complete management for catalog, hero slider banners, customer rewards, and real-time orders.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Sign In Form & LOGOS Logo */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
          <div className="space-y-6">
            {/* Header with ONLY LOGOS Logo */}
            <div className="text-left space-y-2">
              <img
                src="/logo.png"
                alt="LOGOS Logo"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/book1.jpg';
                }}
                className="h-10 sm:h-12 w-auto object-contain mb-3"
              />
              <h1 className="text-xl sm:text-2xl font-normal tracking-tight text-slate-900">
                Admin Sign In
              </h1>
              <p className="text-xs text-slate-400 font-light">
                Enter your verified credentials to access the central bookstore console.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1.5 text-xs">
                  Admin Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="logosadmin@gmail.com"
                    className="w-full pl-10 pr-3.5 py-3 bg-[#FAFBFD] border border-slate-200 rounded-xl text-xs font-normal text-slate-800 outline-none focus:border-[#1E3A8A] focus:bg-white focus:ring-2 focus:ring-[#1E3A8A]/15 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1.5 text-xs">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-[#FAFBFD] border border-slate-200 rounded-xl text-xs font-normal text-slate-800 outline-none focus:border-[#1E3A8A] focus:bg-white focus:ring-2 focus:ring-[#1E3A8A]/15 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-[#1E3A8A] hover:bg-[#152e72] text-white font-medium text-xs tracking-wide shadow-md shadow-blue-900/15 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Verified Admin Credentials Info Card */}
          <div className="mt-6 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 text-[11px] text-slate-700 space-y-1.5">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200/70">
              <span className="font-medium text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Default Credentials
              </span>
              <button
                type="button"
                onClick={() => handleFillCredentials('logosadmin@gmail.com', 'LogosAdmin@2026')}
                className="text-[10px] text-[#1E3A8A] font-medium hover:underline flex items-center gap-1"
              >
                <CheckCircle className="w-3 h-3 text-emerald-600" />
                Auto-fill
              </button>
            </div>
            <div className="space-y-0.5 font-mono text-[11px]">
              <p className="text-slate-500 font-light">
                Email: <span className="text-slate-800 font-medium select-all">logosadmin@gmail.com</span>
              </p>
              <p className="text-slate-500 font-light">
                Pass: <span className="text-slate-800 font-medium select-all">LogosAdmin@2026</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
