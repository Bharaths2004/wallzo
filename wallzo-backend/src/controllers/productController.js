const Product = require('../models/Product');
const PendingAction = require('../models/PendingAction');
const path = require('path');
const fs = require('fs');

// GET /api/products — public
exports.getProducts = async (req, res) => {
  try {
    const { category, subCategory, search, sort, page = 1, limit = 20 } = req.query;

    const query = { status: 'active', approvalStatus: 'approved' };

    if (category) query.category = category;
    if (subCategory) query.subCategory = subCategory;
    if (search) {
      query.$text = { $search: search };
    }

    let sortObj = { createdAt: -1 };
    if (sort === 'price-low') sortObj = { basePrice: 1 };
    else if (sort === 'price-high') sortObj = { basePrice: -1 };
    else if (sort === 'rating') sortObj = { rating: -1 };
    else if (sort === 'trending') sortObj = { isTrending: -1, rating: -1 };
    else if (sort === 'newest') sortObj = { createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(query).sort(sortObj).skip(skip).limit(Number(limit)),
      Product.countDocuments(query)
    ]);

    res.json({
      success: true,
      products,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/products/:slug — public
exports.getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, status: 'active' });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/products/id/:id — admin use
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Build product data from request body
const buildProductData = (body, files, existingImages = []) => {
  const { name, description, category, subCategory, tags, variants, isNew, isTrending, status } = body;

  // Handle uploaded images
  const uploadedImages = files && files.length > 0
    ? files.map(f => `/uploads/${f.filename}`)
    : [];

  // Merge with existing images (for updates)
  const images = [...existingImages, ...uploadedImages];

  // Parse variants from JSON string
  let parsedVariants = [];
  try {
    parsedVariants = typeof variants === 'string' ? JSON.parse(variants) : (variants || []);
  } catch (_) {}

  return {
    name,
    description,
    category: category || 'posters',
    subCategory,
    images,
    variants: parsedVariants,
    tags: tags ? (typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags) : [],
    isNew: isNew === 'true' || isNew === true,
    isTrending: isTrending === 'true' || isTrending === true,
    status: status || 'active'
  };
};

// POST /api/products — admin / super_admin
exports.createProduct = async (req, res) => {
  try {
    const productData = buildProductData(req.body, req.files);
    const isSuperAdmin = req.user.role === 'super_admin';

    if (isSuperAdmin) {
      // Super admin: create directly
      const product = await Product.create({
        ...productData,
        approvalStatus: 'approved',
        createdBy: req.user._id,
        approvedBy: req.user._id
      });
      return res.status(201).json({ success: true, product, message: 'Product created successfully.' });
    } else {
      // Admin: create pending action
      const action = await PendingAction.create({
        type: 'ADD_PRODUCT',
        payload: { ...productData, createdBy: req.user._id },
        submittedBy: req.user._id
      });
      return res.status(202).json({
        success: true,
        pendingAction: action,
        message: 'Product submitted for Super Admin approval.'
      });
    }
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error.' });
  }
};

// PUT /api/products/:id — admin / super_admin
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    const isSuperAdmin = req.user.role === 'super_admin';

    // Remove images that were flagged for deletion
    let existingImages = [...product.images];
    if (req.body.removeImages) {
      const toRemove = typeof req.body.removeImages === 'string'
        ? JSON.parse(req.body.removeImages) : req.body.removeImages;
      // Delete files
      toRemove.forEach(imgPath => {
        const fullPath = path.join(__dirname, '../../', imgPath);
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
      });
      existingImages = existingImages.filter(img => !toRemove.includes(img));
    }

    const updateData = buildProductData(req.body, req.files, existingImages);

    if (isSuperAdmin) {
      const updated = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
      return res.json({ success: true, product: updated, message: 'Product updated.' });
    } else {
      const action = await PendingAction.create({
        type: 'UPDATE_PRODUCT',
        payload: { productId: req.params.id, updates: updateData },
        submittedBy: req.user._id
      });
      return res.status(202).json({ success: true, pendingAction: action, message: 'Update submitted for approval.' });
    }
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error.' });
  }
};

// DELETE /api/products/:id — admin / super_admin
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    const isSuperAdmin = req.user.role === 'super_admin';

    if (isSuperAdmin) {
      // Delete associated image files
      product.images.forEach(imgPath => {
        if (imgPath.startsWith('/uploads/')) {
          const fullPath = path.join(__dirname, '../../', imgPath);
          if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
        }
      });
      await product.deleteOne();
      return res.json({ success: true, message: 'Product deleted.' });
    } else {
      const action = await PendingAction.create({
        type: 'DELETE_PRODUCT',
        payload: { productId: req.params.id, productName: product.name },
        submittedBy: req.user._id
      });
      return res.status(202).json({ success: true, pendingAction: action, message: 'Delete request submitted for approval.' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// PUT /api/products/:id/stock — update variant stock
exports.updateStock = async (req, res) => {
  try {
    const { sku, stock } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    const isSuperAdmin = req.user.role === 'super_admin';

    if (isSuperAdmin) {
      const variant = product.variants.find(v => v.sku === sku);
      if (!variant) return res.status(404).json({ success: false, message: 'Variant not found.' });
      variant.stock = Number(stock);
      await product.save();
      return res.json({ success: true, product, message: 'Stock updated.' });
    } else {
      const action = await PendingAction.create({
        type: 'UPDATE_STOCK',
        payload: { productId: req.params.id, sku, stock: Number(stock) },
        submittedBy: req.user._id
      });
      return res.status(202).json({ success: true, pendingAction: action, message: 'Stock update submitted for approval.' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/products/admin/all — admin sees all including drafts/pending
exports.getAllProductsAdmin = async (req, res) => {
  try {
    const products = await Product.find({})
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
