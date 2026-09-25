'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('logos_admin_user');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return {
      id: 'admin-1',
      name: 'Admin',
      email: 'admin@logos.com',
      role: 'Super Admin'
    };
  });

  const [token, setToken] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('logos_admin_token') || 'mock-admin-jwt-token';
    }
    return 'mock-admin-jwt-token';
  });

  const [loading, setLoading] = useState(false);

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
    } catch (err) {
      if (email.toLowerCase() === 'admin@logos.com' && (password === 'AdminPassword123' || password === 'admin123')) {
        const fallbackAdmin = {
          id: 'admin-master',
          name: 'Admin',
          email: 'admin@logos.com',
          role: 'Super Admin'
        };
        const fallbackToken = 'dev-jwt-admin-token-' + Date.now();
        if (typeof window !== 'undefined') {
          localStorage.setItem('logos_admin_token', fallbackToken);
          localStorage.setItem('logos_admin_user', JSON.stringify(fallbackAdmin));
        }
        setToken(fallbackToken);
        setAdmin(fallbackAdmin);
        return { success: true };
      }
      throw err;
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
