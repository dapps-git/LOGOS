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

  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'profile', 'addresses', 'referrals', 'coupons'
  
  // Orders State
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrderForCancel, setSelectedOrderForCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  // Referral State
  const [referralSummary, setReferralSummary] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Coupons State
  const [coupons, setCoupons] = useState([]);

  // Profile Form
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    avatar: ''
  });
  const [profileMsg, setProfileMsg] = useState(null);

  // Address Form Modal
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddr, setNewAddr] = useState({
    fullName: '',
    phone: '',
    streetAddress: '',
    city: '',
    state: 'Kerala',
    postalCode: '',
    country: 'India'
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        avatar: user.avatar || ''
      });
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setOrdersLoading(true);
    try {
      const [ordersData, refData, coupData] = await Promise.all([
        apiGetMyOrders().catch(() => []),
        apiGetMyReferralSummary().catch(() => null),
        apiGetAvailableCoupons().catch(() => [])
      ]);
      setOrders(ordersData || []);
      setReferralSummary(refData || null);
      setCoupons(coupData || []);
    } catch (err) {
      console.warn('Error loading dashboard data:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg(null);
    try {
      await updateProfile(profileForm);
      setProfileMsg({ success: true, text: 'Profile updated successfully!' });
    } catch (err) {
      setProfileMsg({ success: false, text: err.message || 'Failed to update' });
    }
  };

  const handleAddNewAddress = async (e) => {
    e.preventDefault();
    try {
      await addAddress(newAddr);
      setShowAddressModal(false);
      setNewAddr({
        fullName: user?.name || '',
        phone: user?.phone || '',
        streetAddress: '',
        city: '',
        state: 'Kerala',
        postalCode: '',
        country: 'India'
      });
    } catch (err) {
      alert(err.message || 'Failed to save address');
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

  const copyReferralCode = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-8 h-8 border-3 border-[#1E3A8A]/30 border-t-[#1E3A8A] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        {/* User Greeting & Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#1E3A8A] flex items-center justify-center text-xl font-medium border border-blue-100">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-normal text-slate-900">
                Hello, {user.name || 'Reader'}
              </h1>
              <p className="text-xs font-light text-slate-500 mt-0.5">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[11px] font-mono font-medium px-2.5 py-0.5 bg-blue-50 text-[#1E3A8A] rounded-full">
                  Code: {user.referralCode || 'LOGOS-READER'}
                </span>
                <span className="text-[11px] font-light text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  ₹{user.referralRewardBalance || 0} Rewards Balance
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="self-start sm:self-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl transition-all"
          >
            Sign Out
          </button>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex overflow-x-auto gap-2 pb-2 mb-8 no-scrollbar border-b border-slate-200">
          {[
            { id: 'orders', label: 'My Orders', icon: '📦' },
            { id: 'profile', label: 'Personal Info', icon: '👤' },
            { id: 'addresses', label: 'Delivery Addresses', icon: '📍' },
            { id: 'referrals', label: 'Referrals & Rewards', icon: '🎁' },
            { id: 'coupons', label: 'Coupons & Vouchers', icon: '🏷️' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 rounded-2xl text-xs font-normal whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-[#1E3A8A] text-white shadow-md shadow-blue-900/10'
                  : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-100'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab 1: Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <h2 className="text-base font-normal text-slate-900 mb-4">
              Your Orders ({orders.length})
            </h2>

            {ordersLoading ? (
              <div className="p-12 text-center text-xs font-light text-slate-400">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                <p className="text-sm font-light text-slate-500 mb-4">You have not placed any book orders yet.</p>
                <Link
                  href="/"
                  className="inline-block px-6 py-3 bg-[#1E3A8A] text-white rounded-full text-xs font-medium"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                    <div>
                      <span className="text-xs font-mono font-medium text-slate-900">
                        Order #{order.orderId || order._id.slice(-6).toUpperCase()}
                      </span>
                      <p className="text-[11px] font-light text-slate-400 mt-0.5">
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
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
                        ₹{order.totalPrice}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-3">
                    {order.orderItems?.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs font-light text-slate-700">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-[10px] font-mono text-slate-500">
                            {item.quantity}x
                          </span>
                          <span className="font-normal text-slate-900">{item.title}</span>
                          <span className="text-slate-400">by {item.author}</span>
                        </div>
                        <span className="font-mono">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  {/* Footer & Actions */}
                  <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                    <p className="text-[11px] font-light text-slate-500">
                      Payment: <span className="uppercase font-medium text-slate-700">{order.paymentMethod}</span> ({order.paymentStatus || 'Pending'})
                    </p>

                    {order.orderStatus !== 'cancelled' && order.orderStatus !== 'delivered' && (
                      <button
                        type="button"
                        onClick={() => setSelectedOrderForCancel(order)}
                        className="text-xs text-rose-600 hover:underline font-light"
                      >
                        Cancel Order / Return Request
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Personal Profile */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm max-w-2xl">
            <h2 className="text-base font-normal text-slate-900 mb-6">Personal Profile Details</h2>

            {profileMsg && (
              <div
                className={`mb-6 p-3.5 rounded-xl text-xs ${
                  profileMsg.success
                    ? 'bg-emerald-50 border border-emerald-100 text-emerald-700'
                    : 'bg-rose-50 border border-rose-100 text-rose-700'
                }`}
              >
                {profileMsg.text}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-normal text-slate-700 mb-1.5 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-4 py-3 bg-[#FAFBFD] border border-slate-200 rounded-xl text-xs font-light text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
                />
              </div>

              <div>
                <label className="block text-xs font-normal text-slate-700 mb-1.5 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-xs font-light text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-normal text-slate-700 mb-1.5 uppercase tracking-wider">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-3 bg-[#FAFBFD] border border-slate-200 rounded-xl text-xs font-light text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
                />
              </div>

              <button
                type="submit"
                className="py-3.5 px-6 bg-[#1E3A8A] hover:bg-[#152e72] text-white rounded-xl text-xs font-medium tracking-wide transition-all shadow-md shadow-blue-900/10"
              >
                Save Changes
              </button>
            </form>
          </div>
        )}

        {/* Tab 3: Saved Addresses */}
        {activeTab === 'addresses' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-normal text-slate-900">Saved Delivery Addresses</h2>
              <button
                type="button"
                onClick={() => setShowAddressModal(true)}
                className="px-4 py-2.5 bg-[#1E3A8A] hover:bg-[#152e72] text-white rounded-xl text-xs font-medium"
              >
                + Add New Address
              </button>
            </div>

            {user.addresses?.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-slate-100">
                <p className="text-xs font-light text-slate-500">No saved addresses found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.addresses?.map((addr) => (
                  <div
                    key={addr._id}
                    className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-slate-900">{addr.fullName}</h3>
                        <button
                          type="button"
                          onClick={() => deleteAddress(addr._id)}
                          className="text-xs text-rose-500 hover:underline font-light"
                        >
                          Delete
                        </button>
                      </div>
                      <p className="text-xs font-light text-slate-600 leading-relaxed">
                        {addr.streetAddress}, {addr.city}, {addr.state} - {addr.postalCode}
                      </p>
                      <p className="text-xs font-light text-slate-500 mt-2">Phone: {addr.phone}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Referral & Rewards Hub */}
        {activeTab === 'referrals' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-3xl p-8 shadow-xl">
              <span className="text-[11px] uppercase tracking-widest text-blue-200 font-medium block mb-2">
                REFERRAL PROGRAM
              </span>
              <h2 className="text-2xl font-normal mb-3">Invite Friends & Earn Points</h2>
              <p className="text-xs font-light text-blue-100 leading-relaxed mb-6">
                Share your unique code with fellow book lovers. They get <strong>15% OFF</strong> their first order, and you earn <strong>₹50 reward credits</strong> on their successful delivery!
              </p>

              {/* Code Box */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-blue-200 uppercase block">Your Referral Code</span>
                  <span className="text-lg font-mono font-bold tracking-wider">{user.referralCode || 'LOGOS-FRIEND'}</span>
                </div>
                <button
                  type="button"
                  onClick={copyReferralCode}
                  className="px-4 py-2 bg-white text-[#1E3A8A] rounded-xl text-xs font-medium hover:bg-blue-50 transition-all"
                >
                  {copiedCode ? '✓ Copied!' : 'Copy Code'}
                </button>
              </div>

              {/* Balance Box */}
              <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-center">
                <div>
                  <span className="text-xs text-blue-200 font-light">Available Wallet Balance</span>
                  <div className="text-2xl font-mono font-bold text-emerald-300">₹{user.referralRewardBalance || 0}</div>
                </div>
                <span className="text-xs font-light text-blue-200">
                  {user.successfulReferralsCount || 0} Friends Joined
                </span>
              </div>
            </div>

            <div className="lg:col-span-6 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
              <h3 className="text-base font-normal text-slate-900 mb-4">How It Works</h3>
              <div className="space-y-4 text-xs font-light text-slate-600">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-50 text-[#1E3A8A] flex items-center justify-center font-bold text-xs shrink-0">1</div>
                  <p><strong>Share your code</strong> with friends via WhatsApp, social media, or email.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-50 text-[#1E3A8A] flex items-center justify-center font-bold text-xs shrink-0">2</div>
                  <p>They enter your referral code during signup or checkout to unlock <strong>15% OFF</strong>.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-50 text-[#1E3A8A] flex items-center justify-center font-bold text-xs shrink-0">3</div>
                  <p>You automatically receive ₹50 reward credits directly to your LOGOS wallet after their order is delivered!</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Coupons */}
        {activeTab === 'coupons' && (
          <div className="space-y-4">
            <h2 className="text-base font-normal text-slate-900 mb-4">Available Discount Vouchers</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { code: 'LOGOS10', discount: '10% OFF', desc: 'Valid on all orders above ₹499' },
                { code: 'WELCOME15', discount: '15% OFF', desc: 'Special discount for first time readers' },
                { code: 'READMORE', discount: 'Flat ₹50 OFF', desc: 'Valid on any 3 or more books combo' }
              ].map((c) => (
                <div
                  key={c.code}
                  className="bg-white rounded-3xl p-5 border border-dashed border-blue-200 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-bold text-[#1E3A8A] bg-blue-50 px-2.5 py-1 rounded-lg">
                        {c.code}
                      </span>
                      <span className="text-xs font-medium text-emerald-600">{c.discount}</span>
                    </div>
                    <p className="text-xs font-light text-slate-500 mt-2">{c.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(c.code);
                      alert(`Coupon ${c.code} copied! Apply at cart.`);
                    }}
                    className="mt-4 w-full py-2 bg-[#FAFBFD] hover:bg-slate-100 text-slate-700 text-xs font-normal rounded-xl border border-slate-200"
                  >
                    Copy Coupon
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Address Modal */}
        {showAddressModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-normal text-slate-900">Add Delivery Address</h3>
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddNewAddress} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-normal text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newAddr.fullName}
                    onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#FAFBFD] border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-normal text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={newAddr.phone}
                    onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#FAFBFD] border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-normal text-slate-700 mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    value={newAddr.streetAddress}
                    onChange={(e) => setNewAddr({ ...newAddr, streetAddress: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#FAFBFD] border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-normal text-slate-700 mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={newAddr.city}
                      onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#FAFBFD] border border-slate-200 rounded-xl text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-normal text-slate-700 mb-1">PIN Code</label>
                    <input
                      type="text"
                      required
                      value={newAddr.postalCode}
                      onChange={(e) => setNewAddr({ ...newAddr, postalCode: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#FAFBFD] border border-slate-200 rounded-xl text-xs text-slate-800"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddressModal(false)}
                    className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 bg-[#1E3A8A] hover:bg-[#152e72] text-white text-xs font-medium rounded-xl"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Cancel Order / Return Request Modal */}
        {selectedOrderForCancel && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-normal text-slate-900">Cancel Order / Request Refund</h3>
                <button
                  type="button"
                  onClick={() => setSelectedOrderForCancel(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs font-light text-slate-500 mb-4">
                Please provide a reason for cancelling order #{selectedOrderForCancel.orderId || selectedOrderForCancel._id.slice(-6)}.
              </p>

              <form onSubmit={handleCancelOrderSubmit} className="space-y-4">
                <textarea
                  required
                  rows={3}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Ordered by mistake, found another book, address change..."
                  className="w-full px-3.5 py-2.5 bg-[#FAFBFD] border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20"
                />

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedOrderForCancel(null)}
                    className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 text-xs font-medium rounded-xl"
                  >
                    Keep Order
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium rounded-xl"
                  >
                    Confirm Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
