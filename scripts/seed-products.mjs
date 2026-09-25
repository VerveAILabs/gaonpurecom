import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

// Parse .env.local file to get Firebase project ID
const envPath = path.resolve(process.cwd(), '.env.local');
let projectId = 'gaonpurecom'; // fallback default

try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  for (const line of lines) {
    const match = line.match(/^\s*NEXT_PUBLIC_FIREBASE_PROJECT_ID\s*=\s*["']?([^"'\r\n]+)/);
    if (match) {
      projectId = match[1];
    }
  }
} catch (err) {
  console.warn('Could not read .env.local, using default projectId:', projectId);
}

// Initialize Admin SDK
// This automatically connects to the emulator if process.env.FIRESTORE_EMULATOR_HOST is set.
admin.initializeApp({
  projectId: projectId
});

const db = admin.firestore();
console.log('Connecting to project (via admin-sdk):', projectId);
if (process.env.FIRESTORE_EMULATOR_HOST) {
  console.log('Using Firestore Emulator:', process.env.FIRESTORE_EMULATOR_HOST);
}

const initialProducts = [
  {
    name: 'Chokar Sahit Multigrain Flour',
    description: 'Traditionally stone-ground multigrain flour made with 11 healthy grains, including Jowar, Bajra, Chana, Makka, Ragi, Moong, Soybeen, Jau, Sawa, Kodo, and Kutki. Rich in fiber (Chokar) and minerals.',
    category: 'Flour & Grains',
    imageUrl: 'https://images.unsplash.com/photo-1574325131876-a799dc32938f?w=800&auto=format&fit=crop&q=80',
    isActive: true,
    prices: [
      { weight: '5 Kg', price: 299, stock: 100 },
      { weight: '10 Kg', price: 549, stock: 80 },
      { weight: '20 Kg', price: 999, stock: 50 }
    ]
  },
  {
    name: 'Cold Pressed Mustard Oil',
    description: '100% pure organic mustard oil extracted using traditional wooden press (Kolhu) at low temperatures to maintain natural nutrients, antioxidants, and pungent aroma.',
    category: 'Oils & Ghee',
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&auto=format&fit=crop&q=80',
    isActive: true,
    prices: [
      { weight: '1 Liter', price: 189, stock: 150 },
      { weight: '5 Liter', price: 899, stock: 40 }
    ]
  },
  {
    name: 'A2 Vedic Desi Cow Ghee',
    description: 'Premium A2 Ghee made from the milk of indigenous cows using the traditional Bilona churned method. Nutritious, aromatic, and excellent for health.',
    category: 'Oils & Ghee',
    imageUrl: 'https://images.unsplash.com/photo-1589733901241-5e514f26b43f?w=800&auto=format&fit=crop&q=80',
    isActive: true,
    prices: [
      { weight: '500 mL', price: 449, stock: 60 },
      { weight: '1 Liter', price: 849, stock: 45 }
    ]
  },
  {
    name: 'Organic Jaggery Powder',
    description: 'Pure, unrefined jaggery powder made from organically grown sugarcane. Natural sweetener packed with iron and essential minerals.',
    category: 'Sweeteners',
    imageUrl: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=800&auto=format&fit=crop&q=80',
    isActive: true,
    prices: [
      { weight: '1 Kg', price: 119, stock: 200 }
    ]
  }
];

async function seed() {
  const productsCol = db.collection('products');
  
  // Clear existing products
  console.log('Fetching existing products...');
  const snapshot = await productsCol.get();
  if (!snapshot.empty) {
    console.log(`Clearing ${snapshot.size} existing products...`);
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  }

  console.log('Seeding initial products...');
  for (const product of initialProducts) {
    const docRef = await productsCol.add(product);
    console.log(`Added product: ${product.name} (ID: ${docRef.id})`);
  }
  
  console.log('Seeding completed successfully!');
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
