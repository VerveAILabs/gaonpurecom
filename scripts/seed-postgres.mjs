import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const initialCategories = [
  { name: 'Flours & Grains', slug: 'flours-grains', description: 'Fresh stone-ground flours and grains' },
  { name: 'Cold-Pressed Oils', slug: 'cold-pressed-oils', description: 'Wood-pressed pure oils' },
  { name: 'Natural Sweeteners & Jaggery', slug: 'sweeteners-jaggery', description: 'Chemical-free jaggery and raw honey' },
  { name: 'Organic Spices & Masalas', slug: 'spices-masalas', description: 'Aromatic unadulterated spices' },
  { name: 'Dairy & Desi Ghee', slug: 'dairy-desi-ghee', description: 'Bilona method A2 Desi cow ghee' },
  { name: 'Pulses & Dals', slug: 'pulses-dals', description: 'Unpolished naturally farmed dals' },
];

const sampleProducts = [
  {
    name: 'Organic Sharbati Wheat Atta',
    slug: 'organic-sharbati-wheat-atta',
    description: '100% stone-ground whole wheat flour made from premium Sharbati grains of Madhya Pradesh. Rich in dietary fiber and nutrients.',
    categorySlug: 'flours-grains',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop',
    isFeatured: true,
    variants: [
      { weight: '1kg', price: 80, stock: 100, sku: 'ATTA-SHAR-1KG' },
      { weight: '5kg', price: 380, stock: 50, sku: 'ATTA-SHAR-5KG' },
    ]
  },
  {
    name: 'A2 Gir Cow Desi Ghee (Bilona Method)',
    slug: 'a2-gir-cow-desi-ghee',
    description: 'Traditional Vedic Bilona method cultured curd ghee made from pure A2 milk of free-grazing Gir cows. Golden, aromatic, and deeply nourishing.',
    categorySlug: 'dairy-desi-ghee',
    imageUrl: 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=600&auto=format&fit=crop',
    isFeatured: true,
    variants: [
      { weight: '500ml', price: 950, stock: 40, sku: 'GHEE-A2-500ML' },
      { weight: '1L', price: 1850, stock: 25, sku: 'GHEE-A2-1L' },
    ]
  },
  {
    name: 'Wood Pressed Groundnut Oil (Cold Pressed)',
    slug: 'wood-pressed-groundnut-oil',
    description: 'Cold pressed in traditional wooden Kolhu/Ghani at low RPM to preserve natural antioxidants, vitamin E, and natural nutty flavor.',
    categorySlug: 'cold-pressed-oils',
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop',
    isFeatured: true,
    variants: [
      { weight: '1L', price: 340, stock: 60, sku: 'OIL-GNUT-1L' },
      { weight: '5L', price: 1650, stock: 20, sku: 'OIL-GNUT-5L' },
    ]
  },
  {
    name: 'Organic Desi Khand & Jaggery Powder',
    slug: 'organic-desi-khand-jaggery-powder',
    description: 'Unbleached, chemical-free raw cane sugar and jaggery powder made from organically cultivated sugarcane.',
    categorySlug: 'sweeteners-jaggery',
    imageUrl: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=600&auto=format&fit=crop',
    isFeatured: false,
    variants: [
      { weight: '1kg', price: 120, stock: 80, sku: 'JAGG-POW-1KG' },
    ]
  },
  {
    name: 'Organic Salem Turmeric Powder (Curcumin 4%+)',
    slug: 'organic-salem-turmeric-powder',
    description: 'Pure sun-dried Salem turmeric rhizomes, freshly ground with high natural curcumin content. No artificial colors or lead chromate.',
    categorySlug: 'spices-masalas',
    imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop',
    isFeatured: true,
    variants: [
      { weight: '250g', price: 95, stock: 90, sku: 'SPICE-TURM-250G' },
      { weight: '500g', price: 180, stock: 50, sku: 'SPICE-TURM-500G' },
    ]
  },
  {
    name: 'Unpolished Organic Toor Dal',
    slug: 'unpolished-organic-toor-dal',
    description: 'Farm-fresh pigeon peas, unpolished without water, oil, or stone powder touch. Retains natural flavor and cooks evenly.',
    categorySlug: 'pulses-dals',
    imageUrl: 'https://images.unsplash.com/photo-1585994192700-eb8888796836?w=600&auto=format&fit=crop',
    isFeatured: false,
    variants: [
      { weight: '1kg', price: 195, stock: 75, sku: 'DAL-TOOR-1KG' },
    ]
  }
];

async function main() {
  console.log('Seeding Neon PostgreSQL...');

  // 1. Seed Categories
  const categoryMap = {};
  for (const cat of initialCategories) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description },
      create: cat,
    });
    categoryMap[cat.slug] = record.id;
    console.log(`Category seeded: ${record.name}`);
  }

  // 2. Seed Products & Variants
  for (const p of sampleProducts) {
    const categoryId = categoryMap[p.categorySlug];
    if (!categoryId) continue;

    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        description: p.description,
        categoryId,
        imageUrl: p.imageUrl,
        isFeatured: p.isFeatured,
      },
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        categoryId,
        imageUrl: p.imageUrl,
        isFeatured: p.isFeatured,
      },
    });

    console.log(`Product created: ${product.name}`);

    for (const v of p.variants) {
      const existing = await prisma.productVariant.findFirst({
        where: { productId: product.id, weight: v.weight },
      });

      if (!existing) {
        await prisma.productVariant.create({
          data: {
            productId: product.id,
            weight: v.weight,
            price: v.price,
            stock: v.stock,
            sku: v.sku,
          },
        });
        console.log(`  -> Variant created: ${v.weight} (₹${v.price}, Stock: ${v.stock})`);
      }
    }
  }

  // 3. Seed Default Store Settings
  await prisma.storeSetting.upsert({
    where: { key: 'store_config' },
    update: {},
    create: {
      key: 'store_config',
      value: {
        storeName: 'Gaon Pure',
        supportEmail: 'contact@gaonpure.com',
        supportPhone: '+91 9876543210',
        freeShippingThreshold: 999,
        standardDeliveryFee: 60,
        currency: 'INR',
        announcement: {
          enabled: true,
          text: '🎉 Free delivery across India on all orders above ₹999!',
          link: '/shop',
        },
      },
    },
  });
  console.log('Store settings seeded.');

  // 4. Seed Welcome Coupon
  await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      discountType: 'percentage',
      discountValue: 10.0,
      minOrderValue: 499.0,
      maxDiscount: 150.0,
      isActive: true,
      usageLimit: 1000,
    },
  });
  console.log('Welcome coupon seeded.');

  console.log('✅ Neon PostgreSQL successfully seeded!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
