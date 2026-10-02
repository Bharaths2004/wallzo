import { createContext, useContext, useState, useCallback } from 'react';
import { ordersAPI } from '../services/api';

const OrderContext = createContext(null);
export const useOrders = () => useContext(OrderContext);

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMyOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ordersAPI.getMyOrders();
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const placeOrder = async ({ items, shippingAddress, paymentMethod = 'upi' }) => {
    setLoading(true);
    try {
      const orderRes = await ordersAPI.create({ items, shippingAddress, paymentMethod });
      const order = orderRes.order;

      // Confirm payment (mock)
      const paidRes = await ordersAPI.confirmPayment(order._id, `PAY_${Date.now()}`);
      const paidOrder = paidRes.order;

      setOrders(prev => [paidOrder, ...prev]);
      return { success: true, order: paidOrder };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Admin: fetch all orders
  const fetchAllOrders = async (params = {}) => {
    setLoading(true);
    try {
      const data = await ordersAPI.getAllAdmin(params);
      setOrders(data.orders || []);
      return data;
    } catch (err) {
      console.error('Failed to fetch all orders:', err);
    } finally {
      setLoading(false);
    }
  };

  // Admin: update order status
  const updateOrderStatus = async (orderId, status, note) => {
    try {
      const data = await ordersAPI.updateStatus(orderId, status, note);
      setOrders(prev => prev.map(o => o._id === orderId ? data.order : o));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return (
    <OrderContext.Provider value={{
      orders,
      loading,
      fetchMyOrders,
      placeOrder,
      fetchAllOrders,
      updateOrderStatus
    }}>
      {children}
    </OrderContext.Provider>
  );
};
