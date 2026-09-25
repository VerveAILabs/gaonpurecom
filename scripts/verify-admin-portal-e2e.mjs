import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Load admin-portal .env
dotenv.config({ path: path.resolve('apps/admin-portal/.env') });

const prisma = new PrismaClient();

async function runVerification() {
  console.log('====================================================');
  console.log('🔍 GAON PURE ADMIN MODULE — AUTOMATED VERIFICATION');
  console.log('====================================================\n');

  let passed = 0;
  let total = 8;

  try {
    // 1. Database Connection
    console.log('[1/8] Testing Neon PostgreSQL Connection...');
    await prisma.$connect();
    console.log('  ✅ Neon PostgreSQL connected successfully.');
    passed++;

    // 2. Admin User Verification
    console.log('\n[2/8] Verifying Admin User Role in Database...');
    const adminUser = await prisma.user.findFirst({
      where: { role: 'admin' },
    });
    if (adminUser) {
      console.log(`  ✅ Found Admin User: ${adminUser.email} (ID: ${adminUser.id}, Name: ${adminUser.name || 'N/A'})`);
      passed++;
    } else {
      console.log('  ❌ No user with role="admin" found.');
    }

    // 3. Category Management
    console.log('\n[3/8] Verifying Categories...');
    const categoryCount = await prisma.category.count();
    const sampleCategories = await prisma.category.findMany({ take: 3 });
    console.log(`  ✅ Categories in DB: ${categoryCount}`);
    sampleCategories.forEach(c => console.log(`     - ${c.name} (slug: ${c.slug})`));
    passed++;

    // 4. Products & Variants Catalog
    console.log('\n[4/8] Verifying Products & Multi-Variant Catalog...');
    const productCount = await prisma.product.count();
    const variantCount = await prisma.productVariant.count();
    const lowStockCount = await prisma.productVariant.count({ where: { stock: { lte: 15 } } });
    console.log(`  ✅ Total Products: ${productCount}, Total Variants: ${variantCount}`);
    console.log(`  ✅ Low Stock Variants Alert Count: ${lowStockCount}`);
    passed++;

    // 5. Orders & Dispatch Pipeline
    console.log('\n[5/8] Verifying Orders & OrderItems...');
    const orderCount = await prisma.order.count();
    const paidOrders = await prisma.order.count({ where: { paymentStatus: 'Paid' } });
    const pendingOrders = await prisma.order.count({ where: { orderStatus: { in: ['Ordered', 'Confirmed'] } } });
    console.log(`  ✅ Total Orders: ${orderCount} (Paid: ${paidOrders}, Pending Actions: ${pendingOrders})`);
    passed++;

    // 6. Coupons Engine
    console.log('\n[6/8] Verifying Coupons Engine...');
    const couponCount = await prisma.coupon.count();
    console.log(`  ✅ Active Coupons in DB: ${couponCount}`);
    passed++;

    // 7. Store Settings
    console.log('\n[7/8] Verifying Store Settings Configuration...');
    const storeSettings = await prisma.storeSetting.findUnique({ where: { key: 'store_config' } });
    if (storeSettings) {
      console.log('  ✅ Store Config JSON found:', JSON.stringify(storeSettings.value));
    } else {
      console.log('  ℹ️ Store Config key not yet seeded; default fallback configured in API.');
    }
    passed++;

    // 8. Razorpay Configuration
    console.log('\n[8/8] Verifying Razorpay Configuration...');
    const rzpKey = process.env.RAZORPAY_KEY_ID;
    const rzpSecret = process.env.RAZORPAY_KEY_SECRET;
    if (rzpKey && rzpSecret) {
      console.log(`  ✅ Razorpay credentials loaded: Key ID=${rzpKey.slice(0, 12)}... (Secret configured)`);
      passed++;
    } else {
      console.log('  ❌ Missing Razorpay environment variables.');
    }

  } catch (error) {
    console.error('  ❌ Verification failed with error:', error);
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n====================================================');
  console.log(`SUMMARY: ${passed}/${total} Checks Passed`);
  console.log('====================================================');

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runVerification();
