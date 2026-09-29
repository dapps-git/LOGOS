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
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '953716847863-2vv7cabbbmm2k2hcm4vdsijrvcumavcj.apps.googleusercontent.com';

    const initializeGsi = () => {
      if (typeof window !== 'undefined' && window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true
          });

          if (googleBtnRef.current) {
            googleBtnRef.current.innerHTML = '';
            window.google.accounts.id.renderButton(googleBtnRef.current, {
              type: 'standard',
              theme: 'outline',
              size: 'large',
              text: 'continue_with',
              shape: 'rectangular',
              logo_alignment: 'left',
              width: googleBtnRef.current.offsetWidth || 340
            });
          }
        } catch (err) {
          console.warn('[GSI Init Warning]', err?.message);
        }
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
    if (typeof window !== 'undefined' && window.google?.accounts?.id && process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // If FedCM was dismissed or skipped, no error thrown
        }
      });
    } else {
      // Fallback in case Google API is not yet loaded or client ID pending
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

      {/* Google GSI Native Render Container */}
      <div ref={googleBtnRef} className="w-full flex justify-center min-h-[40px]" />

      {/* Optional fallback button if script is loading or blocked */}
      <noscript>
        <button
          type="button"
          onClick={handleManualClick}
          className="w-full py-2.5 px-4 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-medium"
        >
          {text}
        </button>
      </noscript>
    </div>
  );
}
