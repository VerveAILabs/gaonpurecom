import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createAndAssignShiprocketShipment } from '@/lib/logistics/shiprocket';
import { sendOrderDispatchedWhatsApp } from '@/lib/whatsapp/meta';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, notifyWhatsApp = true } = body;

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, user: true },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // Call Shiprocket to create order and assign courier AWB
    const shiprocketRes = await createAndAssignShiprocketShipment({
      id: order.id,
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
      subtotal: order.subtotal,
      shippingAddress: order.shippingAddress,
      items: order.items.map((i) => ({
        productName: i.productName,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        weight: i.weight,
      })),
    });

    if (!shiprocketRes.success) {
      return NextResponse.json({
        success: false,
        error: shiprocketRes.error || 'Failed to dispatch via Shiprocket',
      }, { status: 400 });
    }

    // Update Neon PostgreSQL Order
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        orderStatus: 'Shipped',
        courierName: shiprocketRes.courierName || 'Delhivery (via Shiprocket)',
        trackingNumber: shiprocketRes.awbCode || order.trackingNumber,
        trackingUrl: shiprocketRes.trackingUrl || (shiprocketRes.awbCode ? `https://shiprocket.co/tracking/${shiprocketRes.awbCode}` : undefined),
      },
      include: { items: true, user: true },
    });

    // Send WhatsApp dispatch notification if requested
    let whatsappResult = null;
    if (notifyWhatsApp) {
      try {
        whatsappResult = await sendOrderDispatchedWhatsApp({
          id: updatedOrder.id,
          orderNumber: updatedOrder.orderNumber,
          shippingAddress: updatedOrder.shippingAddress,
          courierName: updatedOrder.courierName,
          trackingNumber: updatedOrder.trackingNumber,
          trackingUrl: updatedOrder.trackingUrl,
        });
      } catch (waErr: any) {
        console.warn('Failed to send WhatsApp notification:', waErr);
      }
    }

    return NextResponse.json({
      success: true,
      shiprocket: shiprocketRes,
      whatsapp: whatsappResult,
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error('Error in Shiprocket auto-dispatch API:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
