// Wallzo Product Data — Complete Mock Catalog
// All prices in INR (₹)

export const products = [
  {
    id: '1',
    name: 'Naruto Hokage Legacy',
    slug: 'naruto-hokage-legacy',
    category: 'posters',
    subCategory: 'anime',
    description: 'The legendary Seventh Hokage in his iconic sage mode. Premium matte finish poster with vibrant colors that pop on any wall. Perfect for any Naruto fan looking to bring the spirit of the Hidden Leaf to their space.',
    images: [
      'https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&h=800&fit=crop'
    ],
    basePrice: 299,
    variants: [
      { size: 'A4', sku: 'NHP-A4', stock: 50, price: 299 },
      { size: 'A3', sku: 'NHP-A3', stock: 20, price: 499 },
      { size: 'A2', sku: 'NHP-A2', stock: 8, price: 799 }
    ],
    tags: ['anime', 'naruto', 'hokage', 'manga', 'trending'],
    status: 'active',
    rating: 4.8,
    reviewCount: 234,
    isNew: true,
    isTrending: true,
    createdAt: '2026-09-01'
  },
  {
    id: '2',
    name: 'Tokyo Night Drift',
    slug: 'tokyo-night-drift',
    category: 'posters',
    subCategory: 'retro',
    description: 'Neon-soaked Tokyo streets at midnight. A retro-futuristic masterpiece that captures the electric energy of Shibuya. This poster features rich neon gradients with a cyberpunk aesthetic.',
    images: [
      'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=600&h=800&fit=crop'
    ],
    basePrice: 349,
    variants: [
      { size: 'A4', sku: 'TND-A4', stock: 35, price: 349 },
      { size: 'A3', sku: 'TND-A3', stock: 15, price: 549 },
      { size: 'A2', sku: 'TND-A2', stock: 5, price: 849 }
    ],
    tags: ['retro', 'tokyo', 'neon', 'cyberpunk', 'city'],
    status: 'active',
    rating: 4.9,
    reviewCount: 189,
    isNew: false,
    isTrending: true,
    createdAt: '2026-08-15'
  },
  {
    id: '3',
    name: 'Great Wave Reimagined',
    slug: 'great-wave-reimagined',
    category: 'posters',
    subCategory: 'minimal',
    description: 'Hokusai\'s iconic Great Wave reimagined in a minimal, modern style with bold geometric lines. A timeless piece that bridges traditional Japanese art with contemporary design.',
    images: [
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=600&h=800&fit=crop'
    ],
    basePrice: 399,
    variants: [
      { size: 'A4', sku: 'GWR-A4', stock: 40, price: 399 },
      { size: 'A3', sku: 'GWR-A3', stock: 25, price: 599 },
      { size: 'A2', sku: 'GWR-A2', stock: 12, price: 899 }
    ],
    tags: ['minimal', 'japanese', 'wave', 'classic', 'art'],
    status: 'active',
    rating: 4.7,
    reviewCount: 312,
    isNew: false,
    isTrending: false,
    createdAt: '2026-07-20'
  },
  {
    id: '4',
    name: 'Street Art Revolution',
    slug: 'street-art-revolution',
    category: 'posters',
    subCategory: 'street-art',
    description: 'Raw urban energy captured in spray paint. This street art inspired poster features bold typography and graffiti elements. Bring the rebel spirit of the streets to your walls.',
    images: [
      'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1555448248-2571daf6344b?w=600&h=800&fit=crop'
    ],
    basePrice: 279,
    variants: [
      { size: 'A4', sku: 'SAR-A4', stock: 60, price: 279 },
      { size: 'A3', sku: 'SAR-A3', stock: 30, price: 479 },
      { size: 'A2', sku: 'SAR-A2', stock: 0, price: 779 }
    ],
    tags: ['street-art', 'graffiti', 'urban', 'bold'],
    status: 'active',
    rating: 4.6,
    reviewCount: 156,
    isNew: false,
    isTrending: true,
    createdAt: '2026-08-10'
  },
  {
    id: '5',
    name: 'Demon Slayer Sunrise',
    slug: 'demon-slayer-sunrise',
    category: 'posters',
    subCategory: 'anime',
    description: 'Tanjiro\'s Hinokami Kagura captured in a breathtaking sunrise composition. The vivid orange and crimson tones create a poster that radiates pure energy and determination.',
    images: [
      'https://images.unsplash.com/photo-1541562232579-512a21360020?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop'
    ],
    basePrice: 349,
    variants: [
      { size: 'A4', sku: 'DSS-A4', stock: 45, price: 349 },
      { size: 'A3', sku: 'DSS-A3', stock: 18, price: 549 },
      { size: 'A2', sku: 'DSS-A2', stock: 3, price: 849 }
    ],
    tags: ['anime', 'demon-slayer', 'tanjiro', 'manga', 'hot'],
    status: 'active',
    rating: 4.9,
    reviewCount: 278,
    isNew: true,
    isTrending: true,
    createdAt: '2026-09-10'
  },
  {
    id: '6',
    name: 'Vintage Motorsport',
    slug: 'vintage-motorsport',
    category: 'posters',
    subCategory: 'retro',
    description: 'A throwback to the golden era of racing. This vintage-style motorsport poster features classic typography and aged textures that bring nostalgic charm to any room.',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&h=800&fit=crop'
    ],
    basePrice: 329,
    variants: [
      { size: 'A4', sku: 'VM-A4', stock: 30, price: 329 },
      { size: 'A3', sku: 'VM-A3', stock: 12, price: 529 },
      { size: 'A2', sku: 'VM-A2', stock: 7, price: 829 }
    ],
    tags: ['retro', 'vintage', 'cars', 'racing', 'motorsport'],
    status: 'active',
    rating: 4.5,
    reviewCount: 98,
    isNew: false,
    isTrending: false,
    createdAt: '2026-07-01'
  },
  {
    id: '7',
    name: 'Geometric Cosmos',
    slug: 'geometric-cosmos',
    category: 'posters',
    subCategory: 'minimal',
    description: 'Sacred geometry meets deep space in this mesmerizing minimal poster. Clean lines and cosmic patterns create an artwork that\'s both meditative and visually striking.',
    images: [
      'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=600&h=800&fit=crop'
    ],
    basePrice: 299,
    variants: [
      { size: 'A4', sku: 'GC-A4', stock: 55, price: 299 },
      { size: 'A3', sku: 'GC-A3', stock: 22, price: 499 },
      { size: 'A2', sku: 'GC-A2', stock: 10, price: 799 }
    ],
    tags: ['minimal', 'space', 'geometric', 'abstract', 'cosmos'],
    status: 'active',
    rating: 4.4,
    reviewCount: 87,
    isNew: false,
    isTrending: false,
    createdAt: '2026-06-15'
  },
  {
    id: '8',
    name: 'Attack on Titan Final',
    slug: 'attack-on-titan-final',
    category: 'posters',
    subCategory: 'anime',
    description: 'The Survey Corps in their final stand. An epic, cinematic composition featuring Eren and the Colossal Titan in a dramatic showdown. A must-have for AoT fans.',
    images: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=600&h=800&fit=crop'
    ],
    basePrice: 379,
    variants: [
      { size: 'A4', sku: 'AOT-A4', stock: 38, price: 379 },
      { size: 'A3', sku: 'AOT-A3', stock: 2, price: 579 },
      { size: 'A2', sku: 'AOT-A2', stock: 0, price: 879 }
    ],
    tags: ['anime', 'aot', 'attack-on-titan', 'manga', 'epic'],
    status: 'active',
    rating: 4.8,
    reviewCount: 345,
    isNew: false,
    isTrending: true,
    createdAt: '2026-08-25'
  },
  {
    id: '9',
    name: 'Neon Samurai',
    slug: 'neon-samurai',
    category: 'posters',
    subCategory: 'street-art',
    description: 'Where ancient warriors meet futuristic neon. This cyberpunk samurai poster blends traditional Japanese warrior imagery with electric neon aesthetics for a truly unique piece.',
    images: [
      'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1516589091380-5d8e87df6999?w=600&h=800&fit=crop'
    ],
    basePrice: 449,
    variants: [
      { size: 'A4', sku: 'NS-A4', stock: 25, price: 449 },
      { size: 'A3', sku: 'NS-A3', stock: 10, price: 649 },
      { size: 'A2', sku: 'NS-A2', stock: 4, price: 949 }
    ],
    tags: ['street-art', 'samurai', 'neon', 'cyberpunk', 'japanese'],
    status: 'active',
    rating: 4.9,
    reviewCount: 201,
    isNew: true,
    isTrending: true,
    createdAt: '2026-09-15'
  },
  {
    id: '10',
    name: 'Retro Sunset Palms',
    slug: 'retro-sunset-palms',
    category: 'posters',
    subCategory: 'retro',
    description: 'Vaporwave meets Miami Vice in this retro sunset poster. Featuring gradient skies, palm silhouettes, and that unmistakable 80s aesthetic. Instant chill vibes.',
    images: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=600&h=800&fit=crop'
    ],
    basePrice: 299,
    variants: [
      { size: 'A4', sku: 'RSP-A4', stock: 70, price: 299 },
      { size: 'A3', sku: 'RSP-A3', stock: 35, price: 499 },
      { size: 'A2', sku: 'RSP-A2', stock: 15, price: 799 }
    ],
    tags: ['retro', 'vaporwave', 'sunset', '80s', 'miami'],
    status: 'active',
    rating: 4.6,
    reviewCount: 167,
    isNew: false,
    isTrending: false,
    createdAt: '2026-07-10'
  },
  {
    id: '11',
    name: 'One Piece Straw Hat',
    slug: 'one-piece-straw-hat',
    category: 'posters',
    subCategory: 'anime',
    description: 'Monkey D. Luffy and the Straw Hat crew in a dynamic action pose. Vibrant colors and bold linework make this poster a standout piece for any One Piece collection.',
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1578632292335-df3abbb0d586?w=600&h=800&fit=crop'
    ],
    basePrice: 349,
    variants: [
      { size: 'A4', sku: 'OPS-A4', stock: 42, price: 349 },
      { size: 'A3', sku: 'OPS-A3', stock: 20, price: 549 },
      { size: 'A2', sku: 'OPS-A2', stock: 9, price: 849 }
    ],
    tags: ['anime', 'one-piece', 'luffy', 'manga', 'adventure'],
    status: 'active',
    rating: 4.7,
    reviewCount: 289,
    isNew: true,
    isTrending: false,
    createdAt: '2026-09-05'
  },
  {
    id: '12',
    name: 'Abstract Ink Flow',
    slug: 'abstract-ink-flow',
    category: 'posters',
    subCategory: 'minimal',
    description: 'Fluid ink strokes captured in a moment of pure artistic flow. This abstract minimal poster adds sophistication to any space with its elegant black and gold palette.',
    images: [
      'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1549887534-1541e9326642?w=600&h=800&fit=crop'
    ],
    basePrice: 279,
    variants: [
      { size: 'A4', sku: 'AIF-A4', stock: 65, price: 279 },
      { size: 'A3', sku: 'AIF-A3', stock: 28, price: 479 },
      { size: 'A2', sku: 'AIF-A2', stock: 14, price: 779 }
    ],
    tags: ['minimal', 'abstract', 'ink', 'elegant', 'art'],
    status: 'active',
    rating: 4.3,
    reviewCount: 76,
    isNew: false,
    isTrending: false,
    createdAt: '2026-06-20'
  }
];

