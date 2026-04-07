import { getSession } from '@/lib/auth';
import { SiteHeader } from './site-header';

export async function SiteHeaderServer({ cartCount = 0 }: { cartCount?: number }) {
  const session = await getSession();
  return <SiteHeader cartCount={cartCount} initialUser={session?.user ?? null} />;
}
