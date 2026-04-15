import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { DashboardShell } from './dashboard-shell';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (!user) redirect('/login?from=/dashboard');

  return <DashboardShell>{children}</DashboardShell>;
}
