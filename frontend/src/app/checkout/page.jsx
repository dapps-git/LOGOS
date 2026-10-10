'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { apiCreateOrder, apiCreateRazorpayOrder, apiVerifyRazorpayPayment, apiGetAvailableCoupons } from '../../lib/api';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading, addAddress } = useAuth();
  const {
    items,
    itemCount,
    subtotal,
    couponDiscount,
    referralDiscount,
    walletDiscount,
    useWalletBalance,
    setUseWalletBalance,
    shippingFee,
    grandTotal,
    appliedCoupon,
    appliedReferral,
    applyCouponCode,
    removeCoupon,
    removeFromCart,
    clearCart
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState(null);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const INDIAN_STATES = [
    'Kerala', 'Tamil Nadu', 'Karnataka', 'Maharashtra', 'Delhi', 'Andhra Pradesh', 'Telangana',
    'Gujarat', 'West Bengal', 'Uttar Pradesh', 'Rajasthan', 'Madhya Pradesh', 'Punjab',
    'Haryana', 'Bihar', 'Odisha', 'Assam', 'Goa', 'Himachal Pradesh', 'Jammu and Kashmir',
    'Jharkhand', 'Uttarakhand', 'Chhattisgarh', 'Puducherry', 'Chandigarh'
  ];

  // Unified Address State with postOffice & State
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  const [addressForm, setAddressForm] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    streetAddress: '',
    postOffice: '',
    city: '',
    state: 'Kerala',
    postalCode: '',
    country: 'India'
  });
  const [addressErrors, setAddressErrors] = useState({});

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState('razorpay'); // 'razorpay' or 'cod'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. Calculate COD vs Prepaid Shipping Fee: COD is FREE if subtotal >= 1000, otherwise 2% of product price. Prepaid is always FREE
  const codShippingFee = subtotal >= 1000 ? 0 : Math.round(subtotal * 0.02);
  const effectiveShippingFee = paymentMethod === 'cod' ? codShippingFee : 0;
  const effectiveGrandTotal = Math.max(0, subtotal - (couponDiscount || 0) - (referralDiscount || 0) - (walletDiscount || 0) + effectiveShippingFee);

  // Restore saved address on initial load (persists in same system/browser)
  useEffect(() => {
    let restored = false;
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('logos_delivery_address');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === 'object' && parsed.streetAddress) {
            setAddressForm((prev) => ({
              ...prev,
              ...parsed,
              fullName: parsed.fullName || user?.name || prev.fullName,
              phone: parsed.phone || user?.phone || prev.phone
            }));
            restored = true;
          }
        }
      } catch {}
    }

    if (!restored && user?.addresses && user.addresses.length > 0) {
      const saved = user.addresses[selectedAddressIndex] || user.addresses[0];
      setAddressForm((prev) => ({
        ...prev,
        fullName: saved.fullName || user.name || prev.fullName,
        phone: saved.phone || user.phone || prev.phone,
        streetAddress: saved.streetAddress || prev.streetAddress,
        postOffice: saved.postOffice || prev.postOffice,
        city: saved.city || prev.city,
        state: saved.state || 'Kerala',
        postalCode: saved.postalCode || prev.postalCode,
        country: 'India'
      }));
    } else if (!restored && user) {
      setAddressForm((prev) => ({
        ...prev,
        fullName: user.name || prev.fullName,
        phone: user.phone || prev.phone
      }));
    }
  }, [user, selectedAddressIndex]);

  // Continuously save address to localStorage so it persists in the same system
  useEffect(() => {
    if (typeof window !== 'undefined' && addressForm.streetAddress && addressForm.fullName) {
      try {
        localStorage.setItem('logos_delivery_address', JSON.stringify(addressForm));
      } catch {}
    }
  }, [addressForm]);

  // Address Validator
  const validateAddress = (addr) => {
    const errs = {};
    if (!addr.fullName || addr.fullName.trim().length < 3) {
      errs.fullName = 'Full Name is required (minimum 3 characters)';
    }

    const cleanPhone = String(addr.phone || '').replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      errs.phone = 'Valid 10-digit mobile number is required';
    }

    if (!addr.streetAddress || addr.streetAddress.trim().length < 4) {
      errs.streetAddress = 'House name / flat / street address is required';
    }

    if (!addr.postOffice || addr.postOffice.trim().length < 2) {
      errs.postOffice = 'Post Office (P.O.) name is required';
    }

    if (!addr.city || addr.city.trim().length < 2) {
      errs.city = 'City / Town / District is required';
    }

    if (!addr.state || addr.state.trim().length < 2) {
      errs.state = 'State is required';
    }

    const cleanPin = String(addr.postalCode || '').replace(/\D/g, '');
    if (!cleanPin || cleanPin.length !== 6) {
      errs.postalCode = 'PIN Code must be exactly 6 digits';
    }

    return errs;
  };

  // Fetch available coupons
  useEffect(() => {
    apiGetAvailableCoupons()
      .then((data) => {
        if (Array.isArray(data)) setAvailableCoupons(data);
        else if (data?.coupons) setAvailableCoupons(data.coupons);
      })
      .catch(() => {});
  }, []);

  const handleApplyCoupon = async (e, codeToApply) => {
    if (e) e.preventDefault();
    const code = (codeToApply || couponInput).trim().toUpperCase();
    if (!code) return;
    setApplyingCoupon(true);
    setCouponMsg(null);
    const res = await applyCouponCode(code);
    setCouponMsg(res);
    setApplyingCoupon(false);
  };

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0 && !loading) {
      router.push('/cart');
    }
  }, [items, loading, router]);

  // Enforce customer login: You can't checkout without being logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/checkout');
    }
  }, [authLoading, user, router]);

  const handleConfirmAddress = async (e) => {
    if (e) e.preventDefault();
    const errs = validateAddress(addressForm);
    if (Object.keys(errs).length > 0) {
      setAddressErrors(errs);
      return;
    }

    const cleanPhone = String(addressForm.phone).replace(/\D/g, '').slice(-10);
    const cleanPin = String(addressForm.postalCode).replace(/\D/g, '').slice(0, 6);

    const sanitized = {
      ...addressForm,
      fullName: addressForm.fullName.trim(),
      phone: cleanPhone,
      streetAddress: addressForm.streetAddress.trim(),
      postOffice: addressForm.postOffice.trim(),
      city: addressForm.city.trim(),
      state: addressForm.state || 'Kerala',
      postalCode: cleanPin,
      country: 'India'
    };

    setAddressForm(sanitized);
    setAddressErrors({});

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('logos_delivery_address', JSON.stringify(sanitized));
      } catch {}
    }

    if (user && addAddress) {
      try {
        await addAddress(sanitized);
      } catch (err) {
        console.warn('Profile address sync note:', err.message);
      }
    }

    setShowAddressModal(false);
    setIsEditingAddress(false);
    setError('');
  };

  const handlePlaceOrder = async () => {
    setError('');
    
    // User must be logged in to place an order
    if (!user) {
      router.push('/auth/login?redirect=/checkout');
      return;
    }

    // Strict Address Validation before ordering
    const errs = validateAddress(addressForm);
    if (Object.keys(errs).length > 0) {
      setAddressErrors(errs);
      setShowAddressModal(true);
      setIsEditingAddress(true);
      setError('Please provide your complete delivery address with a 6-digit PIN code and 10-digit mobile number.');
      return;
    }

    setLoading(true);

    try {
      const cleanPhone = String(addressForm.phone).replace(/\D/g, '').slice(-10);
      const cleanPin = String(addressForm.postalCode).replace(/\D/g, '').slice(0, 6);

      const finalShippingAddress = {
        fullName: addressForm.fullName.trim(),
        phone: cleanPhone,
        streetAddress: addressForm.streetAddress.trim(),
        postOffice: addressForm.postOffice.trim(),
        city: addressForm.city.trim(),
        state: addressForm.state || 'Kerala',
        postalCode: cleanPin,
        country: 'India'
      };

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('logos_delivery_address', JSON.stringify(finalShippingAddress));
        } catch {}
      }

      const customerName = user?.name || finalShippingAddress.fullName;
      const customerEmail = user?.email || addressForm.email || `${cleanPhone}@guest.logos.in`;
      const customerPhone = user?.phone || cleanPhone;

      const formattedItems = items.map((item) => ({
        bookId: item.book?._id || item.book?.id || item.book,
        book: item.book?._id || item.book?.id || item.book,
        title: item.book?.titleMalayalam || item.book?.title || 'LOGOS Book',
        author: item.book?.author || 'LOGOS',
        quantity: item.quantity,
        price: item.price || item.book?.discountPrice || item.book?.salePrice || item.book?.price || 299,
        coverImage: item.book?.coverImage || item.book?.image || ''
      }));

      const orderPayload = {
        items: formattedItems,
        orderItems: formattedItems,
        shippingAddress: finalShippingAddress,
        paymentMethod: paymentMethod === 'cod' ? 'cod' : 'razorpay',
        itemsPrice: subtotal,
        subtotal,
        shippingPrice: effectiveShippingFee,
        shippingFee: effectiveShippingFee,
        discount: (couponDiscount || 0) + (referralDiscount || 0) + (walletDiscount || 0),
        couponDiscount,
        referralDiscount,
        walletDiscount,
        useWalletBalance: Boolean(useWalletBalance),
        totalPrice: effectiveGrandTotal,
        totalAmount: effectiveGrandTotal,
        couponCode: appliedCoupon?.code || null,
        appliedCoupon: appliedCoupon?.code || null,
        isGuest: false,
        guestEmail: customerEmail,
        guestName: customerName,
        guestPhone: customerPhone
      };

      if (paymentMethod === 'razorpay') {
        const rzpData = await apiCreateRazorpayOrder(orderPayload);
        if (!rzpData || !rzpData.orderId) {
          throw new Error('Unable to initialize Razorpay payment order.');
        }

        const options = {
          key: rzpData.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_live_ThoKT60JX1kpL8',
          amount: rzpData.amount,
          currency: rzpData.currency || 'INR',
          name: 'LOGOS Bookstore',
          description: 'Payment for Book Purchase',
          order_id: rzpData.orderId,
          handler: async function (response) {
            try {
              setLoading(true);
              const verifyRes = await apiVerifyRazorpayPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                ...orderPayload
              });
              const verifiedId = verifyRes?.order?._id || verifyRes?.order?.orderNumber || 'LOGOS-ORDER';
              clearCart();
              router.push(`/order-placed?orderId=${verifiedId}`);
            } catch (vErr) {
              console.error('Payment verification failed:', vErr);
              setError(vErr.message || 'Payment verification failed. Please contact LOGOS support.');
              setLoading(false);
            }
          },
          prefill: rzpData.prefill || {
            name: customerName,
            email: customerEmail,
            contact: customerPhone
          },
          theme: {
            color: '#1044A5'
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
            }
          }
        };

        if (typeof window !== 'undefined' && window.Razorpay) {
          const rzp = new window.Razorpay(options);
          rzp.open();
          setLoading(false);
          return;
        } else {
          throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
        }
      }

      // COD Flow
      const result = await apiCreateOrder(orderPayload);
      const createdOrderId = result?.order?._id || result?.order?.orderNumber || result?._id || 'LOGOS-ORDER';

      setTimeout(() => {
        clearCart();
        router.push(`/order-placed?orderId=${createdOrderId}`);
      }, 1200);

    } catch (err) {
      console.error('Order placement error:', err);
      setError(err.message || 'Failed to place order. Please check all details.');
      setLoading(false);
    }
  };

  const activeAddr = (addressForm.fullName && addressForm.streetAddress)
    ? addressForm
    : ((user?.addresses && user.addresses[selectedAddressIndex]) || (addressForm.fullName ? addressForm : null));

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#1E3A8A] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-600 text-sm font-medium">Checking authorization...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between">
        <Navbar />
        <div className="max-w-md mx-auto my-auto px-4 py-24 text-center">
          <div className="bg-white p-8 rounded-xl border border-slate-200/80 shadow-sm">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Login Required</h2>
            <p className="text-slate-600 text-sm mb-6">
              You must be logged in to place an order. Please sign in or create an account to proceed to checkout.
            </p>
            <div className="space-y-3">
              <Link
                href="/auth/login?redirect=/checkout"
                className="block w-full py-3 bg-[#1E3A8A] hover:bg-[#152e72] text-white font-medium rounded-lg text-sm transition"
              >
                Sign In to Checkout
              </Link>
              <Link
                href="/auth/signup?redirect=/checkout"
                className="block w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium rounded-lg text-sm transition"
              >
                Create an Account
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 max-w-md sm:max-w-xl mx-auto w-full px-4 pt-24 sm:pt-28 pb-16">
        {/* 1. Stepper Header */}
        <div className="flex items-center justify-between mb-6 px-1 text-xs">
          {/* Step 1: Review Order */}
          <div className="flex items-center gap-1.5 font-medium text-[#1044A5]">
            <span className="w-5 h-5 rounded-full bg-[#1044A5] text-white flex items-center justify-center text-[11px] font-bold">
              1
            </span>
            <span>Review Order</span>
          </div>

          <div className="flex-1 h-[1px] bg-slate-200 mx-2" />

          {/* Step 2: Payment */}
          <div className="flex items-center gap-1.5 font-normal text-slate-400">
            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[11px]">
              2
            </span>
            <span>Payment</span>
          </div>

          <div className="flex-1 h-[1px] bg-slate-200 mx-2" />

          {/* Step 3: Confirmation */}
          <div className="flex items-center gap-1.5 font-normal text-slate-400">
            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[11px]">
              3
            </span>
            <span>Confirmation</span>
          </div>
        </div>

        {/* Page Title */}
        <div className="mb-5">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Place Your Order
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Review your details and complete your purchase.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center justify-between gap-2 shadow-xs">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowAddressModal(true);
                setIsEditingAddress(true);
              }}
              className="text-[11px] font-semibold underline text-[#1044A5] shrink-0"
            >
              Update Address
            </button>
          </div>
        )}

        <div className="space-y-4">
          {/* 2. Ordered Item Card */}
          <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-100 shadow-sm">
            {items.map((item) => {
              const book = item.book || {};
              const title = book.titleMalayalam || book.title || 'LOGOS Book';
              const author = book.author || 'LOGOS Publications';
              const img = book.coverImage || book.image || '/book1.jpg';
              const price = item.price || book.salePrice || book.price || 112;
              const original = book.originalPrice || price + 68;

              return (
                <div key={book._id || book.id || item.book} className="flex items-center gap-3">
                  <div className="w-14 h-18 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                    <img
                      src={img}
                      alt={title}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/book1.jpg';
                      }}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">{title}</h3>
                      <button
                        type="button"
                        onClick={() => removeFromCart(book._id || book.id || item.book)}
                        className="text-slate-400 hover:text-rose-500 p-0.5"
                        title="Remove"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400 font-light truncate">{author}</p>
                    <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Qty: {item.quantity}</span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-xs sm:text-sm font-bold text-slate-900 font-mono">₹{price * item.quantity}</span>
                      <span className="text-[10px] line-through text-slate-400 font-mono">₹{original * item.quantity}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 3. Delivery Address Card */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm text-left hover:border-blue-100 transition-colors">
            {/* Header row */}
            <div className="flex items-center justify-between gap-3 px-4 sm:px-5 pt-4 pb-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#1044A5] flex items-center justify-center shrink-0 border border-blue-100/60">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-slate-900 truncate">Delivery Address</h3>
                {activeAddr?.postalCode && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-semibold rounded-md border border-emerald-200/60 shrink-0">
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                    Verified
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowAddressModal(true);
                  setIsEditingAddress(true);
                }}
                className="shrink-0 inline-flex items-center gap-0.5 px-2.5 py-1.5 text-xs font-semibold text-[#1044A5] bg-blue-50/70 hover:bg-blue-100/70 rounded-lg transition-colors"
              >
                <span>{activeAddr?.streetAddress ? 'Change' : 'Add'}</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Body — indented to align under the title */}
            <div className="border-t border-slate-100 px-4 sm:px-5 py-3">
              <div className="pl-12">
                {activeAddr && activeAddr.streetAddress ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-slate-900">{activeAddr.fullName}</span>
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 font-mono">
                        <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        +91 {activeAddr.phone}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed break-words">
                      {activeAddr.streetAddress}
                      {activeAddr.postOffice ? `, ${activeAddr.postOffice} P.O.` : ''}
                    </p>
                    <p className="text-xs text-slate-600">
                      {activeAddr.city}, {activeAddr.state || 'Kerala'}
                      <span className="mx-1.5 text-slate-300">•</span>
                      <span className="font-mono font-semibold text-slate-900">{activeAddr.postalCode}</span>
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs text-rose-500 font-medium">No complete delivery address selected</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Please add your address with Post Office, State &amp; 6-digit PIN code</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 4. Payment Method Card */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm text-left">
            <div className="flex items-center justify-between gap-3 px-4 sm:px-5 pt-4 pb-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#1044A5] flex items-center justify-center shrink-0 border border-blue-100/60">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-slate-900 truncate">Payment Method</h3>
              </div>

              <button
                type="button"
                onClick={() => setShowPaymentModal(true)}
                className="shrink-0 inline-flex items-center gap-0.5 px-2.5 py-1.5 text-xs font-semibold text-[#1044A5] bg-blue-50/70 hover:bg-blue-100/70 rounded-lg transition-colors"
              >
                <span>Change</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className="border-t border-slate-100 px-4 sm:px-5 py-3">
              <div className="pl-12 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {paymentMethod === 'cod' ? (
                    <span className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </span>
                  ) : (
                    <span className="w-5 h-5 rounded-md bg-[#5F259F] text-white flex items-center justify-center text-[9px] font-bold shrink-0">
                      पे
                    </span>
                  )}
                  <p className="text-xs font-medium text-slate-700 truncate">
                    {paymentMethod === 'cod' ? 'Cash on Delivery' : 'UPI / Cards / Net Banking'}
                  </p>
                </div>
                {paymentMethod === 'cod' ? (
                  <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md shrink-0">+2% fee</span>
                ) : (
                  <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md shrink-0">Free shipping</span>
                )}
              </div>
            </div>
          </div>

          {/* 5. Price Details Card */}
          <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm space-y-2 text-xs text-slate-600">
            <h3 className="text-xs font-semibold text-slate-900 pb-2 border-b border-slate-100">
              Price Details
            </h3>

            <div className="flex justify-between pt-1">
              <span className="font-light">Subtotal ({itemCount} item)</span>
              <span className="font-mono text-slate-900">₹{subtotal}</span>
            </div>

            <div className="flex justify-between">
              <span className="font-light">Shipping Charges</span>
              <span className="font-mono text-slate-900">
                {effectiveShippingFee === 0 ? (
                  <span className="text-emerald-600 font-medium">
                    FREE {paymentMethod === 'cod' && subtotal >= 1000 ? '(Orders ≥ ₹1,000)' : '(₹0.00)'}
                  </span>
                ) : (
                  <span>
                    ₹{effectiveShippingFee}{' '}
                    <span className="text-[10px] text-slate-400 font-sans font-normal">(COD 2% under ₹1,000)</span>
                  </span>
                )}
              </span>
            </div>

            {/* Referral Reward Balance Card */}
            {user?.referralRewardBalance > 0 && (
              <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-xl p-3 flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    ₹
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-emerald-950">
                      Referral Rewards: ₹{user.referralRewardBalance}
                    </p>
                    <p className="text-[10px] text-emerald-700">
                      Apply as discount on this upcoming purchase
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useWalletBalance}
                    onChange={(e) => setUseWalletBalance(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4.5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            )}

            {referralDiscount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span className="font-light">Friend Referral (15% OFF)</span>
                <span className="font-mono font-medium">− ₹{referralDiscount}</span>
              </div>
            )}

            {couponDiscount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span className="font-light">Coupon Discount {appliedCoupon?.code ? `(${appliedCoupon.code})` : ''}</span>
                <span className="font-mono font-medium">− ₹{couponDiscount}</span>
              </div>
            )}

            {walletDiscount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span className="font-light">Referral Reward Credit</span>
                <span className="font-mono font-medium">− ₹{walletDiscount}</span>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between font-bold text-slate-900 text-sm">
              <span>Total Amount</span>
              <span className="font-mono text-[#1044A5] text-base">₹{effectiveGrandTotal}</span>
            </div>
          </div>

          {/* 6. Place Order Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full py-3.5 px-6 bg-[#1044A5] hover:bg-[#0c3986] text-white rounded-lg text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-md shadow-blue-900/15 flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Place Order</span>
            </button>

            <p className="text-[10px] text-center text-slate-400 mt-2.5">
              By placing this order, you agree to our{' '}
              <Link href="/policies/terms" className="text-[#1044A5] hover:underline">
                Terms &amp; Conditions
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* LOGOS Branded Order Placing Loading Modal Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative bg-white rounded-3xl max-w-sm w-full p-8 text-center shadow-2xl border border-slate-100 flex flex-col items-center overflow-hidden">
            {/* Top decorative gradient glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-2 bg-gradient-to-r from-transparent via-[#1044A5] to-transparent rounded-full opacity-80" />
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-36 h-36 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />

            {/* LOGOS Brand Emblem with soft animated pulse */}
            <div className="relative mb-5">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-50 via-white to-sky-50 ring-8 ring-blue-50/70 border border-blue-100/60 shadow-lg shadow-blue-500/5 flex items-center justify-center p-3.5 transition-all">
                <img
                  src="/logo.png"
                  alt="LOGOS Books"
                  className="w-full h-full object-contain filter drop-shadow-xs"
                />
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-[#1044A5] text-white flex items-center justify-center shadow-md ring-2 ring-white animate-bounce">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              </div>
            </div>

            {/* Title and Subtitle */}
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Placing Your Order...</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed max-w-[240px]">
              Preparing your literary journey to your doorstep with care.
            </p>

            {/* Loading Indicator Bar */}
            <div className="w-full mt-6 flex flex-col items-center gap-2.5">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50/80 border border-blue-100 text-xs text-[#1044A5] font-medium">
                <div className="w-4 h-4 border-2 border-[#1044A5]/30 border-t-[#1044A5] rounded-full animate-spin" />
                <span>Confirming Order &amp; Stock</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                <span>🔒</span> Safe &amp; 256-Bit Encrypted Checkout
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Fancy Realistic Delivery Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-100 my-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1044A5] flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Delivery Address</h3>
                  <p className="text-[11px] text-slate-400">All fields required for accurate dispatch</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAddressModal(false);
                  setIsEditingAddress(false);
                }}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors text-xs"
              >
                ✕
              </button>
            </div>

            {/* Saved Address Selector (if user has saved addresses and not currently editing) */}
            {user?.addresses && user.addresses.length > 0 && !isEditingAddress ? (
              <div className="space-y-3">
                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {user.addresses.map((addr, idx) => (
                    <label
                      key={addr._id || idx}
                      onClick={() => {
                        setSelectedAddressIndex(idx);
                        setAddressForm({
                          fullName: addr.fullName || '',
                          email: addr.email || user?.email || '',
                          phone: addr.phone || '',
                          streetAddress: addr.streetAddress || '',
                          postOffice: addr.postOffice || '',
                          city: addr.city || '',
                          state: addr.state || 'Kerala',
                          postalCode: addr.postalCode || '',
                          country: 'India'
                        });
                      }}
                      className={`block p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        selectedAddressIndex === idx
                          ? 'border-[#1044A5] bg-blue-50/40 ring-2 ring-[#1044A5]/10'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{addr.fullName}</span>
                        <input
                          type="radio"
                          name="modal_address"
                          checked={selectedAddressIndex === idx}
                          onChange={() => {}}
                          className="text-[#1044A5]"
                        />
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1">
                        {addr.streetAddress}, {addr.postOffice ? `${addr.postOffice} P.O., ` : ''}{addr.city}, {addr.state || 'Kerala'} - <span className="font-mono font-semibold">{addr.postalCode}</span>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5 font-mono">Phone: {addr.phone}</p>
                    </label>
                  ))}
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingAddress(true)}
                    className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                  >
                    + Enter New Address
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddressModal(false)}
                    className="flex-1 py-2.5 px-4 bg-[#1044A5] hover:bg-[#0c3986] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                  >
                    Confirm Selection
                  </button>
                </div>
              </div>
            ) : (
              /* Realistic & Fancy Address Form */
              <form onSubmit={handleConfirmAddress} className="space-y-3.5 text-xs">
                {/* 1. Full Name */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-semibold text-slate-700">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. Aifa Sana"
                      value={addressForm.fullName}
                      onChange={(e) => {
                        setAddressForm({ ...addressForm, fullName: e.target.value });
                        if (addressErrors.fullName) setAddressErrors({ ...addressErrors, fullName: '' });
                      }}
                      className={`w-full pl-9 pr-3 py-2.5 bg-[#FAFBFD] border rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1044A5]/20 ${
                        addressErrors.fullName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 focus:border-[#1044A5]'
                      }`}
                    />
                  </div>
                  {addressErrors.fullName && (
                    <p className="text-[10px] text-rose-500 mt-1">{addressErrors.fullName}</p>
                  )}
                </div>

                {/* 2. Phone Number with Live Validation Pill */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-semibold text-slate-700">
                      Mobile Number <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] font-mono">
                      {String(addressForm.phone || '').replace(/\D/g, '').length === 10 ? (
                        <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                          ✓ 10-Digit Mobile
                        </span>
                      ) : (
                        <span className="text-slate-400">
                          {String(addressForm.phone || '').replace(/\D/g, '').length}/10 digits
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <span className="text-xs font-mono font-medium text-slate-500 border-r border-slate-200 pr-2 mr-1">+91</span>
                    </div>
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="9876543210"
                      value={addressForm.phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setAddressForm({ ...addressForm, phone: val });
                        if (addressErrors.phone) setAddressErrors({ ...addressErrors, phone: '' });
                      }}
                      className={`w-full pl-16 pr-3 py-2.5 bg-[#FAFBFD] border rounded-lg text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1044A5]/20 ${
                        addressErrors.phone ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 focus:border-[#1044A5]'
                      }`}
                    />
                  </div>
                  {addressErrors.phone && (
                    <p className="text-[10px] text-rose-500 mt-1">{addressErrors.phone}</p>
                  )}
                </div>

                {/* 3. Street Address / House Name */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    House Name / Flat / Street Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. Umminikadavath House, Othukkungal"
                      value={addressForm.streetAddress}
                      onChange={(e) => {
                        setAddressForm({ ...addressForm, streetAddress: e.target.value });
                        if (addressErrors.streetAddress) setAddressErrors({ ...addressErrors, streetAddress: '' });
                      }}
                      className={`w-full pl-9 pr-3 py-2.5 bg-[#FAFBFD] border rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1044A5]/20 ${
                        addressErrors.streetAddress ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 focus:border-[#1044A5]'
                      }`}
                    />
                  </div>
                  {addressErrors.streetAddress && (
                    <p className="text-[10px] text-rose-500 mt-1">{addressErrors.streetAddress}</p>
                  )}
                </div>

                {/* 4. Post Office & City Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Post Office (Requested specifically) */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Post Office (P.O.) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. Othukkungal P.O."
                        value={addressForm.postOffice}
                        onChange={(e) => {
                          setAddressForm({ ...addressForm, postOffice: e.target.value });
                          if (addressErrors.postOffice) setAddressErrors({ ...addressErrors, postOffice: '' });
                        }}
                        className={`w-full pl-9 pr-3 py-2 bg-[#FAFBFD] border rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1044A5]/20 ${
                          addressErrors.postOffice ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 focus:border-[#1044A5]'
                        }`}
                      />
                    </div>
                    {addressErrors.postOffice && (
                      <p className="text-[10px] text-rose-500 mt-1">{addressErrors.postOffice}</p>
                    )}
                  </div>

                  {/* City / District */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      City / District <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. Kottakkal"
                        value={addressForm.city}
                        onChange={(e) => {
                          setAddressForm({ ...addressForm, city: e.target.value });
                          if (addressErrors.city) setAddressErrors({ ...addressErrors, city: '' });
                        }}
                        className={`w-full pl-9 pr-3 py-2 bg-[#FAFBFD] border rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1044A5]/20 ${
                          addressErrors.city ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 focus:border-[#1044A5]'
                        }`}
                      />
                    </div>
                    {addressErrors.city && (
                      <p className="text-[10px] text-rose-500 mt-1">{addressErrors.city}</p>
                    )}
                  </div>
                </div>

                {/* 5. State Selector & PIN Code */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* State Dropdown */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      State <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={addressForm.state || 'Kerala'}
                      onChange={(e) => {
                        setAddressForm({ ...addressForm, state: e.target.value });
                        if (addressErrors.state) setAddressErrors({ ...addressErrors, state: '' });
                      }}
                      className="w-full px-3 py-2 bg-[#FAFBFD] border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1044A5]/20 focus:border-[#1044A5] cursor-pointer"
                    >
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                    {addressErrors.state && (
                      <p className="text-[10px] text-rose-500 mt-1">{addressErrors.state}</p>
                    )}
                  </div>

                  {/* PIN Code with Live 6-digit verification */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-semibold text-slate-700">
                        PIN Code <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[10px] font-mono">
                        {String(addressForm.postalCode || '').replace(/\D/g, '').length === 6 ? (
                          <span className="text-emerald-600 font-semibold">✓ 6 Digits</span>
                        ) : (
                          <span className="text-slate-400">
                            {String(addressForm.postalCode || '').replace(/\D/g, '').length}/6
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <span className="text-xs font-mono font-bold text-slate-400">#</span>
                      </div>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="e.g. 676528"
                        value={addressForm.postalCode}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setAddressForm({ ...addressForm, postalCode: val });
                          if (addressErrors.postalCode) setAddressErrors({ ...addressErrors, postalCode: '' });
                        }}
                        className={`w-full pl-8 pr-3 py-2 bg-[#FAFBFD] border rounded-lg text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1044A5]/20 ${
                          addressErrors.postalCode ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 focus:border-[#1044A5]'
                        }`}
                      />
                    </div>
                    {addressErrors.postalCode && (
                      <p className="text-[10px] text-rose-500 mt-1">{addressErrors.postalCode}</p>
                    )}
                  </div>
                </div>

                {/* Quick Kerala District Suggestions */}
                <div className="pt-1">
                  <span className="text-[10px] text-slate-400 block mb-1">Quick Select District:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {['Malappuram', 'Kozhikode', 'Ernakulam', 'Thrissur', 'Palakkad', 'Kannur', 'Kottakkal'].map((district) => (
                      <button
                        key={district}
                        type="button"
                        onClick={() => {
                          setAddressForm((prev) => ({
                            ...prev,
                            city: district,
                            state: 'Kerala'
                          }));
                          if (addressErrors.city) setAddressErrors((prev) => ({ ...prev, city: '' }));
                        }}
                        className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-blue-50 text-[10px] text-slate-600 hover:text-[#1044A5] transition-colors border border-slate-200/60"
                      >
                        {district}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 flex gap-2">
                  {user?.addresses && user.addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsEditingAddress(false)}
                      className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
                    >
                      Back to Saved
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-[#1044A5] hover:bg-[#0c3986] text-white rounded-lg font-semibold shadow-md shadow-blue-900/15 flex items-center justify-center gap-1.5 transition-all active:scale-98"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Confirm &amp; Use Address</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Payment Selector Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-semibold text-slate-900">Select Payment Method</h3>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <label
                onClick={() => {
                  setPaymentMethod('razorpay');
                  setShowPaymentModal(false);
                }}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer ${
                  paymentMethod === 'razorpay' ? 'border-[#1044A5] bg-blue-50/50' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-md bg-[#5F259F] text-white flex items-center justify-center text-[9px] font-bold">
                    पे
                  </span>
                  <span className="font-medium text-slate-900">UPI / Cards / Net Banking</span>
                </div>
                <span className="text-[10px] text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md font-medium">Free Shipping</span>
              </label>

              <label
                onClick={() => {
                  setPaymentMethod('cod');
                  setShowPaymentModal(false);
                }}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer ${
                  paymentMethod === 'cod' ? 'border-[#1044A5] bg-blue-50/50' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="font-medium text-slate-900">Cash on Delivery (COD)</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
                  subtotal >= 1000 ? 'text-emerald-700 bg-emerald-100/70' : 'text-amber-700 bg-amber-100/70'
                }`}>
                  {subtotal >= 1000 ? 'Free (Above ₹1,000)' : '+2% fee (< ₹1,000)'}
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
