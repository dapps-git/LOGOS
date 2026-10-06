'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  fetchCart,
  apiAddToCart,
  apiUpdateCart,
  apiRemoveFromCart,
  apiValidateCoupon,
  apiValidateReferral
} from '../lib/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [appliedReferral, setAppliedReferral] = useState(null);
  const [useWalletBalance, setUseWalletBalance] = useState(false);

  const loadCart = useCallback(async () => {
    try {
      const cart = await fetchCart();
      if (cart && Array.isArray(cart.items)) {
        setItems(cart.items);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.warn('[CartContext] Load error:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart, user]);

  const addToCart = async (book, quantity = 1) => {
    try {
      const bookId = book._id || book.id;
      // Optimistic update
      setItems((prev) => {
        const existing = prev.find((item) => (item.book?._id || item.book) === bookId);
        if (existing) {
          return prev.map((item) =>
            (item.book?._id || item.book) === bookId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prev, { book, quantity, price: book.price || book.salePrice || 299 }];
      });

      const updated = await apiAddToCart(bookId, quantity);
      if (updated && updated.items) {
        setItems(updated.items);
      }
      return true;
    } catch (err) {
      console.error('[CartContext] Add error:', err.message);
      loadCart();
      return false;
    }
  };

  const updateQuantity = async (bookId, quantity) => {
    if (quantity <= 0) {
      return removeFromCart(bookId);
    }
    try {
      setItems((prev) =>
        prev.map((item) =>
          (item.book?._id || item.book?.id || item.book) === bookId
            ? { ...item, quantity }
            : item
        )
      );
      const updated = await apiUpdateCart(bookId, quantity);
      if (updated && updated.items) setItems(updated.items);
    } catch (err) {
      console.error('[CartContext] Update error:', err.message);
      loadCart();
    }
  };

  const removeFromCart = async (bookId) => {
    try {
      setItems((prev) =>
        prev.filter((item) => (item.book?._id || item.book?.id || item.book) !== bookId)
      );
      const updated = await apiRemoveFromCart(bookId);
      if (updated && updated.items) setItems(updated.items);
    } catch (err) {
      console.error('[CartContext] Remove error:', err.message);
      loadCart();
    }
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    setAppliedReferral(null);
  };

  // Calculations
  const subtotal = items.reduce((acc, item) => {
    const p = item.price || item.book?.salePrice || item.book?.price || 0;
    return acc + p * item.quantity;
  }, 0);

  const originalTotal = items.reduce((acc, item) => {
    const op = item.book?.originalPrice || item.book?.price || item.price || 0;
    return acc + op * item.quantity;
  }, 0);

  const productSavings = Math.max(0, originalTotal - subtotal);

  // Coupon Discount
  let couponDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      couponDiscount = Math.round((subtotal * (appliedCoupon.discountValue || 0)) / 100);
      if (appliedCoupon.maxDiscount && couponDiscount > appliedCoupon.maxDiscount) {
        couponDiscount = appliedCoupon.maxDiscount;
      }
    } else {
      couponDiscount = Math.min(subtotal, appliedCoupon.discountValue || 0);
    }
  }

  // Referral Discount (15% on first purchase for referred users or when applied)
  let referralDiscount = 0;
  if (appliedReferral || (user?.isReferred && !user?.referralDiscountUsed)) {
    referralDiscount = Math.round((subtotal * 15) / 100);
  }

  // Wallet deduction
  let walletDiscount = 0;
  if (useWalletBalance && user?.referralRewardBalance > 0) {
    const remainingAfterDiscounts = Math.max(0, subtotal - couponDiscount - referralDiscount);
    walletDiscount = Math.min(remainingAfterDiscounts, user.referralRewardBalance);
  }

  const shippingFee = subtotal > 499 || subtotal === 0 ? 0 : 40;
  const totalDiscounts = Math.min(subtotal, couponDiscount + referralDiscount + walletDiscount);
  const grandTotal = Math.max(0, subtotal - totalDiscounts + shippingFee);
  const totalSavings = productSavings + totalDiscounts;
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const applyCouponCode = async (code) => {
    try {
      const res = await apiValidateCoupon(code, subtotal);
      const couponObj = res.coupon || {
        code: res.code || code,
        discountType: res.discountType,
        discountValue: res.discountValue,
        discountAmount: res.discountAmount,
        maxDiscount: res.maxDiscount
      };
      if (res && (res.success || res.coupon || res.code)) {
        setAppliedCoupon(couponObj);
        return { success: true, message: res.message || `Coupon ${code} applied successfully!` };
      }
      return { success: false, message: res.message || 'Invalid coupon code' };
    } catch (err) {
      return { success: false, message: err.message || 'Coupon could not be applied' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const applyReferralCode = async (code) => {
    try {
      const res = await apiValidateReferral(code);
      if (res && (res.valid || res.success)) {
        setAppliedReferral({ code: res.code || code, discountPercent: 15 });
        return { success: true, message: 'Referral code applied! 15% discount activated.' };
      }
      return { success: false, message: res.message || 'Invalid referral code' };
    } catch (err) {
      return { success: false, message: err.message || 'Referral could not be applied' };
    }
  };

  const removeReferral = () => {
    setAppliedReferral(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        loading,
        subtotal,
        originalTotal,
        productSavings,
        couponDiscount,
        referralDiscount,
        walletDiscount,
        shippingFee,
        grandTotal,
        totalSavings,
        appliedCoupon,
        appliedReferral,
        useWalletBalance,
        setUseWalletBalance,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCouponCode,
        removeCoupon,
        applyReferralCode,
        removeReferral,
        refreshCart: loadCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
};
