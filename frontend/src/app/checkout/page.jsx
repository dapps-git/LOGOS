'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { apiCreateOrder, apiGetAvailableCoupons } from '../../lib/api';
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

  // Restore saved address on initial load
  useEffect(() => {
    if (user?.addresses && user.addresses.length > 0) {
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
    } else if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('logos_delivery_address');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === 'object') {
            setAddressForm((prev) => ({
              ...prev,
              ...parsed,
              fullName: parsed.fullName || user?.name || prev.fullName,
              phone: parsed.phone || user?.phone || prev.phone
            }));
          }
        } else if (user) {
          setAddressForm((prev) => ({
            ...prev,
            fullName: user.name || prev.fullName,
            phone: user.phone || prev.phone
          }));
        }
      } catch {}
    }
  }, [user, selectedAddressIndex]);

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
        shippingPrice: shippingFee,
        shippingFee,
        discount: (couponDiscount || 0) + (referralDiscount || 0) + (walletDiscount || 0),
        couponDiscount,
        referralDiscount,
        walletDiscount,
        totalPrice: grandTotal,
        totalAmount: grandTotal,
        appliedCoupon: appliedCoupon?.code || null,
        isGuest: !user,
        guestEmail: customerEmail,
        guestName: customerName,
        guestPhone: customerPhone
      };

      const result = await apiCreateOrder(orderPayload);
      const createdOrderId = result?.order?._id || result?.order?.orderNumber || result?._id || 'LOGOS-ORDER';

      // If Razorpay online payment selected and gateway configured
      if (paymentMethod === 'razorpay' && result?.razorpayOrder) {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
          amount: result.razorpayOrder.amount,
          currency: 'INR',
          name: 'LOGOS Books',
          description: 'Payment for Book Purchase',
          order_id: result.razorpayOrder.id,
          handler: function (response) {
            clearCart();
            router.push(`/order-placed?orderId=${createdOrderId}`);
          },
          prefill: {
            name: customerName,
            email: customerEmail,
            contact: customerPhone
          },
          theme: {
            color: '#1044A5'
          }
        };

        if (typeof window !== 'undefined' && window.Razorpay) {
          const rzp = new window.Razorpay(options);
          rzp.open();
          setLoading(false);
          return;
        }
      }

      // Small deliberate pause to show the literary loading graphic
      setTimeout(() => {
        clearCart();
        router.push(`/order-placed?orderId=${createdOrderId}`);
      }, 1500);

    } catch (err) {
      console.error('Order placement error:', err);
      setError(err.message || 'Failed to place order. Please check all details.');
      setLoading(false);
    }
  };

  const activeAddr = (addressForm.fullName && addressForm.streetAddress)
    ? addressForm
    : ((user?.addresses && user.addresses[selectedAddressIndex]) || (addressForm.fullName ? addressForm : null));

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
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-sm">
            {items.map((item) => {
              const book = item.book || {};
              const title = book.titleMalayalam || book.title || 'LOGOS Book';
              const author = book.author || 'LOGOS Publications';
              const img = book.coverImage || book.image || '/book1.jpg';
              const price = item.price || book.salePrice || book.price || 112;
              const original = book.originalPrice || price + 68;

              return (
                <div key={book._id || book.id || item.book} className="flex items-center gap-3">
                  <div className="w-14 h-18 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
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

          {/* 3. Delivery Address Card (Fancy & Detailed) */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-sm relative overflow-hidden text-left hover:border-blue-100 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 text-[#1044A5] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs border border-blue-100/60">
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-slate-900">Delivery Address</h3>
                    {activeAddr?.postalCode && (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-semibold rounded-full border border-emerald-200/60">
                        Verified
                      </span>
                    )}
                  </div>

                  {activeAddr && activeAddr.streetAddress ? (
                    <div className="mt-1.5 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-slate-900">{activeAddr.fullName}</span>
                        <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-mono">
                          📞 {activeAddr.phone}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 leading-snug">
                        {activeAddr.streetAddress}
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {activeAddr.postOffice ? `${activeAddr.postOffice} P.O., ` : ''}{activeAddr.city}, {activeAddr.state || 'Kerala'} - <span className="font-mono font-bold text-slate-800">{activeAddr.postalCode}</span>
                      </p>
                    </div>
                  ) : (
                    <div className="mt-1">
                      <p className="text-xs text-rose-500 font-medium">No complete delivery address selected</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Please add your address with Post Office, State &amp; 6-digit PIN code</p>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowAddressModal(true);
                  setIsEditingAddress(true);
                }}
                className="text-xs text-[#1044A5] hover:text-[#0b3380] font-semibold shrink-0 flex items-center gap-1 pt-1 px-2.5 py-1 bg-blue-50/70 hover:bg-blue-100/70 rounded-full transition-colors"
              >
                <span>{activeAddr?.streetAddress ? 'Change' : 'Add'}</span>
                <span>›</span>
              </button>
            </div>
          </div>

          {/* 4. Payment Method Card */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-sm flex items-start justify-between gap-3 text-left">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-[#1044A5] flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-semibold text-slate-900">Payment Method</h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#5F259F] text-white flex items-center justify-center text-[8px] font-bold">
                    पे
                  </span>
                  <p className="text-xs text-slate-700">
                    {paymentMethod === 'cod'
                      ? 'Cash on Delivery (COD)'
                      : 'UPI (PhonePe / Google Pay / Paytm)'}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowPaymentModal(true)}
              className="text-xs text-[#1044A5] hover:underline font-medium shrink-0 flex items-center gap-0.5 pt-0.5"
            >
              <span>Change</span>
              <span>›</span>
            </button>
          </div>

          {/* 5. Price Details Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-2 text-xs text-slate-600">
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
                {shippingFee === 0 ? <span className="text-emerald-600">₹0.00</span> : `₹${shippingFee}`}
              </span>
            </div>

            {(couponDiscount > 0 || referralDiscount > 0 || walletDiscount > 0) && (
              <div className="flex justify-between text-emerald-600">
                <span className="font-light">Discount</span>
                <span className="font-mono">
                  − ₹{(couponDiscount || 0) + (referralDiscount || 0) + (walletDiscount || 0)}
                </span>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between font-bold text-slate-900 text-sm">
              <span>Total Amount</span>
              <span className="font-mono text-[#1044A5] text-base">₹{grandTotal}</span>
            </div>
          </div>

          {/* 6. Place Order Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full py-4 px-6 bg-[#1044A5] hover:bg-[#0c3986] text-white rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-md shadow-blue-900/15 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
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

      {/* Literary Book Order Placing Loading Modal Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xs w-full p-6 text-center shadow-2xl border border-slate-100 flex flex-col items-center">
            {/* Animated Book graphic */}
            <div className="w-24 h-24 rounded-full bg-[#EFF5FF] flex items-center justify-center mb-4 relative animate-pulse">
              <svg className="w-16 h-16" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 20C40 18 20 22 20 22V75C20 75 40 71 50 75C60 71 80 75 80 75V22C80 22 60 18 50 20Z" fill="#1D4ED8" opacity="0.9"/>
                <path d="M50 20V75" stroke="white" strokeWidth="2"/>
                <path d="M26 32H44M26 42H44M26 52H38" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M56 32H74M56 42H74M56 52H68" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>

            <h3 className="text-base font-bold text-slate-900">Placing Your Order...</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Preparing your literary journey to your doorstep.
            </p>
            <div className="w-6 h-6 border-2 border-[#1044A5]/30 border-t-[#1044A5] rounded-full animate-spin mt-4" />
          </div>
        </div>
      )}

      {/* Fancy Realistic Delivery Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-100 my-auto animate-in fade-in zoom-in-95 duration-150">
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
                      className={`w-full pl-9 pr-3 py-2.5 bg-[#FAFBFD] border rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1044A5]/20 ${
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
                      className={`w-full pl-16 pr-3 py-2.5 bg-[#FAFBFD] border rounded-xl text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1044A5]/20 ${
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
                      className={`w-full pl-9 pr-3 py-2.5 bg-[#FAFBFD] border rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1044A5]/20 ${
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
                        className={`w-full pl-9 pr-3 py-2 bg-[#FAFBFD] border rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1044A5]/20 ${
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
                        className={`w-full pl-9 pr-3 py-2 bg-[#FAFBFD] border rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1044A5]/20 ${
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
                      className="w-full px-3 py-2 bg-[#FAFBFD] border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1044A5]/20 focus:border-[#1044A5] cursor-pointer"
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
                        className={`w-full pl-8 pr-3 py-2 bg-[#FAFBFD] border rounded-xl text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1044A5]/20 ${
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
                      className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
                    >
                      Back to Saved
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-[#1044A5] hover:bg-[#0c3986] text-white rounded-xl font-semibold shadow-md shadow-blue-900/15 flex items-center justify-center gap-1.5 transition-all active:scale-98"
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
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
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
                className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer ${
                  paymentMethod === 'razorpay' ? 'border-[#1044A5] bg-blue-50/50' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-[#5F259F] text-white flex items-center justify-center text-[9px] font-bold">
                    पे
                  </span>
                  <span className="font-medium text-slate-900">UPI / Cards / Net Banking</span>
                </div>
                <span className="text-[10px] text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-full">Instant</span>
              </label>

              <label
                onClick={() => {
                  setPaymentMethod('cod');
                  setShowPaymentModal(false);
                }}
                className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer ${
                  paymentMethod === 'cod' ? 'border-[#1044A5] bg-blue-50/50' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="font-medium text-slate-900">Cash on Delivery (COD)</span>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
