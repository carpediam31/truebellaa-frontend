// ---------------------------------------------------------------------
//  API client — the single place the frontend talks to the backend.
//  Change the base URL / tenant with a .env file (see .env.example):
//     VITE_API_BASE=https://api.yourdomain.com/api/v1
//     VITE_TENANT_SLUG=truebellaa
// ---------------------------------------------------------------------

const API_BASE =
  (import.meta.env && import.meta.env.VITE_API_BASE) || 'http://localhost:8000/api/v1';
const TENANT =
  (import.meta.env && import.meta.env.VITE_TENANT_SLUG) || 'truebellaa';

// Languages offered in the header switcher (must be enabled on the tenant).
export const LOCALES = [
  { code: 'en', label: 'EN' },
  { code: 'hi', label: 'हिं' },
  { code: 'ta', label: 'த' },
  { code: 'bn', label: 'বাং' },
  { code: 'mr', label: 'मरा' },
];

export function getLocale() {
  try { return localStorage.getItem('tb_locale') || 'en'; } catch { return 'en'; }
}
export function storeLocale(code) {
  try { localStorage.setItem('tb_locale', code); } catch { /* ignore */ }
}

// ---- customer auth token storage (guest checkout keeps working without any of this) ----
const CUSTOMER_TOKEN_KEY = 'tb_customer_access';

export function getCustomerToken() {
  try { return localStorage.getItem(CUSTOMER_TOKEN_KEY) || null; } catch { return null; }
}
export function setCustomerToken(token) {
  try { localStorage.setItem(CUSTOMER_TOKEN_KEY, token); } catch { /* ignore */ }
}
export function clearCustomerToken() {
  try { localStorage.removeItem(CUSTOMER_TOKEN_KEY); } catch { /* ignore */ }
}

function headers() {
  const h = {
    'Content-Type': 'application/json',
    'X-Tenant-Slug': TENANT,
    'X-Locale': getLocale(),
  };
  const token = getCustomerToken();
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

async function req(path, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, { headers: headers(), ...opts });
  if (!res.ok) {
    let detail = res.statusText;
    try { detail = (await res.json()).detail || detail; } catch { /* ignore */ }
    const err = new Error(typeof detail === 'string' ? detail : 'Request failed');
    err.status = res.status;
    throw err;
  }
  if (res.status === 204) return null;
  return res.json();
}

// Convert an API product into the shape the UI components already expect.
export function toProduct(p) {
  const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');
  return {
    id: p.slug,                 // we use the slug as the stable id
    slug: p.slug,
    name: p.name,
    cat: cap(p.category),       // 'pendants' -> 'Pendants'
    metal: p.metal || '',
    price: p.price,
    stock: p.stock,
    img: p.image,
    alt: p.alt || p.image,
    lengths: p.lengths || [],
    defaultSku: p.default_sku,
    rating_avg: p.rating_avg,
    rating_count: p.rating_count,
  };
}

export const api = {
  listProducts: (params = {}) => {
    const q = new URLSearchParams();
    q.set('limit', params.limit || 100);
    if (params.category && params.category !== 'all') q.set('category', params.category);
    if (params.sort) q.set('sort', params.sort);
    return req(`/catalog/products?${q.toString()}`);
  },
  getProduct: (slug) => req(`/catalog/products/${encodeURIComponent(slug)}`),
  checkout: (payload) => req('/checkout', { method: 'POST', body: JSON.stringify(payload) }),
  verifyPayment: (payload) =>
    req('/payments/verify', { method: 'POST', body: JSON.stringify(payload) }),
  subscribe: (email) =>
    req('/newsletter/subscribe', { method: 'POST', body: JSON.stringify({ email }) }),

  // ---- customer account ----
  // Account creation now requires an emailed code — request one, then
  // verify it. The old password-only /register is disabled server-side.
  requestOtp: (email, purpose = 'register') =>
    req('/auth/customer/otp/request', { method: 'POST', body: JSON.stringify({ email, purpose }) }),
  registerWithOtp: (email, code, password, full_name) =>
    req('/auth/customer/otp/register', {
      method: 'POST', body: JSON.stringify({ email, code, password, full_name }),
    }),
  loginWithOtp: (email, code) =>
    req('/auth/customer/otp/login', { method: 'POST', body: JSON.stringify({ email, code }) }),
  login: (email, password) =>
    req('/auth/customer/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: () => req('/customers/me'),
  myOrders: () => req('/customers/me/orders'),

  // ---- order lookup / tracking ----
  // An order id alone is no longer enough: orders carry the buyer's name,
  // address and email, so a guest must also supply the email used at
  // checkout. Logged-in customers are matched on their account instead.
  getOrder: (publicId, email) =>
    req(`/orders/${encodeURIComponent(publicId)}${email ? `?email=${encodeURIComponent(email)}` : ''}`),
  trackOrder: (publicId, email) =>
    req(`/orders/${encodeURIComponent(publicId)}/tracking${email ? `?email=${encodeURIComponent(email)}` : ''}`),

  // ---- wishlist (requires login) ----
  getWishlist: () => req('/wishlist'),
  addWishlist: (slug) => req(`/wishlist/${encodeURIComponent(slug)}`, { method: 'POST' }),
  removeWishlist: (slug) => req(`/wishlist/${encodeURIComponent(slug)}`, { method: 'DELETE' }),
};

export { API_BASE, TENANT };
