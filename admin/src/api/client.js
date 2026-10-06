export const getApiBaseUrl = () => {
  const envUrl = typeof process !== 'undefined' ? (process.env?.NEXT_PUBLIC_API_URL || process.env?.NEXT_PUBLIC_API_BASE_URL) : null;
  if (typeof window !== 'undefined') {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocal) {
      return (envUrl && envUrl.includes('localhost')) ? envUrl.replace(/\/+$/, '') : 'http://localhost:5001/api';
    }
    // On production (e.g. Vercel), ignore any localhost env variables
    if (envUrl && !envUrl.includes('localhost')) {
      return envUrl.replace(/\/+$/, '');
    }
    return 'https://tweaki.pw/logos/api';
  }
  // Server-side / Build-time
  if (envUrl && !envUrl.includes('localhost')) {
    return envUrl.replace(/\/+$/, '');
  }
  return 'https://tweaki.pw/logos/api';
};

export const apiClient = async (endpoint, options = {}) => {
  const baseUrl = getApiBaseUrl();
  const token = typeof window !== 'undefined' ? localStorage.getItem('logos_admin_token') : null;

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  try {
    const res = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (res.status === 401 && token && typeof window !== 'undefined' && !endpoint.includes('/login')) {
        window.dispatchEvent(new Event('logos-admin-unauthorized'));
      }
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }

    return data;
  } catch (err) {
    console.warn(`[API Call ${endpoint} Fallback/Error]:`, err.message);
    throw err;
  }
};
