import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, CreditCard, MapPin, ArrowRight, Check } from 'lucide-react';
import { useCart } from '../store/CartContext';
import { useAuth } from '../store/AuthContext';
import { useOrders } from '../store/OrderContext';
import toast from 'react-hot-toast';
import './Checkout.css';

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { placeOrder } = useOrders();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [address, setAddress] = useState({
    name: user?.name || '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    phone: ''
  });
  const [processing, setProcessing] = useState(false);

  const shipping = cartTotal >= 599 ? 0 : 49;
  const total = cartTotal + shipping;

  if (!isAuthenticated) {
    return (
      <div className="checkout container" style={{ textAlign: 'center', padding: '80px 0' }}>
        <h2>Please sign in to checkout</h2>
        <Link to="/login" className="checkout__next-btn" style={{ display: 'inline-flex', marginTop: 20 }}>
          Sign In <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  if (cart.length === 0) { navigate('/cart'); return null; }

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    if (!address.name || !address.line1 || !address.city || !address.state || !address.pincode || !address.phone) {
      toast.error('Please fill all required fields');
      return;
    }
    setStep(2);
  };

  const handlePayment = async () => {
    setProcessing(true);

    // Build order items in the format the backend expects
    const items = cart.map(item => ({
      productId: item.productId,
      sku: item.sku,
      qty: item.quantity
    }));

    const result = await placeOrder({ items, shippingAddress: address, paymentMethod });

    setProcessing(false);

    if (result.success) {
      clearCart();
      toast.success('Order placed successfully! 🎉', {
        style: { background: '#141414', color: '#fff', border: '1px solid rgba(255,214,0,0.2)' },
        duration: 4000
      });
      navigate('/orders');
    } else {
      toast.error(result.error || 'Order failed. Please try again.');
    }
  };

  return (
    <div className="checkout container">
      <motion.h1 className="checkout__title" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        Checkout
      </motion.h1>

      {/* Progress Steps */}
      <div className="checkout__steps">
        <div className={`checkout__step ${step >= 1 ? 'checkout__step--active' : ''}`}>
          <span className="checkout__step-num">{step > 1 ? <Check size={14} /> : '1'}</span>
          <span>Address</span>
        </div>
        <div className="checkout__step-line" />
        <div className={`checkout__step ${step >= 2 ? 'checkout__step--active' : ''}`}>
          <span className="checkout__step-num">2</span>
          <span>Payment</span>
        </div>
      </div>

      <div className="checkout__layout">
        <div className="checkout__form-area">
          {step === 1 && (
            <motion.form className="checkout__form" onSubmit={handleAddressSubmit} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="checkout__form-title"><MapPin size={20} /> Shipping Address</h2>
              <div className="checkout__field-grid">
                <div className="checkout__field">
                  <label>Full Name *</label>
                  <input type="text" value={address.name} onChange={e => setAddress({...address, name: e.target.value})} placeholder="John Doe" required />
                </div>
                <div className="checkout__field">
                  <label>Phone *</label>
                  <input type="tel" value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})} placeholder="9876543210" required />
                </div>
                <div className="checkout__field checkout__field--full">
                  <label>Address Line 1 *</label>
                  <input type="text" value={address.line1} onChange={e => setAddress({...address, line1: e.target.value})} placeholder="House/Flat, Street" required />
                </div>
                <div className="checkout__field checkout__field--full">
                  <label>Address Line 2</label>
                  <input type="text" value={address.line2} onChange={e => setAddress({...address, line2: e.target.value})} placeholder="Landmark (optional)" />
                </div>
                <div className="checkout__field">
                  <label>City *</label>
                  <input type="text" value={address.city} onChange={e => setAddress({...address, city: e.target.value})} placeholder="Bangalore" required />
                </div>
                <div className="checkout__field">
                  <label>State *</label>
                  <input type="text" value={address.state} onChange={e => setAddress({...address, state: e.target.value})} placeholder="Karnataka" required />
                </div>
                <div className="checkout__field">
                  <label>Pincode *</label>
                  <input type="text" value={address.pincode} onChange={e => setAddress({...address, pincode: e.target.value})} placeholder="560001" required />
                </div>
              </div>
              {/* Use saved address if available */}
              {user?.addresses?.length > 0 && (
                <div className="checkout__saved-addresses">
                  <p className="checkout__saved-label">Or use a saved address:</p>
                  {user.addresses.map((addr, i) => (
                    <button key={i} type="button" className="checkout__saved-addr-btn"
                      onClick={() => setAddress({ name: addr.name || user.name, line1: addr.line1, line2: addr.line2 || '', city: addr.city, state: addr.state, pincode: addr.pincode, phone: addr.phone })}>
                      📍 {addr.label}: {addr.line1}, {addr.city}
                    </button>
                  ))}
                </div>
              )}
              <button type="submit" className="checkout__next-btn">
                Continue to Payment <ArrowRight size={16} />
              </button>
            </motion.form>
          )}

          {step === 2 && (
            <motion.div className="checkout__payment" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="checkout__form-title"><CreditCard size={20} /> Payment</h2>
              <div className="checkout__payment-methods">
                {[
                  { id: 'upi', label: 'UPI / Google Pay / PhonePe', desc: 'Pay instantly via UPI' },
                  { id: 'card', label: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay' },
                  { id: 'cod', label: 'Cash on Delivery', desc: 'Pay when you receive' },
                ].map(m => (
                  <label key={m.id} className={`checkout__payment-method ${paymentMethod === m.id ? 'checkout__payment-method--active' : ''}`}>
                    <input type="radio" name="payment" value={m.id} checked={paymentMethod === m.id} onChange={() => setPaymentMethod(m.id)} />
                    <div><strong>{m.label}</strong><p>{m.desc}</p></div>
                  </label>
                ))}
              </div>
              <div className="checkout__payment-actions">
                <button className="checkout__back-btn" onClick={() => setStep(1)}>← Back</button>
                <button className="checkout__pay-btn" onClick={handlePayment} disabled={processing}>
                  <Lock size={16} />
                  {processing ? 'Placing Order...' : `Pay ₹${total}`}
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Order Summary */}
        <div className="checkout__summary">
          <h3 className="checkout__summary-title">Order Summary</h3>
          <div className="checkout__summary-items">
            {cart.map(item => (
              <div key={item.sku} className="checkout__summary-item">
                <img src={item.image} alt={item.name} />
                <div>
                  <p className="checkout__summary-name">{item.name}</p>
                  <p className="checkout__summary-meta">{item.size} × {item.quantity}</p>
                </div>
                <span className="checkout__summary-price">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="checkout__summary-divider" />
          <div className="checkout__summary-row"><span>Subtotal</span><span>₹{cartTotal}</span></div>
          <div className="checkout__summary-row">
            <span>Shipping</span>
            <span>{shipping === 0 ? <span style={{color:'var(--color-success)'}}>FREE</span> : `₹${shipping}`}</span>
          </div>
          <div className="checkout__summary-divider" />
          <div className="checkout__summary-row checkout__summary-row--total"><span>Total</span><span>₹{total}</span></div>
        </div>
      </div>
    </div>
  );
}
