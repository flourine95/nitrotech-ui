import { getSession } from '@/lib/auth/session';
import { SiteHeader } from './site-header';

export async function SiteHeaderServer() {
  const session = await getSession();
  return <SiteHeader initialUser={session} />;
}
