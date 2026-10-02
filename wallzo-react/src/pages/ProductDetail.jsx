import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart, ShoppingCart, Star, Truck, Shield, RotateCcw,
  ChevronRight, Minus, Plus, Check
} from 'lucide-react';
import { products } from '../data/products';
import { useCart } from '../store/CartContext';
import { useWishlist } from '../store/WishlistContext';
import ProductCard from '../components/shop/ProductCard';
import toast from 'react-hot-toast';
import './ProductDetail.css';

export default function ProductDetail() {
  const { slug } = useParams();
  const product = products.find(p => p.slug === slug);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [selectedVariant, setSelectedVariant] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div className="pdp__not-found container">
        <h2>Product not found</h2>
        <Link to="/products">← Back to shop</Link>
      </div>
    );
  }

  const variant = product.variants[selectedVariant];
  const inStock = variant.stock > 0;
  const lowStock = variant.stock > 0 && variant.stock <= 10;

  const relatedProducts = products
    .filter(p => p.subCategory === product.subCategory && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    if (!inStock) return;
    for (let i = 0; i < quantity; i++) {
      addToCart(product, variant);
    }
    toast.success(`${quantity}× ${product.name} (${variant.size}) added to cart!`, {
      style: {
        background: '#141414',
        color: '#fff',
        border: '1px solid rgba(255,214,0,0.2)',
      },
      iconTheme: { primary: '#FFD600', secondary: '#0A0A0A' }
    });
  };

  const getStockBadge = () => {
    if (!inStock) return { text: 'Out of Stock', className: 'pdp__stock--oos' };
    if (lowStock) return { text: `Only ${variant.stock} left!`, className: 'pdp__stock--low' };
    return { text: 'In Stock', className: 'pdp__stock--in' };
  };

  const stockBadge = getStockBadge();

  return (
    <div className="pdp">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="pdp__breadcrumb">
          <Link to="/">Home</Link>
          <ChevronRight size={14} />
          <Link to="/products">Shop</Link>
          <ChevronRight size={14} />
          <Link to={`/products?category=${product.subCategory}`}>{product.subCategory}</Link>
          <ChevronRight size={14} />
          <span>{product.name}</span>
        </nav>

        <div className="pdp__main">
          {/* Image Gallery */}
          <motion.div
            className="pdp__gallery"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="pdp__image-main">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                key={selectedImage}
              />
              {product.isNew && (
                <span className="pdp__badge pdp__badge--new">NEW</span>
              )}
              {product.isTrending && (
                <span className="pdp__badge pdp__badge--hot">🔥 HOT</span>
              )}
            </div>
            <div className="pdp__thumbnails">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  className={`pdp__thumbnail ${i === selectedImage ? 'pdp__thumbnail--active' : ''}`}
                  onClick={() => setSelectedImage(i)}
                >
                  <img src={img} alt={`${product.name} ${i + 1}`} />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            className="pdp__info"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <span className="pdp__category">{product.subCategory}</span>
            <h1 className="pdp__name">{product.name}</h1>

            <div className="pdp__rating">
              <div className="pdp__stars">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    size={16}
                    fill={i < Math.floor(product.rating) ? 'currentColor' : 'none'}
                    className={i < Math.floor(product.rating) ? 'pdp__star--filled' : 'pdp__star--empty'}
                  />
                ))}
              </div>
              <span className="pdp__rating-text">{product.rating}</span>
              <span className="pdp__review-count">({product.reviewCount} reviews)</span>
            </div>

            <div className="pdp__price-block">
              <span className="pdp__price">₹{variant.price}</span>
              <span className={`pdp__stock ${stockBadge.className}`}>
                {inStock && <Check size={14} />}
                {stockBadge.text}
              </span>
            </div>

            <p className="pdp__description">{product.description}</p>

            {/* Size Selector */}
            <div className="pdp__option-group">
              <label className="pdp__option-label">
                Size: <strong>{variant.size}</strong>
              </label>
              <div className="pdp__sizes">
                {product.variants.map((v, i) => (
                  <button
                    key={v.sku}
                    className={`pdp__size-btn ${i === selectedVariant ? 'pdp__size-btn--active' : ''} ${v.stock === 0 ? 'pdp__size-btn--oos' : ''}`}
                    onClick={() => { setSelectedVariant(i); setQuantity(1); }}
                    disabled={v.stock === 0}
                  >
                    {v.size}
                    <span className="pdp__size-price">₹{v.price}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="pdp__option-group">
              <label className="pdp__option-label">Quantity</label>
              <div className="pdp__quantity">
                <button
                  className="pdp__qty-btn"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={!inStock}
                >
                  <Minus size={16} />
                </button>
                <span className="pdp__qty-value">{quantity}</span>
                <button
                  className="pdp__qty-btn"
                  onClick={() => setQuantity(Math.min(variant.stock, quantity + 1))}
                  disabled={!inStock}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pdp__actions">
              <button
                className="pdp__add-to-cart"
                onClick={handleAddToCart}
                disabled={!inStock}
              >
                <ShoppingCart size={18} />
                {inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>
              <button
                className={`pdp__wishlist-btn ${isInWishlist(product.id) ? 'pdp__wishlist-btn--active' : ''}`}
                onClick={() => toggleWishlist(product.id)}
              >
                <Heart size={18} fill={isInWishlist(product.id) ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Trust */}
            <div className="pdp__trust">
              <div className="pdp__trust-item">
                <Truck size={16} />
                <span>Free shipping above ₹599</span>
              </div>
              <div className="pdp__trust-item">
                <Shield size={16} />
                <span>Secure payment</span>
              </div>
              <div className="pdp__trust-item">
                <RotateCcw size={16} />
                <span>7-day easy returns</span>
              </div>
            </div>

            {/* Tags */}
            <div className="pdp__tags">
              {product.tags.map(tag => (
                <Link key={tag} to={`/products?search=${tag}`} className="pdp__tag">
                  #{tag}
                </Link>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="pdp__related">
            <h2 className="pdp__related-title">You Might Also Like</h2>
            <div className="pdp__related-grid">
              {relatedProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
