import React from 'react';
import { useApp } from '../context/AppContext.jsx';

export default function MobileMenu() {
  const { mobileMenuOpen, setMobileMenuOpen, go } = useApp();

  const nav = (page, arg) => { go(page, arg); setMobileMenuOpen(false); };

  return (
    <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
      <span className="mclose" onClick={() => setMobileMenuOpen(false)}>&times;</span>
      <a onClick={() => nav('listing', 'all')}>Shop All</a>
      <a onClick={() => nav('listing', 'Chains')}>Chains</a>
      <a onClick={() => nav('listing', 'Pendants')}>Pendants</a>
      <a onClick={() => nav('listing', 'Bracelets')}>Bracelets</a>
      <a onClick={() => nav('cart')}>Cart</a>
      <a onClick={() => nav('wishlist')}>Wishlist</a>
      <a onClick={() => nav('account')}>Account</a>
      <a onClick={() => nav('track')}>Track order</a>
    </div>
  );
}
