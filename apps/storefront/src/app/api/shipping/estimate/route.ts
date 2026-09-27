import { NextRequest, NextResponse } from 'next/server';
import { checkShiprocketServiceability } from '@/lib/logistics/shiprocket';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pincode = searchParams.get('pincode');
    const weight = parseFloat(searchParams.get('weight') || '1');

    if (!pincode || pincode.length !== 6) {
      return NextResponse.json(
        { success: false, error: 'A valid 6-digit Indian delivery pincode is required.' },
        { status: 400 }
      );
    }

    const result = await checkShiprocketServiceability({
      deliveryPincode: pincode,
      weightKg: weight,
      isCod: false,
    });

    if (!result.success) {
      // Return standard estimate fallback if Shiprocket credentials are not yet configured in local test
      return NextResponse.json({
        success: true,
        pincode,
        estimatedDeliveryDays: '3-5 business days',
        recommendedCourier: 'Delhivery / Express Hub',
        couriers: [
          { courierName: 'Delhivery Surface', rate: 50, estimatedDeliveryDays: '3-4 days', rating: 4.6, codAvailable: true },
          { courierName: 'BlueDart Air', rate: 90, estimatedDeliveryDays: '2-3 days', rating: 4.8, codAvailable: false }
        ],
        fallback: true
      });
    }

    return NextResponse.json({
      pincode,
      ...result,
    });
  } catch (error: any) {
    console.error('Error estimating shipping serviceability:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
