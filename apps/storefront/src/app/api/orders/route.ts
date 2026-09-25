import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const orderId = searchParams.get('orderId');

    if (orderId) {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });
      return NextResponse.json({ success: true, order });
    }

    const where: any = {};
    if (userId) {
      where.userId = userId;
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });

    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    console.error('Error fetching orders from PostgreSQL:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if body is formatted from Firebase callable payload {"data": ...}
    const data = body.data || body;
    const { userId, items, totalAmount, subtotal, deliveryFee, discountAmount, shippingAddress, paymentStatus } = data;

    if (!userId || !items || items.length === 0) {
      // If no items, try fetching user's orders (matches getUserOrders behavior)
      if (userId) {
        const orders = await prisma.order.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          include: { items: true },
        });
        return NextResponse.json({ result: orders, orders });
      }
      return NextResponse.json({ success: false, error: 'User ID and items required' }, { status: 400 });
    }

    // Ensure User exists in PostgreSQL (upsert)
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: shippingAddress?.email || `${userId}@customer.local`,
        name: shippingAddress?.name || 'Customer',
        phone: shippingAddress?.phone || null,
      },
    });

    const orderNumber = 'GP-' + Math.floor(100000 + Math.random() * 900000);

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        subtotal: Number(subtotal || totalAmount),
        deliveryFee: Number(deliveryFee || 0),
        discountAmount: Number(discountAmount || 0),
        totalAmount: Number(totalAmount),
        paymentStatus: paymentStatus || 'Pending',
        orderStatus: 'Ordered',
        shippingAddress: shippingAddress || {},
        items: {
          create: items.map((it: any) => ({
            productName: it.name || it.productName,
            weight: it.weight || '1kg',
            unitPrice: Number(it.price || it.unitPrice),
            quantity: Number(it.quantity || 1),
            totalPrice: Number((it.price || it.unitPrice) * (it.quantity || 1)),
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json({ success: true, order, result: order });
  } catch (error: any) {
    console.error('Error in /api/orders PostgreSQL route:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
