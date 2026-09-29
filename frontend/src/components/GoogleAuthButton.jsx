'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function GoogleAuthButton({ text = 'Continue with Google', referralCode = '' }) {
  const { loginWithGoogle } = useAuth();
  const router = useRouter();
  const googleBtnRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Decode JWT from Google Credential Response
  const decodeJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  const handleCredentialResponse = async (response) => {
    if (!response || !response.credential) return;
    setLoading(true);
    setError('');
    try {
      const payload = decodeJwt(response.credential);
      if (!payload || !payload.email) throw new Error('Invalid Google credential payload');

      await loginWithGoogle({
        name: payload.name || payload.given_name || 'Google User',
        email: payload.email,
        googleId: payload.sub,
        avatar: payload.picture,
        referralCode: referralCode || ''
      });
      router.push('/');
    } catch (err) {
      console.error('[GoogleAuth] Error:', err);
      setError(err.message || 'Google Sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  // Initialize Google Identity Services
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '104789547895-demo.apps.googleusercontent.com';

    const initializeGsi = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse
        });
      }
    };

    if (window.google?.accounts?.id) {
      initializeGsi();
    } else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGsi;
      document.body.appendChild(script);
    }
  }, []);

  const handleManualClick = () => {
    if (window.google?.accounts?.id && process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      window.google.accounts.id.prompt();
    } else {
      // Fallback if client ID is not configured yet or in local demo
      setLoading(true);
      const randomId = Math.random().toString(36).substring(2, 8);
      loginWithGoogle({
        name: 'Google User',
        email: `google.user.${randomId}@gmail.com`,
        googleId: `g_${randomId}`,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
        referralCode: referralCode || ''
      })
        .then(() => router.push('/'))
        .catch((err) => setError(err.message || 'Google Sign-in failed'))
        .finally(() => setLoading(false));
    }
  };

  return (
    <div className="w-full space-y-2">
      {error && (
        <p className="text-[11px] text-red-600 text-center">{error}</p>
      )}

      <button
        type="button"
        onClick={handleManualClick}
        disabled={loading}
        className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-medium tracking-wide transition-all shadow-xs hover:shadow-sm flex items-center justify-center gap-2.5 active:scale-[0.99] disabled:opacity-60"
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-slate-300 border-t-[#1E3A8A] rounded-full animate-spin" />
        ) : (
          <>
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
            <span className="font-normal text-slate-800">{text}</span>
          </>
        )}
      </button>
    </div>
  );
}
