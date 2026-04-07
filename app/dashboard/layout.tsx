import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { DashboardShell } from './dashboard-shell';
import { AuthRefresh } from '@/components/auth-refresh';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session.user) redirect('/login?from=/dashboard');

  return (
    <DashboardShell>
      <AuthRefresh expiresAt={session.expiresAt} />
      {children}
    </DashboardShell>
  );
}
