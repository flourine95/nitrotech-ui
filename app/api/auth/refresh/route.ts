import { NextRequest, NextResponse } from 'next/server';
import { getValidAccessToken } from '@/lib/auth/guards';

export async function POST(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie') ?? '';
  const token = await getValidAccessToken(cookieHeader);

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
