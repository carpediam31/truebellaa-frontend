import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import ProductCard from './ProductCard.jsx';
import { useReveal } from '../hooks/useReveal.js';

const reels = [
  { img: '/images/reel-1.jpg', name: '@styled.by.aria', stat: '128K views · 9.2K likes', page: 'listing', arg: 'all' },
  { img: '/images/reel-2.jpg', name: '@dailygold', stat: '86K views · 5.1K likes', page: 'listing', arg: 'Chains' },
  { img: '/images/reel-3.jpg', name: '@layered.look', stat: '203K views · 14K likes', page: 'listing', arg: 'Pendants' },
  { img: '/images/reel-4.jpg', name: '@mens.edit', stat: '67K views · 4.4K likes', page: 'listing', arg: 'Bracelets' }
];

export default function Home() {
  const { go, subscribe, products } = useApp();
  const [email, setEmail] = useState('');
  useReveal([products.length]);

  const handleSubscribe = () => {
    if (subscribe(email)) setEmail('');
  };

  return (
    <>
      <section className="hero">
        <div
          className="hero-bg"
          id="heroBg"
          style={{ backgroundImage: "url('/images/hero-banner.jpg')" }}
        />
        <div className="hero-content">
          <p className="eyebrow reveal">TrueBellaa &middot; Est. Modern Keepsakes</p>
          <h1 className="reveal">Worn today.<br /><em>Kept</em> forever.</h1>
          <p className="hero-sub reveal">
            Chains, pendants and bracelets in gold and surgical steel — designed to move with you and outlast the moment.
          </p>
          <div className="reveal">
            <a className="btn light" onClick={() => go('listing', 'all')}><span>Explore the collection</span></a>
          </div>
        </div>
        <div className="scroll-hint"><span>Scroll</span><span className="line" /></div>
      </section>

      <div className="marquee">
        <div className="marquee-track">
          {Array.from({ length: 2 }).map((_, i) => (
            <React.Fragment key={i}>
              <span>Free shipping across India</span><span className="dot">&#9679;</span>
              <span>Hypoallergenic &amp; tarnish-resistant</span><span className="dot">&#9679;</span>
              <span>30-day returns</span><span className="dot">&#9679;</span>
              <span>Crafted for everyday wear</span><span className="dot">&#9679;</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      <section className="pad wrap">
        <div className="sec-head reveal">
          <div>
            <p className="eyebrow">Shop by category</p>
            <h2 className="serif">Find your form</h2>
          </div>
          <p>Three families, one philosophy — quiet metal, considered weight, and finishes that hold their shine.</p>
        </div>
        <div className="cat-grid stagger">
          {[
            { cat: 'Chains', img: '/images/category-chains.jpg' },
            { cat: 'Pendants', img: '/images/category-pendants.jpg' },
            { cat: 'Bracelets', img: '/images/category-bracelets.jpg' }
          ].map((c) => (
            <div className="cat-card" key={c.cat} onClick={() => go('listing', c.cat)}>
              <img src={c.img} alt={c.cat} />
              <div className="label">
                <h3 className="serif">{c.cat}</h3>
                <span className="arrow">
                  <svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="13 6 19 12 13 18" /></svg>
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="pad wrap" style={{ paddingTop: 0 }}>
        <div className="sec-head reveal">
          <div>
            <p className="eyebrow">Everyone's favourites</p>
            <h2 className="serif">Best sellers</h2>
          </div>
          <a className="link-underline" onClick={() => go('listing', 'all')}>View all</a>
        </div>
        <div className="prod-grid stagger">
          {products.slice(0, 4).map((p) => <ProductCard p={p} key={p.id} />)}
        </div>
      </section>

      <section className="split" id="storySection">
        <div className="media reveal"><img src="/images/craft-story.jpg" alt="Craft" /></div>
        <div className="copy reveal">
          <p className="eyebrow">The craft</p>
          <h2 className="serif">A curation of modern keepsakes</h2>
          <p>
            Every TrueBellaa piece begins as a drawing and ends in your hands. We work in solid, skin-safe metals — no flaking plate, no green wrists — finished by hand and checked one piece at a time.
          </p>
          <p>The result is jewellery that reads quiet up close and confident from across the room. Made to layer, made to last.</p>
          <div className="stats">
            <div className="stat"><div className="n" data-count="8">0</div><div className="l">Quality checks</div></div>
            <div className="stat"><div className="n" data-count="24">0</div><div className="l">Hours per design</div></div>
            <div className="stat"><div className="n" data-count="100">0</div><div className="l">% skin-safe</div></div>
          </div>
        </div>
      </section>

      <section className="pad wrap">
        <div className="sec-head reveal">
          <div>
            <p className="eyebrow">Gift for him &amp; her</p>
            <h2 className="serif">Featured this season</h2>
          </div>
          <a className="link-underline" onClick={() => go('listing', 'all')}>Shop the edit</a>
        </div>
        <div className="prod-grid stagger">
          {products.slice(4, 8).map((p) => <ProductCard p={p} key={p.id} />)}
        </div>
      </section>

      <section className="pad wrap" style={{ paddingTop: 0 }}>
        <div className="sec-head reveal">
          <div>
            <p className="eyebrow">Shop by video</p>
            <h2 className="serif">See it in motion</h2>
          </div>
          <p>Real pieces on real people. Tap any reel to shop the look.</p>
        </div>
        <div className="reels stagger">
          {reels.map((r) => (
            <div className="reel" key={r.name} onClick={() => go(r.page, r.arg)}>
              <img src={r.img} alt={r.name} />
              <div className="play"><svg viewBox="0 0 24 24"><polygon points="6 4 20 12 6 20" /></svg></div>
              <div className="meta">
                <div className="name">{r.name}</div>
                <div className="stat">{r.stat}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="pad testi">
        <div className="wrap reveal">
          <div className="stars">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg viewBox="0 0 24 24" key={i}><polygon points="12 2 15 9 22 9 16 14 18 21 12 17 6 21 8 14 2 9 9 9" /></svg>
            ))}
          </div>
          <p className="quote">The chain hasn't left my neck in six months. Still looks like the day it arrived.</p>
          <p className="who">Rhea M. &middot; Verified buyer</p>
        </div>
      </section>

      <section className="news">
        <div className="wrap reveal">
          <p className="eyebrow" style={{ color: 'rgba(255,255,255,.6)' }}>Join the list</p>
          <h2 className="serif">First to know, first to wear</h2>
          <p>New drops, private restocks and 10% off your first order.</p>
          <div className="news-form">
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button onClick={handleSubscribe}>Subscribe</button>
          </div>
        </div>
      </section>
    </>
  );
}
