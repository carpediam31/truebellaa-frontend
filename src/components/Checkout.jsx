import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';

const STATES = ["Uttar Pradesh", "Delhi", "Maharashtra", "Karnataka", "Tamil Nadu", "Gujarat", "West Bengal", "Rajasthan", "Other"];

export default function Checkout() {
  const { cart, cartTotal, go, payNow, fmt, customer } = useApp();
  const [form, setForm] = useState({
    email: '', phone: '', fname: '', lname: '', addr: '', city: '', pin: '', state: ''
  });

  // Fill in what we already know about the logged-in shopper. The order is
  // always filed under their account email, so the field must show that
  // rather than invite them to type a different one.
  useEffect(() => {
    if (!customer) return;
    setForm((f) => ({
      ...f,
      email: customer.email || f.email,
      fname: f.fname || (customer.full_name || '').split(' ')[0] || '',
      lname: f.lname || (customer.full_name || '').split(' ').slice(1).join(' ') || '',
    }));
  }, [customer]);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (!cart.length) go('cart');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handlePay = () => {
    payNow(form, (missing) => setErrors(missing));
  };

  const isErr = (key) => errors.includes(key) && !String(form[key] || '').trim();

  if (!cart.length) return null;

  return (
    <div className="wrap checkout-wrap">
      <h1 className="serif">Checkout</h1>
      <p className="sub">Secure payment powered by Razorpay</p>

      {/* Say this up front. Discovering it only after the form is filled
          in is a far worse experience than one line here. */}
      {!customer && (
        <div className="checkout-login-note">
          <b>Please log in to place your order.</b>{' '}
          <a onClick={() => go('account')}>Log in or create an account</a> — we email
          you a code to confirm your address. Your bag is saved.
        </div>
      )}
      <div className="checkout-layout">
        <div>
          <div className="form-sec">
            <h3><span className="num">1</span> Contact</h3>
            <div className="field full">
              <label>Email address</label>
              <input className={isErr('email') ? 'err' : ''} type="email"
                placeholder="you@email.com" value={form.email}
                onChange={setField('email')} readOnly={!!customer} />
              {customer && (
                <small className="field-note">Your order confirmation goes to this address.</small>
              )}
            </div>
            <div className="field full">
              <label>Phone number</label>
              <input className={isErr('phone') ? 'err' : ''} type="tel" placeholder="+91 90000 00000" value={form.phone} onChange={setField('phone')} />
            </div>
          </div>

          <div className="form-sec">
            <h3><span className="num">2</span> Shipping address</h3>
            <div className="fgrid">
              <div className="field">
                <label>First name</label>
                <input className={isErr('fname') ? 'err' : ''} placeholder="First name" value={form.fname} onChange={setField('fname')} />
              </div>
              <div className="field">
                <label>Last name</label>
                <input className={isErr('lname') ? 'err' : ''} placeholder="Last name" value={form.lname} onChange={setField('lname')} />
              </div>
            </div>
            <div className="field full">
              <label>Address</label>
              <input className={isErr('addr') ? 'err' : ''} placeholder="House no, street, area" value={form.addr} onChange={setField('addr')} />
            </div>
            <div className="fgrid">
              <div className="field">
                <label>City</label>
                <input className={isErr('city') ? 'err' : ''} placeholder="City" value={form.city} onChange={setField('city')} />
              </div>
              <div className="field">
                <label>PIN code</label>
                <input className={isErr('pin') ? 'err' : ''} placeholder="000000" value={form.pin} onChange={setField('pin')} />
              </div>
            </div>
            <div className="field full">
              <label>State</label>
              <select className={isErr('state') ? 'err' : ''} value={form.state} onChange={setField('state')}>
                <option value="">Select state</option>
                {STATES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="form-sec">
            <h3><span className="num">3</span> Payment</h3>
            <div className="pay-note">
              <svg viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>
              <div>You'll pay securely via <span className="rzp-brand">Razorpay</span> — UPI, cards, net banking &amp; wallets. Your card details never touch our servers.</div>
            </div>
          </div>
        </div>

        <div>
          <div className="summary">
            <h3 className="serif">Order summary</h3>
            <div>
              {cart.map((i) => (
                <div className="mini-item" key={i.key}>
                  <div className="thumb"><img src={i.img} alt={i.name} /></div>
                  <div className="mi-info">
                    <div className="n">{i.name}</div>
                    <div className="o">{i.len} &middot; {i.metal} &middot; Qty {i.qty}</div>
                  </div>
                  <div className="mi-price">{fmt(i.price * i.qty)}</div>
                </div>
              ))}
            </div>
            <div className="sum-row"><span>Subtotal</span><span>{fmt(cartTotal)}</span></div>
            <div className="sum-row"><span>Shipping</span><span>Free</span></div>
            <div className="sum-row total"><span>Total</span><span>{fmt(cartTotal)}</span></div>
            <button className="btn" onClick={handlePay}><span>Pay {fmt(cartTotal)}</span></button>
            <p className="secure">
              <svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
              256-bit encrypted checkout
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