export const categories = [
  { id: 'all', name: 'All', icon: '🎨' },
  { id: 'anime', name: 'Anime', icon: '⚡' },
  { id: 'retro', name: 'Retro', icon: '🕹️' },
  { id: 'minimal', name: 'Minimal', icon: '◼️' },
  { id: 'street-art', name: 'Street Art', icon: '🎭' }
];

export const heroSlides = [
  {
    title: 'ART FOR YOUR WALLS',
    subtitle: 'Bold. Funky. Unapologetically You.',
    cta: 'SHOP NOW',
    accent: 'Premium Art Posters'
  },
  {
    title: 'NEW ARRIVALS',
    subtitle: 'Fresh drops every week. Limited edition prints.',
    cta: 'EXPLORE',
    accent: 'Just Dropped'
  },
  {
    title: 'ANIME COLLECTION',
    subtitle: 'From Naruto to Demon Slayer — your favorite worlds on your walls.',
    cta: 'VIEW COLLECTION',
    accent: 'Most Popular'
  }
];

export const testimonials = [
  {
    name: 'Arjun K.',
    text: 'Absolutely love the quality! The Naruto poster looks insane on my wall. Colors are vibrant and the paper quality is premium.',
    rating: 5,
    avatar: 'A'
  },
  {
    name: 'Priya S.',
    text: 'Ordered 3 posters and they arrived perfectly packed. The retro sunset one is my absolute favorite. Will order more!',
    rating: 5,
    avatar: 'P'
  },
  {
    name: 'Rahul M.',
    text: 'Best poster shop I\'ve found online. The designs are unique and the prices are super reasonable for this quality.',
    rating: 4,
    avatar: 'R'
  }
];
