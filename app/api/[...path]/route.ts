import { NextRequest, NextResponse } from 'next/server';
import { getValidAccessToken } from '@/lib/auth/guards';

const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:8080';

// Public endpoints không cần auth
const PUBLIC_PATHS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/verify-email',
  '/api/auth/resend-verification',
  '/api/products',
  '/api/categories',
  '/api/brands',
];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '?') || pathname.startsWith(p + '/'));
}

async function handler(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const cookieHeader = request.headers.get('cookie') ?? '';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Client-Type': 'web',
  };

  if (!isPublic(pathname)) {
    const token = await getValidAccessToken(cookieHeader);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    headers['Authorization'] = `Bearer ${token}`;
  }

  const body = request.method !== 'GET' && request.method !== 'HEAD'
    ? await request.text()
    : undefined;

  const res = await fetch(`${BACKEND}${pathname}${search}`, {
    method: request.method,
    headers,
    body,
  });

  const data = await res.text();
  return new NextResponse(data, {
    status: res.status,
    headers: { 'Content-Type': res.headers.get('content-type') ?? 'application/json' },
  });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
