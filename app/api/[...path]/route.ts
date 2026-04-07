import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/backend';

// Public endpoints — không cần SESSION cookie
const PUBLIC_PATHS = [
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
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + '?') || pathname.startsWith(p + '/'),
  );
}

async function handler(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const cookieHeader = request.headers.get('cookie') ?? '';

  const body =
    request.method !== 'GET' && request.method !== 'HEAD'
      ? await request.text()
      : undefined;

  const springRes = await backendFetch(`${pathname}${search}`, {
    method: request.method,
    cookieHeader: isPublic(pathname) ? undefined : cookieHeader,
    body,
  });

  const data = await springRes.text();
  const res = new NextResponse(data, {
    status: springRes.status,
    headers: { 'Content-Type': springRes.headers.get('content-type') ?? 'application/json' },
  });

  // Forward Set-Cookie nếu có (ví dụ session renewal)
  const setCookie = springRes.headers.get('set-cookie');
  if (setCookie) res.headers.set('set-cookie', setCookie);

  return res;
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
