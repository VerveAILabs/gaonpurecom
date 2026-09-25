import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        variants: {
          orderBy: { price: 'asc' },
        },
      },
    });

    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ success: true, products, categories });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, categoryId, imageUrl, isFeatured, variants } = body;

    if (!name || !categoryId || !variants || variants.length === 0) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description: description || '',
        categoryId,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop',
        isFeatured: Boolean(isFeatured),
        isActive: true,
        variants: {
          create: variants.map((v: any) => ({
            weight: v.weight,
            price: Number(v.price),
            stock: Number(v.stock || 0),
            sku: v.sku || undefined,
          })),
        },
      },
      include: {
        category: true,
        variants: true,
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, categoryId, imageUrl, isFeatured, isActive, variants } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID required' }, { status: 400 });
    }

    // Update product core fields
    await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        categoryId,
        imageUrl,
        isFeatured: Boolean(isFeatured),
        isActive: Boolean(isActive),
      },
    });

    // Update variants if provided
    if (variants && Array.isArray(variants)) {
      for (const v of variants) {
        if (v.id) {
          await prisma.productVariant.update({
            where: { id: v.id },
            data: {
              weight: v.weight,
              price: Number(v.price),
              stock: Number(v.stock),
              sku: v.sku || undefined,
            },
          });
        } else {
          await prisma.productVariant.create({
            data: {
              productId: id,
              weight: v.weight,
              price: Number(v.price),
              stock: Number(v.stock),
              sku: v.sku || undefined,
            },
          });
        }
      }
    }

    const updated = await prisma.product.findUnique({
      where: { id },
      include: { category: true, variants: true },
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID required' }, { status: 400 });
    }

    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
