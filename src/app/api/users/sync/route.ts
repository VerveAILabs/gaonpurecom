import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, email, name, phone, role } = body;

    if (!id || !email) {
      return NextResponse.json({ success: false, error: 'User ID and Email required' }, { status: 400 });
    }

    const user = await prisma.user.upsert({
      where: { id },
      update: {
        name: name || undefined,
        phone: phone || undefined,
      },
      create: {
        id,
        email,
        name: name || 'Customer',
        phone: phone || null,
        role: role?.toLowerCase() === 'admin' ? 'admin' : 'customer',
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error('Error syncing user with PostgreSQL:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
