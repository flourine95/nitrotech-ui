import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

export interface SessionData {
  accessToken: string;
  expiresAt: number; // ms
  user: { id: number; name: string; email: string };
}

const sessionOptions = {
  cookieName: 'session',
  password: process.env.SESSION_SECRET!,
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 30 * 24 * 60 * 60,
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}
