import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const variants = await prisma.productVariant.findMany({
      orderBy: { stock: 'asc' },
      include: {
        product: {
          include: { category: true },
        },
      },
    });

    return NextResponse.json({ success: true, variants });
  } catch (error: any) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { variantId, stockDelta, exactStock } = body;

    if (!variantId) {
      return NextResponse.json({ success: false, error: 'Variant ID required' }, { status: 400 });
    }

    let updated;
    if (exactStock !== undefined) {
      updated = await prisma.productVariant.update({
        where: { id: variantId },
        data: { stock: Math.max(0, Number(exactStock)) },
      });
    } else if (stockDelta !== undefined) {
      updated = await prisma.productVariant.update({
        where: { id: variantId },
        data: { stock: { increment: Number(stockDelta) } },
      });
    }

    return NextResponse.json({ success: true, variant: updated });
  } catch (error: any) {
    console.error('Error updating stock:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
