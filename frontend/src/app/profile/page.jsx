'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import {
  apiGetMyOrders,
  apiGetMyReferralSummary,
  apiGetAvailableCoupons,
  apiCancelOrder
} from '../../lib/api';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, logout, updateProfile, addAddress, deleteAddress } = useAuth();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'profile', 'addresses'
  
  // Orders State
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrderForCancel, setSelectedOrderForCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  // Profile Form
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: ''
  });
  const [profileMsg, setProfileMsg] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Address Form Modal
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddr, setNewAddr] = useState({
    fullName: '',
    phone: '',
    streetAddress: '',
    postOffice: '',
    city: '',
    state: 'Kerala',
    postalCode: '',
    country: 'India'
  });
  const [addrFormError, setAddrFormError] = useState('');

  const INDIAN_STATES = [
    'Kerala', 'Tamil Nadu', 'Karnataka', 'Maharashtra', 'Delhi', 'Andhra Pradesh', 'Telangana',
    'Gujarat', 'West Bengal', 'Uttar Pradesh', 'Rajasthan', 'Madhya Pradesh', 'Punjab',
    'Haryana', 'Bihar', 'Odisha', 'Assam', 'Goa', 'Himachal Pradesh', 'Jammu and Kashmir',
    'Jharkhand', 'Uttarakhand', 'Chhattisgarh', 'Puducherry', 'Chandigarh'
  ];

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || ''
      });
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setOrdersLoading(true);
    try {
      const ordersData = await apiGetMyOrders().catch(() => []);
      setOrders(ordersData || []);
    } catch (err) {
      console.warn('Error loading orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg(null);
    setSavingProfile(true);
    try {
      await updateProfile(profileForm);
      setProfileMsg({ success: true, text: 'Profile updated successfully!' });
    } catch (err) {
      setProfileMsg({ success: false, text: err.message || 'Failed to update' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddNewAddress = async (e) => {
    e.preventDefault();
    setAddrFormError('');

    if (!newAddr.fullName.trim()) {
      setAddrFormError('Full name is required');
      return;
    }
    const cleanPhone = String(newAddr.phone).replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setAddrFormError('Valid 10-digit mobile number is required');
      return;
    }
    if (!newAddr.streetAddress.trim()) {
      setAddrFormError('Street address / House name is required');
      return;
    }
    if (!newAddr.postOffice.trim()) {
      setAddrFormError('Post Office is required');
      return;
    }
    if (!newAddr.city.trim()) {
      setAddrFormError('City / District is required');
      return;
    }
    const cleanPin = String(newAddr.postalCode).replace(/\D/g, '');
    if (cleanPin.length !== 6) {
      setAddrFormError('PIN Code must be exactly 6 digits');
      return;
    }

    try {
      const sanitized = {
        ...newAddr,
        phone: cleanPhone.slice(-10),
        postalCode: cleanPin.slice(0, 6),
        country: 'India'
      };
      await addAddress(sanitized);
      setShowAddressModal(false);
      setNewAddr({
        fullName: user?.name || '',
        phone: user?.phone || '',
        streetAddress: '',
        postOffice: '',
        city: '',
        state: 'Kerala',
        postalCode: '',
        country: 'India'
      });
    } catch (err) {
      setAddrFormError(err.message || 'Failed to save address');
    }
  };

  const handleCancelOrderSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrderForCancel) return;
    try {
      await apiCancelOrder(selectedOrderForCancel._id, cancelReason);
      setSelectedOrderForCancel(null);
      setCancelReason('');
      loadData();
    } catch (err) {
      alert(err.message || 'Could not cancel order');
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-8 h-8 border-3 border-[#1044A5]/30 border-t-[#1044A5] rounded-full animate-spin" />
      </div>
    );
  }

  const userInitial = user.name ? user.name.trim().charAt(0).toUpperCase() : 'U';

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 max-w-2xl sm:max-w-3xl mx-auto w-full px-4 sm:px-6 pt-24 sm:pt-28 pb-16">
        {/* 1. User Profile Greeting Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-100/90 shadow-sm relative mb-5 sm:mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5 sm:gap-4">
              {/* Circular Initial Avatar */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#EBF3FF] text-[#1044A5] flex items-center justify-center text-xl sm:text-2xl font-semibold shrink-0">
                {userInitial}
              </div>

              {/* Name & Email */}
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-semibold text-slate-800 tracking-tight truncate">
                  Hello, {user.name || 'Reader'}
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 font-normal truncate mt-0.5">
                  {user.email}
                </p>
              </div>
            </div>

            {/* Sign Out Button */}
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors pt-1"
            >
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* 2. Horizontal Tab Navigation Pills */}
        <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-7 overflow-x-auto no-scrollbar">
          {/* Tab 1: My Orders */}
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-2.5 rounded-full text-xs font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'orders'
                ? 'bg-[#1044A5] text-white shadow-xs'
                : 'bg-[#EEF5FF] text-slate-600 hover:text-slate-900'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span>My Orders</span>
          </button>

          {/* Tab 2: Personal Info */}
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-5 py-2.5 rounded-full text-xs font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'profile'
                ? 'bg-[#1044A5] text-white shadow-xs'
                : 'bg-[#EEF5FF] text-slate-600 hover:text-slate-900'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Personal Info</span>
          </button>

          {/* Tab 3: Delivery */}
          <button
            type="button"
            onClick={() => setActiveTab('addresses')}
            className={`px-5 py-2.5 rounded-full text-xs font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'addresses'
                ? 'bg-[#1044A5] text-white shadow-xs'
                : 'bg-[#EEF5FF] text-slate-600 hover:text-slate-900'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Delivery</span>
          </button>
        </div>

        {/* 3. Tab Content */}
        {/* TAB 1: MY ORDERS */}
        {activeTab === 'orders' && (
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">My Orders</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {ordersLoading ? 'Loading...' : `${orders.length} ${orders.length === 1 ? 'order' : 'orders'}`}
              </p>
            </div>

            {ordersLoading ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                <div className="w-6 h-6 border-2 border-[#1044A5]/30 border-t-[#1044A5] rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-400">Loading your orders...</p>
              </div>
            ) : orders.length === 0 ? (
              /* Empty Orders State matching Screenshot */
              <div className="bg-white rounded-3xl p-8 sm:p-14 text-center border border-slate-100/90 shadow-sm flex flex-col items-center justify-center">
                {/* Book Stack Illustration */}
                <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-[#EFF5FF] flex items-center justify-center mb-6 relative">
                  <svg className="w-20 h-20 sm:w-24 sm:h-24" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Sparkle 1 */}
                    <path d="M30 40L32 32L40 30L32 28L30 20L28 28L20 30L28 32L30 40Z" fill="#3B82F6" opacity="0.6"/>
                    {/* Sparkle 2 */}
                    <path d="M90 28L91.5 22L98 20.5L91.5 19L90 13L88.5 19L82 20.5L88.5 22L90 28Z" fill="#60A5FA" opacity="0.8"/>
                    {/* Decorative Leaf */}
                    <path d="M85 58C92 50 100 58 100 70C92 70 85 64 85 58Z" fill="#93C5FD" opacity="0.7"/>
                    <path d="M88 64C94 56 102 62 102 72" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round"/>
                    
                    {/* Book 1 (Top) */}
                    <rect x="42" y="42" width="36" height="8" rx="2" fill="#1D4ED8"/>
                    <path d="M44 44H76V48H44z" fill="#3B82F6"/>
                    <rect x="74" y="43" width="3" height="6" rx="1" fill="#FFFFFF"/>
                    
                    {/* Book 2 (Middle) */}
                    <rect x="36" y="52" width="48" height="11" rx="2.5" fill="#1E40AF"/>
                    <path d="M38 54H82V61H38z" fill="#2563EB"/>
                    <rect x="80" y="54" width="3" height="7" rx="1" fill="#FFFFFF"/>
                    
                    {/* Book 3 (Bottom) */}
                    <rect x="30" y="65" width="60" height="14" rx="3" fill="#1E3A8A"/>
                    <path d="M32 67H88V77H32z" fill="#1D4ED8"/>
                    <rect x="86" y="68" width="3" height="8" rx="1" fill="#FFFFFF"/>
                    {/* Ribbon */}
                    <path d="M50 77V85L53 82L56 85V77H50Z" fill="#60A5FA"/>
                  </svg>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-1.5">
                  No orders yet
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-xs mb-6 leading-relaxed">
                  Your bookshelf is waiting for its first adventure.
                </p>

                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-7 py-3 bg-[#1044A5] hover:bg-[#0c3986] text-white rounded-full text-xs sm:text-sm font-medium transition-all shadow-md shadow-blue-900/15 active:scale-95"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Start Shopping</span>
                </Link>
              </div>
            ) : (
              /* Order List Cards */
              <div className="space-y-4">
                {orders.map((order) => {
                  const itemsList = order.items || order.orderItems || [];
                  const orderNum = order.orderNumber || order.orderId || order._id?.slice(-6).toUpperCase();
                  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  });

                  return (
                    <div
                      key={order._id}
                      className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                        <div>
                          <span className="text-xs font-mono font-medium text-slate-900">
                            Order #{orderNum}
                          </span>
                          <p className="text-[11px] text-slate-400 mt-0.5">Placed on {orderDate}</p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${
                              order.orderStatus === 'delivered'
                                ? 'bg-emerald-50 text-emerald-700'
                                : order.orderStatus === 'cancelled'
                                ? 'bg-rose-50 text-rose-700'
                                : order.orderStatus === 'shipped'
                                ? 'bg-indigo-50 text-indigo-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {order.orderStatus || 'Processing'}
                          </span>
                          <span className="text-sm font-medium font-mono text-slate-900">
                            ₹{order.totalAmount || order.totalPrice}
                          </span>
                        </div>
                      </div>

                      {/* Items List */}
                      <div className="space-y-2.5">
                        {itemsList.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs text-slate-700">
                            <div className="flex items-center gap-2.5 truncate pr-2">
                              <span className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center text-[10px] font-mono text-slate-500 shrink-0">
                                {item.quantity}x
                              </span>
                              <span className="font-medium text-slate-800 truncate">{item.title}</span>
                              {item.author && <span className="text-slate-400 text-[11px] shrink-0">by {item.author}</span>}
                            </div>
                            <span className="font-mono text-slate-800 shrink-0">₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      {/* Footer & Actions */}
                      <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                        <p className="text-[11px] text-slate-500">
                          Payment: <span className="uppercase font-medium text-slate-700">{order.paymentMethod}</span> ({order.paymentStatus || 'Pending'})
                        </p>

                        <Link
                          href={`/orders/${order._id}`}
                          className="text-xs text-[#1044A5] hover:underline font-medium"
                        >
                          View Details →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PERSONAL INFO */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-5">Personal Information</h2>

            {profileMsg && (
              <div
                className={`mb-5 p-3.5 rounded-xl text-xs ${
                  profileMsg.success
                    ? 'bg-emerald-50 border border-emerald-100 text-emerald-700'
                    : 'bg-rose-50 border border-rose-100 text-rose-700'
                }`}
              >
                {profileMsg.text}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#FAFBFD] border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1044A5]/20 focus:border-[#1044A5]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 cursor-not-allowed"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Email address cannot be changed.</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-2.5 bg-[#FAFBFD] border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1044A5]/20 focus:border-[#1044A5]"
                />
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="py-2.5 px-6 bg-[#1044A5] hover:bg-[#0c3986] text-white rounded-xl text-xs font-medium tracking-wide transition-all shadow-md shadow-blue-900/10 disabled:opacity-50"
              >
                {savingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: DELIVERY ADDRESSES */}
        {activeTab === 'addresses' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">Delivery Addresses</h2>
                <p className="text-xs text-slate-400 mt-0.5">Manage your saved shipping addresses</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddressModal(true)}
                className="px-4 py-2 bg-[#1044A5] hover:bg-[#0c3986] text-white rounded-xl text-xs font-medium transition-all shadow-xs"
              >
                + Add Address
              </button>
            </div>

            {user.addresses?.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-slate-100 shadow-sm">
                <p className="text-xs text-slate-400 mb-3">No saved addresses found.</p>
                <button
                  type="button"
                  onClick={() => setShowAddressModal(true)}
                  className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl transition-all"
                >
                  Add Your First Address
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {user.addresses?.map((addr) => (
                  <div
                    key={addr._id}
                    className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-semibold text-slate-900">{addr.fullName}</h3>
                        <button
                          type="button"
                          onClick={() => deleteAddress(addr._id)}
                          className="text-xs text-rose-500 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {addr.streetAddress}, {addr.city}, {addr.state} - {addr.postalCode}
                      </p>
                      <p className="text-xs text-slate-400 mt-2">Phone: {addr.phone}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Address Form Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Add Delivery Address</h3>
                <p className="text-[11px] text-slate-400">All fields are required</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAddressModal(false);
                  setAddrFormError('');
                }}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            {addrFormError && (
              <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                {addrFormError}
              </div>
            )}

            <form onSubmit={handleAddNewAddress} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aifa Sana"
                  value={newAddr.fullName}
                  onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAFBFD] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1044A5]/20"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-semibold text-slate-700">
                    Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {String(newAddr.phone).replace(/\D/g, '').length === 10 ? '✓ 10 Digits' : `${String(newAddr.phone).replace(/\D/g, '').length}/10`}
                  </span>
                </div>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="10-digit number"
                  value={newAddr.phone}
                  onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  className="w-full px-3 py-2 bg-[#FAFBFD] border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#1044A5]/20"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Street Address / House Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="House Name / Street"
                  value={newAddr.streetAddress}
                  onChange={(e) => setNewAddr({ ...newAddr, streetAddress: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAFBFD] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1044A5]/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Post Office (P.O.) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Othukkungal P.O."
                    value={newAddr.postOffice}
                    onChange={(e) => setNewAddr({ ...newAddr, postOffice: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAFBFD] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1044A5]/20"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    City / District <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kottakkal"
                    value={newAddr.city}
                    onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAFBFD] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1044A5]/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    State <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newAddr.state || 'Kerala'}
                    onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAFBFD] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1044A5]/20"
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-semibold text-slate-700">
                      PIN Code <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {String(newAddr.postalCode).replace(/\D/g, '').length === 6 ? '✓ 6 Digits' : `${String(newAddr.postalCode).replace(/\D/g, '').length}/6`}
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="676528"
                    value={newAddr.postalCode}
                    onChange={(e) => setNewAddr({ ...newAddr, postalCode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                    className="w-full px-3 py-2 bg-[#FAFBFD] border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#1044A5]/20"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddressModal(false);
                    setAddrFormError('');
                  }}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#1044A5] hover:bg-[#0c3986] text-white rounded-xl font-semibold transition-colors shadow-xs"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
