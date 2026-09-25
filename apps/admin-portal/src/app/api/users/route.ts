import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const role = searchParams.get('role');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '25')));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (role && role !== 'ALL') {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          orders: {
            select: { id: true, totalAmount: true, paymentStatus: true, createdAt: true },
          },
          addresses: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    const enriched = users.map(u => {
      const paidOrders = u.orders.filter(o => o.paymentStatus === 'Paid');
      const totalSpend = paidOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
      return {
        id: u.id,
        name: u.name || 'Anonymous',
        email: u.email,
        phone: u.phone || 'N/A',
        role: u.role,
        createdAt: u.createdAt,
        totalOrders: u.orders.length,
        totalSpend,
        addresses: u.addresses,
      };
    });

    return NextResponse.json({
      success: true,
      users: enriched,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json({ success: false, error: 'User ID and Role required' }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error: any) {
    console.error('Error updating user role:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
