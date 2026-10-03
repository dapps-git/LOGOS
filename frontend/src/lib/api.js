const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

function getGuestSessionId() {
  if (typeof window === 'undefined') return '';
  let guestId = localStorage.getItem('logos_guest_session_id');
  if (!guestId) {
    guestId = 'guest_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('logos_guest_session_id', guestId);
  }
  return guestId;
}

// Helper for authorized fetch
function getAuthHeaders() {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('logos_customer_token');
  const guestId = getGuestSessionId();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (guestId) {
    headers['x-guest-id'] = guestId;
    headers['x-guest-session-id'] = guestId;
  }
  return headers;
}

export async function fetchBooks(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/books${query ? `?${query}` : ''}`, {
      next: { revalidate: 60 }
    });
    if (!res.ok) throw new Error(`Failed to fetch books: ${res.status}`);
    const data = await res.json();
    return data.books || [];
  } catch (err) {
    console.warn('[LOGOS API] fetchBooks error:', err.message);
    return [];
  }
}

export async function fetchNewArrivals() {
  try {
    const res = await fetch(`${API_BASE}/books/collections/new-arrivals`, {
      next: { revalidate: 60 }
    });
    if (!res.ok) throw new Error(`Failed to fetch new arrivals: ${res.status}`);
    const data = await res.json();
    return data.books || [];
  } catch (err) {
    console.warn('[LOGOS API] fetchNewArrivals fallback:', err.message);
    return [];
  }
}

export async function fetchBestSellers() {
  try {
    const res = await fetch(`${API_BASE}/books/collections/best-sellers`, {
      next: { revalidate: 60 }
    });
    if (!res.ok) throw new Error(`Failed to fetch bestsellers: ${res.status}`);
    const data = await res.json();
    return data.books || [];
  } catch (err) {
    console.warn('[LOGOS API] fetchBestSellers fallback:', err.message);
    return [];
  }
}

export async function fetchFeaturedBooks() {
  try {
    const res = await fetch(`${API_BASE}/books/collections/featured`, {
      next: { revalidate: 60 }
    });
    if (!res.ok) throw new Error(`Failed to fetch featured books: ${res.status}`);
    const data = await res.json();
    return data.books || [];
  } catch (err) {
    console.warn('[LOGOS API] fetchFeaturedBooks fallback:', err.message);
    return [];
  }
}

export async function fetchBookBySlugOrId(idOrSlug) {
  try {
    const res = await fetch(`${API_BASE}/books/${idOrSlug}`, {
      next: { revalidate: 60 }
    });
    if (!res.ok) throw new Error(`Failed to fetch book: ${res.status}`);
    const data = await res.json();
    return data.book || null;
  } catch (err) {
    console.warn(`[LOGOS API] fetchBookBySlugOrId (${idOrSlug}) fallback:`, err.message);
    return null;
  }
}

export async function fetchBanners() {
  try {
    const res = await fetch(`${API_BASE}/banners`, {
      next: { revalidate: 60 }
    });
    if (!res.ok) throw new Error(`Failed to fetch banners: ${res.status}`);
    const data = await res.json();
    return data.banners || [];
  } catch (err) {
    console.warn('[LOGOS API] fetchBanners fallback:', err.message);
    return [];
  }
}

// ----------------- Customer Auth APIs -----------------
export async function customerLogin(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Login failed');
  return data;
}

export async function customerRegister(payload) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Registration failed');
  return data;
}

export async function customerGoogleAuth(payload) {
  const res = await fetch(`${API_BASE}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Google login failed');
  return data;
}

export async function customerForgotPassword(email) {
  const res = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to send reset OTP');
  return data;
}

