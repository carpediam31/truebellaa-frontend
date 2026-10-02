import React from 'react';
import { useApp } from './context/AppContext.jsx';
import Header from './components/Header.jsx';
import MobileMenu from './components/MobileMenu.jsx';
import Home from './components/Home.jsx';
import Listing from './components/Listing.jsx';
import ProductDetail from './components/ProductDetail.jsx';
import CartPage from './components/CartPage.jsx';
import Checkout from './components/Checkout.jsx';
import Success from './components/Success.jsx';
import Account from './components/Account.jsx';
import Wishlist from './components/Wishlist.jsx';
import TrackOrder from './components/TrackOrder.jsx';
import Footer from './components/Footer.jsx';
import Drawer from './components/Drawer.jsx';
import ToastStack from './components/ToastStack.jsx';

export default function App() {
  const { page } = useApp();

  return (
    <>
      <Header />
      <MobileMenu />

      <main style={{ paddingTop: page === 'home' ? 0 : 88, minHeight: '100vh' }}>
        {page === 'home' && <Home />}
        {page === 'listing' && <Listing />}
        {page === 'pdp' && <ProductDetail />}
        {page === 'cart' && <CartPage />}
        {page === 'checkout' && <Checkout />}
        {page === 'success' && <Success />}
        {page === 'account' && <Account />}
        {page === 'wishlist' && <Wishlist />}
        {page === 'track' && <TrackOrder />}
      </main>

      <Footer />
      <Drawer />
      <ToastStack />
    </>
  );
}
