import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

function getTokenExpiry(token: string): number {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    return payload.exp ?? 0;
  } catch {
    return 0;
  }
}

async function refreshAccessToken(
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string } | null> {
  try {
    console.log('[auth] refreshing token, refreshToken length:', refreshToken?.length);
    const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Type': 'web',
        Cookie: `refreshToken=${refreshToken}`,
      },
    });
    console.log('[auth] refresh response status:', res.status);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      console.log('[auth] refresh failed body:', body);
      return null;
    }
    const json = await res.json();
    const setCookie = res.headers.get('set-cookie') ?? '';
    const newRefresh = setCookie.match(/refreshToken=([^;]+)/)?.[1] ?? refreshToken;
    console.log('[auth] refresh success, newRefresh length:', newRefresh?.length);
    return { accessToken: json.data.accessToken, refreshToken: newRefresh };
  } catch (e) {
    console.log('[auth] refresh exception:', e);
    return null;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const res = await fetch(`${BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Client-Type': 'web' },
          body: JSON.stringify({ email: credentials.email, password: credentials.password }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.message ?? 'Email hoặc mật khẩu không đúng');
        }

        const json = await res.json();
        const { accessToken, user } = json.data;
        const setCookie = res.headers.get('set-cookie') ?? '';
        const refreshToken = setCookie.match(/refreshToken=([^;]+)/)?.[1] ?? '';

        return { id: String(user.id), name: user.name, email: user.email, accessToken, refreshToken };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as { accessToken: string; refreshToken: string };
        return {
          ...token,
          accessToken: u.accessToken,
          refreshToken: u.refreshToken,
          accessTokenExpiry: getTokenExpiry(u.accessToken),
        };
      }

      const now = Math.floor(Date.now() / 1000);
      // Buffer 10s — đủ để refresh trước khi hết hạn
      if ((token.accessTokenExpiry as number) - now > 10) return token;

      // Không có refreshToken → không thể refresh
      if (!token.refreshToken) return { ...token, error: 'RefreshTokenExpired' };

      console.log('[auth] jwt: token expired, refreshToken length:', (token.refreshToken as string)?.length, 'expiry:', token.accessTokenExpiry, 'now:', now);
      const refreshed = await refreshAccessToken(token.refreshToken as string);
      if (!refreshed) return { ...token, error: 'RefreshTokenExpired' };

      return {
        ...token,
        accessToken: refreshed.accessToken,
        refreshToken: refreshed.refreshToken,
        accessTokenExpiry: getTokenExpiry(refreshed.accessToken),
        error: undefined,
      };
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      if (token.error) session.error = token.error as string;
      return session;
    },
  },

  pages: { signIn: '/login', error: '/login' },
  session: { strategy: 'jwt' },
});

declare module 'next-auth' {
  interface Session {
    accessToken: string;
    error?: string;
  }
  interface User {
    accessToken: string;
    refreshToken: string;
  }
  interface JWT {
    accessToken: string;
    refreshToken: string;
    accessTokenExpiry: number;
    error?: string;
  }
}
