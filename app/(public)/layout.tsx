import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { getSession } from '@/lib/auth';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { ReactNode } from 'react';

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const user = await getSession();

  const queryClient = new QueryClient();
  if (user) {
    queryClient.setQueryData(['user'], user);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="public-theme">
        <SiteHeader />
        {children}
        <SiteFooter />
      </div>
    </HydrationBoundary>
  );
}
