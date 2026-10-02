import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react';
import { useCart } from '../../store/CartContext';
import { useWishlist } from '../../store/WishlistContext';
import toast from 'react-hot-toast';
import './ProductCard.css';

export default function ProductCard({ product, index = 0 }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const defaultVariant = product.variants[0];
  const inStock = product.variants.some(v => v.stock > 0);
  const lowStock = product.variants.every(v => v.stock <= 10 && v.stock > 0);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) return;
    const availableVariant = product.variants.find(v => v.stock > 0);
    addToCart(product, availableVariant);
    toast.success(`${product.name} added to cart!`, {
      style: {
        background: '#141414',
        color: '#fff',
        border: '1px solid rgba(255,214,0,0.2)',
      },
      iconTheme: { primary: '#FFD600', secondary: '#0A0A0A' }
    });
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
    const action = isInWishlist(product.id) ? 'removed from' : 'added to';
    toast.success(`${product.name} ${action} wishlist`, {
      style: {
        background: '#141414',
        color: '#fff',
        border: '1px solid rgba(255,214,0,0.2)',
      },
      iconTheme: { primary: '#FFD600', secondary: '#0A0A0A' }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <Link
        to={`/product/${product.slug}`}
        className="product-card"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container */}
        <div className="product-card__image-wrap">
          {!imageLoaded && (
            <div className="product-card__skeleton" />
          )}
          <img
            src={product.images[0]}
            alt={product.name}
            className={`product-card__image ${imageLoaded ? 'product-card__image--loaded' : ''}`}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />

          {/* Hover overlay with second image */}
          {product.images[1] && isHovered && (
            <img
              src={product.images[1]}
              alt={product.name}
              className="product-card__image-hover"
            />
          )}

          {/* Badges */}
          <div className="product-card__badges">
            {product.isNew && (
              <span className="product-card__badge product-card__badge--new">NEW</span>
            )}
            {product.isTrending && (
              <span className="product-card__badge product-card__badge--hot">🔥 HOT</span>
            )}
            {!inStock && (
              <span className="product-card__badge product-card__badge--oos">SOLD OUT</span>
            )}
            {inStock && lowStock && (
              <span className="product-card__badge product-card__badge--low">LOW STOCK</span>
            )}
          </div>

          {/* Quick Actions */}
          <div className={`product-card__actions ${isHovered ? 'product-card__actions--visible' : ''}`}>
            <button
              className={`product-card__action-btn ${isInWishlist(product.id) ? 'product-card__action-btn--active' : ''}`}
              onClick={handleWishlist}
              aria-label="Add to wishlist"
            >
              <Heart size={16} fill={isInWishlist(product.id) ? 'currentColor' : 'none'} />
            </button>
            <button
              className="product-card__action-btn"
              onClick={handleAddToCart}
              disabled={!inStock}
              aria-label="Add to cart"
            >
              <ShoppingCart size={16} />
            </button>
            <Link
              to={`/product/${product.slug}`}
              className="product-card__action-btn"
              onClick={(e) => e.stopPropagation()}
              aria-label="Quick view"
            >
              <Eye size={16} />
            </Link>
          </div>
        </div>

        {/* Info */}
        <div className="product-card__info">
          <span className="product-card__category">{product.subCategory}</span>
          <h3 className="product-card__name">{product.name}</h3>
          <div className="product-card__meta">
            <div className="product-card__rating">
              <Star size={13} fill="currentColor" />
              <span>{product.rating}</span>
              <span className="product-card__review-count">({product.reviewCount})</span>
            </div>
            <div className="product-card__price">
              <span className="product-card__price-current">₹{defaultVariant.price}</span>
              {product.variants.length > 1 && (
                <span className="product-card__price-from">onwards</span>
              )}
            </div>
          </div>
          <div className="product-card__sizes">
            {product.variants.map(v => (
              <span
                key={v.sku}
                className={`product-card__size ${v.stock === 0 ? 'product-card__size--oos' : ''}`}
              >
                {v.size}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
