import React from 'react';
import { useApp } from '../context/AppContext.jsx';

export default function CartPage() {
  const { cart, cartQty, removeFromCart, cartTotal, go, fmt } = useApp();

  return (
    <div className="wrap cart-wrap">
      <h1 className="serif">Your bag</h1>

      {!cart.length ? (
        <div className="cart-empty">
          <h3 className="serif">Your bag is empty</h3>
          <p style={{ marginBottom: 26 }}>Discover pieces made to be kept.</p>
          <a className="btn" onClick={() => go('listing', 'all')}><span>Shop the collection</span></a>
        </div>
      ) : (
        <div className="cart-layout">
          <div>
            {cart.map((i) => (
              <div className="cart-item" key={i.key}>
                <div className="thumb"><img src={i.img} alt={i.name} /></div>
                <div>
                  <h3>{i.name}</h3>
                  <div className="opt">{i.len} &middot; {i.metal} tone</div>
                  <div className="qty" style={{ display: 'inline-flex', transform: 'scale(.85)', transformOrigin: 'left' }}>
                    <button onClick={() => cartQty(i.key, -1)}>&minus;</button>
                    <span>{i.qty}</span>
                    <button onClick={() => cartQty(i.key, 1)}>+</button>
                  </div>
                  <div className="rm" style={{ marginTop: 12 }} onClick={() => removeFromCart(i.key)}>Remove</div>
                </div>
                <div className="price">{fmt(i.price * i.qty)}</div>
              </div>
            ))}
          </div>
          <div className="summary">
            <h3 className="serif">Summary</h3>
            <div className="sum-row"><span>Subtotal</span><span>{fmt(cartTotal)}</span></div>
            <div className="sum-row"><span>Shipping</span><span>Free</span></div>
            <div className="sum-row total"><span>Total</span><span>{fmt(cartTotal)}</span></div>
            <button className="btn" onClick={() => go('checkout')}><span>Proceed to checkout</span></button>
            <p className="secure">
              <svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
              Secure checkout via Razorpay
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
