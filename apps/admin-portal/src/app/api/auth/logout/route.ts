import { NextResponse } from 'next/server';
import { clearAdminSessionCookie } from '@/lib/session';

export async function POST() {
  try {
    await clearAdminSessionCookie();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
