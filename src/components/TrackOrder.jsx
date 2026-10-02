import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { api } from '../api.js';

export default function TrackOrder() {
  const { pageArg, customer, fmt } = useApp();
  // pageArg is either a bare order id (from a link) or { id, email } handed
  // over by the Success page right after checkout.
  const argId = typeof pageArg === 'string' ? pageArg : (pageArg?.id || '');
  const argEmail = typeof pageArg === 'object' ? (pageArg?.email || '') : '';

  const [orderId, setOrderId] = useState(argId);
  // Orders expose the buyer's address, so a guest must prove ownership by
  // giving the email they checked out with. Logged-in customers don't need it.
  const [email, setEmail] = useState(argEmail);
  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const lookup = async (id, mail) => {
    if (!id) return;
    setLoading(true); setError(''); setOrder(null); setTracking(null);
    try {
      const e2 = (mail ?? email).trim();
      const [o, t] = await Promise.all([api.getOrder(id, e2), api.trackOrder(id, e2)]);
      setOrder(o); setTracking(t);
    } catch (e) {
      setError(e.message && e.message.includes('email')
        ? e.message
        : 'Order not found. Check the Order ID, and the email you used at checkout.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-look-up only when it can actually succeed: a logged-in shopper is
  // matched on their account, and a guest needs the email we carried over
  // from checkout. Firing without either just showed "Order not found" the
  // instant someone clicked "Track this order".
  useEffect(() => {
    if (!argId) return;
    setOrderId(argId);
    if (argEmail) setEmail(argEmail);
    if (customer || argEmail) lookup(argId, argEmail);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [argId, argEmail, customer]);

  return (
    <div className="wrap track-wrap">
      <h1 className="serif">Track your order</h1>
      <p className="account-sub">
        Enter the Order ID from your confirmation email, plus the email address
        you used at checkout.
      </p>

      <div className="track-search">
        <input
          placeholder="Order ID — e.g. 01M04JD7E59WQ23FVSJGNH1H7C"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') lookup(orderId.trim()); }}
        />
      </div>
      <div className="track-search">
        <input
          type="email"
          placeholder="Email used at checkout"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') lookup(orderId.trim()); }}
        />
        <button className="btn" onClick={() => lookup(orderId.trim())} disabled={loading}>
          <span>{loading ? '…' : 'Track'}</span>
        </button>
      </div>

      {error && <p className="track-error">{error}</p>}

      {order && (
        <div className="track-result">
          <div className="order-row">
            <div className="order-main">
              <div className="order-number">{order.order_number}</div>
              <div className="order-date">
                {order.shipping?.name}{order.shipping?.city ? `, ${order.shipping.city}` : ''}
              </div>
            </div>
            <div className={`order-status status-${order.status}`}>{order.status.replace(/_/g, ' ')}</div>
            <div className="order-total">{fmt(order.grand_total)}</div>
          </div>

          <h3 className="serif account-block-title" style={{ marginTop: 30 }}>Shipping status</h3>

          {tracking?.status === 'not_shipped' && (
            <p className="account-muted">Not shipped yet — we'll update this as soon as it leaves our workshop.</p>
          )}

          {tracking && tracking.status !== 'not_shipped' && (
            <>
              <p className="track-courier">
                {tracking.courier} &middot; AWB {tracking.awb_code}
                {tracking.tracking_url && (
                  <> &middot; <a href={tracking.tracking_url} target="_blank" rel="noreferrer" className="track-link">Courier tracking</a></>
                )}
              </p>
              <div className="track-timeline">
                {tracking.events.map((ev, i) => (
                  <div className="track-event" key={i}>
                    <div className="track-dot" />
                    <div>
                      <div className="track-status">{ev.status.replace(/_/g, ' ')}</div>
                      {ev.detail && <div className="track-detail">{ev.detail}</div>}
                      {ev.at && <div className="track-date">{new Date(ev.at).toLocaleString()}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
