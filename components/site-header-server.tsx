import { getSession } from '@/lib/auth';
import { SiteHeader } from './site-header';

export async function SiteHeaderServer({ cartCount = 0 }: { cartCount?: number }) {
  const user = await getSession();
  return <SiteHeader cartCount={cartCount} initialUser={user} />;
}
