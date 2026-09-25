import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { refundRazorpayPayment } from '@/lib/razorpay';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, amount, reason } = body;

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    let refundResult: any = null;

    if (order.razorpayPaymentId) {
      // Initiate Razorpay API refund
      refundResult = await refundRazorpayPayment(
        order.razorpayPaymentId,
        amount ? Number(amount) : Number(order.totalAmount),
        { reason: reason || 'Customer requested / Admin cancelled', orderNumber: order.orderNumber }
      );
    } else {
      // Order had no Razorpay payment ID (e.g. COD or manual)
      refundResult = { id: `manual-refund-${Date.now()}`, status: 'processed_offline' };
    }

    const refundNote = `\n[${new Date().toLocaleString()}] Refund Issued (${refundResult.id}): ₹${amount || order.totalAmount}. Reason: ${reason || 'N/A'}`;
    const updatedNotes = (order.adminNotes || '') + refundNote;

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'Refunded',
        orderStatus: 'Cancelled',
        adminNotes: updatedNotes,
      },
      include: { items: true, user: true },
    });

    return NextResponse.json({
      success: true,
      refund: refundResult,
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error('Error issuing refund:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
