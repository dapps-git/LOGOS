export const getApiBase = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL;
  if (envUrl) {
    return envUrl.replace(/\/+$/, '');
  }
  if (process.env.NODE_ENV !== 'production') {
    return 'http://localhost:5001/api';
  }
  throw new Error('API URL is not configured. Please define NEXT_PUBLIC_API_URL in your environment.');
};

function getGuestSessionId() {
  if (typeof window === 'undefined') return '';
  let guestId = localStorage.getItem('logos_guest_session_id');
  if (!guestId) {
    guestId = 'guest_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('logos_guest_session_id', guestId);
  }
  return guestId;
}

// Helper for authorized fetch (standard headers only to avoid CORS preflight rejection)
function getAuthHeaders() {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('logos_customer_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export async function fetchBooks(params = {}) {
  try {
    const finalParams = { limit: 16, ...params };
    const cleanParams = Object.entries(finalParams).filter(
      ([_, v]) => v !== undefined && v !== null && v !== ''
    );
    const query = new URLSearchParams(cleanParams).toString();
    const res = await fetch(`${getApiBase()}/books${query ? `?${query}` : ''}`, {
      cache: 'no-store'
    });
    if (!res.ok) throw new Error(`Failed to fetch books: ${res.status}`);
    const data = await res.json();
    return data.books || [];
  } catch (err) {
    console.warn('[LOGOS API] fetchBooks error:', err.message);
    return [];
  }
}

export async function fetchBooksPaginated(params = {}) {
  try {
    const finalParams = { page: 1, limit: 16, ...params };
    const cleanParams = Object.entries(finalParams).filter(
      ([_, v]) => v !== undefined && v !== null && v !== ''
    );
    const query = new URLSearchParams(cleanParams).toString();
    const res = await fetch(`${getApiBase()}/books${query ? `?${query}` : ''}`, {
      cache: 'no-store'
    });
    if (!res.ok) throw new Error(`Failed to fetch books: ${res.status}`);
    const data = await res.json();
    return {
      books: data.books || [],
      pagination: data.pagination || {
        page: Number(finalParams.page) || 1,
        limit: Number(finalParams.limit) || 15,
        totalPages: 1,
        totalItems: (data.books || []).length
      }
    };
  } catch (err) {
    console.warn('[LOGOS API] fetchBooksPaginated error:', err.message);
    return {
      books: [],
      pagination: {
        page: Number(params.page) || 1,
        limit: Number(params.limit) || 15,
        totalPages: 1,
        totalItems: 0
      }
    };
  }
}

export async function fetchFilterOptions() {
  try {
    const res = await fetch(`${getApiBase()}/books/filters/options`, {
      next: { revalidate: 60 }
    });
    if (!res.ok) throw new Error(`Failed to fetch filter options: ${res.status}`);
    const data = await res.json();
    return data.options || { themes: [], authors: [], publishers: [], languages: [] };
  } catch (err) {
    console.warn('[LOGOS API] fetchFilterOptions error:', err.message);
    return { themes: [], authors: [], publishers: [], languages: [] };
  }
}

export async function fetchBookSuggestions(q) {
  if (!q || !q.trim()) return [];
  try {
    const res = await fetch(`${getApiBase()}/books/search/suggest?q=${encodeURIComponent(q.trim())}`, {
      cache: 'no-store'
    });
    if (!res.ok) throw new Error(`Failed to fetch suggestions: ${res.status}`);
    const data = await res.json();
    return data.suggestions || [];
  } catch (err) {
    console.warn('[LOGOS API] fetchBookSuggestions error:', err.message);
    return [];
  }
}

export async function fetchNewArrivals() {
  try {
    const res = await fetch(`${getApiBase()}/books/collections/new-arrivals`, {
      cache: 'no-store'
    });
    if (!res.ok) throw new Error(`Failed to fetch new arrivals: ${res.status}`);
    const data = await res.json();
    return data.books || [];
  } catch (err) {
    console.warn('[LOGOS API] fetchNewArrivals fallback:', err.message);
    return [];
  }
}

export async function fetchBookOfTheWeek() {
  try {
    const res = await fetch(`${getApiBase()}/books/collections/book-of-the-week`, {
      cache: 'no-store'
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.book) return data.book;
    }
  } catch {}

  // Resilient fallback: Query books list and find isBookOfTheWeek or spotlight
  try {
    const res = await fetch(`${getApiBase()}/books?limit=100`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      const list = data.books || [];
      const botw = list.find((b) => Boolean(b.isBookOfTheWeek));
      if (botw) return botw;
      const spot = list.find((b) => Boolean(b.isFeaturedSpotlight || b.isFeatured));
      if (spot) return spot;
    }
  } catch (err) {
    console.warn('[LOGOS API] fetchBookOfTheWeek fallback:', err.message);
  }
  return null;
}

export async function fetchComingSoonBooks() {
  try {
    const res = await fetch(`${getApiBase()}/books/collections/coming-soon`, {
      cache: 'no-store'
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.books) && data.books.length > 0) return data.books;
    }
  } catch {}

  // Resilient fallback: Query books list and find isComingSoon / isPreBook
  try {
    const res = await fetch(`${getApiBase()}/books?limit=100`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      const list = data.books || [];
      return list.filter((b) => Boolean(b.isComingSoon || b.isPreBook));
    }
  } catch (err) {
    console.warn('[LOGOS API] fetchComingSoonBooks fallback:', err.message);
  }
  return [];
}