export async function customerResetPassword(email, otp, newPassword) {
  const res = await fetch(`${API_BASE}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp, newPassword })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to reset password');
  return data;
}

export async function fetchCustomerProfile() {
  const res = await fetch(`${API_BASE}/auth/profile`, {
    headers: getAuthHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch profile');
  return data.customer;
}

export async function updateCustomerProfile(payload) {
  const res = await fetch(`${API_BASE}/auth/profile`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update profile');
  return data.customer;
}

export async function addCustomerAddress(address) {
  const res = await fetch(`${API_BASE}/auth/address`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(address)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to add address');
  return data.addresses;
}

export async function deleteCustomerAddress(addressId) {
  const res = await fetch(`${API_BASE}/auth/address/${addressId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete address');
  return data.addresses;
}

// ----------------- Cart APIs -----------------
export async function fetchCart() {
  const guestId = getGuestSessionId();
  const res = await fetch(`${API_BASE}/cart?guestId=${guestId}`, {
    headers: getAuthHeaders()
  });
  const data = await res.json();
  return data.cart || { items: [] };
}

export async function apiAddToCart(bookId, quantity = 1) {
  const guestId = getGuestSessionId();
  const res = await fetch(`${API_BASE}/cart/add`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ bookId, quantity, guestId })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to add to cart');
  return data.cart;
}

export async function apiUpdateCart(bookId, quantity) {
  const guestId = getGuestSessionId();
  const res = await fetch(`${API_BASE}/cart/update`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ bookId, quantity, guestId })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update cart');
  return data.cart;
}

export async function apiRemoveFromCart(bookId) {
  const guestId = getGuestSessionId();
  const res = await fetch(`${API_BASE}/cart/item/${bookId}?guestId=${guestId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to remove item');
  return data.cart;
}

// ----------------- Wishlist APIs -----------------
export async function fetchWishlist() {
  const guestId = getGuestSessionId();
  const res = await fetch(`${API_BASE}/wishlist?guestId=${guestId}`, {
    headers: getAuthHeaders()
  });
  const data = await res.json();
  return data.wishlist || { books: [] };
}

export async function apiToggleWishlist(bookId) {
  const guestId = getGuestSessionId();
  const res = await fetch(`${API_BASE}/wishlist/toggle`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ bookId, guestId })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update wishlist');
  return data.wishlist;
}

// ----------------- Coupons & Referral APIs -----------------
export async function apiValidateCoupon(code, cartTotal) {
  const res = await fetch(`${API_BASE}/coupons/validate`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ code, cartTotal })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Invalid coupon');
  return data;
}

export async function apiGetAvailableCoupons() {
  const res = await fetch(`${API_BASE}/coupons/available`, {
    headers: getAuthHeaders()
  });
  const data = await res.json();
  return data.coupons || [];
}

export async function apiValidateReferral(referralCode) {
  const res = await fetch(`${API_BASE}/referrals/validate`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ referralCode })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Invalid referral code');
  return data;
}

export async function apiGetMyReferralSummary() {
  const res = await fetch(`${API_BASE}/referrals/my-rewards`, {
    headers: getAuthHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch referral summary');
  return data;
}

// ----------------- Orders APIs -----------------
export async function apiCreateOrder(orderPayload) {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(orderPayload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create order');
  return data;
}

export async function apiGetMyOrders() {
  const res = await fetch(`${API_BASE}/orders/my-orders`, {
    headers: getAuthHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch orders');
  return data.orders || [];
}

export async function apiGetOrderById(orderId) {
  const res = await fetch(`${API_BASE}/orders/${orderId}`, {
    headers: getAuthHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch order details');
  return data.order;
}

export async function apiCancelOrder(orderId, reason = '') {
  const res = await fetch(`${API_BASE}/orders/${orderId}/cancel`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ cancellationReason: reason, reason })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to cancel order');
  return data;
}

export async function apiRequestReturn(orderId, reason, description = '') {
  const res = await fetch(`${API_BASE}/orders/${orderId}/return`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ reason, description })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to submit return request');
  return data;
}

export async function fetchTestimonials() {
  try {
    const res = await fetch(`${API_BASE}/reviews/testimonials`, {
      next: { revalidate: 30 }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.reviews || [];
  } catch (err) {
    console.warn('[LOGOS API] fetchTestimonials fallback:', err.message);
    return [];
  }
}

