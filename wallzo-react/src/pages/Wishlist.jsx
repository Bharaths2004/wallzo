import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { products } from '../data/products';
import { useWishlist } from '../store/WishlistContext';
import ProductCard from '../components/shop/ProductCard';
import './Wishlist.css';

export default function Wishlist() {
  const { wishlist } = useWishlist();
  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  if (wishlistProducts.length === 0) {
    return (
      <div className="wishlist-page container">
        <div className="wishlist-page__empty">
          <Heart size={64} className="wishlist-page__empty-icon" />
          <h2>Your wishlist is empty</h2>
          <p>Save your favorite posters to your wishlist</p>
          <Link to="/products" className="wishlist-page__empty-btn">Browse Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page container">
      <motion.h1 className="wishlist-page__title" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        My Wishlist <span>({wishlistProducts.length})</span>
      </motion.h1>
      <div className="wishlist-page__grid">
        {wishlistProducts.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>
    </div>
  );
}
