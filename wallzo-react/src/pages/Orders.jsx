import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, ChevronRight, Eye } from 'lucide-react';
import { useAuth } from '../store/AuthContext';
import { useOrders } from '../store/OrderContext';
import './Orders.css';

const statusColors = {
  pending: 'var(--color-warning)',
  processing: 'var(--color-info)',
  shipped: 'var(--color-accent-primary)',
  delivered: 'var(--color-success)',
  cancelled: 'var(--color-danger)'
};

export default function Orders() {
  const { user, isAuthenticated } = useAuth();
  const { getUserOrders } = useOrders();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const orders = getUserOrders(user.id);

  return (
    <div className="orders-page container">
      <motion.h1 className="orders-page__title" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        My Orders
      </motion.h1>

      {orders.length === 0 ? (
        <div className="orders-page__empty">
          <Package size={64} className="orders-page__empty-icon" />
          <h2>No orders yet</h2>
          <p>Start shopping and your orders will appear here</p>
          <Link to="/products" className="orders-page__empty-btn">Shop Now</Link>
        </div>
      ) : (
        <div className="orders-page__list">
          {orders.map((order, i) => (
            <motion.div
              key={order.id}
              className="order-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="order-card__header">
                <div>
                  <h3 className="order-card__id">{order.id}</h3>
                  <p className="order-card__date">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </p>
                </div>
                <div className="order-card__status" style={{ '--status-color': statusColors[order.status] }}>
                  {order.status}
                </div>
              </div>

              <div className="order-card__items">
                {order.items.map((item, j) => (
                  <div key={j} className="order-card__item">
                    <img src={item.image} alt={item.name} />
                    <div>
                      <p className="order-card__item-name">{item.name}</p>
                      <p className="order-card__item-meta">{item.size} × {item.qty}</p>
                    </div>
                    <span className="order-card__item-price">₹{item.price * item.qty}</span>
                  </div>
                ))}
              </div>

              {/* Timeline */}
              <div className="order-card__timeline">
                {order.timeline.map((event, j) => (
                  <div key={j} className="order-card__timeline-item">
                    <div className="order-card__timeline-dot" style={{ background: statusColors[event.status] }} />
                    <div>
                      <p className="order-card__timeline-status">{event.status}</p>
                      <p className="order-card__timeline-note">{event.note}</p>
                      <p className="order-card__timeline-date">
                        {new Date(event.date).toLocaleString('en-IN', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-card__footer">
                <span className="order-card__total">Total: ₹{order.total}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
