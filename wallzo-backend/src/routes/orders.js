const router = require('express').Router();
const { protect, requireRole } = require('../middleware/auth');
const {
  createOrder, confirmPayment, getMyOrders,
  getAllOrders, updateOrderStatus, getOrderStats
} = require('../controllers/orderController');

// User routes
router.post('/', protect, createOrder);
router.post('/:id/pay', protect, confirmPayment);
router.get('/my', protect, getMyOrders);

// Admin routes
router.get('/', protect, requireRole('admin', 'super_admin'), getAllOrders);
router.put('/:id/status', protect, requireRole('admin', 'super_admin'), updateOrderStatus);
router.get('/stats', protect, requireRole('admin', 'super_admin'), getOrderStats);

module.exports = router;
