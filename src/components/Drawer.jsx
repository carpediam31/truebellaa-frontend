import React from 'react';
import { useApp } from '../context/AppContext.jsx';

export default function Drawer() {
  const { drawerOpen, setDrawerOpen, cart, cartQty, removeFromCart, cartTotal, go, fmt } = useApp();

  return (
    <>
      <div
        className={`drawer-overlay ${drawerOpen ? 'open' : ''}`}
        onClick={() => setDrawerOpen(false)}
      />
      <aside className={`drawer ${drawerOpen ? 'open' : ''}`}>
        <div className="drawer-head">
          <h3>Your bag</h3>
          <button className="drawer-close" onClick={() => setDrawerOpen(false)}>&times;</button>
        </div>
        <div className="drawer-body">
          {!cart.length ? (
            <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '60px 0' }}>Your bag is empty.</p>
          ) : (
            cart.map((i) => (
              <div className="drawer-item" key={i.key}>
                <div className="thumb"><img src={i.img} alt={i.name} /></div>
                <div>
                  <h4>{i.name}</h4>
                  <div className="o">{i.len} &middot; {i.metal}</div>
                  <div className="p">{fmt(i.price)}</div>
                  <div className="qty" style={{ marginTop: 8, display: 'inline-flex', transform: 'scale(.8)', transformOrigin: 'left' }}>
                    <button onClick={() => cartQty(i.key, -1)}>&minus;</button>
                    <span>{i.qty}</span>
                    <button onClick={() => cartQty(i.key, 1)}>+</button>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="rm" onClick={() => removeFromCart(i.key)}>Remove</div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="drawer-foot">
          {cart.length ? (
            <>
              <div className="row"><span>Subtotal</span><span>{fmt(cartTotal)}</span></div>
              <button className="btn" style={{ width: '100%', justifyContent: 'center' }} onClick={() => go('checkout')}>
                <span>Checkout</span>
              </button>
              <button className="btn ghost" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} onClick={() => go('cart')}>
                <span>View bag</span>
              </button>
            </>
          ) : (
            <button className="btn ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={() => go('listing', 'all')}>
              <span>Start shopping</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
