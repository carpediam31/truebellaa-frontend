import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { fmt } from '../data.js';
import { api, toProduct, LOCALES, getLocale, storeLocale } from '../api.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [page, setPageState] = useState('home');
  const [pageArg, setPageArg] = useState(null);
  const [cart, setCart] = useState([]);
  const [activeFilters, setActiveFilters] = useState({ cat: 'all', metal: [], stock: false });
  const [currentProductId, setCurrentProductId] = useState(null);
  const [successOrderId, setSuccessOrderId] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [headerSolid, setHeaderSolid] = useState(false);
  const [toasts, setToasts] = useState([]);
  const toastId = useRef(0);

  // ---- products loaded from the API (re-loaded when language changes) ----
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [locale, setLocaleState] = useState(getLocale());

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

  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  // ---- order success ----
  const orderSuccess = useCallback((orderNumber) => {
    setSuccessOrderId(orderNumber);
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
        orderSuccess(co.order_number);
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
    successOrderId,
    drawerOpen, setDrawerOpen,
    mobileMenuOpen, setMobileMenuOpen,
    headerSolid,
    toasts, toast,
    payNow, subscribe,
    fmt,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
