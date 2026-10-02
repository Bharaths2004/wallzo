import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';

// Contexts
import { CartProvider } from './store/CartContext';
import { WishlistProvider } from './store/WishlistContext';
import { AuthProvider } from './store/AuthContext';
import { OrderProvider } from './store/OrderContext';
import { ProductsProvider } from './store/ProductsContext';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Wishlist from './pages/Wishlist';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import Admin from './pages/Admin';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAuthRoute = location.pathname === '/login';

  return (
    <>
      <ScrollToTop />
      {!isAdminRoute && !isAuthRoute && <Navbar />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </AnimatePresence>
      {!isAdminRoute && !isAuthRoute && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ProductsProvider>
          <CartProvider>
            <WishlistProvider>
              <OrderProvider>
                <AppContent />
                <Toaster
                  position="bottom-right"
                  toastOptions={{
                    duration: 3000,
                    style: {
                      background: '#141414',
                      color: '#fff',
                      border: '1px solid rgba(255, 214, 0, 0.2)',
                      borderRadius: '10px',
                      fontSize: '14px',
                    },
                  }}
                />
              </OrderProvider>
            </WishlistProvider>
          </CartProvider>
        </ProductsProvider>
      </AuthProvider>
    </Router>
  );
}
