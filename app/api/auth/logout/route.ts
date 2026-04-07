import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { forwardSetCookie } from '@/lib/auth/cookie';

const BACKEND = process.env.BACKEND_URL;

export async function POST(request: NextRequest) {
  const session = await getSession();
  const cookieHeader = request.headers.get('cookie') ?? '';

  if (session.accessToken) {
    const springRes = await fetch(`${BACKEND}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Type': 'web',
        Authorization: `Bearer ${session.accessToken}`,
        Cookie: cookieHeader,
      },
    });
    await forwardSetCookie(springRes);
  }

  await session.destroy();
  return NextResponse.json({ ok: true });
}
