'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  AlertTriangleIcon,
  BellIcon,
  BoltIcon,
  CheckIcon,
  ChevronsUpDownIcon,
  LogOutIcon,
  SearchIcon,
  SettingsIcon,
  ShoppingBagIcon,
  UserIcon,
  UserPlusIcon,
} from 'lucide-react';
import { memo, type CSSProperties } from 'react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/hooks/use-notifications';
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
  const { notifications, unreadCount, markAllAsRead, markAsRead } = useNotifications();

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
    <SidebarProvider
      style={
        {
          '--sidebar-width': '15rem',
          '--sidebar-width-icon': '3rem',
        } as CSSProperties
      }
    >
      <Sidebar collapsible="icon">
        {/* Logo */}
        <SidebarHeader className="p-2">
          <SidebarMenu className="gap-1">
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" className="h-12 px-2" asChild tooltip="NitroTech">
                <Link href="/dashboard">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-muted-foreground/25 bg-transparent text-foreground">
                    <BoltIcon className="size-4.5" />
                  </div>
                  <div className="grid flex-1 text-left leading-tight">
                    <span className="truncate text-sm font-semibold">NitroTech</span>
                    <span className="truncate text-xs text-muted-foreground">Quản trị bán hàng</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        {/* Nav */}
        <SidebarContent className="gap-2">
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

        <SidebarFooter>
          <SidebarMenu className="gap-1">
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton size="lg" className="h-12 px-2" tooltip={displayName}>
                    <Avatar className="size-8 rounded-lg">
                      <AvatarImage src="https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png" />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{displayName}</span>
                      <span className="truncate text-xs text-muted-foreground">{displayEmail}</span>
                    </div>
                    <ChevronsUpDownIcon className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" side="right" className="w-56">
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
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

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
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative size-8"
                    aria-label="Thông báo"
                  >
                    <BellIcon className="size-4.5" />
                    {unreadCount > 0 ? (
                      <Badge className="absolute -top-0.5 -right-0.5 size-4 justify-center rounded-full p-0 text-[10px]">
                        {unreadCount}
                      </Badge>
                    ) : null}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80 p-0 sm:w-96 bg-popover border-border rounded-xl">
                  <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                    <span className="text-sm font-semibold">Thông báo hoạt động</span>
                    {unreadCount > 0 ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={markAllAsRead}
                        className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                      >
                        Đọc tất cả
                      </Button>
                    ) : null}
                  </div>
                  <ScrollArea className="h-80">
                    {notifications.length === 0 ? (
                      <div className="flex h-64 flex-col items-center justify-center text-muted-foreground">
                        <BellIcon className="mb-2 size-8 opacity-40" />
                        <span className="text-xs">Không có thông báo nào</span>
                      </div>
                    ) : (
                      <div className="divide-y divide-border">
                        {notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`flex gap-3 p-4 transition-colors hover:bg-muted/50 ${
                              !notif.read ? 'bg-muted/20' : ''
                            }`}
                          >
                            <div className="flex-shrink-0">
                              {notif.type === 'NEW_ORDER' && (
                                <div className="flex size-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-500">
                                  <ShoppingBagIcon className="size-4" />
                                </div>
                              )}
                              {notif.type === 'USER_SIGNUP' && (
                                <div className="flex size-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950/30 dark:text-blue-500">
                                  <UserPlusIcon className="size-4" />
                                </div>
                              )}
                              {notif.type === 'LOW_STOCK' && (
                                <div className="flex size-8 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950/30 dark:text-amber-500">
                                  <AlertTriangleIcon className="size-4" />
                                </div>
                              )}
                              {notif.type === 'SYSTEM_ALERT' && (
                                <div className="flex size-8 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                                  <AlertTriangleIcon className="size-4" />
                                </div>
                              )}
                            </div>
                            <div className="grid flex-1 gap-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-semibold leading-none">{notif.title}</span>
                                {!notif.read && (
                                  <span className="size-1.5 rounded-full bg-primary" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground leading-normal">
                                {notif.message}
                              </p>
                              <div className="mt-1 flex items-center justify-between gap-2">
                                <span className="text-[10px] text-muted-foreground">
                                  {new Date(notif.createdAt).toLocaleTimeString('vi-VN', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}{' '}
                                  -{' '}
                                  {new Date(notif.createdAt).toLocaleDateString('vi-VN', {
                                    day: '2-digit',
                                    month: '2-digit',
                                  })}
                                </span>
                                <div className="flex gap-1.5">
                                  {!notif.read && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => markAsRead(notif.id)}
                                      className="size-5 hover:bg-muted text-muted-foreground hover:text-foreground"
                                      title="Đánh dấu đã đọc"
                                    >
                                      <CheckIcon className="size-3" />
                                    </Button>
                                  )}
                                  {notif.href && (
                                    <Link
                                      href={notif.href}
                                      onClick={() => markAsRead(notif.id)}
                                      className="text-[10px] font-medium text-primary hover:underline"
                                    >
                                      Chi tiết
                                    </Link>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </PopoverContent>
              </Popover>

            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-5 2xl:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