export async function fetchBestSellers() {
  try {
    const res = await fetch(`${getApiBase()}/books/collections/best-sellers`, {
      cache: 'no-store'
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
    const res = await fetch(`${getApiBase()}/books/collections/featured`, {
      cache: 'no-store'
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
    const res = await fetch(`${getApiBase()}/books/${idOrSlug}`, {
      next: { revalidate: 30 }
    });
    if (!res.ok) throw new Error(`Failed to fetch book: ${res.status}`);
    const data = await res.json();
    return data.book || null;
  } catch (err) {
    console.warn(`[LOGOS API] fetchBookBySlugOrId (${idOrSlug}) fallback:`, err.message);
    return null;
  }
}

// Helper to optimize Cloudinary and CDN image delivery (Forces WebP and optimal compression)
export function optimizeImageUrl(url, { width = 500, quality = 'auto' } = {}) {
  if (!url || typeof url !== 'string') return url;

  // Automatically convert local banners to high-efficiency WebP
  if (url === '/banner.png') return '/banner.webp';
  if (url === '/combo_banner.png') return '/combo_banner.webp';

  // Cloudinary transformation: enforce WebP format & auto quality & resize
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    if (url.includes('/upload/f_') || url.includes('/upload/q_') || url.includes('/upload/w_')) {
      return url.replace(/\/upload\/[^/]+\//, `/upload/f_webp,q_${quality},w_${width},c_limit/`);
    }
    return url.replace('/upload/', `/upload/f_webp,q_${quality},w_${width},c_limit/`);
  }

  // Google Drive / Googleusercontent: append width and -rw to force Google WebP format
  if (url.includes('googleusercontent.com/d/') || url.includes('googleusercontent.com/')) {
    const base = url.split('=')[0];
    return `${base}=w${width}-rw`;
  }

  // Unsplash CDN: auto webp & width
  if (url.includes('images.unsplash.com')) {
    const clean = url.split('?')[0];
    return `${clean}?auto=format&fit=crop&w=${width}&q=80`;
  }

  return url;
}

export async function fetchBanners() {
  try {
    const res = await fetch(`${getApiBase()}/banners`, {
      cache: 'no-store'
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
  const res = await fetch(`${getApiBase()}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Login failed');
  return data;
}

export async function customerRegister(payload) {
  const res = await fetch(`${getApiBase()}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Registration failed');
  return data;
}

export async function customerGoogleAuth(payload) {
  const res = await fetch(`${getApiBase()}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Google login failed');
  return data;
}

export async function customerForgotPassword(email) {
  const res = await fetch(`${getApiBase()}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to send reset OTP');
  return data;
}

export async function customerResetPassword(email, otp, newPassword) {
  const res = await fetch(`${getApiBase()}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp, newPassword })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to reset password');
  return data;
}

export async function fetchCustomerProfile() {
  const res = await fetch(`${getApiBase()}/auth/profile`, {
    headers: getAuthHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch profile');
  return data.customer;
}

export async function updateCustomerProfile(payload) {
  const res = await fetch(`${getApiBase()}/auth/profile`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update profile');
  return data.customer;
}

export async function addCustomerAddress(address) {
  const res = await fetch(`${getApiBase()}/auth/address`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(address)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to add address');
  return data.addresses;
}

export async function deleteCustomerAddress(addressId) {
  const res = await fetch(`${getApiBase()}/auth/address/${addressId}`, {
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
  const res = await fetch(`${getApiBase()}/cart?guestId=${guestId}`, {
    headers: getAuthHeaders()
  });
  const data = await res.json();
  return data.cart || { items: [] };
}

export async function apiAddToCart(bookOrId, quantity = 1) {
  const guestId = getGuestSessionId();
  const bookId = typeof bookOrId === 'object' && bookOrId !== null
    ? (bookOrId._id || bookOrId.id || bookOrId.bookId || (bookOrId.book && (bookOrId.book._id || bookOrId.book.id || bookOrId.book)) || bookOrId.slug)
    : bookOrId;
  const res = await fetch(`${getApiBase()}/cart/add`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ bookId, id: bookId, quantity, guestId })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to add to cart');
  return data.cart;
}

export async function apiUpdateCart(bookOrId, quantity) {
  const guestId = getGuestSessionId();
  const bookId = typeof bookOrId === 'object' && bookOrId !== null
    ? (bookOrId._id || bookOrId.id || bookOrId.bookId || bookOrId.slug)
    : bookOrId;
  const res = await fetch(`${getApiBase()}/cart/update`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ bookId, quantity, guestId })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update cart');
  return data.cart;
}

export async function apiRemoveFromCart(bookOrId) {
  const guestId = getGuestSessionId();
  const bookId = typeof bookOrId === 'object' && bookOrId !== null
    ? (bookOrId._id || bookOrId.id || bookOrId.bookId || bookOrId.slug)
    : bookOrId;
  const res = await fetch(`${getApiBase()}/cart/item/${bookId}?guestId=${guestId}`, {
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
  const res = await fetch(`${getApiBase()}/wishlist?guestId=${guestId}`, {
    headers: getAuthHeaders()
  });
  const data = await res.json();
  return data.wishlist || { books: [] };
}

export async function apiToggleWishlist(bookOrId) {
  const guestId = getGuestSessionId();
  const bookId = typeof bookOrId === 'object' && bookOrId !== null
    ? (bookOrId._id || bookOrId.id || bookOrId.bookId || (bookOrId.book && (bookOrId.book._id || bookOrId.book.id || bookOrId.book)))
    : bookOrId;
  const res = await fetch(`${getApiBase()}/wishlist/toggle`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ bookId, id: bookId, guestId })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update wishlist');
  return data.wishlist;
}

// ----------------- Coupons & Referral APIs -----------------
export async function apiValidateCoupon(code, cartTotal) {
  const res = await fetch(`${getApiBase()}/coupons/validate`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ code, cartTotal })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Invalid coupon');
  return data;
}

export async function apiGetAvailableCoupons() {
  const res = await fetch(`${getApiBase()}/coupons/available`, {
    headers: getAuthHeaders()
  });
  const data = await res.json();
  return data.coupons || [];
}

export async function apiValidateReferral(referralCode) {
  const res = await fetch(`${getApiBase()}/referrals/validate`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ referralCode })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Invalid referral code');
  return data;
}

export async function apiGetMyReferralSummary() {
  const res = await fetch(`${getApiBase()}/referrals/my-rewards`, {
    headers: getAuthHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch referral summary');
  return data;
}

// ----------------- Orders APIs -----------------
export async function apiCreateOrder(orderPayload) {
  const guestId = getGuestSessionId();
  const payload = { guestId, ...orderPayload };
  const res = await fetch(`${getApiBase()}/orders`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create order');
  return data;
}

export async function apiCreateRazorpayOrder(payload) {
  const res = await fetch(`${getApiBase()}/orders/razorpay/create`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to initialize Razorpay payment');
  return data;
}

export async function apiVerifyRazorpayPayment(payload) {
  const res = await fetch(`${getApiBase()}/orders/razorpay/verify`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to verify Razorpay payment');
  return data;
}

export async function apiGetMyOrders() {
  const res = await fetch(`${getApiBase()}/orders/my-orders`, {
    headers: getAuthHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch orders');
  return data.orders || [];
}

export async function apiGetOrderById(orderId) {
  const res = await fetch(`${getApiBase()}/orders/${orderId}`, {
    headers: getAuthHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch order details');
  return data.order;
}

export async function apiCancelOrder(orderId, reason = '') {
  const res = await fetch(`${getApiBase()}/orders/${orderId}/cancel`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ cancellationReason: reason, reason })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to cancel order');
  return data;
}

export async function apiRequestReturn(orderId, reason, description = '') {
  const res = await fetch(`${getApiBase()}/orders/${orderId}/return`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ reason, description })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to submit return request');
  return data;
}

export async function fetchSpotlightAuthor() {
  try {
    const res = await fetch(`${getApiBase()}/books/spotlight/author`, {
      next: { revalidate: 15 }
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.author || null;
  } catch (err) {
    console.warn('[LOGOS API] fetchSpotlightAuthor fallback:', err.message);
    return null;
  }
}

export async function fetchSpotlightBook() {
  try {
    const res = await fetch(`${getApiBase()}/books/spotlight/book`, {
      next: { revalidate: 15 }
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.book || null;
  } catch (err) {
    console.warn('[LOGOS API] fetchSpotlightBook fallback:', err.message);
    return null;
  }
}

export async function fetchAuthors(params = {}) {
  try {
    const cleanParams = Object.entries(params).filter(
      ([_, v]) => v !== undefined && v !== null && v !== ''
    );
    const query = new URLSearchParams(cleanParams).toString();
    const res = await fetch(`${getApiBase()}/books/authors/all${query ? `?${query}` : ''}`, {
      next: { revalidate: 30 }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.authors || [];
  } catch (err) {
    console.warn('[LOGOS API] fetchAuthors fallback:', err.message);
    return [];
  }
}

export async function fetchTestimonials() {
  try {
    const res = await fetch(`${getApiBase()}/reviews/testimonials`, {
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

// ----------------- News & Blog APIs -----------------
export async function fetchNews(params = {}) {
  try {
    const cleanParams = Object.entries(params).filter(
      ([_, v]) => v !== undefined && v !== null && v !== ''
    );
    const query = new URLSearchParams(cleanParams).toString();
    const res = await fetch(`${getApiBase()}/news${query ? `?${query}` : ''}`, {
      cache: 'no-store'
    });
    if (!res.ok) return { articles: [], pagination: { totalItems: 0 } };
    return await res.json();
  } catch (err) {
    console.warn('[LOGOS API] fetchNews error:', err.message);
    return { articles: [], pagination: { totalItems: 0 } };
  }
}

export async function fetchRecentNews(limit = 4) {
  try {
    const res = await fetch(`${getApiBase()}/news/recent?limit=${limit}`, {
      next: { revalidate: 15 }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.articles || [];
  } catch (err) {
    console.warn('[LOGOS API] fetchRecentNews error:', err.message);
    return [];
  }
}

export async function fetchNewsBySlug(idOrSlug) {
  try {
    const res = await fetch(`${getApiBase()}/news/${idOrSlug}`, {
      cache: 'no-store'
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn(`[LOGOS API] fetchNewsBySlug (${idOrSlug}) error:`, err.message);
    return null;
  }
}

// ----------------- Book Reviews APIs -----------------
export async function fetchBookReviews(bookId) {
  try {
    if (!bookId) return [];
    const res = await fetch(`${getApiBase()}/reviews/book/${bookId}`, {
      cache: 'no-store'
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.reviews || [];
  } catch (err) {
    console.warn('[LOGOS API] fetchBookReviews error:', err.message);
    return [];
  }
}

export async function submitBookReview(reviewData) {
  const res = await fetch(`${getApiBase()}/reviews`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(reviewData)
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to submit review');
  }
  return data.review;
}

// ----------------- Book Cover Image Resolver -----------------
export function getBookCoverImage(book) {
  if (!book) return '/book-placeholder.svg';
  const images = Array.isArray(book.images) ? book.images : [];
  // Priority 1: Genuine non-placeholder from images array
  const realFromImages = images.find(
    (img) => typeof img === 'string' && img.trim() && !img.includes('placeholder')
  );
  if (realFromImages) return realFromImages;

  // Priority 2: Genuine non-placeholder from coverImage or image
  const realCover = [book.coverImage, book.image].find(
    (img) => typeof img === 'string' && img.trim() && !img.includes('placeholder')
  );
  if (realCover) return realCover;

  return images[0] || book.coverImage || book.image || '/book-placeholder.svg';
}





