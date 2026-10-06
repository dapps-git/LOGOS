'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function RegisterRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    try {
      const refCode = searchParams.get('ref') || searchParams.get('referralCode');
      if (refCode) {
        const cleaned = refCode.trim().toUpperCase();
        localStorage.setItem('logos_referral_code', cleaned);
        sessionStorage.setItem('logos_referral_code', cleaned);
        document.cookie = `logos_ref=${cleaned}; path=/; max-age=2592000; SameSite=Lax`;
        router.replace(`/auth/signup?ref=${encodeURIComponent(cleaned)}`);
        return;
      }
    } catch {}
    router.replace('/auth/signup');
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="text-center space-y-2">
        <div className="w-8 h-8 border-3 border-[#1044A5]/30 border-t-[#1044A5] rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Activating your 15% referral discount...</p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]" />}>
      <RegisterRedirect />
    </Suspense>
  );
}
