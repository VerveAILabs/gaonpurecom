import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      include: {
        category: true,
        variants: {
          where: { isActive: true },
          orderBy: { price: 'asc' },
        },
      },
    });

    // Format to match storefront Product interface
    const formatted = products.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      description: p.description,
      category: p.category.name,
      imageUrl: p.imageUrl,
      isFeatured: p.isFeatured,
      isActive: p.isActive,
      prices: p.variants.map((v) => ({
        id: v.id,
        weight: v.weight,
        price: Number(v.price),
        stock: v.stock,
        sku: v.sku,
      })),
    }));

    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      success: true,
      products: formatted,
      categories,
    });
  } catch (error: any) {
    console.error('Error fetching catalog from PostgreSQL:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
