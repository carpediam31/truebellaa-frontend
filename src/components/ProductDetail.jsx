import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { api } from '../api.js';
import ProductCard from './ProductCard.jsx';
import Accordion from './Accordion.jsx';
import { useReveal } from '../hooks/useReveal.js';

export default function ProductDetail() {
  const { currentProductId, locale, go, addToCart, fmt, products } = useApp();

  const [p, setP] = useState(null);          // the API product detail
  const [loading, setLoading] = useState(true);
  const [mainImg, setMainImg] = useState(null);
  const [lenCode, setLenCode] = useState(null);
  const [metalCode, setMetalCode] = useState(null);
  const [qty, setQty] = useState(1);

  useReveal([currentProductId, loading]);

  // fetch the product (re-fetch if the slug or language changes)
  useEffect(() => {
    if (!currentProductId) return;
    let alive = true;
    setLoading(true);
    api.getProduct(currentProductId)
      .then((data) => {
        if (!alive) return;
        setP(data);
        setMainImg(data.images?.[0] || null);
        const defVar = data.variants?.find((v) => v.is_default) || data.variants?.[0];
        setLenCode(defVar?.attributes?.length?.code || data.options?.lengths?.[0]?.code || null);
        setMetalCode(defVar?.attributes?.metal?.code || data.options?.metals?.[0]?.code || null);
        setQty(1);
      })
      .catch(() => { if (alive) setP(null); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [currentProductId, locale]);

  // the variant matching the current length + metal selection
  const variant = useMemo(() => {
    if (!p?.variants) return null;
    return (
      p.variants.find((v) => v.attributes?.length?.code === lenCode && v.attributes?.metal?.code === metalCode) ||
      p.variants.find((v) => v.attributes?.length?.code === lenCode) ||
      p.variants.find((v) => v.is_default) || p.variants[0]
    );
  }, [p, lenCode, metalCode]);

  const stock = variant ? variant.stock_available : 0;
  const price = variant ? variant.price : (p ? p.base_price : 0);

  const metalLabel = useMemo(() => {
    const m = p?.options?.metals?.find((x) => x.code === metalCode);
    return m ? m.label : '';
  }, [p, metalCode]);

  const lenLabel = useMemo(() => {
    const l = p?.options?.lengths?.find((x) => x.code === lenCode);
    return l ? l.label : '';
  }, [p, lenCode]);

  if (loading) {
    return <div className="wrap" style={{ padding: '80px 0', color: 'var(--muted)' }}>Loading…</div>;
  }
  if (!p) {
    return <div className="wrap" style={{ padding: '80px 0' }}>Product not found.</div>;
  }

  const images = p.images && p.images.length ? p.images : [mainImg].filter(Boolean);

  const qtyChange = (d) => {
    setQty((v) => {
      let next = v + d;
      if (next < 1) next = 1;
      if (stock && next > stock) next = stock;
      return next;
    });
  };

  const handleAdd = (buyNow) => {
    if (!variant) return;
    const cartProduct = {
      id: p.slug, name: p.name, img: images[0], price, cat: cap(p.category), metal: metalLabel,
    };
    addToCart(cartProduct, lenLabel, metalLabel, variant.sku, qty, true);
    if (buyNow) go('checkout');
  };

  const catTitle = cap(p.category);
  const related = products.filter((x) => x.cat === catTitle && x.slug !== p.slug).slice(0, 4);
  const fill = products.filter((x) => x.slug !== p.slug).slice(0, 4);
  const relatedList = related.length ? related : fill;

  return (
    <div className="wrap">
      <div className="crumb">
        <a onClick={() => go('home')}>Home</a><span>/</span>
        <a onClick={() => go('listing', 'all')}>Shop</a><span>/</span>
        <span>{p.name}</span>
      </div>

      <div className="pdp">
        <div className="pdp-gallery">
          <div className="pdp-thumbs">
            {images.map((im, i) => (
              <div key={i} className={`pdp-thumb ${mainImg === im ? 'on' : ''}`} onClick={() => setMainImg(im)}>
                <img src={im} alt="" />
              </div>
            ))}
          </div>
          <div className="pdp-main"><img id="pdp-main-img" src={mainImg} alt={p.name} /></div>
        </div>

        <div className="pdp-info">
          <div className="cat">{catTitle} &middot; {metalLabel} tone</div>
          <h1 className="serif">{p.name}</h1>
          <div className="pdp-rating">
            <span className="stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg viewBox="0 0 24 24" style={{ fill: 'var(--gold)' }} key={i}>
                  <polygon points="12 2 15 9 22 9 16 14 18 21 12 17 6 21 8 14 2 9 9 9" />
                </svg>
              ))}
            </span> {Number(p.rating_avg).toFixed(1)} ({p.rating_count} reviews)
          </div>
          <div className="pdp-price">{fmt(price)}</div>
          <div className="pdp-tax">Inclusive of all taxes &middot; Free shipping</div>
          <p className="pdp-desc">{p.description || p.short_description}</p>

          <div className="opt-block">
            <div className="lab">Length</div>
            <div className="pills">
              {p.options.lengths.map((l) => (
                <div key={l.code} className={`pill ${lenCode === l.code ? 'on' : ''}`} onClick={() => setLenCode(l.code)}>{l.label}</div>
              ))}
            </div>
          </div>

          <div className="opt-block">
            <div className="lab">Metal</div>
            <div className="swatches">
              {p.options.metals.map((m) => (
                <div
                  key={m.code}
                  className={`swatch ${metalCode === m.code ? 'on' : ''}`}
                  style={{ background: m.hex || '#ccc' }}
                  title={m.label}
                  onClick={() => setMetalCode(m.code)}
                />
              ))}
            </div>
          </div>

          <div className="qty-row">
            <div className="qty">
              <button onClick={() => qtyChange(-1)}>&minus;</button>
              <span>{qty}</span>
              <button onClick={() => qtyChange(1)}>+</button>
            </div>
            <span style={{ fontSize: 13, color: stock <= 2 ? '#b0603a' : 'var(--muted)' }}>
              {stock <= 0 ? 'Out of stock' : stock <= 2 ? `Only ${stock} left` : 'In stock'}
            </span>
          </div>

          <div className="pdp-cta">
            <button className="btn" disabled={stock <= 0} onClick={() => handleAdd(false)}><span>Add to bag</span></button>
            <button className="btn ghost" disabled={stock <= 0} onClick={() => handleAdd(true)}><span>Buy now</span></button>
          </div>

          <div className="trust-row">
            <div className="trust">
              <svg viewBox="0 0 24 24"><path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z" /></svg> 1-year warranty
            </div>
            <div className="trust">
              <svg viewBox="0 0 24 24"><path d="M3 12h18M3 12l4-4M3 12l4 4" /></svg> 30-day returns
            </div>
            <div className="trust">
              <svg viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="13" rx="2" /><path d="M16 7V5a4 4 0 0 0-8 0v2" /></svg> Delivery in 3-5 days
            </div>
          </div>

          <div className="pdp-meta">
            <Accordion title="Product details">
              {p.description || `Skin-safe ${metalLabel} tone alloy. Nickel-free and tarnish-resistant, hand-finished and quality-checked before dispatch.`}
            </Accordion>
            <Accordion title="Care instructions">
              {p.care_instructions || 'Wipe with a soft dry cloth after wear. Avoid perfume, chlorine and moisture for longest shine.'}
            </Accordion>
            <Accordion title="Shipping & returns">
              Free shipping across India. Dispatched in 24 hours. Easy 30-day returns on unworn pieces in original packaging.
            </Accordion>
          </div>
        </div>
      </div>

      <section style={{ padding: '20px 0 100px' }}>
        <div className="sec-head">
          <div><p className="eyebrow">You may also like</p><h2 className="serif">Complete the look</h2></div>
        </div>
        <div className="prod-grid">
          {relatedList.map((rp) => <ProductCard p={rp} key={rp.id} />)}
        </div>
      </section>
    </div>
  );
}

function cap(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}
