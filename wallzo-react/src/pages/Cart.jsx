import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { useCart } from '../store/CartContext';
import './Cart.css';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();

  const shipping = cartTotal >= 599 ? 0 : 49;
  const total = cartTotal + shipping;

  if (cart.length === 0) {
    return (
      <div className="cart-page container">
        <div className="cart-page__empty">
          <ShoppingBag size={64} className="cart-page__empty-icon" />
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added anything to your cart yet.</p>
          <Link to="/products" className="cart-page__empty-btn">
            Browse Products <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page container">
      <motion.h1
        className="cart-page__title"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Shopping Cart <span className="cart-page__count">({cartCount} items)</span>
      </motion.h1>

      <div className="cart-page__layout">
        {/* Cart Items */}
        <div className="cart-page__items">
          <AnimatePresence>
            {cart.map((item) => (
              <motion.div
                key={item.sku}
                className="cart-item"
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Link to={`/products`} className="cart-item__image">
                  <img src={item.image} alt={item.name} />
                </Link>
                <div className="cart-item__info">
                  <h3 className="cart-item__name">{item.name}</h3>
                  <span className="cart-item__variant">Size: {item.size} · SKU: {item.sku}</span>
                  <span className="cart-item__price-single">₹{item.price} each</span>
                </div>
                <div className="cart-item__controls">
                  <div className="cart-item__quantity">
                    <button onClick={() => updateQuantity(item.sku, item.quantity - 1)}>
                      <Minus size={14} />
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.sku, item.quantity + 1)}>
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className="cart-item__price">₹{item.price * item.quantity}</span>
                  <button
                    className="cart-item__remove"
                    onClick={() => removeFromCart(item.sku)}
                    aria-label="Remove"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <motion.div
          className="cart-page__summary"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="cart-page__summary-title">Order Summary</h3>

          <div className="cart-page__summary-row">
            <span>Subtotal</span>
            <span>₹{cartTotal}</span>
          </div>
          <div className="cart-page__summary-row">
            <span>Shipping</span>
            <span>{shipping === 0 ? <span className="cart-page__free">FREE</span> : `₹${shipping}`}</span>
          </div>
          {shipping > 0 && (
            <p className="cart-page__shipping-note">
              Add ₹{599 - cartTotal} more for free shipping
            </p>
          )}
          <div className="cart-page__summary-divider" />
          <div className="cart-page__summary-row cart-page__summary-row--total">
            <span>Total</span>
            <span>₹{total}</span>
          </div>

          <div className="cart-page__coupon">
            <Tag size={14} />
            <input type="text" placeholder="Coupon code" className="cart-page__coupon-input" />
            <button className="cart-page__coupon-btn">Apply</button>
          </div>

          <Link to="/checkout" className="cart-page__checkout-btn">
            Proceed to Checkout <ArrowRight size={16} />
          </Link>

          <Link to="/products" className="cart-page__continue">
            ← Continue Shopping
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
