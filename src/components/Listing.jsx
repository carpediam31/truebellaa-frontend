import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import ProductCard from './ProductCard.jsx';
import { useReveal } from '../hooks/useReveal.js';

const CheckIcon = () => (
  <svg viewBox="0 0 12 12"><polyline points="2 6 5 9 10 3" /></svg>
);

export default function Listing() {
  const { go, activeFilters, setActiveFilters, products } = useApp();
  const [sort, setSort] = useState('featured');
  useReveal([activeFilters, sort, products.length]);

  const title = activeFilters.cat === 'all' ? 'Shop All' : activeFilters.cat;

  const toggleMetal = (m) => {
    setActiveFilters((prev) => {
      const has = prev.metal.includes(m);
      return { ...prev, metal: has ? prev.metal.filter((x) => x !== m) : [...prev.metal, m] };
    });
  };

  const list = useMemo(() => {
    let l = products.filter((p) => {
      if (activeFilters.cat !== 'all' && p.cat !== activeFilters.cat) return false;
      if (activeFilters.metal.length && !activeFilters.metal.includes(p.metal)) return false;
      if (activeFilters.stock && p.stock < 1) return false;
      return true;
    });
    if (sort === 'low') l = [...l].sort((a, b) => a.price - b.price);
    if (sort === 'high') l = [...l].sort((a, b) => b.price - a.price);
    if (sort === 'name') l = [...l].sort((a, b) => a.name.localeCompare(b.name));
    return l;
  }, [activeFilters, sort, products]);

  return (
    <>
      <div className="listing-head">
        <div className="wrap">
          <h1 className="serif">{title}</h1>
          <p>Modern keepsakes in gold and steel</p>
        </div>
      </div>
      <div className="wrap">
        <div className="crumb">
          <a onClick={() => go('home')}>Home</a><span>/</span><span>{title}</span>
        </div>
        <div className="listing-body">
          <aside className="filters">
            <div className="filter-group">
              <h4>Category</h4>
              {['all', 'Chains', 'Pendants', 'Bracelets'].map((c) => (
                <div
                  key={c}
                  className={`filter-opt ${activeFilters.cat === c ? 'on' : ''}`}
                  onClick={() => setActiveFilters((prev) => ({ ...prev, cat: c }))}
                >
                  <span className="box"><CheckIcon /></span> {c === 'all' ? 'All jewellery' : c}
                </div>
              ))}
            </div>
            <div className="filter-group">
              <h4>Metal</h4>
              {[['Gold', 'Gold tone'], ['Silver', 'Silver tone'], ['Steel', 'Steel']].map(([v, label]) => (
                <div
                  key={v}
                  className={`filter-opt ${activeFilters.metal.includes(v) ? 'on' : ''}`}
                  onClick={() => toggleMetal(v)}
                >
                  <span className="box"><CheckIcon /></span> {label}
                </div>
              ))}
            </div>
            <div className="filter-group">
              <h4>Availability</h4>
              <div
                className={`filter-opt ${activeFilters.stock ? 'on' : ''}`}
                onClick={() => setActiveFilters((prev) => ({ ...prev, stock: !prev.stock }))}
              >
                <span className="box"><CheckIcon /></span> In stock
              </div>
            </div>
          </aside>
          <div>
            <div className="listing-top">
              <span className="count">{list.length} pieces</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="featured">Sort — Featured</option>
                <option value="low">Price: Low to high</option>
                <option value="high">Price: High to low</option>
                <option value="name">Alphabetical</option>
              </select>
            </div>
            <div id="listing-grid">
              {list.length ? (
                list.map((p) => <ProductCard p={p} key={p.id} />)
              ) : (
                <p style={{ color: 'var(--muted)', gridColumn: '1/-1', padding: '40px 0' }}>
                  No pieces match these filters. Try clearing a few.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
