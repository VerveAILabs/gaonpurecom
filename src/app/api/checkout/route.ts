import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = body.data || body;
    const { items, shippingAddress, userId, callbackUrl } = data;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: { message: 'At least one cart item is required.' } },
        { status: 400 }
      );
    }

    if (!shippingAddress || !shippingAddress.name || !shippingAddress.email || !shippingAddress.phone) {
      return NextResponse.json(
        { error: { message: 'Valid shipping name, email, and phone are required.' } },
        { status: 400 }
      );
    }

    // 1. Calculate pricing server-side using Neon PostgreSQL
    let subtotal = 0;
    const normalizedItems: Array<{
      variantId?: string;
      productName: string;
      weight: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }> = [];

    for (const it of items) {
      // Look up variant in Neon PostgreSQL
      const variant = await prisma.productVariant.findFirst({
        where: {
          OR: [
            { id: it.productId },
            { productId: it.productId, weight: it.weight },
            { product: { name: it.name || it.productName }, weight: it.weight },
          ],
        },
        include: { product: true },
      });

      let unitPrice = Number(it.price || it.unitPrice || 0);
      let productName = it.name || it.productName || 'Item';
      let weight = it.weight || '1kg';

      if (variant) {
        unitPrice = Number(variant.price);
        productName = variant.product.name;
        weight = variant.weight;
      }

      const qty = Math.max(1, Number(it.quantity || 1));
      const lineTotal = unitPrice * qty;
      subtotal += lineTotal;

      normalizedItems.push({
        variantId: variant?.id,
        productName,
        weight,
        quantity: qty,
        unitPrice,
        totalPrice: lineTotal,
      });
    }

    const shipping = subtotal >= 999 ? 0 : 50;
    const totalAmount = subtotal + shipping;

    // 2. Ensure User exists in PostgreSQL (upsert customer profile)
    const effectiveUserId = userId || 'guest_' + Date.now();
    await prisma.user.upsert({
      where: { id: effectiveUserId },
      update: {
        name: shippingAddress.name,
        phone: shippingAddress.phone,
      },
      create: {
        id: effectiveUserId,
        email: shippingAddress.email,
        name: shippingAddress.name,
        phone: shippingAddress.phone,
        role: 'customer',
      },
    });

    // 3. Create Order in Neon PostgreSQL
    const orderNumber = 'GP-' + Math.floor(100000 + Math.random() * 900000);
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: effectiveUserId,
        subtotal,
        deliveryFee: shipping,
        discountAmount: 0,
        totalAmount,
        paymentStatus: 'Pending',
        orderStatus: 'Ordered',
        shippingAddress,
        items: {
          create: normalizedItems.map((i) => ({
            variantId: i.variantId,
            productName: i.productName,
            weight: i.weight,
            unitPrice: i.unitPrice,
            quantity: i.quantity,
            totalPrice: i.totalPrice,
          })),
        },
      },
    });

    // 4. Generate Razorpay Payment Link
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_S5Dnxf0esaudPy';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'nq_7j9Pb4pT5Jgb';

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const paymentLink = await razorpay.paymentLink.create({
      amount: Math.round(totalAmount * 100),
      currency: 'INR',
      accept_partial: false,
      description: `Gaon Pure Order ${orderNumber}`,
      reference_id: order.id,
      customer: {
        name: shippingAddress.name,
        email: shippingAddress.email,
        contact: shippingAddress.phone,
      },
      notify: {
        sms: true,
        email: true,
      },
      reminder_enable: true,
      callback_url: callbackUrl || 'http://localhost:3000/profile',
      callback_method: 'get',
      notes: {
        orderId: order.id,
        orderNumber,
      },
    });

    // Update order with Razorpay Payment Link ID
    await prisma.order.update({
      where: { id: order.id },
      data: {
        razorpayOrderId: paymentLink.id,
      },
    });

    return NextResponse.json({
      result: {
        orderId: order.id,
        paymentLinkId: paymentLink.id,
        paymentLinkUrl: paymentLink.short_url,
        paymentStatus: 'Pending',
        amount: totalAmount,
        currency: 'INR',
        amountBreakdown: {
          subtotal,
          shipping,
          total: totalAmount,
        },
      },
    });
  } catch (error: any) {
    console.error('Error during checkout payment link creation:', error);
    return NextResponse.json(
      { error: { message: error?.message || 'Failed to process checkout' } },
      { status: 500 }
    );
  }
}
