import { cookies } from 'next/headers';

/**
 * Đọc Set-Cookie header từ Spring response và set lại cho browser qua Next.js.
 * Cần thiết vì server-to-server fetch không tự forward cookie về browser.
 */
export async function forwardSetCookie(springResponse: Response): Promise<void> {
  const setCookieHeaders =
    (springResponse.headers as any).getSetCookie?.() ??
    springResponse.headers.get('set-cookie')?.split(', ') ??
    [];

  if (!setCookieHeaders.length) return;

  const cookieStore = await cookies();

  for (const cookieStr of setCookieHeaders) {
    const parts = cookieStr.split(';').map((s: string) => s.trim());
    const [nameValue, ...attrs] = parts;
    const eqIdx = nameValue.indexOf('=');
    const name = nameValue.substring(0, eqIdx);
    const value = nameValue.substring(eqIdx + 1);

    const attrMap: Record<string, string | boolean> = {};
    for (const attr of attrs) {
      const [k, v] = attr.split('=');
      attrMap[k.toLowerCase()] = v ?? true;
    }

    cookieStore.set(name, value, {
      httpOnly: attrMap['httponly'] === true,
      secure: attrMap['secure'] === true,
      sameSite: (attrMap['samesite'] as 'lax' | 'strict' | 'none') ?? 'lax',
      path: (attrMap['path'] as string) ?? '/',
      maxAge: attrMap['max-age'] ? Number(attrMap['max-age']) : undefined,
    });
  }
}
