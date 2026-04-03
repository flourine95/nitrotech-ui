import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

// Decode JWT để lấy expiry (không verify signature)
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
    const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Type': 'web',
        Cookie: `refreshToken=${refreshToken}`,
      },
    });
    if (!res.ok) return null;
    const json = await res.json();
    // Web: new refreshToken comes from Set-Cookie header
    const setCookie = res.headers.get('set-cookie') ?? '';
    const newRefresh = setCookie.match(/refreshToken=([^;]+)/)?.[1] ?? refreshToken;
    return { accessToken: json.data.accessToken, refreshToken: newRefresh };
  } catch {
    return null;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const res = await fetch(`${BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Client-Type': 'web',
          },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.message ?? 'Email hoặc mật khẩu không đúng');
        }

        const json = await res.json();
        const { accessToken, user } = json.data;

        // Lấy refreshToken từ Set-Cookie header (server-side fetch có thể đọc)
        const setCookie = res.headers.get('set-cookie') ?? '';
        const refreshToken = setCookie.match(/refreshToken=([^;]+)/)?.[1] ?? '';

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          accessToken,
          refreshToken,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // Lần đầu login
      if (user) {
        const u = user as { accessToken: string; refreshToken: string };
        return {
          ...token,
          accessToken: u.accessToken,
          refreshToken: u.refreshToken,
          accessTokenExpiry: getTokenExpiry(u.accessToken),
        };
      }

      // Token còn hạn (buffer 60s)
      const now = Math.floor(Date.now() / 1000);
      if ((token.accessTokenExpiry as number) - now > 60) {
        return token;
      }

      // Token sắp hết hoặc đã hết — refresh
      const refreshed = await refreshAccessToken(token.refreshToken as string);
      if (!refreshed) {
        return { ...token, error: 'RefreshTokenExpired' };
      }

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
      session.user.id = token.id as string;
      if (token.error) (session as { error?: string }).error = token.error as string;
      return session;
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  session: { strategy: 'jwt' },
};
