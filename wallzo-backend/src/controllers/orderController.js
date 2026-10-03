const prisma = require('../prisma');

// POST /api/orders — create order (protected)
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod = 'upi' } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in order.' });
    }
    if (!shippingAddress || !shippingAddress.line1) {
      return res.status(400).json({ success: false, message: 'Shipping address is required.' });
    }

    // We should ideally do this in a transaction, but we will emulate the previous logic
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await prisma.product.findUnique({ 
        where: { id: item.productId },
        include: { variants: true }
      });
      
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found: ${item.productId}` });
      }
      
      const variant = product.variants.find(v => v.sku === item.sku);
      if (!variant) {
        return res.status(404).json({ success: false, message: `Variant ${item.sku} not found.` });
      }
      if (variant.stock < item.qty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name} (${variant.size}). Only ${variant.stock} left.`
        });
      }

      orderItems.push({
        productId: product.id,
        name: product.name,
        image: product.images[0] || '',
        size: variant.size,
        sku: variant.sku,
        qty: item.qty,
        price: variant.price
      });
      subtotal += variant.price * item.qty;

      // Deduct stock
      await prisma.variant.update({
        where: { id: variant.id },
        data: { stock: { decrement: item.qty } }
      });
    }

    const shippingCharge = subtotal >= 599 ? 0 : 49;
    const total = subtotal + shippingCharge;

    // Generate Order ID (WZ-10001+)
    const orderCount = await prisma.order.count();
    const orderIdStr = `WZ-${10001 + orderCount}`;

    const order = await prisma.order.create({
      data: {
        orderId: orderIdStr,
        userId: req.user.id,
        paymentMethod,
        paymentStatus: 'pending',
        subtotal,
        shippingCharge,
        total,
        shippingName: shippingAddress.name || '',
        shippingLine1: shippingAddress.line1,
        shippingLine2: shippingAddress.line2 || '',
        shippingCity: shippingAddress.city,
        shippingState: shippingAddress.state,
        shippingPincode: shippingAddress.pincode,
        shippingPhone: shippingAddress.phone,
        items: {
          create: orderItems
        },
        timeline: {
          create: [{ status: 'pending', note: 'Order placed successfully' }]
        }
      },
      include: { items: true, timeline: true }
    });

    res.status(201).json({ success: true, order });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error.' });
  }
};

// POST /api/orders/:id/pay — mock payment confirmation
exports.confirmPayment = async (req, res) => {
  try {
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    if (order.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: req.params.id },
      data: {
        paymentStatus: 'paid',
        paymentId: req.body.paymentId || `PAY_${Date.now()}`,
        status: 'processing',
        timeline: {
          create: { status: 'processing', note: 'Payment confirmed. Order is being processed.' }
        }
      },
      include: { timeline: true }
    });

    res.json({ success: true, order: updatedOrder });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/orders/my — user's own orders
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({ 
      where: { userId: req.user.id },
      include: { 
        items: {
          include: { product: { select: { name: true, slug: true, images: true } } }
        },
        timeline: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/orders/admin — all orders (admin+)
exports.getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = status ? { status } : {};
    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: { select: { name: true, email: true } },
          items: { include: { product: { select: { name: true, images: true } } } },
          timeline: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.order.count({ where })
    ]);

    res.json({ success: true, orders, pagination: { page: Number(page), limit: Number(limit), total } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// PUT /api/orders/:id/status — update order status (admin+)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, note, trackingNumber } = req.body;
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    const updateData = { status };
    if (trackingNumber) updateData.trackingNumber = trackingNumber;

    const updatedOrder = await prisma.order.update({
      where: { id: req.params.id },
      data: {
        ...updateData,
        timeline: {
          create: { status, note: note || `Status updated to ${status}` }
        }
      },
      include: { timeline: true }
    });

    res.json({ success: true, order: updatedOrder });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/orders/stats — dashboard stats (admin+)
exports.getOrderStats = async (req, res) => {
  try {
    const [totalOrders, revAgg, pendingOrders, processingOrders] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { paymentStatus: 'paid' }
      }),
      prisma.order.count({ where: { status: 'pending' } }),
      prisma.order.count({ where: { status: 'processing' } })
    ]);

    res.json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue: revAgg._sum.total || 0,
        pendingOrders,
        processingOrders
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
