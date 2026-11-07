'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // A real backend JWT has 3 dot-separated parts; anything else (old fake tokens) is discarded
  const isRealJwt = (t) => typeof t === 'string' && t.split('.').length === 3;

  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Purge any legacy admin user objects from localStorage for security hygiene
    try {
      localStorage.removeItem('logos_admin_user');
    } catch {}

    const savedToken = localStorage.getItem('logos_admin_token');
    if (isRealJwt(savedToken)) {
      setToken(savedToken);
      // Fetch fresh admin profile in memory directly from backend without persisting credentials
      apiClient('/auth/admin/profile')
        .then((data) => {
          if (data && data.admin) {
            setAdmin(data.admin);
          }
        })
        .catch(() => {
          // Token expired or invalid
          localStorage.removeItem('logos_admin_token');
          setToken(null);
          setAdmin(null);
        })
        .finally(() => {
          setLoading(false);
        });
      return;
    } else {
      localStorage.removeItem('logos_admin_token');
    }
    setLoading(false);

    // Session expired / rejected by backend -> force re-login
    const onUnauthorized = () => {
      localStorage.removeItem('logos_admin_token');
      try { localStorage.removeItem('logos_admin_user'); } catch {}
      setToken(null);
      setAdmin(null);
    };
    window.addEventListener('logos-admin-unauthorized', onUnauthorized);
    return () => window.removeEventListener('logos-admin-unauthorized', onUnauthorized);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await apiClient('/auth/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      if (data && data.token) {
        if (typeof window !== 'undefined') {
          // Store only the JWT session bearer token; admin profile is kept purely in memory state
          localStorage.setItem('logos_admin_token', data.token);
          try { localStorage.removeItem('logos_admin_user'); } catch {}
        }
        setToken(data.token);
        setAdmin(data.admin);
        return { success: true };
      }
      throw new Error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('logos_admin_token');
      try { localStorage.removeItem('logos_admin_user'); } catch {}
    }
    setToken(null);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, token, isAuthenticated: Boolean(token), login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
