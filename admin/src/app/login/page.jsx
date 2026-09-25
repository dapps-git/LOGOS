'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { BookOpen, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, loading } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('admin@logos.com');
  const [password, setPassword] = useState('AdminPassword123');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      showToast('Admin sign-in successful. Welcome to LOGOS Dashboard!', 'success');
      router.push('/');
    } catch (err) {
      showToast(err.message || 'Invalid admin credentials', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg border border-slate-200 shadow-xl p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-md bg-emerald-50 border border-emerald-300 flex items-center justify-center text-emerald-800 mx-auto shadow-2xs">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900">LOGOS Admin Portal</h2>
          <p className="text-xs text-slate-500 font-medium">
            Sign in to manage catalog, hero banners, orders, and customer rewards.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-800 mb-1">Admin Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@logos.com"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-md font-medium outline-hidden focus:border-slate-900 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-md font-medium outline-hidden focus:border-slate-900 focus:bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Default Credentials Footer */}
        <div className="p-3.5 rounded-md bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 space-y-1">
          <p className="font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            JWT Authentication Enabled
          </p>
          <p className="text-emerald-800">Default Admin: <span className="font-mono font-semibold">admin@logos.com</span></p>
          <p className="text-emerald-800">Password: <span className="font-mono font-semibold">AdminPassword123</span></p>
        </div>
      </div>
    </div>
  );
}
