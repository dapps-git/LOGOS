'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  customerLogin,
  customerRegister,
  customerGoogleAuth,
  fetchCustomerProfile,
  updateCustomerProfile,
  addCustomerAddress,
  deleteCustomerAddress
} from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize guest session if not present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!localStorage.getItem('logos_guest_session_id')) {
        const guestId = 'guest_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('logos_guest_session_id', guestId);
      }
    }
  }, []);

  // Fetch current user profile if token exists
  useEffect(() => {
    async function loadUser() {
      const token = typeof window !== 'undefined' ? localStorage.getItem('logos_customer_token') : null;
      if (token) {
        try {
          const customer = await fetchCustomerProfile();
          setUser(customer);
        } catch (err) {
          console.warn('[AuthContext] Session expired:', err.message);
          localStorage.removeItem('logos_customer_token');
          setUser(null);
        }
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  const login = async (email, password) => {
    const data = await customerLogin(email, password);
    if (data.token) {
      localStorage.setItem('logos_customer_token', data.token);
      setUser(data.customer);
    }
    return data;
  };

  const register = async (formData) => {
    const data = await customerRegister(formData);
    if (data.token) {
      localStorage.setItem('logos_customer_token', data.token);
      setUser(data.customer);
    }
    return data;
  };

  const loginWithGoogle = async (googleData) => {
    const data = await customerGoogleAuth(googleData);
    if (data.token) {
      localStorage.setItem('logos_customer_token', data.token);
      setUser(data.customer);
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem('logos_customer_token');
    setUser(null);
  };

  const updateProfile = async (updates) => {
    const updated = await updateCustomerProfile(updates);
    setUser(updated);
    return updated;
  };

  const addAddress = async (address) => {
    const addresses = await addCustomerAddress(address);
    setUser((prev) => (prev ? { ...prev, addresses } : prev));
    return addresses;
  };

  const deleteAddress = async (addressId) => {
    const addresses = await deleteCustomerAddress(addressId);
    setUser((prev) => (prev ? { ...prev, addresses } : prev));
    return addresses;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        loginWithGoogle,
        logout,
        updateProfile,
        addAddress,
        deleteAddress,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
