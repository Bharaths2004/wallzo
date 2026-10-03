const prisma = require('../prisma');
const path = require('path');
const fs = require('fs');

// GET /api/products — public
exports.getProducts = async (req, res) => {
  try {
    const { category, subCategory, search, sort, page = 1, limit = 20 } = req.query;

    const where = { status: 'active', approvalStatus: 'approved' };

    if (category) where.category = category;
    if (subCategory) where.subCategory = subCategory;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } }
      ];
    }

    let orderBy = { createdAt: 'desc' };
    if (sort === 'price-low') orderBy = { basePrice: 'asc' };
    else if (sort === 'price-high') orderBy = { basePrice: 'desc' };
    else if (sort === 'rating') orderBy = { rating: 'desc' };
    else if (sort === 'trending') orderBy = [ { isTrending: 'desc' }, { rating: 'desc' } ];
    else if (sort === 'newest') orderBy = { createdAt: 'desc' };

    const skip = (Number(page) - 1) * Number(limit);
    
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: Number(limit),
        include: { variants: true }
      }),
      prisma.product.count({ where })
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
    const product = await prisma.product.findUnique({ 
      where: { slug: req.params.slug },
      include: { variants: true } 
    });
    
    if (!product || product.status !== 'active') {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/products/id/:id — admin use
exports.getProductById = async (req, res) => {
  try {
    const product = await prisma.product.findUnique({ 
      where: { id: req.params.id },
      include: { variants: true }
    });
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
    slug: name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim(),
    description,
    category: category || 'posters',
    subCategory,
    images,
    basePrice: parsedVariants.length > 0 ? Math.min(...parsedVariants.map(v => Number(v.price))) : 0,
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
    
    // Parse variants again for nested create
    let parsedVariants = [];
    if (req.body.variants) {
      try { parsedVariants = typeof req.body.variants === 'string' ? JSON.parse(req.body.variants) : req.body.variants; } catch(_) {}
    }

    const isSuperAdmin = req.user.role === 'super_admin';

    if (isSuperAdmin) {
      // Super admin: create directly
      const product = await prisma.product.create({
        data: {
          ...productData,
          approvalStatus: 'approved',
          createdById: req.user.id,
          approvedById: req.user.id,
          variants: {
            create: parsedVariants.map(v => ({
              size: v.size, sku: v.sku, stock: Number(v.stock), price: Number(v.price)
            }))
          }
        },
        include: { variants: true }
      });
      return res.status(201).json({ success: true, product, message: 'Product created successfully.' });
    } else {
      // Admin: create pending action
      const action = await prisma.pendingAction.create({
        data: {
          type: 'ADD_PRODUCT',
          payload: { ...productData, variants: parsedVariants },
          submittedById: req.user.id
        }
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
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
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
    
    let parsedVariants = [];
    if (req.body.variants) {
      try { parsedVariants = typeof req.body.variants === 'string' ? JSON.parse(req.body.variants) : req.body.variants; } catch(_) {}
    }

    if (isSuperAdmin) {
      const updated = await prisma.product.update({
        where: { id: req.params.id },
        data: {
          ...updateData,
          variants: {
            deleteMany: {}, // replace all existing variants
            create: parsedVariants.map(v => ({
              size: v.size, sku: v.sku, stock: Number(v.stock), price: Number(v.price)
            }))
          }
        },
        include: { variants: true }
      });
      return res.json({ success: true, product: updated, message: 'Product updated.' });
    } else {
      const action = await prisma.pendingAction.create({
        data: {
          type: 'UPDATE_PRODUCT',
          payload: { productId: req.params.id, updates: { ...updateData, variants: parsedVariants } },
          submittedById: req.user.id
        }
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
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
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
      
      // variants are set to Cascade delete in prisma schema, or we explicitly delete them
      await prisma.variant.deleteMany({ where: { productId: product.id } });
      await prisma.product.delete({ where: { id: product.id } });
      
      return res.json({ success: true, message: 'Product deleted.' });
    } else {
      const action = await prisma.pendingAction.create({
        data: {
          type: 'DELETE_PRODUCT',
          payload: { productId: req.params.id, productName: product.name },
          submittedById: req.user.id
        }
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
    const product = await prisma.product.findUnique({ 
      where: { id: req.params.id },
      include: { variants: true }
    });
    
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    const isSuperAdmin = req.user.role === 'super_admin';

    if (isSuperAdmin) {
      const variant = product.variants.find(v => v.sku === sku);
      if (!variant) return res.status(404).json({ success: false, message: 'Variant not found.' });
      
      await prisma.variant.update({
        where: { id: variant.id },
        data: { stock: Number(stock) }
      });
      
      const updatedProduct = await prisma.product.findUnique({
        where: { id: req.params.id },
        include: { variants: true }
      });
      
      return res.json({ success: true, product: updatedProduct, message: 'Stock updated.' });
    } else {
      const action = await prisma.pendingAction.create({
        data: {
          type: 'UPDATE_STOCK',
          payload: { productId: req.params.id, sku, stock: Number(stock) },
          submittedById: req.user.id
        }
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
    const products = await prisma.product.findMany({
      include: {
        createdBy: { select: { name: true, email: true } },
        variants: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
