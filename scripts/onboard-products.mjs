import admin from 'firebase-admin';

// Initialize Firebase Admin with production projectId
admin.initializeApp({
  projectId: 'gaonpurecom'
});

const db = admin.firestore();

const products = [
  // === FLOURS & GRAINS ===
  {
    name: 'Organic Sharbati Wheat Atta',
    description: '100% stone-ground whole wheat flour made from premium Sharbati grains of Madhya Pradesh. Rich in dietary fiber and nutrients.',
    category: 'Flours & Grains',
    imageUrl: '🌾',
    isActive: true,
    prices: [
      { weight: '1kg', price: 80, stock: 100 },
      { weight: '5kg', price: 380, stock: 50 }
    ]
  },
  {
    name: 'Premium Lokwan Wheat Atta',
    description: 'Traditional stone-ground wheat flour made from Lokwan wheat. Perfect for soft and fluffy rotis.',
    category: 'Flours & Grains',
    imageUrl: '🌾',
    isActive: true,
    prices: [
      { weight: '1kg', price: 75, stock: 100 },
      { weight: '5kg', price: 360, stock: 50 }
    ]
  },
  {
    name: 'Stone Ground Multigrain Atta',
    description: 'A nutritious blend of wheat, ragi, jowar, bajra, chana, and barley. Stone-ground to preserve freshness and nutrition.',
    category: 'Flours & Grains',
    imageUrl: '🌾',
    isActive: true,
    prices: [
      { weight: '1kg', price: 95, stock: 100 },
      { weight: '5kg', price: 450, stock: 50 }
    ]
  },
  {
    name: 'Finger Millet (Ragi) Flour',
    description: 'Gluten-free flour made from premium ragi seeds. Extremely rich in calcium and iron, ideal for healthy porridges and bhakris.',
    category: 'Flours & Grains',
    imageUrl: '🌾',
    isActive: true,
    prices: [
      { weight: '1kg', price: 85, stock: 100 },
      { weight: '2kg', price: 160, stock: 50 }
    ]
  },
  {
    name: 'Pearl Millet (Bajra) Flour',
    description: 'Iron-rich organic pearl millet flour. Warming in nature, perfect for traditional winter flatbreads.',
    category: 'Flours & Grains',
    imageUrl: '🌾',
    isActive: true,
    prices: [
      { weight: '1kg', price: 70, stock: 100 },
      { weight: '2kg', price: 130, stock: 50 }
    ]
  },
  {
    name: 'Sorghum (Jowar) Flour',
    description: 'Easy-to-digest, gluten-free white sorghum flour. High in dietary fiber and essential minerals.',
    category: 'Flours & Grains',
    imageUrl: '🌾',
    isActive: true,
    prices: [
      { weight: '1kg', price: 90, stock: 100 },
      { weight: '2kg', price: 170, stock: 50 }
    ]
  },
  {
    name: 'Organic Besan (Gram Flour)',
    description: 'Finely ground flour made from organic Bengal gram (Chana Dal). Perfect for traditional snacks and sweets.',
    category: 'Flours & Grains',
    imageUrl: '🌾',
    isActive: true,
    prices: [
      { weight: '500g', price: 70, stock: 100 },
      { weight: '1kg', price: 130, stock: 50 }
    ]
  },
  {
    name: 'Roasted Suji (Semolina)',
    description: 'Cleaned and lightly roasted premium semolina. Delivers consistent texture for upma and halwa.',
    category: 'Flours & Grains',
    imageUrl: '🌾',
    isActive: true,
    prices: [
      { weight: '500g', price: 45, stock: 100 },
      { weight: '1kg', price: 85, stock: 50 }
    ]
  },
  {
    name: 'Amaranth (Rajgira) Flour',
    description: 'Gluten-free flour made from amaranth seeds. A staple for fasting meals and high in plant protein.',
    category: 'Flours & Grains',
    imageUrl: '🌾',
    isActive: true,
    prices: [
      { weight: '500g', price: 90, stock: 100 },
      { weight: '1kg', price: 170, stock: 50 }
    ]
  },
  {
    name: 'Barley (Jau) Flour',
    description: 'Wholesome, high-fiber flour ground from clean barley grains. Excellent for managing metabolism and heart health.',
    category: 'Flours & Grains',
    imageUrl: '🌾',
    isActive: true,
    prices: [
      { weight: '1kg', price: 80, stock: 100 }
    ]
  },

  // === PULSES & LENTILS ===
  {
    name: 'Unpolished Toor Dal',
    description: 'Premium split pigeon peas. Free from artificial colors, polishing, or chemicals. A rich source of plant protein.',
    category: 'Pulses & Lentils',
    imageUrl: '🥣',
    isActive: true,
    prices: [
      { weight: '1kg', price: 175, stock: 100 }
    ]
  },
  {
    name: 'Organic Moong Dal',
    description: 'Split yellow mung beans. Highly digestible, quick-cooking, and ideal for light khichdis and daily meals.',
    category: 'Pulses & Lentils',
    imageUrl: '🥣',
    isActive: true,
    prices: [
      { weight: '1kg', price: 165, stock: 100 }
    ]
  },
  {
    name: 'Whole Green Moong',
    description: 'Whole green mung beans. Perfect for sprouting or making traditional green moong curry.',
    category: 'Pulses & Lentils',
    imageUrl: '🥣',
    isActive: true,
    prices: [
      { weight: '1kg', price: 150, stock: 100 }
    ]
  },
  {
    name: 'Split Chana Dal',
    description: 'Nutritious Bengal gram split lentils. Rich in taste and texture, highly versatile for Indian curries.',
    category: 'Pulses & Lentils',
    imageUrl: '🥣',
    isActive: true,
    prices: [
      { weight: '1kg', price: 110, stock: 100 }
    ]
  },
  {
    name: 'Organic Masoor Dal',
    description: 'Split red lentils. Quick to cook, earthy flavor, and packed with dietary fibers and potassium.',
    category: 'Pulses & Lentils',
    imageUrl: '🥣',
    isActive: true,
    prices: [
      { weight: '1kg', price: 125, stock: 100 }
    ]
  },
  {
    name: 'Black Urad Dal Split',
    description: 'Split black gram lentils with skin. Imparts deep, rich flavor to dal makhani and traditional soups.',
    category: 'Pulses & Lentils',
    imageUrl: '🥣',
    isActive: true,
    prices: [
      { weight: '1kg', price: 155, stock: 100 }
    ]
  },
  {
    name: 'White Urad Dal Gola',
    description: 'Whole dehusked split black gram. Ideal for grinding soft batters for idlis, dosas, and vadas.',
    category: 'Pulses & Lentils',
    imageUrl: '🥣',
    isActive: true,
    prices: [
      { weight: '1kg', price: 170, stock: 100 }
    ]
  },
  {
    name: 'Kabuli Chana (Chickpeas)',
    description: 'Large, premium white chickpeas. Creamy texture when cooked, perfect for chole and cold salads.',
    category: 'Pulses & Lentils',
    imageUrl: '🥣',
    isActive: true,
    prices: [
      { weight: '1kg', price: 160, stock: 100 }
    ]
  },
  {
    name: 'Kala Chana (Brown Chickpeas)',
    description: 'Traditional organic brown chickpeas. Exceptionally high in protein, iron, and fiber.',
    category: 'Pulses & Lentils',
    imageUrl: '🥣',
    isActive: true,
    prices: [
      { weight: '1kg', price: 115, stock: 100 }
    ]
  },
  {
    name: 'Rajma Citra (Kidney Beans)',
    description: 'Premium light-colored kidney beans sourced from the foothills of the Himalayas. Cooks to a buttery texture.',
    category: 'Pulses & Lentils',
    imageUrl: '🥣',
    isActive: true,
    prices: [
      { weight: '1kg', price: 185, stock: 100 }
    ]
  },

  // === GHEE & OILS ===
  {
    name: 'A2 Gir Cow Bilona Ghee',
    description: 'Authentic A2 ghee prepared using the traditional Bilona wooden churn method from Gir cow milk. Rich aroma and granular texture.',
    category: 'Ghee & Oils',
    imageUrl: '🍯',
    isActive: true,
    prices: [
      { weight: '500ml', price: 750, stock: 50 },
      { weight: '1L', price: 1450, stock: 30 }
    ]
  },
  {
    name: 'Pure Buffalo Ghee',
    description: 'Rich and aromatic ghee made from pure buffalo milk cream. Excellent for daily cooking and sweets.',
    category: 'Ghee & Oils',
    imageUrl: '🍯',
    isActive: true,
    prices: [
      { weight: '500ml', price: 450, stock: 50 },
      { weight: '1L', price: 850, stock: 30 }
    ]
  },
  {
    name: 'Cold Pressed Mustard Oil',
    description: 'Traditional wood-pressed Kachi Ghani mustard oil. Pungent and rich in monounsaturated fatty acids.',
    category: 'Ghee & Oils',
    imageUrl: '🍾',
    isActive: true,
    prices: [
      { weight: '1L', price: 210, stock: 100 },
      { weight: '5L', price: 990, stock: 30 }
    ]
  },
  {
    name: 'Cold Pressed Groundnut Oil',
    description: 'Wood-pressed peanut oil. Neutral flavor, high smoke point, perfect for healthy daily frying.',
    category: 'Ghee & Oils',
    imageUrl: '🍾',
    isActive: true,
    prices: [
      { weight: '1L', price: 260, stock: 100 },
      { weight: '5L', price: 1250, stock: 30 }
    ]
  },
  {
    name: 'Cold Pressed Sesame Oil',
    description: 'Wood-pressed pure til oil. Golden color, distinct nutty aroma, and excellent for health and seasoning.',
    category: 'Ghee & Oils',
    imageUrl: '🍾',
    isActive: true,
    prices: [
      { weight: '1L', price: 340, stock: 100 }
    ]
  },
  {
    name: 'Virgin Cold Pressed Coconut Oil',
    description: 'Extracted from fresh raw coconut meat. 100% natural, unrefined, and multi-purpose (cooking, skin, and hair).',
    category: 'Ghee & Oils',
    imageUrl: '🍾',
    isActive: true,
    prices: [
      { weight: '500ml', price: 230, stock: 100 },
      { weight: '1L', price: 440, stock: 50 }
    ]
  },
  {
    name: 'Cold Pressed Safflower Oil',
    description: 'Wood-pressed safflower (Kardi) oil. High in unsaturated fats, helpful in maintaining healthy cholesterol levels.',
    category: 'Ghee & Oils',
    imageUrl: '🍾',
    isActive: true,
    prices: [
      { weight: '1L', price: 280, stock: 100 }
    ]
  },

  // === SPICES & CONDIMENTS ===
  {
    name: 'Organic Turmeric Powder',
    description: 'Pure turmeric powder ground from dried rhizomes. High curcumin content, natural yellow hue, and strong antioxidant properties.',
    category: 'Spices & Condiments',
    imageUrl: '🌶️',
    isActive: true,
    prices: [
      { weight: '100g', price: 55, stock: 150 },
      { weight: '250g', price: 120, stock: 100 }
    ]
  },
  {
    name: 'Guntur Red Chilli Powder',
    description: 'Hot and vibrant red chilli powder sourced from Guntur, Andhra Pradesh. Delivers deep color and high pungency.',
    category: 'Spices & Condiments',
    imageUrl: '🌶️',
    isActive: true,
    prices: [
      { weight: '100g', price: 65, stock: 150 },
      { weight: '250g', price: 150, stock: 100 }
    ]
  },
  {
    name: 'Stone Ground Coriander Powder',
    description: 'Fragrant Dhania powder ground at low temperatures to preserve volatile oils and rich green color.',
    category: 'Spices & Condiments',
    imageUrl: '🌱',
    isActive: true,
    prices: [
      { weight: '100g', price: 45, stock: 150 },
      { weight: '250g', price: 100, stock: 100 }
    ]
  },
  {
    name: 'Whole Cumin Seeds (Jeera)',
    description: 'Clean, bold, and aromatic cumin seeds. High essential oil content, ideal for tempering dishes.',
    category: 'Spices & Condiments',
    imageUrl: '🌱',
    isActive: true,
    prices: [
      { weight: '100g', price: 95, stock: 150 },
      { weight: '250g', price: 220, stock: 100 }
    ]
  },
  {
    name: 'Black Mustard Seeds (Rai)',
    description: 'Cleaned whole small black mustard seeds. Imparts classic crackling aroma in South Indian tempering.',
    category: 'Spices & Condiments',
    imageUrl: '🌱',
    isActive: true,
    prices: [
      { weight: '200g', price: 40, stock: 150 }
    ]
  },
  {
    name: 'Premium Asafoetida (Hing)',
    description: 'Strong and aromatic compounded Hing powder. Just a pinch adds deep, savory richness to dals and curries.',
    category: 'Spices & Condiments',
    imageUrl: '🌱',
    isActive: true,
    prices: [
      { weight: '50g', price: 85, stock: 100 }
    ]
  },
  {
    name: 'Organic Kashmiri Chilli Powder',
    description: 'Mild red chilli powder providing a rich, vibrant red hue without extreme heat.',
    category: 'Spices & Condiments',
    imageUrl: '🌶️',
    isActive: true,
    prices: [
      { weight: '100g', price: 85, stock: 100 }
    ]
  },
  {
    name: 'Black Pepper Powder',
    description: 'Fine ground bold black peppercorns from Malabar coast. Strong, hot, and biting flavor.',
    category: 'Spices & Condiments',
    imageUrl: '🌱',
    isActive: true,
    prices: [
      { weight: '100g', price: 120, stock: 100 }
    ]
  },
  {
    name: 'Green Cardamom (Elaichi)',
    description: 'Hand-picked bold green cardamom pods. Intensely sweet, floral flavor for tea, desserts, and curries.',
    category: 'Spices & Condiments',
    imageUrl: '🌱',
    isActive: true,
    prices: [
      { weight: '50g', price: 195, stock: 100 }
    ]
  },
  {
    name: 'Whole Cloves (Laung)',
    description: 'Cleaned, premium whole clove buds. High oil content, sharp aromatic properties.',
    category: 'Spices & Condiments',
    imageUrl: '🌱',
    isActive: true,
    prices: [
      { weight: '50g', price: 85, stock: 100 }
    ]
  },
  {
    name: 'Cinnamon Sticks (Dalchini)',
    description: 'Natural sweet and warm rolled cinnamon bark. Adds complex fragrance to biryani and hot beverages.',
    category: 'Spices & Condiments',
    imageUrl: '🌱',
    isActive: true,
    prices: [
      { weight: '100g', price: 95, stock: 100 }
    ]
  },
  {
    name: 'Garam Masala Blend',
    description: 'A traditional warming blend of 12 hand-roasted spices. Free from artificial fillers or flavor enhancers.',
    category: 'Spices & Condiments',
    imageUrl: '🌶️',
    isActive: true,
    prices: [
      { weight: '100g', price: 85, stock: 100 }
    ]
  },

  // === SWEETENERS & SUPERFOODS ===
  {
    name: 'Raw Wild Forest Honey',
    description: '100% pure, raw, unfiltered forest honey. Sourced sustainably from wild hives in deep deciduous forests.',
    category: 'Sweeteners & Superfoods',
    imageUrl: '🍯',
    isActive: true,
    prices: [
      { weight: '500g', price: 290, stock: 100 },
      { weight: '1kg', price: 540, stock: 50 }
    ]
  },
  {
    name: 'Organic Jaggery Powder',
    description: 'Free-flowing granulated jaggery made from clean organic sugarcane juice. Excellent iron-rich sugar substitute.',
    category: 'Sweeteners & Superfoods',
    imageUrl: '🍯',
    isActive: true,
    prices: [
      { weight: '500g', price: 65, stock: 100 },
      { weight: '1kg', price: 120, stock: 50 }
    ]
  },
  {
    name: 'Solid Jaggery Blocks',
    description: 'Traditional solid jaggery blocks. Free from sulfur and chemical bleaching agents.',
    category: 'Sweeteners & Superfoods',
    imageUrl: '🍯',
    isActive: true,
    prices: [
      { weight: '1kg', price: 110, stock: 100 }
    ]
  },
  {
    name: 'Organic Chia Seeds',
    description: 'Raw, non-GMO black chia seeds. Excellent source of Omega-3, dietary fibers, and proteins.',
    category: 'Sweeteners & Superfoods',
    imageUrl: '🌱',
    isActive: true,
    prices: [
      { weight: '200g', price: 130, stock: 100 }
    ]
  },
  {
    name: 'Flax Seeds (Alsi)',
    description: 'Cleaned raw brown flax seeds. Packed with lignans, alpha-linolenic acid, and minerals.',
    category: 'Sweeteners & Superfoods',
    imageUrl: '🌱',
    isActive: true,
    prices: [
      { weight: '250g', price: 65, stock: 100 }
    ]
  },
  {
    name: 'Raw Pumpkin Seeds',
    description: 'Raw pumpkin seed kernels. Excellent zinc-rich snack to support immunity and daily vitality.',
    category: 'Sweeteners & Superfoods',
    imageUrl: '🌱',
    isActive: true,
    prices: [
      { weight: '200g', price: 185, stock: 100 }
    ]
  },

  // === DRY FRUITS & NUTS ===
  {
    name: 'Premium California Almonds',
    description: 'Crisp, bold premium almonds. Sourced from California, perfect for daily brain health and snacking.',
    category: 'Dry Fruits & Nuts',
    imageUrl: '🥜',
    isActive: true,
    prices: [
      { weight: '250g', price: 270, stock: 100 },
      { weight: '500g', price: 520, stock: 50 }
    ]
  },
  {
    name: 'Whole Cashews (Kaju)',
    description: 'Bold, creamy, premium whole white cashew nuts. Ideal for baking, gravies, and direct consumption.',
    category: 'Dry Fruits & Nuts',
    imageUrl: '🥜',
    isActive: true,
    prices: [
      { weight: '250g', price: 290, stock: 100 },
      { weight: '500g', price: 560, stock: 50 }
    ]
  },
  {
    name: 'Organic Green Raisins',
    description: 'Naturally dried sweet green raisins. A delicious, fiber-rich energy booster.',
    category: 'Dry Fruits & Nuts',
    imageUrl: '🍇',
    isActive: true,
    prices: [
      { weight: '250g', price: 120, stock: 100 }
    ]
  },
  {
    name: 'Akhrot Giri (Walnuts)',
    description: 'Half-brain walnut kernels. Light-colored, buttery taste, and exceptionally rich in antioxidants.',
    category: 'Dry Fruits & Nuts',
    imageUrl: '🥜',
    isActive: true,
    prices: [
      { weight: '250g', price: 340, stock: 100 }
    ]
  },
  {
    name: 'Dried Anjeer (Figs)',
    description: 'Soft and sweet hand-picked dried figs. Exceptionally rich in iron, fiber, and calcium.',
    category: 'Dry Fruits & Nuts',
    imageUrl: '🍇',
    isActive: true,
    prices: [
      { weight: '250g', price: 390, stock: 100 }
    ]
  }
];

async function onboard() {
  console.log(`Starting onboarding of ${products.length} organic grocery items...`);
  const batch = db.batch();
  
  products.forEach((product) => {
    const docRef = db.collection('products').doc(); // Auto-generate ID
    batch.set(docRef, product);
  });

  try {
    await batch.commit();
    console.log(`Successfully onboarded all ${products.length} products to Firestore!`);
  } catch (error) {
    console.error('Error committing Firestore batch write:', error);
  }
}

onboard();
