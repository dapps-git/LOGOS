'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ReferralCapture() {
  const searchParams = useSearchParams();

  useEffect(() => {
    try {
      const refCode = searchParams.get('ref') || searchParams.get('referralCode');
      if (refCode && typeof refCode === 'string') {
        const cleaned = refCode.trim().toUpperCase();
        if (cleaned) {
          localStorage.setItem('logos_referral_code', cleaned);
          sessionStorage.setItem('logos_referral_code', cleaned);
          // Set cookie expiring in 30 days
          document.cookie = `logos_ref=${cleaned}; path=/; max-age=2592000; SameSite=Lax`;
        }
      }
    } catch (e) {
      // Ignore in SSR / restricted storage environments
    }
  }, [searchParams]);

  return null;
}
