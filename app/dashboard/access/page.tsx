'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { KeyRoundIcon, PencilIcon, PlusIcon, SearchIcon, ShieldCheckIcon, UsersIcon } from 'lucide-react';
import { toast } from 'sonner';

import { StatusChip } from '@/components/dashboard/status-chip';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { getFriendlyErrorMessage } from '@/lib/utils/errors';
import {
  createRole,
  getAccessUsers,
  getPermissions,
  getRoles,
  updateRole,
  updateRolePermissions,
  updateUserRoles,
  type PermissionData,
  type RoleData,
  type UserAccessData,
} from '@/lib/api/admin/access';

const GROUP_LABELS: Record<string, string> = {
  audit: 'Nhật ký',
  banner: 'Banner',
  brand: 'Thương hiệu',
  category: 'Danh mục',
  inventory: 'Tồn kho',
  media: 'Media',
  notification: 'Thông báo',
  order: 'Đơn hàng',
  product: 'Sản phẩm',
  promotion: 'Khuyến mãi',
  review: 'Đánh giá',
  role: 'Vai trò',
  shipment: 'Vận chuyển',
  user: 'Tài khoản',
};

function groupedPermissions(permissions: PermissionData[]) {
  return permissions.reduce<Record<string, PermissionData[]>>((acc, permission) => {
    const group = GROUP_LABELS[permission.groupName] ?? permission.groupName ?? 'Khác';
    acc[group] = [...(acc[group] ?? []), permission];
    return acc;
  }, {});
}

type RoleFormInput = {
  name: string;
  slug: string;
  description: string;
  active: boolean;
};

