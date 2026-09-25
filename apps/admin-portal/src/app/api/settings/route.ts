import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const setting = await prisma.storeSetting.findUnique({
      where: { key: 'store_config' },
    });

    return NextResponse.json({
      success: true,
      settings: setting?.value || {
        storeName: 'Gaon Pure',
        supportEmail: 'contact@gaonpure.com',
        supportPhone: '+91 9876543210',
        freeShippingThreshold: 999,
        standardDeliveryFee: 60,
        currency: 'INR',
        announcement: {
          enabled: true,
          text: '🎉 Free delivery across India on all orders above ₹999!',
          link: '/shop',
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const updated = await prisma.storeSetting.upsert({
      where: { key: 'store_config' },
      update: { value: body },
      create: { key: 'store_config', value: body },
    });

    return NextResponse.json({ success: true, settings: updated.value });
  } catch (error: any) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
