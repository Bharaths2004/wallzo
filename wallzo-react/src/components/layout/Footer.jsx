import { Link } from 'react-router-dom';
import { Share2, MessageCircle, Play, Mail, MapPin, Phone } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__accent-line" />
      <div className="container">
        <div className="footer__grid">
          {/* Brand */}
          <div className="footer__brand">
            <Link to="/" className="footer__logo">
              <span className="footer__logo-icon">W</span>
              <span className="footer__logo-text">WALLZO</span>
            </Link>
            <p className="footer__tagline">
              Art for Your Walls — Bold. Funky. Unapologetically You.
            </p>
            <div className="footer__socials">
              <a href="#" className="footer__social" aria-label="Instagram">
                <Share2 size={18} />
              </a>
              <a href="#" className="footer__social" aria-label="Twitter">
                <MessageCircle size={18} />
              </a>
              <a href="#" className="footer__social" aria-label="YouTube">
                <Play size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer__section">
            <h4 className="footer__heading">Shop</h4>
            <div className="footer__links">
              <Link to="/products">All Posters</Link>
              <Link to="/products?category=anime">Anime Collection</Link>
              <Link to="/products?category=retro">Retro Collection</Link>
              <Link to="/products?category=minimal">Minimal Collection</Link>
              <Link to="/products?category=street-art">Street Art</Link>
            </div>
          </div>

          {/* Help */}
          <div className="footer__section">
            <h4 className="footer__heading">Help</h4>
            <div className="footer__links">
              <Link to="/orders">Track Order</Link>
              <a href="#">Shipping Policy</a>
              <a href="#">Returns & Refunds</a>
              <a href="#">FAQ</a>
              <a href="#">Size Guide</a>
            </div>
          </div>

          {/* Contact */}
          <div className="footer__section">
            <h4 className="footer__heading">Contact</h4>
            <div className="footer__contact-list">
              <div className="footer__contact-item">
                <Mail size={14} />
                <span>hello@wallzo.in</span>
              </div>
              <div className="footer__contact-item">
                <Phone size={14} />
                <span>+91 98765 43210</span>
              </div>
              <div className="footer__contact-item">
                <MapPin size={14} />
                <span>Bangalore, India</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="footer__bottom">
          <p className="footer__copyright">
            © {new Date().getFullYear()} Wallzo. All rights reserved.
          </p>
          <div className="footer__bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