function RoleEditorDialog({
  role,
  open,
  saving,
  onOpenChange,
  onSubmit,
}: {
  role: RoleData | null;
  open: boolean;
  saving: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: RoleFormInput) => void;
}) {
  const [name, setName] = useState(role?.name ?? '');
  const [slug, setSlug] = useState(role?.slug ?? '');
  const [description, setDescription] = useState(role?.description ?? '');
  const [active, setActive] = useState(role?.active ?? true);
  const isEditing = Boolean(role);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim(),
      active,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Sửa role' : 'Thêm role'}</DialogTitle>
          <DialogDescription>
            Vai trò dùng để gom nhiều quyền và gán cho tài khoản.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="role-name">Tên vai trò</Label>
            <Input
              id="role-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nhân viên kho"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="role-slug">Mã vai trò</Label>
            <Input
              id="role-slug"
              value={slug}
              onChange={(event) => setSlug(event.target.value.toLowerCase())}
              placeholder="warehouse_staff"
              disabled={isEditing}
              pattern="[a-z0-9_]+"
              required
            />
            {!isEditing ? (
              <p className="text-xs text-muted-foreground">Chỉ dùng chữ thường, số và dấu gạch dưới.</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="role-description">Mô tả</Label>
            <Textarea
              id="role-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              placeholder="Quyền xử lý đơn hàng trong kho"
            />
          </div>

          {isEditing ? (
            <label className="flex items-start gap-3 rounded-lg border p-3">
              <Checkbox checked={active} onCheckedChange={(value) => setActive(value === true)} />
              <span className="grid gap-0.5">
                <span className="text-sm font-medium">Đang hoạt động</span>
                <span className="text-xs text-muted-foreground">
                  Tắt vai trò sẽ làm tài khoản đang giữ vai trò này mất quyền tương ứng.
                </span>
              </span>
            </label>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ToggleRow({
  checked,
  disabled,
  title,
  subtitle,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  title: string;
  subtitle?: string | null;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg px-3 py-2 hover:bg-muted/60 has-disabled:cursor-not-allowed has-disabled:opacity-60">
      <Checkbox
        checked={checked}
        disabled={disabled}
        onCheckedChange={(value) => onChange(value === true)}
        className="mt-0.5"
      />
      <span className="min-w-0">
        <span className="block text-sm font-medium text-foreground">{title}</span>
        {subtitle ? <span className="mt-0.5 block text-xs text-muted-foreground">{subtitle}</span> : null}
      </span>
    </label>
  );
}

export default function AccessManagementPage() {
  const [permissions, setPermissions] = useState<PermissionData[]>([]);
  const [roles, setRoles] = useState<RoleData[]>([]);
  const [users, setUsers] = useState<UserAccessData[]>([]);
  const [selectedRoleSlug, setSelectedRoleSlug] = useState<string>('');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [roleDraft, setRoleDraft] = useState<Set<string>>(new Set());
  const [userRoleDraft, setUserRoleDraft] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingRole, setSavingRole] = useState(false);
  const [savingUser, setSavingUser] = useState(false);
  const [roleEditorOpen, setRoleEditorOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleData | null>(null);
  const [savingRoleMeta, setSavingRoleMeta] = useState(false);

  const selectedRole = roles.find((role) => role.slug === selectedRoleSlug) ?? roles[0];
  const selectedUser = users.find((user) => user.id === selectedUserId) ?? users[0];

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [permissionData, roleData, userData] = await Promise.all([
        getPermissions(),
        getRoles(),
        getAccessUsers(),
      ]);
      setPermissions(permissionData);
      setRoles(roleData);
      setUsers(userData);
      setSelectedRoleSlug((current) => current || roleData[0]?.slug || '');
      setSelectedUserId((current) => current ?? userData[0]?.id ?? null);
    } catch (error) {
      toast.error(getFriendlyErrorMessage(error, 'Không thể tải dữ liệu phân quyền'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    setRoleDraft(new Set(selectedRole?.permissionSlugs ?? []));
  }, [selectedRole?.slug, selectedRole?.permissionSlugs]);

  useEffect(() => {
    setUserRoleDraft(new Set(selectedUser?.roleSlugs ?? []));
  }, [selectedUser?.id, selectedUser?.roleSlugs]);

  const permissionGroups = useMemo(() => groupedPermissions(permissions), [permissions]);
  const permissionNames = useMemo(
    () => new Map(permissions.map((permission) => [permission.slug, permission.name])),
    [permissions],
  );

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;
    return users.filter((user) =>
      `${user.name} ${user.email}`.toLowerCase().includes(query),
    );
  }, [search, users]);

  const roleDirty = Boolean(selectedRole) && selectedRole.permissionSlugs.length !== roleDraft.size
    || Boolean(selectedRole) && selectedRole.permissionSlugs.some((slug) => !roleDraft.has(slug));
  const userDirty = Boolean(selectedUser) && selectedUser.roleSlugs.length !== userRoleDraft.size
    || Boolean(selectedUser) && selectedUser.roleSlugs.some((slug) => !userRoleDraft.has(slug));

  function toggleRolePermission(slug: string, checked: boolean) {
    setRoleDraft((current) => {
      const next = new Set(current);
      if (checked) next.add(slug);
      else next.delete(slug);
      return next;
    });
  }

  function toggleUserRole(slug: string, checked: boolean) {
    setUserRoleDraft((current) => {
      const next = new Set(current);
      if (checked) next.add(slug);
      else next.delete(slug);
      return next;
    });
  }

  async function handleSaveRole() {
    if (!selectedRole) return;
    setSavingRole(true);
    try {
      const updated = await updateRolePermissions(selectedRole.id, Array.from(roleDraft));
      setRoles((current) => current.map((role) => (role.id === updated.id ? updated : role)));
      toast.success('Đã cập nhật quyền của role');
    } catch (error) {
      toast.error(getFriendlyErrorMessage(error, 'Cập nhật quyền thất bại'));
    } finally {
      setSavingRole(false);
    }
  }

  async function handleSaveRoleMeta(input: RoleFormInput) {
    if (!input.name || !input.slug) return;

    setSavingRoleMeta(true);
    try {
      if (editingRole) {
        const updated = await updateRole(editingRole.id, {
          name: input.name,
          description: input.description || null,
          active: input.active,
        });
        setRoles((current) => current.map((role) => (role.id === updated.id ? updated : role)));
        setSelectedRoleSlug(updated.slug);
        toast.success('Đã cập nhật role');
      } else {
        const created = await createRole({
          name: input.name,
          slug: input.slug,
          description: input.description || null,
        });
        setRoles((current) => [...current, created].sort((a, b) => a.slug.localeCompare(b.slug)));
        setSelectedRoleSlug(created.slug);
        setRoleDraft(new Set(created.permissionSlugs));
        toast.success('Đã tạo role');
      }
      setRoleEditorOpen(false);
      setEditingRole(null);
    } catch (error) {
      toast.error(getFriendlyErrorMessage(error, 'Lưu vai trò thất bại'));
    } finally {
      setSavingRoleMeta(false);
    }
  }

  async function handleSaveUserRoles() {
    if (!selectedUser) return;
    setSavingUser(true);
    try {
      const updated = await updateUserRoles(selectedUser.id, Array.from(userRoleDraft));
      setUsers((current) => current.map((user) => (user.id === updated.id ? updated : user)));
      toast.success('Đã cập nhật role của user');
    } catch (error) {
      toast.error(getFriendlyErrorMessage(error, 'Cập nhật vai trò người dùng thất bại'));
    } finally {
      setSavingUser(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100dvh-7.5rem)] flex-col gap-4">
        <div className="flex items-start gap-3 border-b border-dashed border-border/70 pb-3">
          <Skeleton className="size-10 rounded-xl" />
          <div className="grid gap-2">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-4 w-80" />
          </div>
        </div>
        <Skeleton className="min-h-0 flex-1 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100dvh-7.5rem)] w-full max-w-none flex-col gap-4 overflow-hidden">
      <section className="flex flex-col gap-3 border-b border-dashed border-border/70 pb-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl border bg-card 2xl:size-11">
            <ShieldCheckIcon />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight 2xl:text-2xl">Phân quyền</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Quản lý vai trò, quyền và quyền truy cập của từng tài khoản.
            </p>
          </div>
        </div>
      </section>

      <Tabs defaultValue="roles" className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
        <TabsList className="h-10 w-fit rounded-xl">
          <TabsTrigger value="roles">
            Vai trò & quyền
          </TabsTrigger>
          <TabsTrigger value="users">
            Tài khoản & vai trò
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="min-h-0 flex-1 overflow-hidden">
          <div className="grid h-full min-h-0 overflow-hidden rounded-xl border bg-card lg:grid-cols-[300px_minmax(0,1fr)]">
            <div className="flex min-h-0 flex-col overflow-hidden border-b lg:border-r lg:border-b-0">
              <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
                <div>
                  <h2 className="text-sm font-semibold">Vai trò</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">{roles.length} vai trò</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 rounded-lg"
                  onClick={() => {
                    setEditingRole(null);
                    setRoleEditorOpen(true);
                  }}
                >
                  <PlusIcon data-icon="inline-start" />
                  Thêm
                </Button>
              </div>
              <div className="min-h-0 divide-y overflow-auto">
                {roles.map((role) => (
                  <button
                    key={role.slug}
                    className={cn(
                      'flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-muted/60',
                      selectedRole?.slug === role.slug && 'bg-muted',
                    )}
                    onClick={() => setSelectedRoleSlug(role.slug)}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{role.name}</span>
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                        {role.slug}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1">
                      {!role.active ? <StatusChip tone="warning">Tắt</StatusChip> : null}
                      {role.systemRole ? <StatusChip>Khóa sửa</StatusChip> : null}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex min-h-0 flex-col overflow-hidden">
              <div className="flex flex-col justify-between gap-3 border-b px-4 py-3 sm:flex-row sm:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-semibold">{selectedRole?.name ?? 'Role'}</h2>
                    {selectedRole?.systemRole ? <StatusChip>Khóa sửa</StatusChip> : null}
                    {selectedRole?.active === false ? <StatusChip tone="warning">Tắt</StatusChip> : null}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {selectedRole?.description || selectedRole?.slug}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 rounded-xl"
                    disabled={!selectedRole || selectedRole.systemRole}
                    onClick={() => {
                      setEditingRole(selectedRole ?? null);
                      setRoleEditorOpen(true);
                    }}
                  >
                    <PencilIcon data-icon="inline-start" />
                    Sửa vai trò
                  </Button>
                  <Button
                    size="sm"
                    className="h-9 rounded-xl"
                    disabled={!roleDirty || selectedRole?.systemRole || savingRole}
                    onClick={handleSaveRole}
                  >
                    <KeyRoundIcon data-icon="inline-start" />
                    Lưu quyền
                  </Button>
                </div>
              </div>

              <div className="min-h-0 overflow-auto">
                {Object.entries(permissionGroups).map(([group, items]) => (
                  <section key={group} className="border-b last:border-b-0">
                    <div className="flex items-center justify-between gap-3 bg-muted/25 px-4 py-2">
                      <span className="text-xs font-semibold text-muted-foreground">{group}</span>
                      <span className="text-xs text-muted-foreground">
                        {items.filter((permission) => roleDraft.has(permission.slug)).length}/{items.length}
                      </span>
                    </div>
                    <div className="grid gap-0 py-1 sm:grid-cols-2 xl:grid-cols-3">
                      {items.map((permission) => (
                        <ToggleRow
                          key={permission.slug}
                          title={permission.name}
                          subtitle={permission.slug}
                          checked={roleDraft.has(permission.slug)}
                          disabled={selectedRole?.systemRole}
                          onChange={(checked) => toggleRolePermission(permission.slug, checked)}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="users" className="min-h-0 flex-1 overflow-hidden">
          <div className="grid h-full min-h-0 overflow-hidden rounded-xl border bg-card lg:grid-cols-[360px_minmax(0,1fr)]">
            <div className="flex min-h-0 flex-col overflow-hidden border-b lg:border-r lg:border-b-0">
              <div className="border-b p-4">
                <div className="relative">
                  <SearchIcon className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Tìm theo tên hoặc email..."
                    className="h-9 rounded-xl pl-10"
                  />
                </div>
              </div>
              <div className="min-h-0 divide-y overflow-auto">
                {filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    className={cn(
                      'flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-muted/60',
                      selectedUser?.id === user.id && 'bg-muted',
                    )}
                    onClick={() => setSelectedUserId(user.id)}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{user.name}</span>
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </span>
                    <StatusChip tone={user.status === 'active' ? 'success' : 'warning'}>
                      {user.status === 'active' ? 'Đang hoạt động' : user.status}
                    </StatusChip>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex min-h-0 flex-col overflow-hidden">
              <div className="flex flex-col justify-between gap-3 border-b px-4 py-3 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-sm font-semibold">{selectedUser?.name ?? 'User'}</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">{selectedUser?.email}</p>
                </div>
                <Button size="sm" className="h-9 rounded-xl" disabled={!userDirty || savingUser} onClick={handleSaveUserRoles}>
                  <UsersIcon data-icon="inline-start" />
                  Lưu vai trò
                </Button>
              </div>

              <div className="grid min-h-0 overflow-auto lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
                <div className="border-b lg:border-r lg:border-b-0">
                  <div className="border-b bg-muted/25 px-4 py-2 text-xs font-semibold text-muted-foreground">Vai trò được gán</div>
                  <div className="py-1">
                    {roles.map((role) => (
                      <ToggleRow
                        key={role.slug}
                        title={role.name}
                        subtitle={role.slug}
                        checked={userRoleDraft.has(role.slug)}
                        onChange={(checked) => toggleUserRole(role.slug, checked)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <div className="border-b bg-muted/25 px-4 py-2 text-xs font-semibold text-muted-foreground">Quyền hiệu lực</div>
                  <div className="grid gap-1 p-3 sm:grid-cols-2 xl:grid-cols-3">
                    {(selectedUser?.permissionSlugs ?? []).map((slug) => (
                      <Badge key={slug} variant="outline" className="justify-start truncate font-normal" title={slug}>
                        {permissionNames.get(slug) ?? slug}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <RoleEditorDialog
        key={`${editingRole?.id ?? 'new-role'}-${roleEditorOpen}`}
        role={editingRole}
        open={roleEditorOpen}
        saving={savingRoleMeta}
        onOpenChange={(open) => {
          setRoleEditorOpen(open);
          if (!open) setEditingRole(null);
        }}
        onSubmit={handleSaveRoleMeta}
      />
    </div>
  );
}
