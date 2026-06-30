import { NextRequest, NextResponse } from 'next/server';
import { isPublicApiPath } from '@/lib/auth/routes';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;

async function handler(request: NextRequest) {
  if (!BACKEND_URL) {
    return NextResponse.json(
      {
        status: 500,
        code: 'BACKEND_URL_MISSING',
        message: 'BACKEND_URL hoặc NEXT_PUBLIC_API_URL chưa được cấu hình',
      },
      { status: 500 },
    );
  }

  const { pathname, search } = request.nextUrl;
  const method = request.method.toUpperCase();

  const targetUrl = `${BACKEND_URL}${pathname}${search}`;

  const headers = new Headers();

  const contentType = request.headers.get('content-type');
  if (contentType) {
    headers.set('Content-Type', contentType);
  }

  const accept = request.headers.get('accept');
  if (accept) {
    headers.set('Accept', accept);
  }

  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader && !isPublicApiPath(pathname)) {
    headers.set('Cookie', cookieHeader);
  }

  const body = method === 'GET' || method === 'HEAD' ? undefined : await request.text();

  const springRes = await fetch(targetUrl, {
    method,
    headers,
    body,
    cache: 'no-store',
  });

  const data = await springRes.text();

  const res = new NextResponse(data, {
    status: springRes.status,
    headers: {
      'Content-Type': springRes.headers.get('content-type') ?? 'application/json',
    },
  });

  const setCookie = springRes.headers.get('set-cookie');
  if (setCookie) {
    res.headers.set('set-cookie', setCookie);
  }

  return res;
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;