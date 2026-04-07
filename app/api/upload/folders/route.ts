import { NextRequest, NextResponse } from 'next/server';
import { getValidAccessToken } from '@/lib/auth/guards';

const BACKEND = process.env.BACKEND_URL;

export async function GET(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie') ?? '';
  const token = await getValidAccessToken(cookieHeader);
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { search } = request.nextUrl;
  const res = await fetch(`${BACKEND}/api/upload/folders${search}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return NextResponse.json(await res.json(), { status: res.status });
}
