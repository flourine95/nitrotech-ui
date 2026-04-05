import { AuthWrapper } from './auth-wrapper';
import { DashboardShell } from './dashboard-shell';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthWrapper>
      <DashboardShell>{children}</DashboardShell>
    </AuthWrapper>
  );
}
