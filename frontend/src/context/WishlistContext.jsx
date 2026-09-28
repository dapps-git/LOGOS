'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchWishlist, apiToggleWishlist } from '../lib/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadWishlist = useCallback(async () => {
    try {
      const data = await fetchWishlist();
      if (data && Array.isArray(data.books)) {
        setBooks(data.books);
      } else {
        setBooks([]);
      }
    } catch (err) {
      console.warn('[WishlistContext] Load error:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist, user]);

  const toggleWishlist = async (book) => {
    const bookId = book._id || book.id;
    const isPresent = books.some((b) => (b._id || b.id) === bookId);

    // Optimistic UI toggle
    if (isPresent) {
      setBooks((prev) => prev.filter((b) => (b._id || b.id) !== bookId));
    } else {
      setBooks((prev) => [...prev, book]);
    }

    try {
      const updated = await apiToggleWishlist(bookId);
      if (updated && Array.isArray(updated.books)) {
        setBooks(updated.books);
      }
    } catch (err) {
      console.error('[WishlistContext] Toggle error:', err.message);
      loadWishlist();
    }
  };

  const isBookInWishlist = (bookId) => {
    return books.some((b) => (b._id || b.id) === bookId);
  };

  return (
    <WishlistContext.Provider
      value={{
        books,
        count: books.length,
        loading,
        toggleWishlist,
        isBookInWishlist,
        refreshWishlist: loadWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within a WishlistProvider');
  return ctx;
};
