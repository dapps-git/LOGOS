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
import { useAuth } from './AuthContext';

const StoreDataContext = createContext(null);

export const StoreDataProvider = ({ children }) => {
  const { token } = useAuth();
  // Helper to remove legacy dummy mock objects from localStorage
  const sanitizeList = (list) => {
    if (!Array.isArray(list)) return [];
    return list.filter((item) => {
      if (!item || typeof item !== 'object') return false;
      const id = String(item._id || item.id || '');
      // If legacy mock ID like bk-1, ord-1, bnr-1, cpn-1, ref-1, ret-101, ret-102
      if (/^(bk|ord|bnr|cpn|ref|usr|cust|ret)-/i.test(id)) return false;
      // Filter out any mock order numbers with GRV-
      if (typeof item.orderNumber === 'string' && item.orderNumber.startsWith('GRV-')) return false;
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
  });

  const [referralStats, setReferralStats] = useState({
    totalLinksGenerated: 0,
    totalReferrals: 0,
    successfulReferrals: 0,
    pendingReferrals: 0,
    totalRewardsIssued: 0
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

  const [authors, setAuthors] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('logos_admin_authors');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return [];
  });

  // Safe localStorage helper to prevent QuotaExceededError
  const safeSetItem = (key, data) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn(`[StoreDataContext] LocalStorage quota reached for ${key}. Silently continuing with in-memory state.`);
      try {
        localStorage.removeItem('logos_admin_banners');
        localStorage.removeItem('logos_admin_books');
      } catch {}
    }
  };

  // Sync to localStorage
  useEffect(() => {
    safeSetItem('logos_admin_books', books);
  }, [books]);

  useEffect(() => {
    safeSetItem('logos_admin_banners', banners);
  }, [banners]);

  useEffect(() => {
    safeSetItem('logos_admin_authors', authors);
  }, [authors]);

  useEffect(() => {
    safeSetItem('logos_admin_orders', orders);
  }, [orders]);

  useEffect(() => {
    safeSetItem('logos_admin_coupons', coupons);
  }, [coupons]);

  useEffect(() => {
    safeSetItem('logos_admin_referrals', referrals);
  }, [referrals]);

  useEffect(() => {
    safeSetItem('logos_admin_returns', returnsList);
  }, [returnsList]);

  useEffect(() => {
    safeSetItem('logos_admin_customers', customers);
  }, [customers]);

  // Fetch fresh data from backend API
  const fetchAllData = async () => {
    try {
      const bookData = await apiClient('/books?limit=1000');
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

        // Derive and sync live return requests from actual store orders
        const returnOrders = orderData.orders.filter(
          (o) => o.orderStatus === 'Return Requested' || o.orderStatus === 'Return Accepted' || o.orderStatus === 'Return Rejected' || o.returnRequest?.reason
        );
        if (returnOrders.length > 0) {
          const derivedReturns = returnOrders.map((o) => ({
            _id: o._id,
            orderId: o._id,
            orderNumber: o.orderNumber,
            customerName: o.customer?.name || o.shippingAddress?.fullName || 'Customer',
            customerEmail: o.customer?.email || 'N/A',
            phone: o.shippingAddress?.phone || o.customer?.phone || '',
            reason: o.returnRequest?.reason || 'Return requested by customer',
            status: o.returnRequest?.status || (o.orderStatus === 'Return Accepted' ? 'Approved' : (o.orderStatus === 'Return Rejected' ? 'Rejected' : o.orderStatus || 'Return Requested')),
            requestedAt: o.returnRequest?.requestedAt || o.updatedAt || o.createdAt,
            totalAmount: o.finalTotal || o.totalAmount || 0,
            items: o.items || []
          }));
          setReturnsList((prev) => {
            const existingIds = new Set(derivedReturns.map((d) => d._id));
            const retained = prev.filter((p) => !existingIds.has(p._id));
            return [...derivedReturns, ...retained];
          });
        }
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
        setReferralStats({
          totalLinksGenerated: referralData.totalLinksGenerated || 0,
          totalReferrals: referralData.totalReferrals || referralData.referrals.length,
          successfulReferrals: referralData.successfulReferrals || 0,
          pendingReferrals: referralData.pendingReferrals || 0,
          totalRewardsIssued: referralData.totalRewardsIssued || 0
        });
      }
    } catch {}

    try {
      const customerData = await apiClient('/auth/admin/customers');
      if (Array.isArray(customerData?.customers)) {
        setCustomers(customerData.customers);
      }
    } catch {}

    try {
      const authorData = await apiClient('/author-highlights/admin/all');
      if (Array.isArray(authorData?.highlights)) {
        setAuthors(authorData.highlights);
      }
    } catch {}
  };

  useEffect(() => {
    if (token) fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

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

  // Author Actions
  const addAuthor = async (newAuthor) => {
    const authorWithId = {
      ...newAuthor,
      _id: `auth-${Date.now().toString().slice(-6)}`
    };

    try {
      const backendRes = await apiClient('/author-highlights', {
        method: 'POST',
        body: JSON.stringify(newAuthor)
      });
      if (backendRes?.highlight) {
        if (newAuthor.isSpotlight) {
          setAuthors((prev) => [backendRes.highlight, ...prev.map(a => ({ ...a, isSpotlight: false }))]);
        } else {
          setAuthors((prev) => [backendRes.highlight, ...prev]);
        }
        return backendRes.highlight;
      }
    } catch {}

    if (newAuthor.isSpotlight) {
      setAuthors((prev) => [authorWithId, ...prev.map(a => ({ ...a, isSpotlight: false }))]);
    } else {
      setAuthors((prev) => [authorWithId, ...prev]);
    }
    return authorWithId;
  };

  const updateAuthor = async (id, updatedFields) => {
    try {
      await apiClient(`/author-highlights/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedFields)
      });
    } catch {}

    setAuthors((prev) =>
      prev.map((a) => {
        if (a._id === id) {
          return { ...a, ...updatedFields };
        }
        if (updatedFields.isSpotlight) {
          return { ...a, isSpotlight: false };
        }
        return a;
      })
    );
  };

  const deleteAuthor = async (id) => {
    try {
      await apiClient(`/author-highlights/${id}`, { method: 'DELETE' });
    } catch {}
    setAuthors((prev) => prev.filter((a) => a._id !== id));
  };

  // Order Actions
  const updateOrderStatus = async (id, newStatus, note, trackingNumber, options = {}) => {
    const payload = {
      status: newStatus,
      note,
      trackingNumber,
      ...options
    };
    try {
      await apiClient(`/orders/admin/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.error('[StoreDataContext] Failed to update order status:', err.message);
    }
    setOrders((prev) =>
      prev.map((o) => {
        if (o._id !== id) return o;
        return {
          ...o,
          orderStatus: newStatus,
          trackingNumber: trackingNumber !== undefined ? trackingNumber : o.trackingNumber,
          currentLocation: options.currentLocation !== undefined ? options.currentLocation : o.currentLocation,
          shippingLocation: options.shippingLocation !== undefined ? options.shippingLocation : o.shippingLocation,
          returnRequest: options.scheduledDate || options.resolutionType || options.refundAmount
            ? {
                ...(o.returnRequest || {}),
                status: newStatus,
                scheduledDate: options.scheduledDate ? new Date(options.scheduledDate) : o.returnRequest?.scheduledDate,
                resolutionType: options.resolutionType || o.returnRequest?.resolutionType,
                refundAmount: options.refundAmount !== undefined ? options.refundAmount : o.returnRequest?.refundAmount,
                adminNote: note || o.returnRequest?.adminNote,
                note: note || o.returnRequest?.note
              }
            : o.returnRequest
        };
      })
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
  const addCoupon = async (newCoupon) => {
    const backendRes = await apiClient('/coupons', {
      method: 'POST',
      body: JSON.stringify(newCoupon)
    });
    if (!backendRes?.coupon) {
      throw new Error('Coupon could not be saved');
    }
    setCoupons((prev) => [backendRes.coupon, ...prev.filter(c => c._id !== backendRes.coupon._id)]);
    return backendRes.coupon;
  };

  const deleteCoupon = async (id) => {
    setCoupons((prev) => prev.filter((c) => c._id !== id && c.id !== id && c.code !== id));

    try {
      await apiClient(`/coupons/${id}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.error('[StoreDataContext] Failed to delete coupon from backend:', err.message);
      try {
        const couponData = await apiClient('/coupons/admin/all');
        if (Array.isArray(couponData?.coupons)) {
          setCoupons(couponData.coupons);
        }
      } catch {}
      throw err;
    }
  };

  // Return Actions
  const updateReturnStatus = async (id, newStatus, note, returnDetails = {}) => {
    try {
      const mappedOrderStatus = newStatus === 'Approved' ? 'Return Accepted' : (newStatus === 'Rejected' ? 'Return Rejected' : newStatus);
      await apiClient(`/orders/admin/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({
          status: mappedOrderStatus,
          note: note || `Return status: ${newStatus}`,
          ...returnDetails
        })
      });
      setOrders((prev) =>
        prev.map((o) =>
          o._id === id
            ? {
                ...o,
                orderStatus: mappedOrderStatus,
                returnRequest: {
                  ...(o.returnRequest || {}),
                  status: newStatus,
                  adminNote: note,
                  note,
                  scheduledDate: returnDetails.scheduledDate ? new Date(returnDetails.scheduledDate) : o.returnRequest?.scheduledDate,
                  resolutionType: returnDetails.resolutionType || o.returnRequest?.resolutionType,
                  refundAmount: returnDetails.refundAmount || o.returnRequest?.refundAmount
                }
              }
            : o
        )
      );
    } catch {}
    setReturnsList((prev) =>
      prev.map((r) => (r._id === id || r.orderId === id ? { ...r, status: newStatus, note, ...returnDetails } : r))
    );
  };

  return (
    <StoreDataContext.Provider
      value={{
        books,
        banners,
        authors,
        orders,
        coupons,
        referrals,
        referralStats,
        returnsList,
        customers,
        addBook,
        updateBook,
        deleteBook,
        addBanner,
        updateBanner,
        deleteBanner,
        addAuthor,
        updateAuthor,
        deleteAuthor,
        updateOrderStatus,
        updatePaymentStatus,
        addCoupon,
        deleteCoupon,
        updateReturnStatus,
        refreshData: fetchAllData,
        fetchAllData
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
