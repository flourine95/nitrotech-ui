import { auth } from '@/auth';
import { SessionProvider } from 'next-auth/react';
import { SessionBridge } from './session-bridge';

/**
 * Server component: đọc session sẵn, truyền xuống SessionProvider.
 * Client nhận session ngay từ render đầu — không có loading state.
 */
export async function AuthWrapper({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <SessionProvider session={session}>
      <SessionBridge />
      {children}
    </SessionProvider>
  );
}
