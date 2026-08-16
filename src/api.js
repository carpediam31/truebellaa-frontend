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

function headers() {
  return {
    'Content-Type': 'application/json',
    'X-Tenant-Slug': TENANT,
    'X-Locale': getLocale(),
  };
}

async function req(path, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, { headers: headers(), ...opts });
  if (!res.ok) {
    let detail = res.statusText;
    try { detail = (await res.json()).detail || detail; } catch { /* ignore */ }
    throw new Error(typeof detail === 'string' ? detail : 'Request failed');
  }
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
};

export { API_BASE, TENANT };
