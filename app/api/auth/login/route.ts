import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/server';

export async function POST(request: NextRequest) {
  const body = await request.json();

  const springRes = await backendFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  const data = await springRes.json();

  if (!springRes.ok) {
    return NextResponse.json(data, { status: springRes.status });
  }

  // Forward SESSION cookie từ Spring về browser
  const res = NextResponse.json(data);
  const setCookie = springRes.headers.get('set-cookie');
  if (setCookie) res.headers.set('set-cookie', setCookie);

  return res;
}
