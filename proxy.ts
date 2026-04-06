import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_PATHS = ['/dashboard', '/account'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));

  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get('access_token')?.value;
  const expiresAt = request.cookies.get('access_token_expires_at')?.value;

  const isValid = token && expiresAt && Date.now() < Number(expiresAt) - 30_000;

  if (!isValid) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/account/:path*'],
};
