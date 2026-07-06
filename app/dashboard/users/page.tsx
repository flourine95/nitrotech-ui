'use client';

import Link from 'next/link';
import { keepPreviousData, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
 import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import {
  AlertCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CoinsIcon,
  DownloadIcon,
  MoreHorizontalIcon,
  PlusIcon,
  SearchIcon,
  ShieldCheckIcon,
  UploadIcon,
  UserRoundIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react';
import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { useDebounce } from 'use-debounce';

import { MultipleSortPopover, parseSortParam } from '@/components/dashboard/multiple-sort-popover';
import { PageSizeDropdown } from '@/components/dashboard/page-size-dropdown';
import { DashboardFilterDropdown } from '@/components/dashboard/filter-dropdown';
import { StatusChip, type StatusChipTone } from '@/components/dashboard/status-chip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pagination, PaginationContent, PaginationItem } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { useSimplePagination } from '@/hooks/use-simple-pagination';
import {
  getAdminUserFacets,
  getAdminUsers,
  bulkUpdateAdminUsersStatus,
  bulkDeleteAdminUsers,
  bulkRestoreAdminUsers,
  createAdminUser,
  importAdminUsers,
  resetAdminUserPassword,
  updateAdminUser,
  type AdminUser,
  type AdminUserInput,
  type AdminUserActivity,
  type UserImportResult,
} from '@/lib/api/admin/users';
import { cn } from '@/lib/utils';
import { getFriendlyErrorMessage } from '@/lib/utils/errors';
import { downloadCSV, escapeCsv, formatRelativeTime, formatViDate, formatVnd } from '@/lib/utils/formatting';

const ALL = 'all';
const PAGE_SIZES = [10, 20, 50];
const EMPTY_USERS: AdminUser[] = [];

const activityTabs: Array<{ value: string; label: string; countKey?: 'withOrders' | 'noOrders' | 'newUsers' | 'atRisk' }> = [
  { value: ALL, label: 'Tất cả' },
  { value: 'with_orders', label: 'Có đơn', countKey: 'withOrders' },
  { value: 'no_orders', label: 'Chưa mua', countKey: 'noOrders' },
  { value: 'new', label: 'Mới', countKey: 'newUsers' },
  { value: 'at_risk', label: 'Có nguy cơ', countKey: 'atRisk' },
];

const statusOptions = [
  { value: ALL, label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'inactive', label: 'Chưa kích hoạt' },
  { value: 'suspended', label: 'Tạm khóa' },
  { value: 'banned', label: 'Bị khóa' },
  { value: 'deleted', label: 'Đã xóa (Thùng rác)' },
];

const roleOptions = [
  { value: ALL, label: 'Tất cả vai trò' },
  { value: 'customer', label: 'Khách hàng' },
  { value: 'staff', label: 'Nhân viên' },
  { value: 'admin', label: 'Admin' },
  { value: 'super_admin', label: 'Super Admin' },
];

const roleLabels = Object.fromEntries(roleOptions.map((option) => [option.value, option.label]));

function roleLabel(slug: string) {
  return roleLabels[slug] ?? slug;
}

const statusLabels: Record<string, string> = {
  active: 'Đang hoạt động',
  inactive: 'Chưa kích hoạt',
  suspended: 'Tạm khóa',
  banned: 'Bị khóa',
  deleted: 'Đã xóa',
};

const sortFields = [
  { value: 'createdAt', label: 'Ngày đăng ký' },
  { value: 'lastOrderAt', label: 'Đơn gần nhất' },
  { value: 'totalSpent', label: 'Tổng chi tiêu' },
  { value: 'orderCount', label: 'Số đơn hàng' },
  { value: 'averageOrderValue', label: 'Trung bình đơn' },
  { value: 'name', label: 'Tên tài khoản' },
  { value: 'id', label: 'ID tài khoản' },
  { value: 'email', label: 'Email' },
];

const activityConfig: Record<string, { label: string; tone: StatusChipTone }> = {
  new: { label: 'Mới', tone: 'default' },
  with_orders: { label: 'Có đơn', tone: 'success' },
  no_orders: { label: 'Chưa mua', tone: 'warning' },
  at_risk: { label: 'Có nguy cơ', tone: 'danger' },
};

function roleTone(slug: string): StatusChipTone {
  if (slug === 'super_admin') return 'danger';
  if (slug === 'admin' || slug === 'staff') return 'warning';
  return 'default';
}

const filterParsers = {
  search: parseAsString.withDefault(''),
  status: parseAsString.withDefault(ALL),
  role: parseAsString.withDefault(ALL),
  activity: parseAsString.withDefault(ALL),
  sort: parseAsString.withDefault('createdAt,desc'),
  page: parseAsInteger.withDefault(0),
  size: parseAsInteger.withDefault(20),
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
    'Họ và tên',
    'Email',
    'Số điện thoại',
    'Trạng thái',
    'Nhà cung cấp',
    'Vai trò',
    'Trạng thái hoạt động',
    'Số đơn hàng',
    'Tổng chi tiêu',
    'Trung bình đơn',
    'Đơn gần nhất',
    'Ngày đăng ký',
  ];
  const rows = users.map((user) => [
    user.id,
    user.name,
    user.email,
    user.phone ?? '',
    statusLabels[user.status] ?? user.status,
    user.provider,
    user.roleSlugs.map(roleLabel).join(' | '),
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

function downloadUsersImportTemplate() {
  const csv = '\uFEFF' + [
    ['name', 'email', 'phone', 'roles', 'status'],
    ['Nguyen Van A', 'a@example.com', '0901000000', 'customer|staff', 'active'],
  ].map((row) => row.map((cell) => escapeCsv(cell)).join(',')).join('\n');
  downloadCSV(csv, 'users-import-template.csv');
}

function UserTableSkeleton({ count }: { count: number }) {
  return Array.from({ length: count }).map((_, index) => (
    <TableRow key={index}>
      <TableCell className="pl-4">
        <Skeleton className="size-4 rounded" />
      </TableCell>
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

function UserEditorDialog({
  user,
  open,
  saving,
  onOpenChange,
  onSubmit,
}: {
  user: AdminUser | null;
  open: boolean;
  saving: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: AdminUserInput) => void;
}) {
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [status, setStatus] = useState(user?.status ?? 'active');
  const [roleSlugs, setRoleSlugs] = useState<string[]>(user?.roleSlugs.length ? user.roleSlugs : ['customer']);
  const isEditing = Boolean(user);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({
      name,
      email,
      phone,
      status,
      roleSlugs: isEditing ? undefined : roleSlugs,
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 p-0 sm:max-w-xl">
        <SheetHeader className="border-b px-6 py-5">
          <SheetTitle>{isEditing ? 'Sửa tài khoản' : 'Thêm tài khoản'}</SheetTitle>
          <SheetDescription>
            {isEditing ? 'Cập nhật thông tin cơ bản của tài khoản.' : 'User sẽ nhận email đặt mật khẩu sau khi tạo.'}
          </SheetDescription>
        </SheetHeader>
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
          <div className="grid gap-5 overflow-y-auto px-6 py-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="user-name">Họ tên</Label>
                <Input id="user-name" value={name} onChange={(event) => setName(event.target.value)} required maxLength={120} />
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="user-email">Email</Label>
                <Input id="user-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required maxLength={255} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="user-phone">Số điện thoại</Label>
                <Input id="user-phone" value={phone} onChange={(event) => setPhone(event.target.value)} maxLength={30} />
              </div>
              <div className="grid gap-2">
                <Label>Trạng thái</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={6}>
                    {statusOptions.filter((item) => item.value !== ALL && item.value !== 'deleted').map((item) => (
                      <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {!isEditing ? (
              <div className="grid gap-2">
                <Label>Vai trò</Label>
                <div className="grid grid-cols-2 gap-2">
                  {roleOptions.filter((item) => item.value !== ALL).map((item) => {
                    const checked = roleSlugs.includes(item.value);
                    return (
                      <label
                        key={item.value}
                        className={cn(
                          'flex h-11 cursor-pointer items-center justify-between rounded-lg border px-3 text-left text-sm transition-colors',
                          checked ? 'border-foreground bg-foreground text-background' : 'bg-background hover:bg-muted/60',
                        )}
                      >
                        <span>{item.label}</span>
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => {
                          setRoleSlugs((current) => checked
                            ? current.filter((slug) => slug !== item.value)
                            : [...current, item.value]);
                          }}
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
          <SheetFooter className="mt-auto flex-row justify-end border-t px-6 py-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
            <Button type="submit" disabled={saving || !name.trim() || !email.trim() || (!isEditing && roleSlugs.length === 0)}>
              {saving ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function ImportUsersDialog({
  open,
  importing,
  result,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  importing: boolean;
  result: UserImportResult | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (file: File) => void;
}) {
  const [file, setFile] = useState<File | null>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import tài khoản</DialogTitle>
          <DialogDescription>CSV: name,email,phone,roles,status. Nhiều role phân tách bằng dấu |.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <Button type="button" variant="outline" className="w-fit" onClick={downloadUsersImportTemplate}>
            <DownloadIcon data-icon="inline-start" />
            Tải mẫu import
          </Button>
          <div className="grid gap-2">
            <Label htmlFor="users-import-file">File CSV</Label>
            <Input
              id="users-import-file"
              type="file"
              accept=".csv,text/csv"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </div>
          {result ? (
            <div className="rounded-lg border bg-muted/30 p-3 text-sm">
              <p className="font-medium">Tạo thành công: {result.created}. Lỗi: {result.failed}.</p>
              {result.failedRows.length ? (
                <div className="mt-2 grid gap-1 text-muted-foreground">
                  {result.failedRows.slice(0, 5).map((row) => (
                    <p key={row}>Dòng {row}: {result.failedReasons[row] ?? 'Không rõ lỗi'}</p>
                  ))}
                  {result.failedRows.length > 5 ? <p>...</p> : null}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Đóng</Button>
          <Button disabled={!file || importing} onClick={() => file && onSubmit(file)}>
            {importing ? 'Đang import...' : 'Import'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function DashboardUsersPage() {
  const [queryParams, setQueryParams] = useQueryStates(filterParsers, {
    shallow: true,
    history: 'replace',
    throttleMs: 300,
  });
  const {
    search,
    status,
    role,
    activity,
    sort,
    page: currentPage,
    size: pageSize,
  } = queryParams;

  const [now] = useState(() => Date.now());
  const [searchInput, setSearchInput] = useState(search);
  const [debouncedSearch] = useDebounce(searchInput, 350);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingIds, setDeletingIds] = useState<number[]>([]);
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);
  const [restoringIds, setRestoringIds] = useState<number[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importResult, setImportResult] = useState<UserImportResult | null>(null);

  // Reset selected IDs when any query parameters change
  useEffect(() => {
    setSelectedIds([]);
  }, [queryParams]);

  const queryClient = useQueryClient();

  const invalidateUsers = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    void queryClient.invalidateQueries({ queryKey: ['admin-user-facets'] });
    void queryClient.invalidateQueries({ queryKey: ['access-users'] });
  };

  const updateStatusMutation = useMutation({
    mutationFn: ({ ids, status }: { ids: number[]; status: string }) =>
      bulkUpdateAdminUsersStatus(ids, status),
    onSuccess: (_, variables) => {
      invalidateUsers();
      setSelectedIds([]);
      toast.success(`Đã cập nhật trạng thái cho ${variables.ids.length} tài khoản`);
    },
    onError: (error) => {
      toast.error(getFriendlyErrorMessage(error, 'Cập nhật trạng thái thất bại'));
    },
  });

  const deleteUsersMutation = useMutation({
    mutationFn: (ids: number[]) => bulkDeleteAdminUsers(ids),
    onSuccess: (_, ids) => {
      invalidateUsers();
      setSelectedIds([]);
      setDeletingIds([]);
      toast.success(`Đã xóa thành công ${ids.length} tài khoản`);
    },
    onError: (error) => {
      toast.error(getFriendlyErrorMessage(error, 'Xóa tài khoản thất bại'));
    },
  });

  const restoreUsersMutation = useMutation({
    mutationFn: (ids: number[]) => bulkRestoreAdminUsers(ids),
    onSuccess: (_, ids) => {
      invalidateUsers();
      setSelectedIds([]);
      setRestoringIds([]);
      toast.success(`Đã khôi phục thành công ${ids.length} tài khoản`);
    },
    onError: (error) => {
      toast.error(getFriendlyErrorMessage(error, 'Khôi phục tài khoản thất bại'));
    },
  });

  const createUserMutation = useMutation({
    mutationFn: createAdminUser,
    onSuccess: () => {
      invalidateUsers();
      setIsEditorOpen(false);
      toast.success('Đã tạo tài khoản và gửi email đặt mật khẩu');
    },
    onError: (error) => toast.error(getFriendlyErrorMessage(error, 'Tạo tài khoản thất bại')),
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: Omit<AdminUserInput, 'roleSlugs'> }) => updateAdminUser(id, input),
    onSuccess: () => {
      invalidateUsers();
      setIsEditorOpen(false);
      setEditingUser(null);
      toast.success('Đã cập nhật tài khoản');
    },
    onError: (error) => toast.error(getFriendlyErrorMessage(error, 'Cập nhật tài khoản thất bại')),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: resetAdminUserPassword,
    onSuccess: () => toast.success('Đã gửi email đặt lại mật khẩu'),
    onError: (error) => toast.error(getFriendlyErrorMessage(error, 'Gửi email đặt lại mật khẩu thất bại')),
  });

  const importUsersMutation = useMutation({
    mutationFn: importAdminUsers,
    onSuccess: (result) => {
      invalidateUsers();
      setImportResult(result);
      toast.success(`Import xong: ${result.created} tạo mới, ${result.failed} lỗi`);
    },
    onError: (error) => toast.error(getFriendlyErrorMessage(error, 'Import tài khoản thất bại')),
  });

  const confirmRestore = () => {
    if (restoringIds.length === 0) return;
    restoreUsersMutation.mutate(restoringIds);
    setIsRestoreDialogOpen(false);
  };

  const handleBulkUpdateStatus = (newStatus: string) => {
    if (selectedIds.length === 0) return;
    updateStatusMutation.mutate({ ids: selectedIds, status: newStatus });
  };

  const handleRowUpdateStatus = (id: number, newStatus: string) => {
    updateStatusMutation.mutate({ ids: [id], status: newStatus });
  };

  const confirmDelete = () => {
    if (deletingIds.length === 0) return;
    deleteUsersMutation.mutate(deletingIds);
    setIsDeleteDialogOpen(false);
  };

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    if (debouncedSearch === search) return;
    void setQueryParams({ search: debouncedSearch, page: 0 });
  }, [debouncedSearch, search, setQueryParams]);

  const filters = useMemo(() => ({
    search: search || undefined,
    status: status !== ALL && status !== 'deleted' ? status : undefined,
    role: role !== ALL ? role : undefined,
    activity: activity !== ALL ? (activity as AdminUserActivity) : undefined,
    deleted: status === 'deleted' ? true : undefined,
  }), [search, status, role, activity]);

  const sortRules = useMemo(() => parseSortParam(sort), [sort]);

  const usersQuery = useQuery({
    queryKey: ['admin-users', filters, sort, currentPage, pageSize],
    queryFn: () =>
      getAdminUsers({
        ...filters,
        sort: sortRules.map((r) => ({ field: r.field, dir: r.direction })),
        page: currentPage,
        size: pageSize,
      }),
    placeholderData: keepPreviousData,
    staleTime: 20_000,
  });

  const facetsFilters = useMemo(() => {
    const rest = { ...filters };
    delete rest.activity;
    return rest;
  }, [filters]);

  const facetsQuery = useQuery({
    queryKey: ['admin-user-facets', facetsFilters],
    queryFn: () => getAdminUserFacets(facetsFilters),
    placeholderData: keepPreviousData,
    staleTime: 20_000,
  });

  const [displayUsersPage, setDisplayUsersPage] = useState(usersQuery.data);

  useEffect(() => {
    if (!usersQuery.data || usersQuery.isFetching) return;
    const id = window.setTimeout(() => setDisplayUsersPage(usersQuery.data), 0);
    return () => window.clearTimeout(id);
  }, [usersQuery.data, usersQuery.isFetching]);

  const users = displayUsersPage?.data ?? usersQuery.data?.data ?? EMPTY_USERS;
  const facets = facetsQuery.data;
  const meta = displayUsersPage?.meta ?? usersQuery.data?.meta;
  const displayPage = meta?.page ?? currentPage;
  const totalPages = meta?.totalPages ?? 0;
  const totalElements = meta?.totalElements ?? 0;
  const shownFrom = totalElements > 0 ? displayPage * pageSize + 1 : 0;
  const shownTo = Math.min((displayPage + 1) * pageSize, totalElements);
  const pagination = useSimplePagination({ currentPage: displayPage, totalPages });
  const activeFilterCount = (search ? 1 : 0) + (status !== ALL ? 1 : 0) + (role !== ALL ? 1 : 0) + (activity !== ALL ? 1 : 0);
  const pageSpend = useMemo(() => users.reduce((sum, user) => sum + Number(user.totalSpent), 0), [users]);

  function resetFilters() {
    setSearchInput('');
    void setQueryParams({
      search: '',
      status: ALL,
      role: ALL,
      activity: ALL,
      sort: 'createdAt,desc',
      page: 0,
    });
  }

  function updateFilter(updates: Partial<typeof queryParams>) {
    void setQueryParams({ ...updates, page: 0 });
  }

  return (
    <div className="-m-4 flex h-[calc(100dvh-3.5rem)] w-auto max-w-none flex-col gap-4 overflow-hidden p-4 lg:-m-5 lg:p-5 2xl:-m-6 2xl:p-6">
      <section className="flex flex-col gap-3 border-b border-dashed border-border/70 pb-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl border bg-card 2xl:size-11">
            <UsersIcon />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight 2xl:text-2xl">Tài khoản</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Theo dõi tài khoản, vai trò và giá trị mua hàng từ dữ liệu hiện có.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            variant="outline"
            className="h-10 w-full rounded-xl px-4 shadow-none sm:w-fit"
            onClick={() => {
              setImportResult(null);
              setIsImportOpen(true);
            }}
          >
            <UploadIcon data-icon="inline-start" />
            Import
          </Button>
          <Button
            variant="outline"
            className="h-10 w-full rounded-xl px-4 shadow-none sm:w-fit"
            disabled={!users.length}
            onClick={() => exportUsersPage(users, displayPage)}
          >
            <DownloadIcon data-icon="inline-start" />
            Xuất CSV
          </Button>
          <Button
            className="h-10 w-full rounded-xl px-4 sm:w-fit"
            onClick={() => {
              setEditingUser(null);
              setIsEditorOpen(true);
            }}
          >
            <PlusIcon data-icon="inline-start" />
            Thêm
          </Button>
        </div>
      </section>

      <section className="grid overflow-hidden rounded-xl border bg-card sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Tổng tài khoản', value: facets?.total ?? 0, icon: UsersIcon },
          { label: 'Tài khoản mới 30 ngày', value: facets?.newUsers ?? 0, icon: UserRoundIcon },
          { label: 'Có đơn hàng', value: facets?.withOrders ?? 0, icon: ShieldCheckIcon },
          { label: 'Tổng chi tiêu', value: compactMoney(facets?.totalSpent ?? 0), icon: CoinsIcon },
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
        <div className="shrink-0 border-b border-dashed border-border/70 pb-3.5">
          {/* Row 1: Segmented tabs for customer activity */}
          <div className="flex flex-wrap items-center justify-between gap-3">
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
                    onClick={() => updateFilter({ activity: tab.value })}
                  >
                    {tab.label}
                    <span className={cn('text-xs', active ? 'text-background/70' : 'text-muted-foreground')}>
                      {facetsQuery.isLoading ? '...' : count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 2: Search and tabular filters */}
          <div className="mt-3.5 flex flex-col gap-2.5 lg:flex-row lg:items-center px-0.5 py-0.5">
            <div className="relative w-full sm:w-64 xl:w-72 shrink-0">
              <SearchIcon className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
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

            <div className="flex flex-wrap items-center gap-2">
              <DashboardFilterDropdown label="Trạng thái" value={status} options={statusOptions} onChange={(value) => updateFilter({ status: value })} />
              <DashboardFilterDropdown label="Role" value={role} options={roleOptions} onChange={(value) => updateFilter({ role: value })} />
              <MultipleSortPopover
                value={sort}
                fields={sortFields}
                className="h-9 w-fit sm:w-fit xl:w-fit 2xl:w-fit gap-1.5"
                onChange={(value) => updateFilter({ sort: value })}
              />
              {activeFilterCount > 0 ? (
                <Button variant="ghost" className="h-9 rounded-xl shrink-0" onClick={resetFilters}>
                  <XIcon data-icon="inline-start" />
                  Xóa lọc
                </Button>
              ) : null}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StatusChip>{totalElements} tài khoản</StatusChip>
            <StatusChip>{formatVnd(pageSpend)} trang này</StatusChip>
            {activeFilterCount > 0 ? <StatusChip tone="warning">{activeFilterCount} bộ lọc</StatusChip> : null}
          </div>
        </div>

        <div className="mt-3 min-h-0 flex-1 overflow-auto rounded-xl border bg-card [scrollbar-gutter:stable]">
          {usersQuery.isError ? (
            <div className="flex h-full min-h-80 flex-col items-center justify-center py-16 text-muted-foreground">
              <AlertCircleIcon className="mb-3 size-10 text-destructive/40" />
              <p className="text-sm font-medium text-foreground">Không thể tải danh sách tài khoản</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => usersQuery.refetch()}>
                Thử lại
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="w-12 pl-4">
                    <Checkbox
                      checked={
                        users.length > 0 &&
                        users.every((user) => selectedIds.includes(user.id))
                      }
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedIds(users.map((user) => user.id));
                        } else {
                          setSelectedIds([]);
                        }
                      }}
                      aria-label="Chọn tất cả"
                    />
                  </TableHead>
                  <TableHead className="w-16">ID</TableHead>
                  <TableHead>Tài khoản</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead className="text-right">Đơn hàng</TableHead>
                  <TableHead className="text-right">Tổng chi tiêu</TableHead>
                  <TableHead className="text-right">Trung bình đơn</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Đơn gần nhất</TableHead>
                  <TableHead className="w-10 pr-4" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersQuery.isLoading ? (
                  <UserTableSkeleton count={pageSize} />
                ) : users.length ? (
                  users.map((user) => (
                    <TableRow key={user.id} className="h-15">
                      <TableCell className="pl-4">
                        <Checkbox
                          checked={selectedIds.includes(user.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedIds((prev) => [...prev, user.id]);
                            } else {
                              setSelectedIds((prev) => prev.filter((id) => id !== user.id));
                            }
                          }}
                          aria-label={`Chọn tài khoản ${user.name}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium text-muted-foreground">#{user.id}</TableCell>
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
                            <StatusChip key={item} tone={roleTone(item)}>
                              {roleLabel(item)}
                            </StatusChip>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">{user.orderCount}</TableCell>
                      <TableCell className="text-right font-semibold">{formatVnd(Number(user.totalSpent))}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{formatVnd(Number(user.averageOrderValue))}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          <StatusChip tone={user.status === 'active' ? 'success' : 'warning'}>{statusLabels[user.status] ?? user.status}</StatusChip>
                          <StatusChip tone={activityConfig[user.customerState]?.tone}>{activityConfig[user.customerState]?.label ?? user.customerState}</StatusChip>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="min-w-28">
                          <p>{user.lastOrderAt ? formatViDate(user.lastOrderAt) : 'Chưa có'}</p>
                          {user.lastOrderAt ? (
                            Math.abs(now - new Date(user.lastOrderAt).getTime()) < 30 * 24 * 60 * 60 * 1000 ? (
                              <p className="text-xs text-muted-foreground">
                                {formatRelativeTime(user.lastOrderAt)}
                              </p>
                            ) : null
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              Tạo: {formatViDate(user.createdAt)}
                            </p>
                          )}
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
                            {status === 'deleted' ? (
                              <DropdownMenuItem
                                onClick={() => {
                                  setRestoringIds([user.id]);
                                  setIsRestoreDialogOpen(true);
                                }}
                              >
                                Khôi phục tài khoản
                              </DropdownMenuItem>
                            ) : (
                              <>
                                <DropdownMenuItem asChild>
                                  <Link href={`/dashboard/orders?search=${encodeURIComponent(user.email)}`}>Xem đơn hàng</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <a href={`mailto:${user.email}`}>
                                    Gửi email
                                  </a>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditingUser(user);
                                    setIsEditorOpen(true);
                                  }}
                                >
                                  Sửa thông tin
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => resetPasswordMutation.mutate(user.id)}>
                                  Gửi reset mật khẩu
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuSub>
                                  <DropdownMenuSubTrigger>Đổi trạng thái</DropdownMenuSubTrigger>
                                  <DropdownMenuSubContent className="w-36">
                                    <DropdownMenuItem onClick={() => handleRowUpdateStatus(user.id, 'active')}>
                                      Đang hoạt động
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleRowUpdateStatus(user.id, 'inactive')}>
                                      Chưa kích hoạt
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleRowUpdateStatus(user.id, 'suspended')}>
                                      Tạm khóa
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleRowUpdateStatus(user.id, 'banned')}>
                                      Bị khóa
                                    </DropdownMenuItem>
                                  </DropdownMenuSubContent>
                                </DropdownMenuSub>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                  <Link href="/dashboard/access">Quản lý role</Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  variant="destructive"
                                  onClick={() => {
                                    setDeletingIds([user.id]);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                >
                                  Xóa tài khoản
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10}>
                      <div className="flex min-h-72 flex-col items-center justify-center text-muted-foreground">
                        <UsersIcon className="mb-3 size-10 text-muted-foreground/50" />
                        <p className="text-sm font-medium text-foreground">Không tìm thấy tài khoản nào</p>
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
                  {totalElements > 0 ? `Hiển thị ${shownFrom}-${shownTo} trong ${totalElements} tài khoản` : '0 kết quả'}
                </p>
              )}
              <PageSizeDropdown
                value={pageSize}
                options={PAGE_SIZES}
                onChange={(value) => {
                  void setQueryParams({ size: value, page: 0 });
                }}
              />
            </div>
            {totalPages > 1 ? (
              <Pagination className="mx-0! ml-auto w-auto justify-end">
                <PaginationContent>
                  <PaginationItem>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 rounded-xl px-3 shadow-none"
                      disabled={!pagination.canGoPrevious}
                      onClick={() => void setQueryParams({ page: pagination.previousPage })}
                    >
                      <ChevronLeftIcon data-icon="inline-start" />
                      Trước
                    </Button>
                  </PaginationItem>
                  <PaginationItem>
                    <span aria-current="page" className="inline-flex h-9 min-w-28 items-center justify-center rounded-xl border border-primary bg-primary px-3 text-sm font-medium text-primary-foreground">
                      Trang {pagination.currentPageLabel} / {pagination.totalPages}
                    </span>
                  </PaginationItem>
                  <PaginationItem>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 rounded-xl px-3 shadow-none"
                      disabled={!pagination.canGoNext}
                      onClick={() => void setQueryParams({ page: pagination.nextPage })}
                    >
                      Sau
                      <ChevronRightIcon data-icon="inline-end" />
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            ) : null}
          </div>
        </div>
      </main>

      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-full border border-border/80 bg-background/90 px-6 py-3 shadow-lg backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
          <span className="text-sm font-medium">
            Đã chọn <strong className="text-primary">{selectedIds.length}</strong> tài khoản
          </span>
          <div className="h-4 w-px bg-border" />
          
          {status === 'deleted' ? (
            <Button
              size="sm"
              variant="default"
              className="h-8 gap-1.5"
              onClick={() => {
                setRestoringIds(selectedIds);
                setIsRestoreDialogOpen(true);
              }}
            >
              Khôi phục
            </Button>
          ) : (
            <>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline" className="h-8 gap-1">
                    Đổi trạng thái
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={() => handleBulkUpdateStatus('active')}>
                    Đang hoạt động
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkUpdateStatus('inactive')}>
                    Chưa kích hoạt
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkUpdateStatus('suspended')}>
                    Tạm khóa
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkUpdateStatus('banned')}>
                    Bị khóa
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                size="sm"
                variant="destructive"
                className="h-8 gap-1.5"
                onClick={() => {
                  setDeletingIds(selectedIds);
                  setIsDeleteDialogOpen(true);
                }}
              >
                Xóa
              </Button>
            </>
          )}

          <Button
            size="sm"
            variant="ghost"
            className="h-8 px-2 text-muted-foreground hover:text-foreground"
            onClick={() => setSelectedIds([])}
          >
            Hủy
          </Button>
        </div>
      )}

      <UserEditorDialog
        key={`${editingUser?.id ?? 'new'}-${isEditorOpen}`}
        user={editingUser}
        open={isEditorOpen}
        saving={createUserMutation.isPending || updateUserMutation.isPending}
        onOpenChange={(open) => {
          setIsEditorOpen(open);
          if (!open) setEditingUser(null);
        }}
        onSubmit={(input) => {
          if (editingUser) {
            updateUserMutation.mutate({
              id: editingUser.id,
              input: {
                name: input.name,
                email: input.email,
                phone: input.phone,
                status: input.status,
              },
            });
          } else {
            createUserMutation.mutate(input);
          }
        }}
      />

      <ImportUsersDialog
        key={`import-${isImportOpen}`}
        open={isImportOpen}
        importing={importUsersMutation.isPending}
        result={importResult}
        onOpenChange={setIsImportOpen}
        onSubmit={(file) => importUsersMutation.mutate(file)}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa tài khoản</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa {deletingIds.length} tài khoản đã chọn? Hành động này sẽ thực hiện xóa mềm và tài khoản không thể truy cập hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDelete}>
              Xác nhận xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isRestoreDialogOpen} onOpenChange={setIsRestoreDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận khôi phục tài khoản</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn khôi phục {restoringIds.length} tài khoản đã chọn? Hành động này sẽ cho phép tài khoản hoạt động trở lại.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRestore}>
              Xác nhận khôi phục
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
