import { getSession } from './session';
import { forwardSetCookie } from './cookie';

const BACKEND = process.env.BACKEND_URL;

let refreshing: Promise<string | null> | null = null;

export async function getValidAccessToken(requestCookieHeader?: string): Promise<string | null> {
  const session = await getSession();
  if (!session.accessToken) return null;

  // Còn hạn (buffer 30s)
  if (Date.now() < session.expiresAt - 30_000) return session.accessToken;

  if (refreshing) return refreshing;

  refreshing = (async () => {
    try {
      const res = await fetch(`${BACKEND}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(requestCookieHeader ? { Cookie: requestCookieHeader } : {}),
        },
      });

      if (!res.ok) {
        // Không destroy session — tab khác có thể đã refresh thành công
        // Client sẽ retry, lúc đó session đã có token mới
        return null;
      }

      // Forward Set-Cookie mới từ Spring về browser (rotation)
      await forwardSetCookie(res);

      const { data } = await res.json();
      session.accessToken = data.accessToken;
      session.expiresAt = Date.now() + data.expiresIn * 1000;
      await session.save();

      return data.accessToken;
    } finally {
      refreshing = null;
    }
  })();

  return refreshing;
}
