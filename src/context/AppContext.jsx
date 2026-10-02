import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { fmt } from '../data.js';
import {
  api, toProduct, LOCALES, getLocale, storeLocale,
  getCustomerToken, setCustomerToken, clearCustomerToken,
} from '../api.js';

const AppContext = createContext(null);

const CART_KEY = 'tb_cart';

/**
 * Restore the saved bag. Wrapped in try/catch because localStorage throws
 * in private windows and when site data is blocked — a shopper with cookies
 * disabled should still get a working (just non-persistent) cart.
 */
function loadStoredCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function AppProvider({ children }) {
  const [page, setPageState] = useState('home');
  const [pageArg, setPageArg] = useState(null);
  // The cart lives in the browser until checkout, so it has to survive a
  // page refresh — otherwise a shopper who reloads loses their bag.
  const [cart, setCart] = useState(loadStoredCart);
  const [activeFilters, setActiveFilters] = useState({ cat: 'all', metal: [], stock: false });
  const [currentProductId, setCurrentProductId] = useState(null);
  const [successOrderId, setSuccessOrderId] = useState('');
  const [successOrderPublicId, setSuccessOrderPublicId] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [headerSolid, setHeaderSolid] = useState(false);
  const [toasts, setToasts] = useState([]);
  const toastId = useRef(0);

  // ---- products loaded from the API (re-loaded when language changes) ----
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [locale, setLocaleState] = useState(getLocale());

  // ---- customer account (login is optional — guest checkout still works without it) ----
  const [customer, setCustomer] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]); // array of product slugs currently saved

  // ---- toasts ----
  const toast = useCallback((msg) => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3100);
  }, []);

  // ---- load catalogue whenever the language changes ----
  useEffect(() => {
    let alive = true;
    setProductsLoading(true);
    api.listProducts({ limit: 100 })
      .then((res) => { if (alive) setProducts((res.products || []).map(toProduct)); })
      .catch(() => { if (alive) toast('Could not load products. Is the API running?'); })
      .finally(() => { if (alive) setProductsLoading(false); });
    return () => { alive = false; };
  }, [locale, toast]);

  const setLocale = useCallback((code) => {
    storeLocale(code);
    setLocaleState(code);
  }, []);

  // ---- load the wishlist for the current logged-in customer ----
  const refreshWishlist = useCallback(() => {
    api.getWishlist()
      .then((items) => setWishlist((items || []).map((i) => i.slug)))
      .catch(() => { /* not logged in, or a transient error — leave the wishlist as-is */ });
  }, []);

  // ---- restore the customer session on page load (if a token is saved) ----
  useEffect(() => {
    const token = getCustomerToken();
    if (!token) { setAuthLoading(false); return; }
    api.me()
      .then((profile) => { setCustomer(profile); refreshWishlist(); })
      .catch(() => clearCustomerToken())
      .finally(() => setAuthLoading(false));
  }, [refreshWishlist]);

  const login = useCallback(async (email, password) => {
    const res = await api.login(email, password);
    setCustomerToken(res.access_token);
    setCustomer({ id: res.customer.public_id, email: res.customer.email, full_name: res.customer.name });
    refreshWishlist();
    toast(`Welcome back, ${res.customer.name || 'there'}`);
  }, [refreshWishlist, toast]);

  // Step 1 of signup: email a 6-digit code. Deliberately does NOT reveal
  // whether the address already has an account.
  const requestOtp = useCallback(async (email, purpose = 'register') => {
    const res = await api.requestOtp(email, purpose);
    toast(`Code sent to ${email}`);
    return res;
  }, [toast]);

  // Step 2: the code proves the person owns the address, so the account
  // can be created. This replaces the old password-only registration.
  const register = useCallback(async (email, code, password, fullName) => {
    const res = await api.registerWithOtp(email, code, password, fullName);
    setCustomerToken(res.access_token);
    setCustomer({ id: res.customer.public_id, email: res.customer.email, full_name: res.customer.name });
    refreshWishlist();
    toast('Account created — welcome to TrueBellaa');
  }, [refreshWishlist, toast]);

  // Passwordless login with an emailed code.
  const loginWithOtp = useCallback(async (email, code) => {
    const res = await api.loginWithOtp(email, code);
    setCustomerToken(res.access_token);
    setCustomer({ id: res.customer.public_id, email: res.customer.email, full_name: res.customer.name });
    refreshWishlist();
    toast(`Welcome back, ${res.customer.name || 'there'}`);
  }, [refreshWishlist, toast]);

  const logout = useCallback(() => {
    clearCustomerToken();
    setCustomer(null);
    setWishlist([]);
    toast('Logged out');
    go('home');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]);

  // ---- wishlist toggle (used by the heart icon on product cards / PDP) ----
  const isWishlisted = useCallback((slug) => wishlist.includes(slug), [wishlist]);

  const toggleWishlist = useCallback((product) => {
    if (!customer) {
      toast('Log in to save items to your wishlist');
      go('account');
      return;
    }
    const slug = product.slug || product.id;
    const already = wishlist.includes(slug);
    setWishlist((prev) => (already ? prev.filter((s) => s !== slug) : [...prev, slug]));
    const call = already ? api.removeWishlist(slug) : api.addWishlist(slug);
    call
      .then(() => toast(already ? 'Removed from wishlist' : 'Saved to wishlist'))
      .catch(() => {
        // roll back on failure
        setWishlist((prev) => (already ? [...prev, slug] : prev.filter((s) => s !== slug)));
        toast('Could not update wishlist');
      });
  }, [customer, wishlist, toast]);

  // ---- navigation ----
  const go = useCallback((nextPage, arg) => {
    setPageState(nextPage);
    setPageArg(arg ?? null);
    window.scrollTo(0, 0);
    setDrawerOpen(false);
    setMobileMenuOpen(false);
    if (nextPage === 'pdp') setCurrentProductId(arg);
    if (nextPage === 'listing') setActiveFilters({ cat: arg || 'all', metal: [], stock: false });
  }, []);

  const scrollToStory = useCallback(() => {
    go('home');
    setTimeout(() => {
      document.getElementById('storySection')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [go]);

  // ---- header solid-on-scroll + hero parallax ----
  useEffect(() => {
    function onScroll() {
      setHeaderSolid(page !== 'home' || window.scrollY > 60);
      if (page === 'home') {
        const bg = document.getElementById('heroBg');
        if (bg) bg.style.transform = `translateY(${window.scrollY * 0.35}px)`;
      }
    }
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [page]);

  // ---- cart (items carry the variant SKU used at checkout) ----
  const addToCart = useCallback((p, len, metal, sku, qty, silent) => {
    const key = `${p.id}-${len}-${metal}`;
    setCart((prev) => {
      const ex = prev.find((i) => i.key === key);
      if (ex) return prev.map((i) => (i.key === key ? { ...i, qty: i.qty + qty } : i));
      return [...prev, { key, id: p.id, sku, name: p.name, img: p.img, price: p.price, len, metal, qty, cat: p.cat }];
    });
    toast(`${p.name} added to bag`);
    if (!silent || page !== 'checkout') setDrawerOpen(true);
  }, [toast, page]);

  // Quick add from a product card: use its default variant.
  const quickAdd = useCallback((p) => {
    if (!p || !p.defaultSku) { toast('This piece is unavailable'); return; }
    addToCart(p, p.lengths[0] || '', p.metal, p.defaultSku, 1);
  }, [addToCart, toast]);

  const removeFromCart = useCallback((key) => {
    setCart((prev) => prev.filter((i) => i.key !== key));
  }, []);

  const cartQty = useCallback((key, d) => {
    setCart((prev) => {
      const it = prev.find((i) => i.key === key);
      if (!it) return prev;
      const nextQty = it.qty + d;
      if (nextQty < 1) return prev.filter((i) => i.key !== key);
      return prev.map((i) => (i.key === key ? { ...i, qty: nextQty } : i));
    });
  }, []);

  // Persist on every change so a refresh (or an accidental tab close)
  // doesn't empty the bag.
  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch { /* private window / storage blocked — cart just won't persist */ }
  }, [cart]);

  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  // ---- order success ----
  const orderSuccess = useCallback((orderNumber, orderPublicId) => {
    setSuccessOrderId(orderNumber);
    setSuccessOrderPublicId(orderPublicId || '');
    setCart([]);
    go('success');
  }, [go]);

  // ---- checkout + payment (real backend) ----
  const payNow = useCallback(async (formValues, onValidationError) => {
    const required = ['email', 'phone', 'fname', 'lname', 'addr', 'city', 'pin', 'state'];
    const missing = required.filter((k) => !String(formValues[k] || '').trim());
    if (missing.length) {
      toast('Please fill all required fields');
      onValidationError?.(missing);
      return;
    }
    if (!cart.length) { toast('Your bag is empty'); return; }

    try {
      // 1) create the order + a Razorpay order on the backend
      const co = await api.checkout({
        items: cart.map((i) => ({ sku: i.sku, qty: i.qty })),
        email: formValues.email, phone: formValues.phone,
        fname: formValues.fname, lname: formValues.lname,
        addr: formValues.addr, addr2: formValues.addr2 || null,
        city: formValues.city, pin: formValues.pin, state: formValues.state,
      });

      const finish = async (payment) => {
        await api.verifyPayment({
          order_public_id: co.order_public_id,
          razorpay_order_id: payment.razorpay_order_id,
          razorpay_payment_id: payment.razorpay_payment_id,
          razorpay_signature: payment.razorpay_signature,
        });
        orderSuccess(co.order_number, co.order_public_id);
      };

      // 2a) DEMO mode (no live keys) — simulate a successful payment
      if (co.demo_mode || typeof window.Razorpay === 'undefined') {
        toast('Demo mode — simulating payment…');
        setTimeout(() => {
          finish({
            razorpay_order_id: co.razorpay_order_id,
            razorpay_payment_id: 'pay_DEMO' + Date.now(),
            razorpay_signature: 'demo',
          }).catch(() => toast('Payment could not be confirmed'));
        }, 1000);
        return;
      }

      // 2b) LIVE mode — open the Razorpay widget
      const rzp = new window.Razorpay({
        key: co.razorpay_key_id,
        order_id: co.razorpay_order_id,
        amount: Math.round(co.amount * 100),
        currency: co.currency || 'INR',
        name: 'TrueBellaa',
        description: 'Fine jewellery order',
        prefill: {
          name: `${formValues.fname} ${formValues.lname}`,
          email: formValues.email,
          contact: formValues.phone,
        },
        theme: { color: '#000000' },
        handler: (resp) => finish(resp).catch(() => toast('Payment verification failed')),
      });
      rzp.on('payment.failed', () => toast('Payment failed. Please try again.'));
      rzp.open();
    } catch (e) {
      toast(e.message || 'Checkout failed. Please try again.');
    }
  }, [cart, toast, orderSuccess]);

  // ---- newsletter ----
  const subscribe = useCallback((email) => {
    if (!email || !email.includes('@')) { toast('Enter a valid email'); return false; }
    api.subscribe(email)
      .then(() => toast('You are on the list — welcome.'))
      .catch(() => toast('Could not subscribe right now'));
    return true;
  }, [toast]);

  const value = {
    page, pageArg, go, scrollToStory,
    products, productsLoading,
    locale, setLocale, LOCALES,
    cart, addToCart, quickAdd, removeFromCart, cartQty, cartTotal, cartCount,
    activeFilters, setActiveFilters,
    currentProductId,
    successOrderId, successOrderPublicId,
    drawerOpen, setDrawerOpen,
    mobileMenuOpen, setMobileMenuOpen,
    headerSolid,
    toasts, toast,
    payNow, subscribe,
    customer, authLoading, login, register, logout, requestOtp, loginWithOtp,
    wishlist, isWishlisted, toggleWishlist,
    fmt,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
