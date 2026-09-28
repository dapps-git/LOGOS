'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { apiCreateOrder } from '../../lib/api';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, addAddress } = useAuth();
  const {
    items,
    itemCount,
    subtotal,
    couponDiscount,
    referralDiscount,
    walletDiscount,
    shippingFee,
    grandTotal,
    appliedCoupon,
    appliedReferral,
    clearCart
  } = useCart();

  // Address State
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    streetAddress: '',
    city: '',
    state: 'Kerala',
    postalCode: '',
    country: 'India'
  });

  // Guest Address fallback if not logged in
  const [guestAddress, setGuestAddress] = useState({
    fullName: '',
    email: '',
    phone: '',
    streetAddress: '',
    city: '',
    state: 'Kerala',
    postalCode: '',
    country: 'India'
  });

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState('razorpay'); // 'razorpay' or 'cod'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0 && !loading) {
      router.push('/cart');
    }
  }, [items, loading, router]);

  const handleAddNewAddress = async (e) => {
    e.preventDefault();
    try {
      if (user) {
        await addAddress(newAddress);
        setShowAddressModal(false);
        setSelectedAddressIndex((user.addresses?.length || 1) - 1);
      }
    } catch (err) {
      setError(err.message || 'Failed to save address');
    }
  };

  const handlePlaceOrder = async () => {
    setError('');
    setLoading(true);

    try {
      let finalShippingAddress;
      let customerName = user?.name || guestAddress.fullName;
      let customerEmail = user?.email || guestAddress.email;
      let customerPhone = user?.phone || guestAddress.phone;

      if (user && user.addresses && user.addresses.length > 0) {
        finalShippingAddress = user.addresses[selectedAddressIndex] || user.addresses[0];
      } else {
        if (!guestAddress.fullName || !guestAddress.streetAddress || !guestAddress.postalCode || !guestAddress.phone) {
          throw new Error('Please fill in complete delivery address details.');
        }
        finalShippingAddress = {
          fullName: guestAddress.fullName,
          phone: guestAddress.phone,
          streetAddress: guestAddress.streetAddress,
          city: guestAddress.city,
          state: guestAddress.state,
          postalCode: guestAddress.postalCode,
          country: guestAddress.country
        };
      }

      const orderPayload = {
        orderItems: items.map((item) => ({
          book: item.book?._id || item.book?.id || item.book,
          title: item.book?.titleMalayalam || item.book?.title || 'LOGOS Book',
          author: item.book?.author || 'LOGOS',
          quantity: item.quantity,
          price: item.price || item.book?.salePrice || item.book?.price || 299,
          coverImage: item.book?.coverImage || item.book?.image || ''
        })),
        shippingAddress: finalShippingAddress,
        paymentMethod: paymentMethod === 'cod' ? 'cod' : 'razorpay',
        itemsPrice: subtotal,
        shippingPrice: shippingFee,
        discountAmount: couponDiscount + referralDiscount + walletDiscount,
        couponCode: appliedCoupon?.code || '',
        referralCode: appliedReferral?.code || '',
        totalPrice: grandTotal,
        customerInfo: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone
        }
      };

      const res = await apiCreateOrder(orderPayload);
      clearCart();
      const orderId = res.order?._id || res.order?.orderId || 'LOGOS-ORDER';
      router.push(`/order-placed?orderId=${orderId}`);
    } catch (err) {
      setError(err.message || 'Could not place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs font-light text-slate-400 mb-6">
          <Link href="/" className="hover:text-slate-700">Home</Link>
          <span>/</span>
          <Link href="/cart" className="hover:text-slate-700">Cart</Link>
          <span>/</span>
          <span className="text-slate-800 font-normal">Checkout</span>
        </nav>

        <h1 className="text-2xl sm:text-3xl font-normal text-slate-900 tracking-tight mb-8">
          Checkout & Delivery
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-xs rounded-2xl flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Delivery Address & Payment Method */}
          <div className="lg:col-span-8 space-y-6">
            {/* Step 1: Delivery Address */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 bg-[#1E3A8A] text-white rounded-full flex items-center justify-center text-xs font-semibold">
                    1
                  </span>
                  <h2 className="text-base sm:text-lg font-normal text-slate-900">
                    Delivery Address
                  </h2>
                </div>
                {user && (
                  <button
                    type="button"
                    onClick={() => setShowAddressModal(true)}
                    className="text-xs text-[#1E3A8A] hover:underline font-medium flex items-center gap-1"
                  >
                    + Add New Address
                  </button>
                )}
              </div>

              {/* Logged-in User Saved Addresses */}
              {user && user.addresses && user.addresses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {user.addresses.map((addr, idx) => (
                    <label
                      key={addr._id || idx}
                      onClick={() => setSelectedAddressIndex(idx)}
                      className={`relative p-4 rounded-2xl border cursor-pointer transition-all ${
                        selectedAddressIndex === idx
                          ? 'border-[#1E3A8A] bg-blue-50/40 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-sm font-medium text-slate-900">{addr.fullName}</span>
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddressIndex === idx}
                          onChange={() => setSelectedAddressIndex(idx)}
                          className="text-[#1E3A8A] focus:ring-[#1E3A8A]"
                        />
                      </div>
                      <p className="text-xs font-light text-slate-600 mt-2 leading-relaxed">
                        {addr.streetAddress}, {addr.city}, {addr.state} - {addr.postalCode}
                      </p>
                      <p className="text-xs font-light text-slate-500 mt-1">Phone: {addr.phone}</p>
                    </label>
                  ))}
                </div>
              ) : (
                /* Guest / Direct Address Input */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-normal text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={guestAddress.fullName}
                      onChange={(e) => setGuestAddress({ ...guestAddress, fullName: e.target.value })}
                      placeholder="Receiver's full name"
                      className="w-full px-3.5 py-2.5 bg-[#FAFBFD] border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-normal text-slate-700 mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      required
                      value={guestAddress.phone}
                      onChange={(e) => setGuestAddress({ ...guestAddress, phone: e.target.value })}
                      placeholder="10-digit mobile number"
                      className="w-full px-3.5 py-2.5 bg-[#FAFBFD] border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-normal text-slate-700 mb-1">Street / House Address</label>
                    <input
                      type="text"
                      required
                      value={guestAddress.streetAddress}
                      onChange={(e) => setGuestAddress({ ...guestAddress, streetAddress: e.target.value })}
                      placeholder="House/Building Name, Street, Locality"
                      className="w-full px-3.5 py-2.5 bg-[#FAFBFD] border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-normal text-slate-700 mb-1">City / Town</label>
                    <input
                      type="text"
                      required
                      value={guestAddress.city}
                      onChange={(e) => setGuestAddress({ ...guestAddress, city: e.target.value })}
                      placeholder="e.g. Kozhikode"
                      className="w-full px-3.5 py-2.5 bg-[#FAFBFD] border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-normal text-slate-700 mb-1">PIN Code</label>
                    <input
                      type="text"
                      required
                      value={guestAddress.postalCode}
                      onChange={(e) => setGuestAddress({ ...guestAddress, postalCode: e.target.value })}
                      placeholder="6-digit PIN code"
                      className="w-full px-3.5 py-2.5 bg-[#FAFBFD] border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Payment Method */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-3 border-b border-slate-100">
                <span className="w-7 h-7 bg-[#1E3A8A] text-white rounded-full flex items-center justify-center text-xs font-semibold">
                  2
                </span>
                <h2 className="text-base sm:text-lg font-normal text-slate-900">
                  Select Payment Method
                </h2>
              </div>

              <div className="space-y-3">
                {/* Razorpay Online */}
                <label
                  onClick={() => setPaymentMethod('razorpay')}
                  className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'razorpay'
                      ? 'border-[#1E3A8A] bg-blue-50/40 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'razorpay'}
                      onChange={() => setPaymentMethod('razorpay')}
                      className="text-[#1E3A8A] focus:ring-[#1E3A8A]"
                    />
                    <div>
                      <span className="text-sm font-medium text-slate-900 block">
                        Online Payment (UPI / Cards / Net Banking)
                      </span>
                      <span className="text-xs font-light text-slate-500">
                        Secure instant checkout via Razorpay Gateway
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
                    Recommended
                  </span>
                </label>

                {/* Cash on Delivery */}
                <label
                  onClick={() => setPaymentMethod('cod')}
                  className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-[#1E3A8A] bg-blue-50/40 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="text-[#1E3A8A] focus:ring-[#1E3A8A]"
                    />
                    <div>
                      <span className="text-sm font-medium text-slate-900 block">
                        Cash on Delivery (COD)
                      </span>
                      <span className="text-xs font-light text-slate-500">
                        Pay with cash or UPI upon delivery at your doorstep
                      </span>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Review Summary */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-lg shadow-slate-200/50">
              <h2 className="text-base font-normal text-slate-900 mb-4 pb-3 border-b border-slate-100">
                Order Review ({itemCount} books)
              </h2>

              {/* Items Mini List */}
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1 divide-y divide-slate-50">
                {items.map((item) => {
                  const book = item.book || {};
                  const title = book.titleMalayalam || book.title || 'LOGOS Book';
                  const price = item.price || book.salePrice || book.price || 299;
                  const image = book.coverImage || book.image || (book.images && book.images[0]) || '/book1.jpg';

                  return (
                    <div key={book._id || book.id || item.book} className="pt-2.5 flex items-center gap-3">
                      <div className="relative w-10 h-14 bg-slate-50 rounded-lg overflow-hidden shrink-0 border border-slate-100">
                        <img
                          src={image}
                          alt={title}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/book1.jpg';
                          }}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-normal text-slate-800 line-clamp-1">{title}</h4>
                        <span className="text-[11px] font-light text-slate-400">Qty: {item.quantity}</span>
                      </div>
                      <span className="text-xs font-medium text-slate-900 font-mono">
                        ₹{price * item.quantity}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Price Breakdown */}
              <div className="mt-6 pt-4 border-t border-slate-100 space-y-2.5 text-xs font-light text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono text-slate-900">₹{subtotal}</span>
                </div>

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Coupon ({appliedCoupon?.code})</span>
                    <span className="font-mono">−₹{couponDiscount}</span>
                  </div>
                )}

                {referralDiscount > 0 && (
                  <div className="flex justify-between text-blue-600">
                    <span>Referral Discount</span>
                    <span className="font-mono">−₹{referralDiscount}</span>
                  </div>
                )}

                {walletDiscount > 0 && (
                  <div className="flex justify-between text-indigo-600">
                    <span>Wallet Rewards</span>
                    <span className="font-mono">−₹{walletDiscount}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span className="font-mono">
                    {shippingFee === 0 ? <span className="text-emerald-600">FREE</span> : `₹${shippingFee}`}
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
                  <span className="text-sm font-normal text-slate-900">Amount Payable</span>
                  <span className="text-xl font-normal text-[#1E3A8A] font-mono">₹{grandTotal}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full mt-6 py-4 px-6 bg-[#1E3A8A] hover:bg-[#152e72] text-white rounded-2xl text-sm font-medium tracking-wide transition-all shadow-md shadow-blue-900/15 hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  `Place Order • ₹${grandTotal}`
                )}
              </button>

              <div className="mt-4 text-center">
                <p className="text-[11px] font-light text-slate-400 flex items-center justify-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>100% Safe & Secure Payments</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Add Address Modal */}
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
                    value={newAddress.fullName}
                    onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#FAFBFD] border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-normal text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#FAFBFD] border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-normal text-slate-700 mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    value={newAddress.streetAddress}
                    onChange={(e) => setNewAddress({ ...newAddress, streetAddress: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#FAFBFD] border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-normal text-slate-700 mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#FAFBFD] border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-normal text-slate-700 mb-1">PIN Code</label>
                    <input
                      type="text"
                      required
                      value={newAddress.postalCode}
                      onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#FAFBFD] border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20"
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
      </main>

      <Footer />
    </div>
  );
}
