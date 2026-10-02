const router = require('express').Router();
const { protect, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getProducts, getProductBySlug, getProductById,
  createProduct, updateProduct, deleteProduct,
  updateStock, getAllProductsAdmin
} = require('../controllers/productController');

// Public routes
router.get('/', getProducts);
router.get('/slug/:slug', getProductBySlug);

// Admin routes (admin + super_admin)
router.get('/admin/all', protect, requireRole('admin', 'super_admin'), getAllProductsAdmin);
router.get('/id/:id', protect, requireRole('admin', 'super_admin'), getProductById);

router.post(
  '/',
  protect,
  requireRole('admin', 'super_admin'),
  upload.array('images', 6),
  createProduct
);

router.put(
  '/:id',
  protect,
  requireRole('admin', 'super_admin'),
  upload.array('images', 6),
  updateProduct
);

router.delete('/:id', protect, requireRole('admin', 'super_admin'), deleteProduct);
router.put('/:id/stock', protect, requireRole('admin', 'super_admin'), updateStock);

module.exports = router;
