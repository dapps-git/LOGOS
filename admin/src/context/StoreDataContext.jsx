'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  initialMockBooks,
  initialMockBanners,
  initialMockOrders,
  initialMockCoupons,
  initialMockReferrals,
  initialMockReturns,
  initialMockCustomers
} from '../api/mockData';
import { apiClient } from '../api/client';

const StoreDataContext = createContext(null);

export const StoreDataProvider = ({ children }) => {
  // Helper to remove legacy dummy mock objects from localStorage
  const sanitizeList = (list) => {
    if (!Array.isArray(list)) return [];
    return list.filter((item) => {
      if (!item || typeof item !== 'object') return false;
      const id = String(item._id || item.id || '');
      // If legacy mock ID like bk-1, ord-1, bnr-1, cpn-1, ref-1
      if (/^(bk|ord|bnr|cpn|ref|usr|cust)-[1-9]$/.test(id)) return false;
      return true;
    });
  };

  const [books, setBooks] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('logos_admin_books');
      if (saved) {
        try {
          return sanitizeList(JSON.parse(saved));
        } catch {}
      }
    }
    return initialMockBooks;
  });

  const [banners, setBanners] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('logos_admin_banners');
      if (saved) {
        try {
          return sanitizeList(JSON.parse(saved));
        } catch {}
      }
    }
    return initialMockBanners;
  });

  const [orders, setOrders] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('logos_admin_orders');
      if (saved) {
        try {
          return sanitizeList(JSON.parse(saved));
        } catch {}
      }
    }
    return initialMockOrders;
  });

  const [coupons, setCoupons] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('logos_admin_coupons');
      if (saved) {
        try {
          return sanitizeList(JSON.parse(saved));
        } catch {}
      }
    }
    return initialMockCoupons;
  });

  const [referrals, setReferrals] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('logos_admin_referrals');
      if (saved) {
        try {
          return sanitizeList(JSON.parse(saved));
        } catch {}
      }
    }
    return initialMockReferrals;
  });

  const [returnsList, setReturnsList] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('logos_admin_returns');
      if (saved) {
        try {
          return sanitizeList(JSON.parse(saved));
        } catch {}
      }
    }
    return initialMockReturns;
  });

  const [customers, setCustomers] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('logos_admin_customers');
      if (saved) {
        try {
          return sanitizeList(JSON.parse(saved));
        } catch {}
      }
    }
    return initialMockCustomers;
  });

  // Sync to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('logos_admin_books', JSON.stringify(books));
    }
  }, [books]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('logos_admin_banners', JSON.stringify(banners));
    }
  }, [banners]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('logos_admin_orders', JSON.stringify(orders));
    }
  }, [orders]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('logos_admin_coupons', JSON.stringify(coupons));
    }
  }, [coupons]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('logos_admin_referrals', JSON.stringify(referrals));
    }
  }, [referrals]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('logos_admin_returns', JSON.stringify(returnsList));
    }
  }, [returnsList]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('logos_admin_customers', JSON.stringify(customers));
    }
  }, [customers]);

  // Try fetching fresh data from backend
  useEffect(() => {
    const fetchBackendData = async () => {
      try {
        const bookData = await apiClient('/books?limit=100');
        if (Array.isArray(bookData?.books)) {
          setBooks(bookData.books);
        }
      } catch {}

      try {
        const bannerData = await apiClient('/banners/admin/all');
        if (Array.isArray(bannerData?.banners)) {
          setBanners(bannerData.banners);
        }
      } catch {}

      try {
        const orderData = await apiClient('/orders/admin/all');
        if (Array.isArray(orderData?.orders)) {
          setOrders(orderData.orders);
        }
      } catch {}

      try {
        const couponData = await apiClient('/coupons/admin/all');
        if (Array.isArray(couponData?.coupons)) {
          setCoupons(couponData.coupons);
        }
      } catch {}

      try {
        const referralData = await apiClient('/referrals/admin/all');
        if (Array.isArray(referralData?.referrals)) {
          setReferrals(referralData.referrals);
        }
      } catch {}

      try {
        const customerData = await apiClient('/auth/admin/customers');
        if (Array.isArray(customerData?.customers)) {
          setCustomers(customerData.customers);
        }
      } catch {}
    };

    fetchBackendData();
  }, []);

  // --- Actions ---
  const addBook = async (newBook) => {
    const id = `bk-${Date.now().toString().slice(-6)}`;
    const bookWithId = {
      ...newBook,
      _id: id,
      rating: newBook.rating || 5.0,
      reviewsCount: newBook.reviewsCount || 0,
      salesCount: 0,
      stockStatus: newBook.stock === 0 ? 'out_of_stock' : newBook.stock <= 5 ? 'low_stock' : 'in_stock',
      discountPercent: newBook.discountPrice && newBook.discountPrice < newBook.price
        ? Math.round(((newBook.price - newBook.discountPrice) / newBook.price) * 100)
        : 0
    };

    // Try backend
    try {
      const backendRes = await apiClient('/books', {
        method: 'POST',
        body: JSON.stringify(bookWithId)
      });
      if (backendRes?.book) {
        setBooks((prev) => [backendRes.book, ...prev]);
        return backendRes.book;
      }
    } catch {}

    setBooks((prev) => [bookWithId, ...prev]);
    return bookWithId;
  };

  const updateBook = async (id, updatedFields) => {
    const calculatedDiscount = updatedFields.price && updatedFields.discountPrice
      ? Math.round(((updatedFields.price - updatedFields.discountPrice) / updatedFields.price) * 100)
      : undefined;

    const stockStatus = updatedFields.stock !== undefined
      ? (updatedFields.stock === 0 ? 'out_of_stock' : updatedFields.stock <= 5 ? 'low_stock' : 'in_stock')
      : undefined;

    const merged = {
      ...updatedFields,
      ...(calculatedDiscount !== undefined ? { discountPercent: calculatedDiscount } : {}),
      ...(stockStatus !== undefined ? { stockStatus } : {})
    };

    // Try backend
    try {
      await apiClient(`/books/${id}`, {
        method: 'PUT',
        body: JSON.stringify(merged)
      });
    } catch {}

    setBooks((prev) => prev.map((b) => (b._id === id ? { ...b, ...merged } : b)));
  };

  const deleteBook = async (id) => {
    try {
      await apiClient(`/books/${id}`, { method: 'DELETE' });
    } catch {}
    setBooks((prev) => prev.filter((b) => b._id !== id));
  };

  // Banner Actions
  const addBanner = async (newBanner) => {
    const bannerWithId = {
      ...newBanner,
      _id: `bnr-${Date.now().toString().slice(-6)}`,
      order: banners.length + 1
    };

    try {
      const backendRes = await apiClient('/banners', {
        method: 'POST',
        body: JSON.stringify(bannerWithId)
      });
      if (backendRes?.banner) {
        setBanners((prev) => [...prev, backendRes.banner]);
        return backendRes.banner;
      }
    } catch {}

    setBanners((prev) => [...prev, bannerWithId]);
    return bannerWithId;
  };

  const updateBanner = async (id, updatedFields) => {
    try {
      await apiClient(`/banners/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedFields)
      });
    } catch {}
    setBanners((prev) => prev.map((b) => (b._id === id ? { ...b, ...updatedFields } : b)));
  };

  const deleteBanner = async (id) => {
    try {
      await apiClient(`/banners/${id}`, { method: 'DELETE' });
    } catch {}
    setBanners((prev) => prev.filter((b) => b._id !== id));
  };

  // Order Actions
  const updateOrderStatus = async (id, newStatus, note, trackingNumber) => {
    try {
      await apiClient(`/orders/admin/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus, note, trackingNumber })
      });
    } catch {}
    setOrders((prev) =>
      prev.map((o) => (o._id === id ? { ...o, orderStatus: newStatus, trackingNumber: trackingNumber || o.trackingNumber } : o))
    );
  };

  const updatePaymentStatus = async (id, paymentStatus) => {
    try {
      await apiClient(`/orders/admin/${id}/payment`, {
        method: 'PUT',
        body: JSON.stringify({ paymentStatus })
      });
    } catch {}
    setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, paymentStatus } : o)));
  };

  // Coupon Actions
  const addCoupon = (newCoupon) => {
    const couponWithId = {
      ...newCoupon,
      _id: `cpn-${Date.now().toString().slice(-6)}`,
      usedCount: 0
    };
    setCoupons((prev) => [couponWithId, ...prev]);
  };

  const deleteCoupon = (id) => {
    setCoupons((prev) => prev.filter((c) => c._id !== id));
  };

  // Return Actions
  const updateReturnStatus = (id, newStatus) => {
    setReturnsList((prev) => prev.map((r) => (r._id === id ? { ...r, status: newStatus } : r)));
  };

  return (
    <StoreDataContext.Provider
      value={{
        books,
        banners,
        orders,
        coupons,
        referrals,
        returnsList,
        customers,
        addBook,
        updateBook,
        deleteBook,
        addBanner,
        updateBanner,
        deleteBanner,
        updateOrderStatus,
        updatePaymentStatus,
        addCoupon,
        deleteCoupon,
        updateReturnStatus
      }}
    >
      {children}
    </StoreDataContext.Provider>
  );
};

export const useStoreData = () => {
  const context = useContext(StoreDataContext);
  if (!context) {
    throw new Error('useStoreData must be used within a StoreDataProvider');
  }
  return context;
};
