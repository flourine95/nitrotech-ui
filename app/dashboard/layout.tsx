import { redirect } from 'next/navigation';
import { canAccessDashboard, getSession } from '@/lib/auth/session';
import { DashboardShell } from './dashboard-shell';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (!user) redirect('/login?from=/dashboard');
  if (!canAccessDashboard(user)) redirect('/account/profile');

  return (
    <div className="dashboard-theme">
      <DashboardShell user={user}>{children}</DashboardShell>
    </div>
  );
}
