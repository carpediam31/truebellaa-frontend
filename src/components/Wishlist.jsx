import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { api, toProduct } from '../api.js';
import ProductCard from './ProductCard.jsx';

export default function Wishlist() {
  const { customer, authLoading, go } = useApp();
  const [items, setItems] = useState(null);

  useEffect(() => {
    if (!customer) return;
    let alive = true;
    api.getWishlist()
      .then((res) => { if (alive) setItems((res || []).map(toProduct)); })
      .catch(() => { if (alive) setItems([]); });
    return () => { alive = false; };
  }, [customer]);

  return (
    <div className="wrap" style={{ paddingTop: 40, paddingBottom: 100 }}>
      <h1 className="serif">Your wishlist</h1>

      {!authLoading && !customer && (
        <div className="cart-empty">
          <h3 className="serif">Login to see your wishlist</h3>
          <p style={{ marginBottom: 26 }}>Save pieces you love and pick up where you left off.</p>
          <a className="btn" onClick={() => go('account')}><span>Login</span></a>
        </div>
      )}

      {customer && items === null && <p className="account-muted" style={{ marginTop: 20 }}>Loading…</p>}

      {customer && items && !items.length && (
        <div className="cart-empty">
          <h3 className="serif">Nothing saved yet</h3>
          <p style={{ marginBottom: 26 }}>Tap the heart on any piece to save it here.</p>
          <a className="btn" onClick={() => go('listing', 'all')}><span>Shop the collection</span></a>
        </div>
      )}

      {customer && items && !!items.length && (
        <div className="prod-grid" style={{ marginTop: 30 }}>
          {items.map((p) => <ProductCard p={p} key={p.id} />)}
        </div>
      )}
    </div>
  );
}
