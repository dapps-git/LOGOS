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
    const savedToken = localStorage.getItem('logos_admin_token');
    if (isRealJwt(savedToken)) {
      setToken(savedToken);
      try {
        const savedUser = localStorage.getItem('logos_admin_user');
        if (savedUser) setAdmin(JSON.parse(savedUser));
      } catch {}
    } else {
      localStorage.removeItem('logos_admin_token');
      localStorage.removeItem('logos_admin_user');
    }
    setLoading(false);

    // Session expired / rejected by backend -> force re-login
    const onUnauthorized = () => {
      localStorage.removeItem('logos_admin_token');
      localStorage.removeItem('logos_admin_user');
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
          localStorage.setItem('logos_admin_token', data.token);
          localStorage.setItem('logos_admin_user', JSON.stringify(data.admin));
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
      localStorage.removeItem('logos_admin_user');
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
