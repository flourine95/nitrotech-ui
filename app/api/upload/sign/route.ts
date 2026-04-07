import { NextRequest, NextResponse } from 'next/server';
import { getValidAccessToken } from '@/lib/auth/guards';

const BACKEND = process.env.BACKEND_URL;

export async function POST(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie') ?? '';
  const token = await getValidAccessToken(cookieHeader);
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const res = await fetch(`${BACKEND}/api/upload/sign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });

  return NextResponse.json(await res.json(), { status: res.status });
}
