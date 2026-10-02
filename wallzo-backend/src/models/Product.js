const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  size: { type: String, required: true },     // A4, A3, A2
  sku: { type: String, required: true },
  stock: { type: Number, required: true, min: 0, default: 0 },
  price: { type: Number, required: true, min: 0 }
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, lowercase: true },
  category: { type: String, enum: ['posters', 'accessories', 'clothing'], default: 'posters' },
  subCategory: {
    type: String,
    enum: ['anime', 'retro', 'minimal', 'street-art', 'rings', 'chains', 'tshirts', 'hoodies'],
    required: true
  },
  description: { type: String, required: true },
  images: [{ type: String }],
  basePrice: { type: Number, required: true, min: 0 },
  variants: [variantSchema],
  tags: [String],
  status: { type: String, enum: ['active', 'draft', 'archived'], default: 'active' },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  isNew: { type: Boolean, default: false },
  isTrending: { type: Boolean, default: false }
}, { timestamps: true });

// Auto-generate slug from name
productSchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  // Derive basePrice from cheapest variant
  if (this.variants && this.variants.length > 0) {
    this.basePrice = Math.min(...this.variants.map(v => v.price));
  }
  next();
});

// Index for search
productSchema.index({ name: 'text', tags: 'text', description: 'text' });
productSchema.index({ subCategory: 1, status: 1, approvalStatus: 1 });
productSchema.index({ slug: 1 });

module.exports = mongoose.model('Product', productSchema);
