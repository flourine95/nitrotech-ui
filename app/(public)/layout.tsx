import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { getSession } from '@/lib/auth';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();

  return (
    <div className="public-theme">
      <SiteHeader initialUser={user} />
      {children}
      <SiteFooter />
    </div>
  );
}
