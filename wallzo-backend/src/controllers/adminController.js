const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const PendingAction = require('../models/PendingAction');

// GET /api/admin/stats — dashboard overview
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers, totalProducts, totalOrders,
      revenueAgg, pendingActions, lowStockProducts, recentOrders
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Product.countDocuments({ status: 'active', approvalStatus: 'approved' }),
      Order.countDocuments(),
      Order.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      PendingAction.countDocuments({ status: 'pending' }),
      Product.find({ 'variants.stock': { $lte: 10, $gt: 0 }, status: 'active' })
        .select('name images variants')
        .limit(10),
      Order.find().sort({ createdAt: -1 }).limit(5)
        .populate('user', 'name email')
        .select('orderId user total status createdAt')
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: revenueAgg[0]?.total || 0,
        pendingActions,
        lowStockProducts,
        recentOrders
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/admin/users — list all users (super_admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// PUT /api/admin/users/:id/role — change user role (super_admin only)
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin', 'super_admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role.' });
    }
    // Prevent demoting yourself
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot change your own role.' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// PUT /api/admin/users/:id/toggle — activate/deactivate user (super_admin only)
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, user, message: `User ${user.isActive ? 'activated' : 'deactivated'}.` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/admin/pending — list pending actions (super_admin only)
exports.getPendingActions = async (req, res) => {
  try {
    const actions = await PendingAction.find({ status: 'pending' })
      .populate('submittedBy', 'name email role')
      .sort({ submittedAt: -1 });
    res.json({ success: true, actions });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// POST /api/admin/pending/:id/approve — approve pending action (super_admin only)
exports.approveAction = async (req, res) => {
  try {
    const action = await PendingAction.findById(req.params.id);
    if (!action || action.status !== 'pending') {
      return res.status(404).json({ success: false, message: 'Pending action not found.' });
    }

    let result;
    switch (action.type) {
      case 'ADD_PRODUCT':
        result = await Product.create({
          ...action.payload,
          approvalStatus: 'approved',
          approvedBy: req.user._id
        });
        break;

      case 'UPDATE_PRODUCT':
        result = await Product.findByIdAndUpdate(
          action.payload.productId,
          action.payload.updates,
          { new: true, runValidators: true }
        );
        break;

      case 'DELETE_PRODUCT':
        result = await Product.findByIdAndDelete(action.payload.productId);
        break;

      case 'UPDATE_STOCK':
        const product = await Product.findById(action.payload.productId);
        if (product) {
          const variant = product.variants.find(v => v.sku === action.payload.sku);
          if (variant) {
            variant.stock = action.payload.stock;
            await product.save();
            result = product;
          }
        }
        break;
    }

    action.status = 'approved';
    action.reviewedBy = req.user._id;
    action.reviewedAt = new Date();
    action.reviewNote = req.body.note || 'Approved';
    await action.save();

    res.json({ success: true, action, result, message: 'Action approved and executed.' });
  } catch (err) {
    console.error('Approve action error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error.' });
  }
};

// POST /api/admin/pending/:id/reject — reject pending action (super_admin only)
exports.rejectAction = async (req, res) => {
  try {
    const action = await PendingAction.findById(req.params.id);
    if (!action || action.status !== 'pending') {
      return res.status(404).json({ success: false, message: 'Pending action not found.' });
    }
    action.status = 'rejected';
    action.reviewedBy = req.user._id;
    action.reviewedAt = new Date();
    action.reviewNote = req.body.note || 'Rejected';
    await action.save();
    res.json({ success: true, action, message: 'Action rejected.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/admin/analytics — advanced analytics (super_admin only)
exports.getAnalytics = async (req, res) => {
  try {
    const [
      revenueLast30Days,
      ordersByStatus,
      topProducts
    ] = await Promise.all([
      // Revenue by day for last 30 days
      Order.aggregate([
        {
          $match: {
            paymentStatus: 'paid',
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$total' },
            orders: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      // Orders by status
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      // Top selling products
      Order.aggregate([
        { $unwind: '$items' },
        { $group: { _id: '$items.product', name: { $first: '$items.name' }, totalSold: { $sum: '$items.qty' } } },
        { $sort: { totalSold: -1 } },
        { $limit: 10 }
      ])
    ]);

    res.json({ success: true, analytics: { revenueLast30Days, ordersByStatus, topProducts } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
