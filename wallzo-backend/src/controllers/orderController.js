const Order = require('../models/Order');
const Product = require('../models/Product');

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

    // Validate items, check stock, and build order items
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
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
        product: product._id,
        name: product.name,
        image: product.images[0] || '',
        size: variant.size,
        sku: variant.sku,
        qty: item.qty,
        price: variant.price
      });
      subtotal += variant.price * item.qty;

      // Deduct stock
      variant.stock -= item.qty;
      await product.save();
    }

    const shippingCharge = subtotal >= 599 ? 0 : 49;
    const total = subtotal + shippingCharge;

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      paymentStatus: 'pending',
      subtotal,
      shippingCharge,
      total,
      timeline: [{ status: 'pending', note: 'Order placed successfully' }]
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
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    order.paymentStatus = 'paid';
    order.paymentId = req.body.paymentId || `PAY_${Date.now()}`;
    order.status = 'processing';
    order.timeline.push({ status: 'processing', note: 'Payment confirmed. Order is being processed.' });
    await order.save();

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/orders/my — user's own orders
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name slug images')
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/orders/admin — all orders (admin+)
exports.getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};
    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('user', 'name email')
        .populate('items.product', 'name images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments(query)
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
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    order.timeline.push({
      status,
      note: note || `Status updated to ${status}`,
    });
    await order.save();

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/orders/stats — dashboard stats (admin+)
exports.getOrderStats = async (req, res) => {
  try {
    const [totalOrders, totalRevenue, pendingOrders, processingOrders] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'processing' })
    ]);

    res.json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        pendingOrders,
        processingOrders
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
