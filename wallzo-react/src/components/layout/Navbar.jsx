import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ShoppingCart, Heart, User, Menu, X,
  ChevronDown, LogOut, Package, Settings, Shield
} from 'lucide-react';
import { useCart } from '../../store/CartContext';
import { useAuth } from '../../store/AuthContext';
import { useWishlist } from '../../store/WishlistContext';
import { products } from '../../data/products';
import './Navbar.css';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [profileOpen, setProfileOpen] = useState(false);
  const { cartCount } = useCart();
  const { wishlist } = useWishlist();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setProfileOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const results = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 5);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setProfileOpen(false);
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/products', label: 'Shop' },
    { path: '/products?category=anime', label: 'Anime' },
    { path: '/products?category=retro', label: 'Retro' },
    { path: '/products?category=minimal', label: 'Minimal' }
  ];

  return (
    <>
      <nav className={`navbar ${isScrolled ? 'navbar--scrolled' : ''}`}>
        <div className="navbar__inner container">
          {/* Logo */}
          <Link to="/" className="navbar__logo">
            <span className="navbar__logo-icon">W</span>
            <span className="navbar__logo-text">WALLZO</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="navbar__links">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`navbar__link ${location.pathname === link.path ? 'navbar__link--active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="navbar__actions">
            {/* Search */}
            <div className="navbar__search-wrapper" ref={searchRef}>
              <button
                className="navbar__icon-btn"
                onClick={() => setSearchOpen(!searchOpen)}
                aria-label="Search"
              >
                <Search size={20} />
              </button>

              <AnimatePresence>
                {searchOpen && (
                  <motion.div
                    className="navbar__search-dropdown"
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="navbar__search-input-wrap">
                      <Search size={16} className="navbar__search-icon" />
                      <input
                        type="text"
                        placeholder="Search posters, anime, retro..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                        className="navbar__search-input"
                      />
                      {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="navbar__search-clear">
                          <X size={14} />
                        </button>
                      )}
                    </div>
                    {searchResults.length > 0 && (
                      <div className="navbar__search-results">
                        {searchResults.map(product => (
                          <Link
                            key={product.id}
                            to={`/product/${product.slug}`}
                            className="navbar__search-result"
                            onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                          >
                            <img src={product.images[0]} alt={product.name} />
                            <div>
                              <p className="navbar__search-result-name">{product.name}</p>
                              <p className="navbar__search-result-price">₹{product.basePrice}</p>
                            </div>
                          </Link>
                        ))}
                        <Link
                          to={`/products?search=${searchQuery}`}
                          className="navbar__search-viewall"
                          onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                        >
                          View all results →
                        </Link>
                      </div>
                    )}
                    {searchQuery && searchResults.length === 0 && (
                      <div className="navbar__search-empty">
                        No results found for "{searchQuery}"
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Wishlist */}
            <Link to="/wishlist" className="navbar__icon-btn" aria-label="Wishlist">
              <Heart size={20} />
              {wishlist.length > 0 && (
                <span className="navbar__badge">{wishlist.length}</span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" className="navbar__icon-btn" aria-label="Cart">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="navbar__badge">{cartCount}</span>
              )}
            </Link>

            {/* Profile / Auth */}
            {isAuthenticated ? (
              <div className="navbar__profile-wrapper" ref={profileRef}>
                <button
                  className="navbar__avatar-btn"
                  onClick={() => setProfileOpen(!profileOpen)}
                >
                  <span className="navbar__avatar">{user.avatar}</span>
                  <ChevronDown size={14} className={`navbar__chevron ${profileOpen ? 'navbar__chevron--open' : ''}`} />
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      className="navbar__profile-dropdown"
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="navbar__profile-header">
                        <span className="navbar__profile-avatar">{user.avatar}</span>
                        <div>
                          <p className="navbar__profile-name">{user.name}</p>
                          <p className="navbar__profile-email">{user.email}</p>
                        </div>
                      </div>
                      <div className="navbar__profile-divider" />
                      <Link to="/profile" className="navbar__profile-item" onClick={() => setProfileOpen(false)}>
                        <User size={16} /> My Profile
                      </Link>
                      <Link to="/orders" className="navbar__profile-item" onClick={() => setProfileOpen(false)}>
                        <Package size={16} /> My Orders
                      </Link>
                      {(user.role === 'admin' || user.role === 'super_admin') && (
                        <Link to="/admin" className="navbar__profile-item" onClick={() => setProfileOpen(false)}>
                          <Settings size={16} /> Admin Panel
                        </Link>
                      )}
                      {user.role === 'super_admin' && (
                        <Link to="/admin" className="navbar__profile-item navbar__profile-item--super" onClick={() => setProfileOpen(false)}>
                          <Shield size={16} /> Super Admin
                        </Link>
                      )}
                      <div className="navbar__profile-divider" />
                      <button className="navbar__profile-item navbar__profile-item--logout" onClick={handleLogout}>
                        <LogOut size={16} /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" className="navbar__login-btn">
                Sign In
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="navbar__menu-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="navbar__mobile-menu"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="navbar__mobile-links">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="navbar__mobile-link"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {!isAuthenticated && (
                <Link to="/login" className="navbar__mobile-link navbar__mobile-link--cta" onClick={() => setMenuOpen(false)}>
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer */}
      <div className="navbar__spacer" />
    </>
  );
}
