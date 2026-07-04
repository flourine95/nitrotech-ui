'use client';

import Link from 'next/link';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import {
  AlertCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  MailIcon,
  MoreHorizontalIcon,
  RefreshCwIcon,
  SearchIcon,
  Settings2Icon,
  ShieldCheckIcon,
  UserRoundIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react';
import { useEffect, useMemo, useState, useTransition } from 'react';
import { useDebounce } from 'use-debounce';

import { PageSizeDropdown } from '@/components/dashboard/page-size-dropdown';
import { StatusChip, type StatusChipTone } from '@/components/dashboard/status-chip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Pagination, PaginationContent, PaginationItem } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useSimplePagination } from '@/hooks/use-simple-pagination';
import {
  getAdminUserFacets,
  getAdminUsers,
  type AdminUser,
  type AdminUserActivity,
} from '@/lib/api/admin/users';
import { cn } from '@/lib/utils';
import { downloadCSV, escapeCsv, formatRelativeTime, formatViDate, formatVnd } from '@/lib/utils/formatting';

const ALL = 'all';
const PAGE_SIZES = [10, 20, 50];
const EMPTY_USERS: AdminUser[] = [];

const activityTabs: Array<{ value: string; label: string; countKey?: 'withOrders' | 'noOrders' | 'newUsers' | 'atRisk' }> = [
  { value: ALL, label: 'Tất cả' },
  { value: 'with_orders', label: 'Có đơn', countKey: 'withOrders' },
  { value: 'no_orders', label: 'Chưa mua', countKey: 'noOrders' },
  { value: 'new', label: 'Mới', countKey: 'newUsers' },
  { value: 'at_risk', label: 'At risk', countKey: 'atRisk' },
];

const statusOptions = [
  { value: ALL, label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'banned', label: 'Banned' },
];

const roleOptions = [
  { value: ALL, label: 'Tất cả role' },
  { value: 'customer', label: 'Customer' },
  { value: 'staff', label: 'Staff' },
  { value: 'admin', label: 'Admin' },
  { value: 'super_admin', label: 'Super Admin' },
];

const sortOptions = [
  { value: 'createdAt,desc', label: 'Mới nhất' },
  { value: 'lastOrderAt,desc', label: 'Đơn gần nhất' },
  { value: 'totalSpent,desc', label: 'Chi tiêu cao nhất' },
  { value: 'orderCount,desc', label: 'Nhiều đơn nhất' },
  { value: 'name,asc', label: 'Tên A-Z' },
];

const activityConfig: Record<string, { label: string; tone: StatusChipTone }> = {
  new: { label: 'Mới', tone: 'default' },
  with_orders: { label: 'Có đơn', tone: 'success' },
  no_orders: { label: 'Chưa mua', tone: 'warning' },
  at_risk: { label: 'At risk', tone: 'danger' },
};

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function compactMoney(value: number) {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${Math.round(value / 1_000_000)}M`;
  return formatVnd(value);
}

function exportUsersPage(users: AdminUser[], currentPage: number) {
  if (!users.length) return;
  const header = [
    'ID',
    'Name',
    'Email',
    'Phone',
    'Status',
    'Provider',
    'Roles',
    'Customer state',
    'Orders',
    'Total spent',
    'Average order',
    'Last order',
    'Created',
  ];
  const rows = users.map((user) => [
    user.id,
    user.name,
    user.email,
    user.phone ?? '',
    user.status,
    user.provider,
    user.roleSlugs.join(' | '),
    activityConfig[user.customerState]?.label ?? user.customerState,
    user.orderCount,
    user.totalSpent,
    user.averageOrderValue,
    user.lastOrderAt ? formatViDate(user.lastOrderAt) : '',
    formatViDate(user.createdAt),
  ]);
  const csv = [header, ...rows].map((row) => row.map((cell) => escapeCsv(cell)).join(',')).join('\n');
  downloadCSV(csv, `users-page-${currentPage + 1}.csv`);
}

function FilterMenu({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  const selected = options.find((option) => option.value === value)?.label ?? label;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-9 justify-between rounded-xl shadow-none">
          <span className="truncate">{selected}</span>
          <Settings2Icon data-icon="inline-end" className="text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={6} className="w-(--radix-dropdown-menu-trigger-width)">
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UserTableSkeleton({ count }: { count: number }) {
  return Array.from({ length: count }).map((_, index) => (
    <TableRow key={index}>
      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <Skeleton className="size-9 rounded-full" />
          <div className="grid gap-1.5">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-44" />
          </div>
        </div>
      </TableCell>
      {Array.from({ length: 6 }).map((__, cellIndex) => (
        <TableCell key={cellIndex}><Skeleton className="h-5 w-20" /></TableCell>
      ))}
    </TableRow>
  ));
}

export default function DashboardUsersPage() {
  const [search, setSearch] = useQueryState('search', parseAsString.withDefault(''));
  const [status, setStatus] = useQueryState('status', parseAsString.withDefault(ALL));
  const [role, setRole] = useQueryState('role', parseAsString.withDefault(ALL));
  const [activity, setActivity] = useQueryState('activity', parseAsString.withDefault(ALL));
  const [sort, setSort] = useQueryState('sort', parseAsString.withDefault('createdAt,desc'));
  const [currentPage, setCurrentPage] = useQueryState('page', parseAsInteger.withDefault(0));
  const [pageSize, setPageSize] = useQueryState('size', parseAsInteger.withDefault(20));
  const [searchInput, setSearchInput] = useState(search);
  const [debouncedSearch] = useDebounce(searchInput, 350);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    if (debouncedSearch === search) return;
    void setSearch(debouncedSearch);
    void setCurrentPage(0);
  }, [debouncedSearch, search, setCurrentPage, setSearch]);

  const filters = {
    search: search || undefined,
    status: status !== ALL ? status : undefined,
    role: role !== ALL ? role : undefined,
    activity: activity !== ALL ? (activity as AdminUserActivity) : undefined,
  };

  const usersQuery = useQuery({
    queryKey: ['admin-users', filters, sort, currentPage, pageSize],
    queryFn: () => getAdminUsers({ ...filters, sort, page: currentPage, size: pageSize }),
    placeholderData: keepPreviousData,
    staleTime: 20_000,
  });

  const facetsQuery = useQuery({
    queryKey: ['admin-user-facets', filters],
    queryFn: () => getAdminUserFacets(filters),
    placeholderData: keepPreviousData,
    staleTime: 20_000,
  });

  const users = usersQuery.data?.data ?? EMPTY_USERS;
  const facets = facetsQuery.data;
  const meta = usersQuery.data?.meta;
  const totalPages = meta?.totalPages ?? 0;
  const totalElements = meta?.totalElements ?? 0;
  const shownFrom = totalElements > 0 ? currentPage * pageSize + 1 : 0;
  const shownTo = Math.min((currentPage + 1) * pageSize, totalElements);
  const pagination = useSimplePagination({ currentPage, totalPages });
  const activeFilterCount = (search ? 1 : 0) + (status !== ALL ? 1 : 0) + (role !== ALL ? 1 : 0) + (activity !== ALL ? 1 : 0);
  const pageSpend = useMemo(() => users.reduce((sum, user) => sum + Number(user.totalSpent), 0), [users]);

  function resetFilters() {
    startTransition(() => {
      void setSearch('');
      void setSearchInput('');
      void setStatus(ALL);
      void setRole(ALL);
      void setActivity(ALL);
      void setSort('createdAt,desc');
      void setCurrentPage(0);
    });
  }

  function setFilter(update: () => void) {
    startTransition(() => {
      update();
      void setCurrentPage(0);
    });
  }

  return (
    <div className="flex h-[calc(100dvh-6.5rem)] w-full max-w-none flex-col gap-4 overflow-hidden">
      <section className="flex flex-col gap-3 border-b border-dashed border-border/70 pb-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl border bg-card 2xl:size-11">
            <UsersIcon />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight 2xl:text-2xl">Users</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Theo dõi tài khoản, vai trò và giá trị mua hàng từ dữ liệu hiện có.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-10 rounded-xl shadow-none" onClick={() => usersQuery.refetch()}>
            <RefreshCwIcon data-icon="inline-start" />
            Tải lại
          </Button>
          <Button className="h-10 rounded-xl" disabled={!users.length} onClick={() => exportUsersPage(users, currentPage)}>
            <DownloadIcon data-icon="inline-start" />
            Xuất CSV
          </Button>
        </div>
      </section>

      <section className="grid overflow-hidden rounded-xl border bg-card sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Tổng users', value: facets?.total ?? 0, icon: UsersIcon },
          { label: 'Users mới 30 ngày', value: facets?.newUsers ?? 0, icon: UserRoundIcon },
          { label: 'Có đơn hàng', value: facets?.withOrders ?? 0, icon: ShieldCheckIcon },
          { label: 'Tổng chi tiêu', value: compactMoney(facets?.totalSpent ?? 0), icon: DownloadIcon },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-4 border-b p-4 last:border-b-0 sm:nth-[2n+1]:border-r xl:border-b-0 xl:border-r xl:last:border-r-0">
            <div>
              <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
              <p className="mt-1 text-2xl font-semibold">{item.value}</p>
            </div>
            <item.icon className="text-muted-foreground" />
          </div>
        ))}
      </section>

      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b border-dashed border-border/70 pb-3">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap gap-2">
              {activityTabs.map((tab) => {
                const active = activity === tab.value;
                const count = tab.countKey && facets ? facets[tab.countKey] : facets?.total;
                return (
                  <button
                    key={tab.value}
                    type="button"
                    className={cn(
                      'inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-sm font-medium transition-colors',
                      active ? 'border-foreground bg-foreground text-background' : 'bg-background hover:bg-muted/60',
                    )}
                    onClick={() => setFilter(() => void setActivity(tab.value))}
                  >
                    {tab.label}
                    <span className={cn('text-xs', active ? 'text-background/70' : 'text-muted-foreground')}>
                      {facetsQuery.isLoading ? '...' : count}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative sm:w-64">
                <SearchIcon className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Tìm tên, email, SĐT..."
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  className="h-9 rounded-xl pl-10 pr-9"
                />
                {searchInput ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Xóa tìm kiếm"
                    onClick={() => setSearchInput('')}
                    className="absolute inset-y-0 right-1 my-auto size-7"
                  >
                    <XIcon />
                  </Button>
                ) : null}
              </div>
              <FilterMenu label="Trạng thái" value={status} options={statusOptions} onChange={(value) => setFilter(() => void setStatus(value))} />
              <FilterMenu label="Role" value={role} options={roleOptions} onChange={(value) => setFilter(() => void setRole(value))} />
              <FilterMenu label="Sắp xếp" value={sort} options={sortOptions} onChange={(value) => setFilter(() => void setSort(value))} />
              {activeFilterCount > 0 ? (
                <Button variant="ghost" className="h-9 rounded-xl" onClick={resetFilters}>
                  <XIcon data-icon="inline-start" />
                  Xóa lọc
                </Button>
              ) : null}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StatusChip>{totalElements} users</StatusChip>
            <StatusChip>{formatVnd(pageSpend)} trang này</StatusChip>
            {activeFilterCount > 0 ? <StatusChip tone="warning">{activeFilterCount} bộ lọc</StatusChip> : null}
          </div>
        </div>

        <div className={cn('mt-3 min-h-0 flex-1 overflow-auto rounded-xl border bg-card transition-opacity', (usersQuery.isFetching && !usersQuery.isLoading) || isPending ? 'opacity-60' : 'opacity-100')}>
          {usersQuery.isError ? (
            <div className="flex h-full min-h-80 flex-col items-center justify-center py-16 text-muted-foreground">
              <AlertCircleIcon className="mb-3 size-10 text-destructive/40" />
              <p className="text-sm font-medium text-foreground">Không thể tải users</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => usersQuery.refetch()}>
                Thử lại
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="pl-4">User ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                  <TableHead className="text-right">Total spend</TableHead>
                  <TableHead className="text-right">Avg order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last order</TableHead>
                  <TableHead className="w-10 pr-4" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersQuery.isLoading ? (
                  <UserTableSkeleton count={pageSize} />
                ) : users.length ? (
                  users.map((user) => (
                    <TableRow key={user.id} className="h-15">
                      <TableCell className="pl-4 font-medium text-muted-foreground">USR-{String(user.id).padStart(4, '0')}</TableCell>
                      <TableCell>
                        <div className="flex min-w-64 items-center gap-3">
                          <Avatar className="size-9">
                            <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
                            <AvatarFallback>{initials(user.name)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate font-semibold">{user.name}</p>
                            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.roleSlugs.map((item) => (
                            <StatusChip key={item} tone={item === 'customer' ? 'default' : 'warning'}>
                              {item}
                            </StatusChip>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">{user.orderCount}</TableCell>
                      <TableCell className="text-right font-semibold">{formatVnd(Number(user.totalSpent))}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{formatVnd(Number(user.averageOrderValue))}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          <StatusChip tone={user.status === 'active' ? 'success' : 'warning'}>{user.status}</StatusChip>
                          <StatusChip tone={activityConfig[user.customerState]?.tone}>{activityConfig[user.customerState]?.label ?? user.customerState}</StatusChip>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="min-w-28">
                          <p>{user.lastOrderAt ? formatViDate(user.lastOrderAt) : 'Chưa có'}</p>
                          <p className="text-xs text-muted-foreground">{user.lastOrderAt ? formatRelativeTime(user.lastOrderAt) : formatViDate(user.createdAt)}</p>
                        </div>
                      </TableCell>
                      <TableCell className="pr-4">
                        <DropdownMenu modal={false}>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm" aria-label={`Mở thao tác cho ${user.name}`}>
                              <MoreHorizontalIcon />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" sideOffset={6} className="w-44">
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/orders?search=${encodeURIComponent(user.email)}`}>Xem đơn hàng</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <a href={`mailto:${user.email}`}>
                                <MailIcon />
                                Gửi email
                              </a>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href="/dashboard/access">Quản lý role</Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9}>
                      <div className="flex min-h-72 flex-col items-center justify-center text-muted-foreground">
                        <UsersIcon className="mb-3 size-10 text-muted-foreground/50" />
                        <p className="text-sm font-medium text-foreground">Không tìm thấy user nào</p>
                        <p className="mt-1 text-xs">Thử đổi từ khóa hoặc xóa bộ lọc.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>

        <div className="mt-3 shrink-0 border-t border-dashed border-border/70 pt-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              {usersQuery.isLoading ? (
                <Skeleton className="h-5 w-40" />
              ) : (
                <p className="text-sm text-muted-foreground">
                  {totalElements > 0 ? `Hiển thị ${shownFrom}-${shownTo} trong ${totalElements} users` : '0 kết quả'}
                </p>
              )}
              <PageSizeDropdown
                value={pageSize}
                options={PAGE_SIZES}
                onChange={(value) => {
                  void setPageSize(value);
                  void setCurrentPage(0);
                }}
              />
            </div>
            {totalPages > 1 ? (
              <Pagination className="mx-0! ml-auto w-auto justify-end">
                <PaginationContent>
                  <PaginationItem>
                    <button
                      type="button"
                      className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-sm font-medium text-foreground disabled:pointer-events-none disabled:opacity-50"
                      disabled={!pagination.canGoPrevious}
                      onClick={() => startTransition(() => void setCurrentPage(pagination.previousPage))}
                    >
                      <ChevronLeftIcon className="size-4" />
                      Trước
                    </button>
                  </PaginationItem>
                  <PaginationItem>
                    <span aria-current="page" className="inline-flex h-8 min-w-24 items-center justify-center rounded-lg border border-primary bg-primary px-3 text-sm font-medium text-primary-foreground">
                      Trang {pagination.currentPageLabel} / {pagination.totalPages}
                    </span>
                  </PaginationItem>
                  <PaginationItem>
                    <button
                      type="button"
                      className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-sm font-medium text-foreground disabled:pointer-events-none disabled:opacity-50"
                      disabled={!pagination.canGoNext}
                      onClick={() => startTransition(() => void setCurrentPage(pagination.nextPage))}
                    >
                      Sau
                      <ChevronRightIcon className="size-4" />
                    </button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
