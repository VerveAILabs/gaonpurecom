import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  sendMetaWhatsAppMessage, 
  sendOrderConfirmedWhatsApp, 
  sendOrderDispatchedWhatsApp 
} from '@/lib/whatsapp/meta';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, templateType = 'order_confirmed', customMessage } = body;

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

    let result;

    if (customMessage) {
      const addr = typeof order.shippingAddress === 'string'
        ? JSON.parse(order.shippingAddress)
        : order.shippingAddress || {};
      const phone = order.user?.phone || addr.phone;

      if (!phone) {
        return NextResponse.json({ success: false, error: 'Recipient phone number not found in order' }, { status: 400 });
      }

      result = await sendMetaWhatsAppMessage({
        toPhone: phone,
        textMessage: customMessage,
      });
    } else if (templateType === 'order_dispatched') {
      result = await sendOrderDispatchedWhatsApp({
        id: order.id,
        orderNumber: order.orderNumber,
        shippingAddress: order.shippingAddress,
        courierName: order.courierName,
        trackingNumber: order.trackingNumber,
        trackingUrl: order.trackingUrl,
      });
    } else {
      result = await sendOrderConfirmedWhatsApp({
        id: order.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        shippingAddress: order.shippingAddress,
        courierName: order.courierName,
        trackingNumber: order.trackingNumber,
        trackingUrl: order.trackingUrl,
        items: order.items.map((i) => ({
          productName: i.productName,
          weight: i.weight,
          quantity: i.quantity,
        })),
      });
    }

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error || 'Failed to send WhatsApp message' }, { status: 400 });
    }

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('Error in WhatsApp trigger API:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
