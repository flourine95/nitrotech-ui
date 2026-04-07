import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { forwardSetCookie } from '@/lib/auth/cookie';

const BACKEND = process.env.BACKEND_URL;

export async function POST(request: NextRequest) {
  const body = await request.json();

  const springRes = await fetch(`${BACKEND}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Client-Type': 'web' },
    body: JSON.stringify(body),
  });

  if (!springRes.ok) {
    const error = await springRes.json();
    return NextResponse.json(error, { status: springRes.status });
  }

  const { data } = await springRes.json();

  // Forward refreshToken cookie từ Spring về browser
  await forwardSetCookie(springRes);

  // Lưu session
  const session = await getSession();
  session.accessToken = data.accessToken;
  session.expiresAt = Date.now() + data.expiresIn * 1000;
  session.user = data.user;
  await session.save();

  return NextResponse.json({ user: data.user });
}
