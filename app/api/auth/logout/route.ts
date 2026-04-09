import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/server';

export async function POST(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie') ?? '';

  const springRes = await backendFetch('/api/auth/logout', {
    method: 'POST',
    cookieHeader,
  });

  const res = NextResponse.json({ ok: true });

  // Forward clear-cookie từ Spring về browser
  const setCookie = springRes.headers.get('set-cookie');
  if (setCookie) res.headers.set('set-cookie', setCookie);

  return res;
}
