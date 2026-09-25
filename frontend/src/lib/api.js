const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

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
    console.warn('[LOGOS API] fetchBooks error, using fallback:', err.message);
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
