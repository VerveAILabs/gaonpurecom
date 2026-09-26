import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, email, name, phone, role } = body;

    if (!id || !email) {
      return NextResponse.json({ success: false, error: 'User ID and Email required' }, { status: 400 });
    }

    // Find existing user by ID or Email
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { id },
          { email: { equals: email.toLowerCase().trim(), mode: 'insensitive' } },
        ],
      },
    });

    if (user) {
      // If user exists with an older ID, migrate their orders to the active auth UID
      if (user.id !== id) {
        await prisma.order.updateMany({
          where: { userId: user.id },
          data: { userId: id },
        });
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            id,
            name: name || user.name,
            phone: phone || user.phone,
            role: role?.toLowerCase() === 'admin' ? 'admin' : user.role,
          },
        });
      } else {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            name: name || user.name,
            phone: phone || user.phone,
            role: role?.toLowerCase() === 'admin' ? 'admin' : user.role,
          },
        });
      }
    } else {
      user = await prisma.user.create({
        data: {
          id,
          email: email.toLowerCase().trim(),
          name: name || 'Customer',
          phone: phone || null,
          role: role?.toLowerCase() === 'admin' ? 'admin' : 'customer',
        },
      });
    }

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error('Error syncing user with PostgreSQL:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
