import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 1. Calculate Revenue from Paid Orders
    const paidOrders = await prisma.order.findMany({
      where: { paymentStatus: 'Paid' },
      select: { totalAmount: true, createdAt: true },
    });

    const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const totalOrdersCount = await prisma.order.count();
    const averageOrderValue = paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length) : 0;

    // 2. Count Pending Action Orders
    const pendingOrdersCount = await prisma.order.count({
      where: { orderStatus: { in: ['Ordered', 'Confirmed'] } },
    });

    // 3. Count Low-stock variants (< 15 units)
    const lowStockVariants = await prisma.productVariant.findMany({
      where: { stock: { lte: 15 } },
      include: { product: true },
      take: 8,
    });

    // 4. Recent Orders
    const recentOrders = await prisma.order.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        user: { select: { name: true, email: true, phone: true } },
      },
    });

    // 5. Total Products Count
    const totalProductsCount = await prisma.product.count();

    // 6. Total Customers Count
    const totalCustomersCount = await prisma.user.count();

    return NextResponse.json({
      success: true,
      stats: {
        totalRevenue,
        totalOrdersCount,
        averageOrderValue,
        pendingOrdersCount,
        totalProductsCount,
        totalCustomersCount,
      },
      lowStockVariants: lowStockVariants.map(v => ({
        id: v.id,
        productName: v.product.name,
        weight: v.weight,
        stock: v.stock,
        sku: v.sku,
      })),
      recentOrders: recentOrders.map(o => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.user?.name || 'Guest / Direct',
        customerEmail: o.user?.email || 'N/A',
        totalAmount: Number(o.totalAmount),
        paymentStatus: o.paymentStatus,
        orderStatus: o.orderStatus,
        createdAt: o.createdAt,
        itemCount: o.items.length,
      })),
    });
  } catch (error: any) {
    console.error('Error in /api/dashboard:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
