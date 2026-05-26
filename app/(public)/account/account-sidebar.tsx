'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Package, Heart, User, MapPin, Lock, Bell, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { getMe } from '@/lib/api/auth';

const SIDEBAR_LINKS = [
  { href: '/account', label: 'Tổng quan', icon: Home },
  { href: '/account/orders', label: 'Đơn hàng', icon: Package },
  { href: '/account/wishlist', label: 'Yêu thích', icon: Heart },
  { href: '/account/profile', label: 'Thông tin cá nhân', icon: User },
  { href: '/account/addresses', label: 'Địa chỉ', icon: MapPin },
  { href: '/account/security', label: 'Bảo mật', icon: Lock },
  { href: '/account/notifications', label: 'Thông báo', icon: Bell },
];

export function AccountSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  // Get user from TanStack Query
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: getMe,
  });

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      toast.success('Đã đăng xuất');
      router.push('/login');
      router.refresh();
    } catch {
      toast.error('Có lỗi xảy ra khi đăng xuất');
    }
  }

  if (!user) return null;

  return (
    <aside className="hidden w-56 shrink-0 lg:block">
      <div className="sticky top-36">
        {/* User info */}
        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
            {user.name?.charAt(0)?.toUpperCase() ?? 'U'}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-slate-900">
              {user.name ?? 'User'}
            </div>
            <div className="truncate text-xs text-slate-400">{user.email ?? 'email@example.com'}</div>
          </div>
        </div>

        {/* Nav */}
        <nav aria-label="Menu tài khoản">
          <ul className="space-y-1">
            {SIDEBAR_LINKS.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-all duration-200 ${
                      isActive
                        ? 'bg-white text-slate-900 shadow-sm font-medium'
                        : 'text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm'
                    }`}
                  >
                    <Icon className="h-4 w-4 text-slate-400" />
                    {link.label}
                  </Link>
                </li>
              );
            })}
            <li className="mt-2 border-t border-slate-200 pt-2">
              <button
                onClick={handleLogout}
                className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-rose-500 transition-colors duration-200 hover:bg-rose-50"
              >
                <LogOut className="h-4 w-4" />
                Đăng xuất
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
}
