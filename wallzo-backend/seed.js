require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Product = require('./src/models/Product');
const Order = require('./src/models/Order');

if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set in .env');
  process.exit(1);
}

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    console.log('   URI:', process.env.MONGODB_URI.replace(/:([^@]+)@/, ':****@'));

    console.log('\n⚠️  This will DELETE all existing data and reseed.');
    console.log('   Press Ctrl+C within 5 seconds to cancel...\n');
    await new Promise(r => setTimeout(r, 5000));

    // Clear existing data
    await Promise.all([User.deleteMany(), Product.deleteMany(), Order.deleteMany()]);
    console.log('🧹 Cleared existing data');

    // === SEED USERS ===
    const users = await User.create([
      { name: 'Bharath', email: 'bharath@wallzo.in', password: 'wallzo123', role: 'super_admin', avatar: 'B' },
      { name: 'Admin User', email: 'admin@wallzo.in', password: 'wallzo123', role: 'admin', avatar: 'A' },
      {
        name: 'Test User', email: 'user@wallzo.in', password: 'wallzo123', role: 'user', avatar: 'T',
        addresses: [{ label: 'Home', name: 'Test User', line1: '12, MG Road', city: 'Bangalore', state: 'Karnataka', pincode: '560001', phone: '9876543210' }]
      }
    ]);
    console.log(`✅ Created ${users.length} users`);

    // === SEED PRODUCTS ===
    const productData = [
      { name: 'Akira Neo-Tokyo', slug: 'akira-neo-tokyo', category: 'posters', subCategory: 'anime', description: 'Stunning Akira cityscape from the classic manga. A must-have for any anime enthusiast.', images: ['https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&q=80'], basePrice: 299, variants: [{ size: 'A4', sku: 'AKIRA-A4', stock: 25, price: 299 }, { size: 'A3', sku: 'AKIRA-A3', stock: 15, price: 499 }, { size: 'A2', sku: 'AKIRA-A2', stock: 8, price: 799 }], tags: ['anime', 'akira', 'manga', 'sci-fi'], isNew: false, isTrending: true, rating: 4.9, reviewCount: 128, approvalStatus: 'approved', createdBy: users[0]._id, approvedBy: users[0]._id },
      { name: 'Spirited Away Forest', slug: 'spirited-away-forest', category: 'posters', subCategory: 'anime', description: "Enchanting forest spirit scene from Studio Ghibli's beloved masterpiece.", images: ['https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=600&q=80'], basePrice: 349, variants: [{ size: 'A4', sku: 'SAWAY-A4', stock: 20, price: 349 }, { size: 'A3', sku: 'SAWAY-A3', stock: 12, price: 549 }, { size: 'A2', sku: 'SAWAY-A2', stock: 5, price: 849 }], tags: ['anime', 'ghibli', 'spirited-away'], isNew: true, isTrending: true, rating: 4.8, reviewCount: 94, approvalStatus: 'approved', createdBy: users[0]._id, approvedBy: users[0]._id },
      { name: 'Retro Wave Sunset', slug: 'retro-wave-sunset', category: 'posters', subCategory: 'retro', description: 'Neon-drenched synthwave aesthetic. Pure 80s nostalgia in every pixel.', images: ['https://images.unsplash.com/photo-1557683316-973673baf926?w=600&q=80'], basePrice: 249, variants: [{ size: 'A4', sku: 'RETRO-A4', stock: 30, price: 249 }, { size: 'A3', sku: 'RETRO-A3', stock: 20, price: 449 }, { size: 'A2', sku: 'RETRO-A2', stock: 10, price: 699 }], tags: ['retro', 'synthwave', '80s', 'neon'], isNew: false, isTrending: false, rating: 4.6, reviewCount: 76, approvalStatus: 'approved', createdBy: users[0]._id, approvedBy: users[0]._id },
      { name: 'Geometric Minimal', slug: 'geometric-minimal', category: 'posters', subCategory: 'minimal', description: 'Clean lines and bold geometry. Perfect for modern minimalist spaces.', images: ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80'], basePrice: 199, variants: [{ size: 'A4', sku: 'GEO-A4', stock: 50, price: 199 }, { size: 'A3', sku: 'GEO-A3', stock: 30, price: 349 }, { size: 'A2', sku: 'GEO-A2', stock: 15, price: 599 }], tags: ['minimal', 'geometric', 'modern'], isNew: true, isTrending: false, rating: 4.5, reviewCount: 52, approvalStatus: 'approved', createdBy: users[0]._id, approvedBy: users[0]._id },
      { name: 'Urban Graffiti Kings', slug: 'urban-graffiti-kings', category: 'posters', subCategory: 'street-art', description: 'Vibrant street art from the underground. Bold, loud, unapologetic.', images: ['https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=600&q=80'], basePrice: 299, variants: [{ size: 'A4', sku: 'GRFT-A4', stock: 18, price: 299 }, { size: 'A3', sku: 'GRFT-A3', stock: 10, price: 499 }, { size: 'A2', sku: 'GRFT-A2', stock: 0, price: 799 }], tags: ['street-art', 'graffiti', 'urban'], isNew: false, isTrending: true, rating: 4.7, reviewCount: 89, approvalStatus: 'approved', createdBy: users[0]._id, approvedBy: users[0]._id },
      { name: 'Attack on Titan Survey Corps', slug: 'attack-on-titan-survey', category: 'posters', subCategory: 'anime', description: 'For the scouts who never give up. Wings of freedom emblazoned in glory.', images: ['https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&q=80'], basePrice: 349, variants: [{ size: 'A4', sku: 'AOT-A4', stock: 22, price: 349 }, { size: 'A3', sku: 'AOT-A3', stock: 14, price: 549 }, { size: 'A2', sku: 'AOT-A2', stock: 6, price: 849 }], tags: ['anime', 'attack-on-titan', 'shonen'], isNew: true, isTrending: true, rating: 4.9, reviewCount: 201, approvalStatus: 'approved', createdBy: users[0]._id, approvedBy: users[0]._id },
      { name: 'Bauhaus Composition', slug: 'bauhaus-composition', category: 'posters', subCategory: 'minimal', description: 'German Bauhaus inspired art. Timeless design that transcends decades.', images: ['https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=600&q=80'], basePrice: 249, variants: [{ size: 'A4', sku: 'BHAUS-A4', stock: 40, price: 249 }, { size: 'A3', sku: 'BHAUS-A3', stock: 25, price: 399 }, { size: 'A2', sku: 'BHAUS-A2', stock: 12, price: 649 }], tags: ['minimal', 'bauhaus', 'german'], isNew: false, isTrending: false, rating: 4.4, reviewCount: 41, approvalStatus: 'approved', createdBy: users[0]._id, approvedBy: users[0]._id },
      { name: 'Tokyo Street Night', slug: 'tokyo-street-night', category: 'posters', subCategory: 'street-art', description: 'Neon-lit Tokyo streets captured in breathtaking detail.', images: ['https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80'], basePrice: 299, variants: [{ size: 'A4', sku: 'TOKYO-A4', stock: 28, price: 299 }, { size: 'A3', sku: 'TOKYO-A3', stock: 16, price: 499 }, { size: 'A2', sku: 'TOKYO-A2', stock: 8, price: 799 }], tags: ['japan', 'tokyo', 'neon', 'street'], isNew: true, isTrending: true, rating: 4.8, reviewCount: 115, approvalStatus: 'approved', createdBy: users[0]._id, approvedBy: users[0]._id }
    ];

    const products = await Product.create(productData);
    console.log(`✅ Created ${products.length} products`);

    // === SEED SAMPLE ORDERS ===
    const orders = await Order.create([
      {
        user: users[2]._id,
        items: [{ product: products[0]._id, name: products[0].name, image: products[0].images[0], size: 'A3', sku: 'AKIRA-A3', qty: 1, price: 499 }],
        shippingAddress: { name: 'Test User', line1: '12 MG Road', city: 'Bangalore', state: 'Karnataka', pincode: '560001', phone: '9876543210' },
        paymentStatus: 'paid', paymentId: 'PAY_DEMO_001', subtotal: 499, shippingCharge: 0, total: 499,
        status: 'delivered',
        timeline: [
          { status: 'pending', note: 'Order placed', date: new Date(Date.now() - 7 * 86400000) },
          { status: 'processing', note: 'Payment confirmed', date: new Date(Date.now() - 6 * 86400000) },
          { status: 'shipped', note: 'Dispatched via BlueDart', date: new Date(Date.now() - 4 * 86400000) },
          { status: 'delivered', note: 'Package delivered!', date: new Date(Date.now() - 2 * 86400000) }
        ]
      },
      {
        user: users[2]._id,
        items: [{ product: products[5]._id, name: products[5].name, image: products[5].images[0], size: 'A4', sku: 'AOT-A4', qty: 2, price: 349 }],
        shippingAddress: { name: 'Test User', line1: '12 MG Road', city: 'Bangalore', state: 'Karnataka', pincode: '560001', phone: '9876543210' },
        paymentStatus: 'paid', paymentId: 'PAY_DEMO_002', subtotal: 698, shippingCharge: 0, total: 698,
        status: 'shipped',
        timeline: [
          { status: 'pending', note: 'Order placed', date: new Date(Date.now() - 2 * 86400000) },
          { status: 'processing', note: 'Payment confirmed', date: new Date(Date.now() - 86400000) },
          { status: 'shipped', note: 'In transit', date: new Date() }
        ]
      }
    ]);
    console.log(`✅ Created ${orders.length} sample orders`);

    console.log('\n🎉 Database seeded successfully!\n');
    console.log('📧 Demo Accounts (password: wallzo123):');
    console.log('   🛡️  Super Admin: bharath@wallzo.in');
    console.log('   ⚙️  Admin:       admin@wallzo.in');
    console.log('   👤  User:        user@wallzo.in');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err.message);
    process.exit(1);
  }
};

seed();
