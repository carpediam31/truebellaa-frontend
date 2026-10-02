import React from 'react';
import { useApp } from '../context/AppContext.jsx';

export default function Footer() {
  const { go } = useApp();

  return (
    <footer>
      <div className="wrap">
        <div className="foot-top">
          <div className="foot-brand">
            <a className="logo" href="#" onClick={(e) => { e.preventDefault(); go('home'); }}>TrueBellaa</a>
            <p>Modern keepsakes in gold and surgical steel. Designed in-house, made to be worn every day and kept for a lifetime.</p>
          </div>
          <div className="foot-col">
            <h4>Shop</h4>
            <a onClick={() => go('listing', 'all')}>All jewellery</a>
            <a onClick={() => go('listing', 'Chains')}>Chains</a>
            <a onClick={() => go('listing', 'Pendants')}>Pendants</a>
            <a onClick={() => go('listing', 'Bracelets')}>Bracelets</a>
          </div>
          <div className="foot-col">
            <h4>Support</h4>
            <a>Shipping &amp; returns</a>
            <a>Care guide</a>
            <a onClick={() => go('track')}>Track order</a>
            <a>Contact us</a>
          </div>
          <div className="foot-col">
            <h4>Company</h4>
            <a>About TrueBellaa</a>
            <a>Instagram</a>
            <a>Blog</a>
            <a>Terms &amp; privacy</a>
          </div>
        </div>
        <div className="foot-bottom">
          <span>&copy; 2026 TrueBellaa. All rights reserved.</span>
          <div className="pay-icons">
            <span>UPI</span><span>VISA</span><span>Mastercard</span><span>RuPay</span><span>Razorpay</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
