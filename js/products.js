/**
 * VANTA Sneaker Catalog Data
 * Centralized maintainable dataset for products, colors, sizes, and pricing (EGP)
 */

const VANTA_PRODUCTS = [
  {
    id: 'vanta-core',
    name: 'VANTA CORE',
    subtitle: 'Stealth Obsidian Runner',
    price: 2499,
    originalPrice: 2999,
    category: 'Core',
    tag: 'BESTSELLER',
    isNew: false,
    isSale: true,
    rating: 4.9,
    reviewsCount: 128,
    image: 'assets/images/vanta_core.jpg',
    colors: [
      { name: 'Obsidian Black', hex: '#0a0a0c' },
      { name: 'Brushed Silver', hex: '#c0c0c0' }
    ],
    sizes: [40, 41, 42, 43, 44, 45, 46],
    description: 'The definitive VANTA silhouette. Engineered with ultra-dense obsidian mesh and a carbon-fiber torsion plate, the Core offers unyielding stability and futuristic streetwear aesthetics.',
    features: [
      'Carbon-fiber torsion shank plate',
      'Dual-density obsidian shock foam',
      'Reflective metallic silver branding accents',
      'Breathable technical knit upper'
    ]
  },
  {
    id: 'vanta-shadow',
    name: 'VANTA SHADOW',
    subtitle: 'Architectural High-Top',
    price: 2899,
    originalPrice: null,
    category: 'Street',
    tag: 'NEW ARRIVAL',
    isNew: true,
    isSale: false,
    rating: 5.0,
    reviewsCount: 64,
    image: 'assets/images/vanta_shadow.jpg',
    colors: [
      { name: 'Graphite Grey', hex: '#222226' },
      { name: 'Matte Chrome', hex: '#7a7a85' }
    ],
    sizes: [41, 42, 43, 44, 45],
    description: 'An aggressive high-top profile forged from tactile suede overlays and brushed chrome sole support. Built for commanding presence in urban environments.',
    features: [
      'High-ankle supportive collar construction',
      'Tactile premium micro-suede panels',
      'Brushed metallic heel counter',
      'High-traction rubber outsole layout'
    ]
  },
  {
    id: 'vanta-motion',
    name: 'VANTA MOTION',
    subtitle: 'Kinetic Lightweight Runner',
    price: 2699,
    originalPrice: 3199,
    category: 'Performance',
    tag: 'PERFORMANCE',
    isNew: false,
    isSale: true,
    rating: 4.8,
    reviewsCount: 92,
    image: 'assets/images/vanta_motion.jpg',
    colors: [
      { name: 'Aurora White', hex: '#f0f0f5' },
      { name: 'Metallic Chrome', hex: '#d0d0da' }
    ],
    sizes: [40, 41, 42, 43, 44],
    description: 'Ultra-lightweight kinetic propulsion sneaker designed for maximum movement. Wrapped in sleek Aurora white with silver dynamic mid-foot structural cages.',
    features: [
      'RIDE-X energy return responsive cushioning',
      'Monofilament lightweight ventilation mesh',
      'Anatomical heel lock design',
      'Weight: 275g (Size 42)'
    ]
  },
  {
    id: 'vanta-phantom',
    name: 'VANTA PHANTOM',
    subtitle: 'Stealth High-Tech Boot',
    price: 3199,
    originalPrice: 3699,
    category: 'Street',
    tag: 'LIMITED EDITION',
    isNew: true,
    isSale: false,
    rating: 4.95,
    reviewsCount: 45,
    image: 'assets/images/vanta_phantom.jpg',
    colors: [
      { name: 'Carbon Black', hex: '#111114' },
      { name: 'Dark Metallic', hex: '#3d3d45' }
    ],
    sizes: [41, 42, 43, 44, 45, 46],
    description: 'Constructed with raw carbon-fiber weave and water-repellent tech membrane. The Phantom commands supreme stealth with mirror-finish metallic heel chassis.',
    features: [
      'Full carbon weave lateral stability cage',
      'Hydro-shield waterproof lining',
      'Mirror-polished chrome chassis',
      'Shock-absorption impact pod sole'
    ]
  },
  {
    id: 'vanta-pulse',
    name: 'VANTA PULSE',
    subtitle: 'Avant-Garde Sculptural Sole',
    price: 2399,
    originalPrice: null,
    category: 'Core',
    tag: 'AVANT-GARDE',
    isNew: false,
    isSale: false,
    rating: 4.7,
    reviewsCount: 88,
    image: 'assets/images/vanta_pulse.jpg',
    colors: [
      { name: 'Gunmetal Cyan', hex: '#1c242b' },
      { name: 'Stealth Grey', hex: '#2d333b' }
    ],
    sizes: [40, 41, 42, 43, 44, 45],
    description: 'A striking fusion of futuristic industrial design and ergonomic geometry. Features open lattice sole channels and subtle reactive cyan accents.',
    features: [
      '3D-printed hollow lattice cushioning structure',
      'Tactile rubberized upper harness',
      'Self-locking Speed-Lace system',
      'Reflective piping accents'
    ]
  },
  {
    id: 'vanta-edge',
    name: 'VANTA EDGE',
    subtitle: 'Geometric Obsidian Low-Top',
    price: 2799,
    originalPrice: 3299,
    category: 'Street',
    tag: 'HOT',
    isNew: false,
    isSale: true,
    rating: 4.85,
    reviewsCount: 110,
    image: 'assets/images/vanta_edge.jpg',
    colors: [
      { name: 'Obsidian Gloss', hex: '#0d0d10' },
      { name: 'Graphite Matte', hex: '#25252b' }
    ],
    sizes: [39, 40, 41, 42, 43, 44, 45],
    description: 'Chiseled angular geometry meets luxury street fashion. Polished obsidian overlays combined with matte dark panels create an unmistakable silhouette.',
    features: [
      'Multi-faceted geometric sole molding',
      'High-gloss synthetic patent overlays',
      'Cushioned memory foam sockliner',
      'Abrasion-resistant outsole compound'
    ]
  },
  {
    id: 'vanta-storm',
    name: 'VANTA STORM',
    subtitle: 'All-Weather Technical Sneaker',
    price: 3499,
    originalPrice: null,
    category: 'Performance',
    tag: 'ALL-WEATHER',
    isNew: true,
    isSale: false,
    rating: 5.0,
    reviewsCount: 39,
    image: 'assets/images/vanta_shadow.jpg',
    colors: [
      { name: 'Silver Storm', hex: '#a8a8b3' },
      { name: 'Charcoal Black', hex: '#18181c' }
    ],
    sizes: [41, 42, 43, 44, 45, 46],
    description: 'Engineered to withstand extreme urban conditions. Reinforced silver storm textile with heavy-duty weather guard zippers and lugged grip soles.',
    features: [
      'GORE-TECH weather resistant membrane',
      'Quick-release magnetic utility closure',
      'Deep tread mud & snow lug traction',
      'Insulated thermal mesh lining'
    ]
  },
  {
    id: 'vanta-zero',
    name: 'VANTA ZERO',
    subtitle: 'Minimalist Monolith Platform',
    price: 2599,
    originalPrice: 2999,
    category: 'Core',
    tag: 'ESSENTIAL',
    isNew: false,
    isSale: true,
    rating: 4.9,
    reviewsCount: 156,
    image: 'assets/images/vanta_core.jpg',
    colors: [
      { name: 'Pure White', hex: '#fafafa' },
      { name: 'Vanta Black', hex: '#050505' }
    ],
    sizes: [40, 41, 42, 43, 44],
    description: 'Stripped of all unnecessary elements. A clean monolith platform sneaker crafted from supple full-grain leather and signature metallic eyelets.',
    features: [
      'Italian full-grain calfskin upper',
      'Vulcanized monolith platform rubber outsole',
      'Embossed silver VANTA heel branding',
      'Hand-stitched perimeter construction'
    ]
  }
];

// Helper to format currency in EGP
function formatPrice(amount) {
  return `EGP ${amount.toLocaleString('en-US')}`;
}
