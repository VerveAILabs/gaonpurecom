import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signSession, setAdminSessionCookie } from '@/lib/session';

const ADMIN_EMAILS = [
  'rds087@gmail.com',
  'admin@gaonpure.com',
  'gaonpure01@gmail.com',
  'khiladi14290@gmail.com'
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, uid, name } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check user in database
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    const isWhitelisted = ADMIN_EMAILS.includes(normalizedEmail);

    if (!user && isWhitelisted) {
      // Create admin user record if they exist in whitelist
      user = await prisma.user.create({
        data: {
          id: uid || `admin-${Date.now()}`,
          email: normalizedEmail,
          name: name || 'Admin',
          role: 'admin',
        },
      });
    } else if (user && isWhitelisted && user.role !== 'admin') {
      // Promote whitelisted email to admin
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: 'admin' },
      });
    }

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Access denied: You do not have administrator privileges.' },
        { status: 403 }
      );
    }

    // Create session token
    const token = await signSession({
      uid: user.id,
      email: user.email,
      name: user.name || 'Admin',
      role: 'admin',
    });

    // Set cookie
    await setAdminSessionCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Error during admin login:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
