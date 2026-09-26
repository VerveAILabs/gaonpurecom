import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, razorpayPaymentId, razorpayPaymentLinkId } = body;

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    if (order.paymentStatus === 'Paid') {
      return NextResponse.json({ success: true, order });
    }

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
          const updatedOrder = await prisma.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: 'Paid',
              orderStatus: order.orderStatus === 'Ordered' ? 'Confirmed' : order.orderStatus,
              razorpayPaymentId: paymentId || order.razorpayPaymentId,
            },
            include: { items: true },
          });

          return NextResponse.json({ success: true, order: updatedOrder });
        }
      } catch (rzpErr) {
        console.warn('Error fetching Razorpay payment link:', rzpErr);
      }
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
