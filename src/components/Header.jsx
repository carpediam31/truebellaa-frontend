import React from 'react';
import { useApp } from '../context/AppContext.jsx';

export default function Header() {
  const { go, scrollToStory, setDrawerOpen, cartCount, headerSolid, setMobileMenuOpen,
    locale, setLocale, LOCALES } = useApp();

  return (
    <header id="header" className={headerSolid ? 'solid' : ''}>
      <div className="bar">
        <a className="logo" href="#" onClick={(e) => { e.preventDefault(); go('home'); }}>TrueBellaa</a>
        <nav className="nav">
          <a className="nav-link" onClick={() => go('listing', 'all')}>Shop All</a>
          <a className="nav-link" onClick={() => go('listing', 'Chains')}>Chains</a>
          <a className="nav-link" onClick={() => go('listing', 'Pendants')}>Pendants</a>
          <a className="nav-link" onClick={() => go('listing', 'Bracelets')}>Bracelets</a>
          <a className="nav-link" onClick={scrollToStory}>Craft</a>
        </nav>
        <div className="nav-icons">
          <select
            className="lang-switch"
            title="Language"
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            aria-label="Language"
            style={{
              background: 'transparent', border: '1px solid currentColor', color: 'inherit',
              borderRadius: 999, padding: '4px 8px', font: 'inherit', fontSize: 12,
              cursor: 'pointer', opacity: 0.85,
            }}
          >
            {LOCALES.map((l) => (
              <option key={l.code} value={l.code} style={{ color: '#111' }}>{l.label}</option>
            ))}
          </select>
          <button className="icon-btn" title="Search">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.5" y2="16.5" /></svg>
          </button>
          <button className="icon-btn" title="Account">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></svg>
          </button>
          <button className="icon-btn" title="Wishlist">
            <svg viewBox="0 0 24 24"><path d="M12 21s-7-4.5-9.5-9C1 9 2.5 5 6 5c2 0 3.2 1.2 4 2.3C10.8 6.2 12 5 14 5c3.5 0 5 4 3.5 7-2.5 4.5-9.5 9-9.5 9z" /></svg>
          </button>
          <button className="icon-btn" title="Cart" onClick={() => setDrawerOpen(true)}>
            <svg viewBox="0 0 24 24"><path d="M6 8h12l-1 12H7L6 8z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg>
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </button>
          <button className="icon-btn menu-toggle" onClick={() => setMobileMenuOpen(true)}>
            <svg viewBox="0 0 24 24"><line x1="3" y1="7" x2="21" y2="7" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="17" x2="21" y2="17" /></svg>
          </button>
        </div>
      </div>
    </header>
  );
}
