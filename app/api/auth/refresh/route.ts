import { NextRequest, NextResponse } from 'next/server';
import { getValidAccessToken } from '@/lib/auth/guards';
import { getSession } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie') ?? '';
  const token = await getValidAccessToken(cookieHeader);

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Trả expiresAt để client schedule lần refresh tiếp theo
  const session = await getSession();
  return NextResponse.json({ ok: true, expiresAt: session.expiresAt });
}
