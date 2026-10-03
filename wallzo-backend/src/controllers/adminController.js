const prisma = require('../prisma');

// GET /api/admin/stats — dashboard overview
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers, totalProducts, totalOrders,
      revenueAgg, pendingActions, lowStockProducts, recentOrders
    ] = await Promise.all([
      prisma.user.count({ where: { isActive: true } }),
      prisma.product.count({ where: { status: 'active', approvalStatus: 'approved' } }),
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'paid' } }),
      prisma.pendingAction.count({ where: { status: 'pending' } }),
      prisma.product.findMany({
        where: { status: 'active', variants: { some: { stock: { lte: 10, gt: 0 } } } },
        select: { id: true, name: true, images: true, variants: true },
        take: 10
      }),
      prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { user: { select: { name: true, email: true } } }
      })
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: revenueAgg._sum.total || 0,
        pendingActions,
        lowStockProducts,
        recentOrders: recentOrders.map(o => ({
          orderId: o.orderId,
          user: o.user,
          total: o.total,
          status: o.status,
          createdAt: o.createdAt
        }))
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
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, email: true, role: true, avatar: true, isActive: true, createdAt: true
      }
    });
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
    if (req.params.id === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot change your own role.' });
    }
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: { id: true, name: true, email: true, role: true, avatar: true, isActive: true }
    });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// PUT /api/admin/users/:id/toggle — activate/deactivate user (super_admin only)
exports.toggleUserStatus = async (req, res) => {
  try {
    const existing = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, message: 'User not found.' });
    
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: !existing.isActive },
      select: { id: true, name: true, email: true, role: true, avatar: true, isActive: true }
    });
    res.json({ success: true, user, message: `User ${user.isActive ? 'activated' : 'deactivated'}.` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/admin/pending — list pending actions (super_admin only)
exports.getPendingActions = async (req, res) => {
  try {
    const actions = await prisma.pendingAction.findMany({
      where: { status: 'pending' },
      include: { submittedBy: { select: { name: true, email: true, role: true } } },
      orderBy: { submittedAt: 'desc' }
    });
    res.json({ success: true, actions });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// POST /api/admin/pending/:id/approve — approve pending action (super_admin only)
exports.approveAction = async (req, res) => {
  try {
    const action = await prisma.pendingAction.findUnique({ where: { id: req.params.id } });
    if (!action || action.status !== 'pending') {
      return res.status(404).json({ success: false, message: 'Pending action not found.' });
    }

    let result;
    switch (action.type) {
      case 'ADD_PRODUCT':
        const addPayload = action.payload;
        result = await prisma.product.create({
          data: {
            ...addPayload,
            approvalStatus: 'approved',
            approvedById: req.user.id,
            variants: {
              create: addPayload.variants || []
            }
          }
        });
        break;

      case 'UPDATE_PRODUCT':
        const updatePayload = action.payload;
        
        let variantsUpdate = {};
        if (updatePayload.updates.variants) {
          variantsUpdate = {
            deleteMany: {},
            create: updatePayload.updates.variants
          };
          delete updatePayload.updates.variants;
        }

        result = await prisma.product.update({
          where: { id: updatePayload.productId },
          data: {
            ...updatePayload.updates,
            variants: variantsUpdate
          }
        });
        break;

      case 'DELETE_PRODUCT':
        const delPayload = action.payload;
        await prisma.variant.deleteMany({ where: { productId: delPayload.productId } });
        result = await prisma.product.delete({ where: { id: delPayload.productId } });
        break;

      case 'UPDATE_STOCK':
        const stockPayload = action.payload;
        const product = await prisma.product.findUnique({ where: { id: stockPayload.productId }, include: { variants: true } });
        if (product) {
          const variant = product.variants.find(v => v.sku === stockPayload.sku);
          if (variant) {
            await prisma.variant.update({ where: { id: variant.id }, data: { stock: stockPayload.stock } });
            result = await prisma.product.findUnique({ where: { id: product.id } });
          }
        }
        break;
    }

    const updatedAction = await prisma.pendingAction.update({
      where: { id: req.params.id },
      data: {
        status: 'approved',
        reviewedById: req.user.id,
        reviewedAt: new Date(),
        reviewNote: req.body.note || 'Approved'
      }
    });

    res.json({ success: true, action: updatedAction, result, message: 'Action approved and executed.' });
  } catch (err) {
    console.error('Approve action error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error.' });
  }
};

// POST /api/admin/pending/:id/reject — reject pending action (super_admin only)
exports.rejectAction = async (req, res) => {
  try {
    const action = await prisma.pendingAction.findUnique({ where: { id: req.params.id } });
    if (!action || action.status !== 'pending') {
      return res.status(404).json({ success: false, message: 'Pending action not found.' });
    }
    
    const updatedAction = await prisma.pendingAction.update({
      where: { id: req.params.id },
      data: {
        status: 'rejected',
        reviewedById: req.user.id,
        reviewedAt: new Date(),
        reviewNote: req.body.note || 'Rejected'
      }
    });
    
    res.json({ success: true, action: updatedAction, message: 'Action rejected.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/admin/analytics — advanced analytics (super_admin only)
exports.getAnalytics = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    // Revenue by day requires raw query in Prisma or post-processing
    const recentOrders = await prisma.order.findMany({
      where: { paymentStatus: 'paid', createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true, total: true }
    });
    
    const revenueMap = {};
    recentOrders.forEach(o => {
      const dateStr = o.createdAt.toISOString().split('T')[0];
      if (!revenueMap[dateStr]) revenueMap[dateStr] = { _id: dateStr, revenue: 0, orders: 0 };
      revenueMap[dateStr].revenue += o.total;
      revenueMap[dateStr].orders += 1;
    });
    const revenueLast30Days = Object.values(revenueMap).sort((a, b) => a._id.localeCompare(b._id));

    // Orders by status
    const statusGroups = await prisma.order.groupBy({
      by: ['status'],
      _count: { id: true }
    });
    const ordersByStatus = statusGroups.map(g => ({ _id: g.status, count: g._count.id }));

    // Top selling products
    const topItems = await prisma.orderItem.groupBy({
      by: ['productId', 'name'],
      _sum: { qty: true },
      orderBy: { _sum: { qty: 'desc' } },
      take: 10
    });
    
    const topProducts = topItems.map(item => ({
      _id: item.productId,
      name: item.name,
      totalSold: item._sum.qty
    }));

    res.json({ success: true, analytics: { revenueLast30Days, ordersByStatus, topProducts } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
