import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { prisma } from '@/lib/prisma';
import { createAndAssignShiprocketShipment } from '@/lib/logistics/shiprocket';
import { sendOrderConfirmedWhatsApp } from '@/lib/whatsapp/meta';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, razorpayPaymentId, razorpayPaymentLinkId } = body;

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    let order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const wasAlreadyPaid = order.paymentStatus === 'Paid';
    let freshlyPaid = false;

    if (!wasAlreadyPaid) {
      const paymentLinkId = razorpayPaymentLinkId || order.razorpayOrderId;

      if (paymentLinkId && paymentLinkId.startsWith('plink_')) {
        const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_S5Dnxf0esaudPy';
        const keySecret = process.env.RAZORPAY_KEY_SECRET || 'PDzjLM6u6BJsHZEdp9jxlcQL';

        const razorpay = new Razorpay({
          key_id: keyId,
          key_secret: keySecret,
        });

        try {
          const link = await razorpay.paymentLink.fetch(paymentLinkId);
          if (link.status === 'paid') {
            const paymentId = link.payments?.[0]?.payment_id || razorpayPaymentId;
            order = await prisma.order.update({
              where: { id: order.id },
              data: {
                paymentStatus: 'Paid',
                orderStatus: order.orderStatus === 'Ordered' ? 'Confirmed' : order.orderStatus,
                razorpayPaymentId: paymentId || order.razorpayPaymentId,
              },
              include: { items: true },
            });
            freshlyPaid = true;
          }
        } catch (rzpErr) {
          console.warn('Error fetching Razorpay payment link:', rzpErr);
        }
      }
    }

    // If order is Paid/Confirmed and AWB has not been assigned yet, auto-trigger Shiprocket
    if ((freshlyPaid || order.paymentStatus === 'Paid') && !order.trackingNumber) {
      try {
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

        if (shiprocketRes.success && shiprocketRes.awbCode) {
          order = await prisma.order.update({
            where: { id: order.id },
            data: {
              courierName: shiprocketRes.courierName || 'Delhivery (via Shiprocket)',
              trackingNumber: shiprocketRes.awbCode,
              trackingUrl: shiprocketRes.trackingUrl || `https://shiprocket.co/tracking/${shiprocketRes.awbCode}`,
            },
            include: { items: true },
          });
        }
      } catch (srErr) {
        console.warn('Shiprocket automated shipment creation skipped/failed:', srErr);
      }
    }

    // Send WhatsApp order confirmation with live tracking if freshly paid
    if (freshlyPaid) {
      try {
        await sendOrderConfirmedWhatsApp({
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
      } catch (waErr) {
        console.warn('WhatsApp automated order confirmation send failed:', waErr);
      }
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
