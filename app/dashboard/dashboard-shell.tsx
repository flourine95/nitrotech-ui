'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { BoltIcon, BellIcon, SearchIcon, LogOutIcon, UserIcon, SettingsIcon } from 'lucide-react';
import { memo } from 'react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { mainNavItems, catalogNavItems, systemNavItems, devNavItems, type NavItem } from './nav-items';

type User = {
  name?: string | null;
  email?: string | null;
};

const NavGroup = memo(function NavGroup({
  items,
  pathname,
}: {
  items: NavItem[];
  pathname: string;
}) {
  return (
    <SidebarMenu>
      {items.map((item) => {
        const isActive =
          item.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.href);
        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
              <Link href={item.href}>
                <item.icon />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
            {item.badge ? (
              <SidebarMenuBadge className="rounded-full bg-primary/20 text-primary">
                {item.badge}
              </SidebarMenuBadge>
            ) : null}
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
});

export function DashboardShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user?: User | null;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const displayName = user?.name ?? 'Admin';
  const displayEmail = user?.email ?? 'admin@nitrotech.vn';

  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

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

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        {/* Logo */}
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild tooltip="NitroTech">
                <Link href="/dashboard">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-foreground text-background">
                    <BoltIcon className="size-4" />
                  </div>
                  <span className="text-base font-bold tracking-tight">NitroTech</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        {/* Nav */}
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Quản lý</SidebarGroupLabel>
            <SidebarGroupContent>
              <NavGroup items={mainNavItems} pathname={pathname} />
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Danh mục</SidebarGroupLabel>
            <SidebarGroupContent>
              <NavGroup items={catalogNavItems} pathname={pathname} />
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Hệ thống</SidebarGroupLabel>
            <SidebarGroupContent>
              <NavGroup items={systemNavItems} pathname={pathname} />
            </SidebarGroupContent>
          </SidebarGroup>

          {process.env.NODE_ENV === 'development' && (
            <SidebarGroup>
              <SidebarGroupLabel>Dev</SidebarGroupLabel>
              <SidebarGroupContent>
                <NavGroup items={devNavItems} pathname={pathname} />
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>

        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        {/* Header */}
        <header className="sticky top-0 z-40 border-b bg-card">
          <div className="flex h-14 items-center justify-between gap-4 px-4 sm:px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="size-8 [&_svg]:!size-5" />
              <Separator orientation="vertical" className="hidden h-4 sm:block" />
              {/* Search — desktop */}
              <div className="relative hidden sm:block">
                <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground/60" />
                <Input
                  type="search"
                  placeholder="Tìm kiếm..."
                  className="h-8 w-48 pl-9 lg:w-64"
                  aria-label="Tìm kiếm"
                />
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Search — mobile icon */}
              <Button
                variant="ghost"
                size="icon"
                className="size-8 sm:hidden"
                aria-label="Tìm kiếm"
              >
                <SearchIcon />
              </Button>

              {/* Notifications */}
              <Button
                variant="ghost"
                size="icon"
                className="relative size-8"
                aria-label="Thông báo"
              >
                <BellIcon />
                <Badge className="absolute -top-0.5 -right-0.5 size-4 justify-center rounded-full p-0 text-[10px]">
                  3
                </Badge>
              </Button>

              {/* Profile */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8">
                    <Avatar className="size-8 rounded-md">
                      <AvatarImage src="https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png" />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium">{displayName}</p>
                      <p className="text-xs text-muted-foreground">{displayEmail}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/account/profile">
                      <UserIcon className="mr-2 size-4" />
                      Tài khoản
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings">
                      <SettingsIcon className="mr-2 size-4" />
                      Cài đặt
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={handleLogout}
                  >
                    <LogOutIcon className="mr-2 size-4" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
