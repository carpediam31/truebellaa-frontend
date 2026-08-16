import React from 'react';
import { useApp } from '../context/AppContext.jsx';

export default function Success() {
  const { successOrderId, go } = useApp();

  return (
    <div className="wrap success">
      <div className="check"><svg viewBox="0 0 24 24"><polyline points="4 12 10 18 20 6" /></svg></div>
      <h1 className="serif">Thank you</h1>
      <p>Your order has been placed successfully.</p>
      <p>Order ID: <span className="oid">{successOrderId}</span></p>
      <p style={{ marginTop: 8 }}>A confirmation has been sent to your email.</p>
      <div style={{ marginTop: 36 }}>
        <a className="btn ghost" onClick={() => go('home')}><span>Continue shopping</span></a>
      </div>
    </div>
  );
}
