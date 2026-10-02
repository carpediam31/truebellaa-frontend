import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { api } from '../api.js';

export default function Account() {
  const { customer, authLoading, login, register, logout, requestOtp, loginWithOtp,
          go, toast, fmt } = useApp();
  // 'login'     — email + password
  // 'otp-login' — email + emailed code, no password
  // 'register'  — two steps: ask for a code, then verify it and create the account
  const [mode, setMode] = useState('login');
  const [step, setStep] = useState('details');   // 'details' | 'code'
  const [form, setForm] = useState({ email: '', password: '', full_name: '', code: '' });
  const [busy, setBusy] = useState(false);
  const [orders, setOrders] = useState(null);
  const [cooldown, setCooldown] = useState(0);

  // Countdown for the "Resend code" link.
  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const t = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  function switchMode(next) {
    setMode(next);
    setStep('details');
    setForm((f) => ({ ...f, code: '' }));
  }

  useEffect(() => {
    if (!customer) return;
    let alive = true;
    api.myOrders().then((res) => { if (alive) setOrders(res); }).catch(() => { if (alive) setOrders([]); });
    return () => { alive = false; };
  }, [customer]);

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const sendCode = async (purpose) => {
    setBusy(true);
    try {
      await requestOtp(form.email, purpose);
      setStep('code');
      setCooldown(60);          // matches the server's resend cooldown
    } catch (err) {
      toast(err.message || 'Could not send the code');
    } finally {
      setBusy(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else if (mode === 'otp-login') {
        if (step === 'details') { await sendCode('login'); return; }
        await loginWithOtp(form.email, form.code);
      } else {
        // register: ask for the code first, then create the account with it
        if (step === 'details') { await sendCode('register'); return; }
        await register(form.email, form.code, form.password, form.full_name);
      }
    } catch (err) {
      toast(err.message || 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  if (authLoading) {
    return <div className="wrap" style={{ padding: '80px 0', color: 'var(--muted)' }}>Loading…</div>;
  }

  // ---- not logged in: login / register form ----
  if (!customer) {
    return (
      <div className="wrap account-wrap">
        <div className="account-auth">
          <h1 className="serif">
            {mode === 'register' ? 'Create an account' : 'Login'}
          </h1>
          <p className="account-sub">
            {step === 'code'
              ? `Enter the 6-digit code we emailed to ${form.email}.`
              : mode === 'register'
                ? 'We’ll email you a code to confirm the address is yours.'
                : mode === 'otp-login'
                  ? 'We’ll email you a code — no password needed.'
                  : 'Login to track orders and view your wishlist.'}
          </p>

          <form onSubmit={submit}>
            {step === 'details' && (
              <>
                {mode === 'register' && (
                  <div className="field full">
                    <label>Full name</label>
                    <input value={form.full_name} onChange={setField('full_name')} placeholder="Your name" />
                  </div>
                )}
                <div className="field full">
                  <label>Email address</label>
                  <input type="email" required value={form.email} onChange={setField('email')}
                    placeholder="you@email.com" />
                </div>
                {mode !== 'otp-login' && (
                  <div className="field full">
                    <label>Password</label>
                    <input type="password" required minLength={6} value={form.password}
                      onChange={setField('password')} placeholder="At least 6 characters" />
                  </div>
                )}
              </>
            )}

            {step === 'code' && (
              <div className="field full">
                <label>Verification code</label>
                <input required inputMode="numeric" autoComplete="one-time-code"
                  maxLength={6} value={form.code} onChange={setField('code')}
                  placeholder="------"
                  style={{ letterSpacing: '.5em', textAlign: 'center', fontSize: 20 }} />
              </div>
            )}

            <button className="btn" type="submit" disabled={busy} style={{ width: '100%', marginTop: 10 }}>
              <span>
                {busy ? 'Please wait…'
                  : step === 'code'
                    ? (mode === 'register' ? 'Verify & create account' : 'Verify & log in')
                    : mode === 'login' ? 'Login' : 'Email me a code'}
              </span>
            </button>
          </form>

          {step === 'code' && (
            <p className="account-switch">
              {cooldown > 0
                ? <>Didn’t get it? You can resend in {cooldown}s</>
                : <>Didn’t get it? <a onClick={() => sendCode(mode === 'register' ? 'register' : 'login')}>Resend code</a></>}
              {' · '}
              <a onClick={() => setStep('details')}>Change email</a>
            </p>
          )}

          {step === 'details' && (
            <p className="account-switch">
              {mode === 'login' ? (
                <>
                  <a onClick={() => switchMode('otp-login')}>Login with an email code</a>
                  <br />New here? <a onClick={() => switchMode('register')}>Create an account</a>
                </>
              ) : mode === 'otp-login' ? (
                <>
                  <a onClick={() => switchMode('login')}>Use a password instead</a>
                  <br />New here? <a onClick={() => switchMode('register')}>Create an account</a>
                </>
              ) : (
                <>Already have an account? <a onClick={() => switchMode('login')}>Login</a></>
              )}
            </p>
          )}
        </div>
      </div>
    );
  }

  // ---- logged in: profile + order history ----
  return (
    <div className="wrap account-wrap">
      <div className="account-head">
        <div>
          <h1 className="serif">My account</h1>
          <p className="account-sub">{customer.full_name || customer.email}</p>
        </div>
        <a className="btn ghost small" onClick={logout}><span>Logout</span></a>
      </div>

      <div className="account-grid">
        <div>
          <h3 className="serif account-block-title">Order history</h3>
          {orders === null && <p className="account-muted">Loading…</p>}
          {orders && !orders.length && (
            <p className="account-muted">
              No orders yet. <a onClick={() => go('listing', 'all')}>Start shopping</a>
            </p>
          )}
          {orders && orders.map((o) => (
            <div className="order-row" key={o.public_id}>
              <div className="order-main">
                <div className="order-number">{o.order_number}</div>
                <div className="order-date">
                  {o.placed_at ? new Date(o.placed_at).toLocaleDateString() : 'Awaiting payment'} &middot; {o.item_count} item{o.item_count === 1 ? '' : 's'}
                </div>
              </div>
              <div className={`order-status status-${o.status}`}>{o.status.replace(/_/g, ' ')}</div>
              <div className="order-total">{fmt(o.grand_total)}</div>
              <a className="btn ghost small" onClick={() => go('track', o.public_id)}><span>Track</span></a>
            </div>
          ))}
        </div>

        <div>
          <h3 className="serif account-block-title">Account details</h3>
          <div className="account-detail"><span>Email</span><strong>{customer.email}</strong></div>
          <div className="account-detail"><span>Name</span><strong>{customer.full_name || '—'}</strong></div>
          <a className="btn ghost" onClick={() => go('wishlist')} style={{ marginTop: 18, display: 'inline-flex' }}>
            <span>View wishlist</span>
          </a>
        </div>
      </div>
    </div>
  );
}
