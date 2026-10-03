const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const prisma = require('../prisma');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const sendToken = (user, statusCode, res) => {
  const token = signToken(user.id);
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      addresses: user.addresses || [],
      wishlist: user.wishlist || []
    }
  });
};

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const avatar = name.charAt(0).toUpperCase();

    const user = await prisma.user.create({
      data: { 
        name, 
        email: email.toLowerCase(), 
        password: hashedPassword,
        avatar
      }
    });

    sendToken(user, 201, res);
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { addresses: true, wishlist: true }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    sendToken(user, 200, res);
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

// GET /api/auth/me  (protected)
exports.getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { 
        wishlist: {
          select: { id: true, name: true, slug: true, images: true, basePrice: true }
        },
        addresses: true
      }
    });
    
    // don't send password
    delete user.password;
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// PUT /api/auth/profile  (protected)
exports.updateProfile = async (req, res) => {
  try {
    const { name, addresses } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    
    if (addresses) {
      // Prisma requires nested writes for relations
      updateData.addresses = {
        deleteMany: {}, // replace all existing
        create: addresses.map(addr => ({
          label: addr.label,
          name: addr.name,
          line1: addr.line1,
          line2: addr.line2,
          city: addr.city,
          state: addr.state,
          pincode: addr.pincode,
          phone: addr.phone
        }))
      };
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      include: { addresses: true }
    });
    
    delete user.password;
    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// POST /api/auth/wishlist/:productId  (protected) — toggle
exports.toggleWishlist = async (req, res) => {
  try {
    const productId = req.params.productId;
    
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { wishlist: { select: { id: true } } }
    });
    
    const hasProduct = user.wishlist.some(p => p.id === productId);
    
    let updatedUser;
    if (hasProduct) {
      updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: {
          wishlist: { disconnect: { id: productId } }
        },
        include: { wishlist: { select: { id: true } } }
      });
    } else {
      updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: {
          wishlist: { connect: { id: productId } }
        },
        include: { wishlist: { select: { id: true } } }
      });
    }
    
    const wishlistIds = updatedUser.wishlist.map(p => p.id);
    res.json({ success: true, wishlist: wishlistIds });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
