'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { KeyRoundIcon, RefreshCwIcon, ShieldCheckIcon, UsersIcon } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ApiException } from '@/lib/api/client';
import {
  getAccessUsers,
  getPermissions,
  getRoles,
  updateRolePermissions,
  updateUserRoles,
  type PermissionData,
  type RoleData,
  type UserAccessData,
} from '@/lib/api/admin/access';

function errorMessage(error: unknown) {
  return error instanceof ApiException ? error.error.message : 'Có lỗi xảy ra';
}

function groupedPermissions(permissions: PermissionData[]) {
  return permissions.reduce<Record<string, PermissionData[]>>((acc, permission) => {
    const group = permission.groupName || 'Khác';
    acc[group] = [...(acc[group] ?? []), permission];
    return acc;
  }, {});
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
      toast.error(errorMessage(error));
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
      toast.error(errorMessage(error));
    } finally {
      setSavingRole(false);
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
      toast.error(errorMessage(error));
    } finally {
      setSavingUser(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-[520px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Phân quyền</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Quản lý role, permission và quyền truy cập của từng tài khoản.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData}>
          <RefreshCwIcon />
          Tải lại
        </Button>
      </div>

      <Tabs defaultValue="roles" className="gap-4">
        <TabsList>
          <TabsTrigger value="roles">
            <ShieldCheckIcon />
            Role & quyền
          </TabsTrigger>
          <TabsTrigger value="users">
            <UsersIcon />
            User & role
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roles">
          <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
            <div className="rounded-xl border bg-card">
              <div className="border-b px-4 py-3">
                <h2 className="text-sm font-semibold">Roles</h2>
              </div>
              <div className="divide-y">
                {roles.map((role) => (
                  <button
                    key={role.slug}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-muted/60 disabled:cursor-default disabled:bg-muted"
                    disabled={selectedRole?.slug === role.slug}
                    onClick={() => setSelectedRoleSlug(role.slug)}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{role.name}</span>
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">{role.slug}</span>
                    </span>
                    {role.systemRole ? <Badge variant="secondary">System</Badge> : null}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border bg-card">
              <div className="flex flex-col justify-between gap-3 border-b px-4 py-3 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-sm font-semibold">{selectedRole?.name ?? 'Role'}</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">{selectedRole?.description}</p>
                </div>
                <Button
                  size="sm"
                  disabled={!roleDirty || selectedRole?.systemRole || savingRole}
                  onClick={handleSaveRole}
                >
                  <KeyRoundIcon />
                  Lưu quyền
                </Button>
              </div>

              <div className="grid gap-4 p-4 xl:grid-cols-2">
                {Object.entries(permissionGroups).map(([group, items]) => (
                  <div key={group} className="rounded-lg border">
                    <div className="border-b px-3 py-2 text-sm font-semibold">{group}</div>
                    <div className="py-1">
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
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <div className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
            <div className="rounded-xl border bg-card">
              <div className="border-b p-4">
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Tìm theo tên hoặc email..."
                  className="h-9"
                />
              </div>
              <div className="max-h-[560px] divide-y overflow-auto">
                {filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-muted/60 disabled:cursor-default disabled:bg-muted"
                    disabled={selectedUser?.id === user.id}
                    onClick={() => setSelectedUserId(user.id)}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{user.name}</span>
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">{user.email}</span>
                    </span>
                    <Badge variant={user.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {user.status}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border bg-card">
              <div className="flex flex-col justify-between gap-3 border-b px-4 py-3 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-sm font-semibold">{selectedUser?.name ?? 'User'}</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">{selectedUser?.email}</p>
                </div>
                <Button size="sm" disabled={!userDirty || savingUser} onClick={handleSaveUserRoles}>
                  <UsersIcon />
                  Lưu role
                </Button>
              </div>

              <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
                <div className="rounded-lg border">
                  <div className="border-b px-3 py-2 text-sm font-semibold">Role được gán</div>
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

                <div className="rounded-lg border">
                  <div className="border-b px-3 py-2 text-sm font-semibold">Permission hiệu lực</div>
                  <div className="flex flex-wrap gap-2 p-3">
                    {(selectedUser?.permissionSlugs ?? []).map((slug) => (
                      <Badge key={slug} variant="secondary" className="font-normal">
                        {slug}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
