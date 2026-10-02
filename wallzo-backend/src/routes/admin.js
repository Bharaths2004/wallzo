const router = require('express').Router();
const { protect, requireRole } = require('../middleware/auth');
const {
  getDashboardStats, getAllUsers, updateUserRole,
  toggleUserStatus, getPendingActions, approveAction,
  rejectAction, getAnalytics
} = require('../controllers/adminController');

// All admin routes require at least 'admin' role
router.use(protect, requireRole('admin', 'super_admin'));

router.get('/stats', getDashboardStats);
router.get('/analytics', requireRole('super_admin'), getAnalytics);

// User management — super_admin only
router.get('/users', requireRole('super_admin'), getAllUsers);
router.put('/users/:id/role', requireRole('super_admin'), updateUserRole);
router.put('/users/:id/toggle', requireRole('super_admin'), toggleUserStatus);

// Pending actions — super_admin only
router.get('/pending', requireRole('super_admin'), getPendingActions);
router.post('/pending/:id/approve', requireRole('super_admin'), approveAction);
router.post('/pending/:id/reject', requireRole('super_admin'), rejectAction);

module.exports = router;
