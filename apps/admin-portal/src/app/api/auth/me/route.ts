import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: session.uid,
        email: session.email,
        name: session.name || 'Admin',
        role: session.role,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
