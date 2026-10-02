import React from 'react';
import { useApp } from '../context/AppContext.jsx';

export default function ProductCard({ p }) {
  const { go, quickAdd, fmt, isWishlisted, toggleWishlist } = useApp();
  const wished = isWishlisted(p.slug || p.id);

  return (
    <div className="prod-card" onClick={() => go('pdp', p.id)}>
      <div className="prod-media">
        {p.stock <= 1 && <span className="prod-badge">Last one</span>}
        <button
          className={`prod-wish ${wished ? 'active' : ''}`}
          onClick={(e) => { e.stopPropagation(); toggleWishlist(p); }}
        >
          <svg viewBox="0 0 24 24"><path d="M12 21s-7-4.5-9.5-9C1 9 2.5 5 6 5c2 0 3.2 1.2 4 2.3C10.8 6.2 12 5 14 5c3.5 0 5 4 3.5 7-2.5 4.5-9.5 9-9.5 9z" /></svg>
        </button>
        <img className="main" src={p.img} alt={p.name} loading="lazy" />
        <img className="alt" src={p.alt} alt={p.name} loading="lazy" />
        <button className="quick-add" onClick={(e) => { e.stopPropagation(); quickAdd(p); }}>
          Quick add
        </button>
      </div>
      <div className="prod-info">
        <div className="prod-cat">{p.cat} &middot; {p.metal}</div>
        <h3>{p.name}</h3>
        <div className="prod-price">{fmt(p.price)}</div>
        {p.stock <= 2 && <div className="prod-stock">Only {p.stock} left in stock</div>}
      </div>
    </div>
  );
}
