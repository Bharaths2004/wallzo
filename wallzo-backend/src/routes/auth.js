const router = require('express').Router();
const { protect, requireRole } = require('../middleware/auth');
const {
  register, login, getMe, updateProfile, toggleWishlist
} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/wishlist/:productId', protect, toggleWishlist);

module.exports = router;
