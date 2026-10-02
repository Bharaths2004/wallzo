const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,         // snapshot at time of purchase
  image: String,        // snapshot
  size: String,
  sku: String,
  qty: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true }   // price at time of purchase
});

const timelineSchema = new mongoose.Schema({
  status: String,
  note: String,
  date: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true },  // WZ-10001
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentId: String,
  paymentMethod: { type: String, default: 'upi' },
  shippingAddress: {
    name: String,
    line1: String,
    line2: String,
    city: String,
    state: String,
    pincode: String,
    phone: String
  },
  subtotal: { type: Number, required: true },
  shippingCharge: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  timeline: [timelineSchema],
  trackingNumber: String,
  notes: String
}, { timestamps: true });

// Auto-generate order ID
orderSchema.pre('save', async function (next) {
  if (!this.orderId) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderId = `WZ-${10001 + count}`;
  }
  next();
});

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderId: 1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', orderSchema);
