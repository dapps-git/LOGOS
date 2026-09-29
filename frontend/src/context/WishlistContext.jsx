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
    // Initial load from local storage
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('logos_wishlist');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) setBooks(parsed);
        }
      } catch {}
    }

    try {
      const data = await fetchWishlist();
      if (data && Array.isArray(data.books)) {
        setBooks(data.books);
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('logos_wishlist', JSON.stringify(data.books));
          } catch {}
        }
      }
    } catch (err) {
      // Graceful fallback to offline local storage
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

    let nextBooks;
    if (isPresent) {
      nextBooks = books.filter((b) => (b._id || b.id) !== bookId);
    } else {
      nextBooks = [...books, book];
    }

    setBooks(nextBooks);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('logos_wishlist', JSON.stringify(nextBooks));
      } catch {}
    }

    try {
      const updated = await apiToggleWishlist(bookId);
      if (updated && Array.isArray(updated.books)) {
        setBooks(updated.books);
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('logos_wishlist', JSON.stringify(updated.books));
          } catch {}
        }
      }
    } catch (err) {
      // Keep local state in sync
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
