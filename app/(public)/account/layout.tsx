import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { AccountSidebar } from './account-sidebar';
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();
  if (!user) redirect('/login?from=/account');

  const queryClient = new QueryClient();
  queryClient.setQueryData(['user'], user);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex gap-8">
            <AccountSidebar />
            <div className="min-w-0 flex-1">{children}</div>
          </div>
        </div>
      </div>
    </HydrationBoundary>
  );
}
