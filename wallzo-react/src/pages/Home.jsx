import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Truck, Shield, RotateCcw, Star,
  ChevronLeft, ChevronRight, Sparkles, Zap
} from 'lucide-react';
import ProductCard from '../components/shop/ProductCard';
import { products, categories, heroSlides, testimonials } from '../data/products';
import './Home.css';

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeCategory, setActiveCategory] = useState('all');

  const trendingProducts = products.filter(p => p.isTrending).slice(0, 4);
  const newProducts = products.filter(p => p.isNew).slice(0, 4);
  const featuredProducts = activeCategory === 'all'
    ? products.slice(0, 8)
    : products.filter(p => p.subCategory === activeCategory).slice(0, 8);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

  return (
    <div className="home">
      {/* === HERO SECTION === */}
      <section className="hero">
        <div className="hero__bg-effects">
          <div className="hero__diagonal hero__diagonal--1" />
          <div className="hero__diagonal hero__diagonal--2" />
          <div className="hero__grid-pattern" />
          <div className="hero__glow hero__glow--1" />
          <div className="hero__glow hero__glow--2" />
        </div>

        <div className="container hero__container">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              className="hero__content"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.5 }}
            >
              <span className="hero__accent-label">
                <Sparkles size={14} />
                {heroSlides[currentSlide].accent}
              </span>
              <h1 className="hero__title display-text">
                {heroSlides[currentSlide].title}
              </h1>
              <p className="hero__subtitle">
                {heroSlides[currentSlide].subtitle}
              </p>
              <div className="hero__cta-group">
                <Link to="/products" className="hero__cta-btn hero__cta-btn--primary">
                  {heroSlides[currentSlide].cta}
                  <ArrowRight size={18} />
                </Link>
                <Link to="/products?category=anime" className="hero__cta-btn hero__cta-btn--secondary">
                  Browse Anime
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Hero Product Showcase */}
          <div className="hero__showcase">
            <motion.div
              className="hero__poster-stack"
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="hero__poster hero__poster--back">
                <img src={products[1].images[0]} alt={products[1].name} />
              </div>
              <div className="hero__poster hero__poster--middle">
                <img src={products[4].images[0]} alt={products[4].name} />
              </div>
              <div className="hero__poster hero__poster--front">
                <img src={products[0].images[0]} alt={products[0].name} />
                <div className="hero__poster-badge">
                  <Zap size={12} /> BESTSELLER
                </div>
              </div>
            </motion.div>
          </div>

          {/* Slide Controls */}
          <div className="hero__controls">
            <button className="hero__control-btn" onClick={prevSlide} aria-label="Previous slide">
              <ChevronLeft size={18} />
            </button>
            <div className="hero__dots">
              {heroSlides.map((_, i) => (
                <button
                  key={i}
                  className={`hero__dot ${i === currentSlide ? 'hero__dot--active' : ''}`}
                  onClick={() => setCurrentSlide(i)}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
            <button className="hero__control-btn" onClick={nextSlide} aria-label="Next slide">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="hero__stats">
          <div className="container">
            <div className="hero__stats-grid">
              <div className="hero__stat">
                <span className="hero__stat-number">5000+</span>
                <span className="hero__stat-label">Happy Customers</span>
              </div>
              <div className="hero__stat">
                <span className="hero__stat-number">500+</span>
                <span className="hero__stat-label">Unique Designs</span>
              </div>
              <div className="hero__stat">
                <span className="hero__stat-number">4.9★</span>
                <span className="hero__stat-label">Average Rating</span>
              </div>
              <div className="hero__stat">
                <span className="hero__stat-number">24hr</span>
                <span className="hero__stat-label">Fast Shipping</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* === TRENDING SECTION === */}
      <section className="home__section">
        <div className="container">
          <div className="home__section-header">
            <div>
              <span className="home__section-accent">🔥 What's Hot</span>
              <h2 className="home__section-title">Trending Now</h2>
            </div>
            <Link to="/products?sort=trending" className="home__view-all">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="home__product-grid home__product-grid--4">
            {trendingProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* === CATEGORY BANNER === */}
      <section className="home__categories-banner">
        <div className="container">
          <div className="home__section-header home__section-header--center">
            <div>
              <span className="home__section-accent">🎨 Collections</span>
              <h2 className="home__section-title">Shop By Vibe</h2>
            </div>
          </div>
          <div className="home__category-grid">
            {[
              { name: 'Anime', slug: 'anime', emoji: '⚡', desc: 'Epic anime art', color: '#FF4444' },
              { name: 'Retro', slug: 'retro', emoji: '🕹️', desc: 'Nostalgic vibes', color: '#FF8800' },
              { name: 'Minimal', slug: 'minimal', emoji: '◼️', desc: 'Clean & bold', color: '#4488FF' },
              { name: 'Street Art', slug: 'street-art', emoji: '🎭', desc: 'Urban culture', color: '#44DD88' },
            ].map((cat, i) => (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  to={`/products?category=${cat.slug}`}
                  className="home__category-card"
                  style={{ '--cat-color': cat.color }}
                >
                  <span className="home__category-emoji">{cat.emoji}</span>
                  <h3 className="home__category-name">{cat.name}</h3>
                  <p className="home__category-desc">{cat.desc}</p>
                  <span className="home__category-arrow">→</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* === NEW ARRIVALS === */}
      <section className="home__section">
        <div className="container">
          <div className="home__section-header">
            <div>
              <span className="home__section-accent">✨ Fresh Drops</span>
              <h2 className="home__section-title">New Arrivals</h2>
            </div>
            <Link to="/products?sort=newest" className="home__view-all">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="home__product-grid home__product-grid--4">
            {newProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* === FEATURED WITH FILTERS === */}
      <section className="home__section">
        <div className="container">
          <div className="home__section-header home__section-header--center">
            <div>
              <span className="home__section-accent">🏆 Curated</span>
              <h2 className="home__section-title">Featured Collection</h2>
            </div>
          </div>

          {/* Category Filters */}
          <div className="home__filters">
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`home__filter-btn ${activeCategory === cat.id ? 'home__filter-btn--active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                <span>{cat.icon}</span> {cat.name}
              </button>
            ))}
          </div>

          <div className="home__product-grid home__product-grid--4">
            {featuredProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>

          <div className="home__cta-center">
            <Link to="/products" className="home__browse-all-btn">
              Browse All Products <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* === PROMO BANNER === */}
      <section className="home__promo">
        <div className="container">
          <div className="home__promo-card">
            <div className="home__promo-content">
              <span className="home__promo-badge">LIMITED OFFER</span>
              <h2 className="home__promo-title display-text">BUY 3, GET 1 FREE</h2>
              <p className="home__promo-text">
                Stock up on your favorites. Mix & match across all categories.
              </p>
              <Link to="/products" className="home__promo-btn">
                Shop Now <ArrowRight size={16} />
              </Link>
            </div>
            <div className="home__promo-visual">
              <div className="home__promo-poster">
                <img src={products[8].images[0]} alt="Promo" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* === TESTIMONIALS === */}
      <section className="home__section">
        <div className="container">
          <div className="home__section-header home__section-header--center">
            <div>
              <span className="home__section-accent">💬 Reviews</span>
              <h2 className="home__section-title">What Our Customers Say</h2>
            </div>
          </div>
          <div className="home__testimonials">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                className="home__testimonial"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <div className="home__testimonial-stars">
                  {Array.from({ length: t.rating }, (_, j) => (
                    <Star key={j} size={14} fill="currentColor" />
                  ))}
                </div>
                <p className="home__testimonial-text">"{t.text}"</p>
                <div className="home__testimonial-author">
                  <span className="home__testimonial-avatar">{t.avatar}</span>
                  <span className="home__testimonial-name">{t.name}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* === TRUST BADGES === */}
      <section className="home__trust">
        <div className="container">
          <div className="home__trust-grid">
            <div className="home__trust-item">
              <Truck size={28} />
              <h4>Free Shipping</h4>
              <p>On orders above ₹599</p>
            </div>
            <div className="home__trust-item">
              <Shield size={28} />
              <h4>Secure Payment</h4>
              <p>100% secure checkout</p>
            </div>
            <div className="home__trust-item">
              <RotateCcw size={28} />
              <h4>Easy Returns</h4>
              <p>7-day hassle-free returns</p>
            </div>
            <div className="home__trust-item">
              <Star size={28} />
              <h4>Premium Quality</h4>
              <p>Museum-grade prints</p>
            </div>
          </div>
        </div>
      </section>

      {/* === NEWSLETTER === */}
      <section className="home__newsletter">
        <div className="container">
          <div className="home__newsletter-card">
            <h2 className="home__newsletter-title display-text">STAY IN THE LOOP</h2>
            <p className="home__newsletter-text">
              Get notified about new drops, exclusive deals, and behind-the-scenes content.
            </p>
            <form className="home__newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="your@email.com"
                className="home__newsletter-input"
              />
              <button type="submit" className="home__newsletter-btn">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
