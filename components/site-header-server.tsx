import { auth } from '@/auth';
import { SiteHeader } from './site-header';

export async function SiteHeaderServer({ cartCount = 0 }: { cartCount?: number }) {
  const session = await auth();
  return <SiteHeader cartCount={cartCount} initialUser={session?.user} />;
}
