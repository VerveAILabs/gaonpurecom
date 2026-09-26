import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOrderDispatchedWhatsApp, sendMetaWhatsAppMessage } from '@/lib/whatsapp/meta';

/**
 * Webhook handler for Shiprocket and courier milestone updates.
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    console.log('Received logistics webhook payload:', JSON.stringify(payload, null, 2));

    const orderNumber = payload.order_id || payload.order_no || payload.order_number;
    const awb = payload.awb || payload.awb_code || payload.tracking_number;
    const currentStatus = (payload.current_status || payload.status || '').toUpperCase();
    const courierName = payload.courier_name || payload.courier;

    if (!orderNumber && !awb) {
      return NextResponse.json({ success: false, message: 'Missing order_id or awb identifier' }, { status: 400 });
    }

    // Locate the order in Neon PostgreSQL
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          ...(orderNumber ? [{ orderNumber: String(orderNumber) }] : []),
          ...(awb ? [{ trackingNumber: String(awb) }] : []),
        ],
      },
      include: { items: true, user: true },
    });

    if (!order) {
      console.warn(`Order not found for logistics webhook: order_id=${orderNumber}, awb=${awb}`);
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    let mappedStatus = order.orderStatus;
    const trackingUrl = awb ? `https://shiprocket.co/tracking/${awb}` : order.trackingUrl;

    if (currentStatus.includes('DELIVERED')) {
      mappedStatus = 'Delivered';
    } else if (
      currentStatus.includes('IN TRANSIT') ||
      currentStatus.includes('SHIPPED') ||
      currentStatus.includes('OUT FOR DELIVERY') ||
      currentStatus.includes('PICKED UP')
    ) {
      mappedStatus = 'Shipped';
    } else if (currentStatus.includes('CANCELLED') || currentStatus.includes('RTO')) {
      mappedStatus = 'Cancelled';
    }

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        orderStatus: mappedStatus,
        trackingNumber: awb || order.trackingNumber,
        trackingUrl: trackingUrl || order.trackingUrl,
        courierName: courierName || order.courierName,
        adminNotes: order.adminNotes
          ? `${order.adminNotes}\n[${new Date().toISOString()}] Logistics Update: ${currentStatus}`
          : `[${new Date().toISOString()}] Logistics Update: ${currentStatus}`,
      },
      include: { items: true, user: true },
    });

    // If transitioned to Shipped for the first time, send WhatsApp dispatched notification
    if (mappedStatus === 'Shipped' && order.orderStatus !== 'Shipped') {
      try {
        await sendOrderDispatchedWhatsApp({
          id: updatedOrder.id,
          orderNumber: updatedOrder.orderNumber,
          shippingAddress: updatedOrder.shippingAddress,
          courierName: updatedOrder.courierName,
          trackingNumber: updatedOrder.trackingNumber,
          trackingUrl: updatedOrder.trackingUrl,
        });
      } catch (waErr) {
        console.warn('WhatsApp dispatch notification failed in webhook:', waErr);
      }
    } else if (mappedStatus === 'Delivered' && order.orderStatus !== 'Delivered') {
      try {
        const addr = typeof updatedOrder.shippingAddress === 'string'
          ? JSON.parse(updatedOrder.shippingAddress)
          : updatedOrder.shippingAddress || {};
        const phone = updatedOrder.user?.phone || addr.phone;
        if (phone) {
          await sendMetaWhatsAppMessage({
            toPhone: phone,
            textMessage: `🌿 *Gaon Pure — Order Delivered!*

Namaste *${addr.name || 'Valued Customer'}*,

Your order *#${updatedOrder.orderNumber}* has been successfully delivered! We hope you enjoy the pure, fresh village harvest.

If you have any feedback or questions, we are just a message away.

_Gaon Pure — Healthy Foods, Desi Roots_
https://gaonpure.com`,
          });
        }
      } catch (waErr) {
        console.warn('WhatsApp delivery notification failed in webhook:', waErr);
      }
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error: any) {
    console.error('Error handling logistics webhook:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
