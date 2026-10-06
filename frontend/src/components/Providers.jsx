'use client';

import React, { Suspense } from 'react';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { WishlistProvider } from '../context/WishlistContext';
import ReferralCapture from './ReferralCapture';

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <Suspense fallback={null}>
            <ReferralCapture />
          </Suspense>
          {children}
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
