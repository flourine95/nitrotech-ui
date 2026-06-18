'use client';

import { useDeferredValue, useMemo, useState, useTransition } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import {
  Activity,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Copy,
  Eye,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from '@/components/ui/pagination';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePagination } from '@/hooks/use-pagination';
import { useCopy } from '@/hooks/use-copy';
import { cn } from '@/lib/utils';
import { ApiException } from '@/lib/api/client';
import { getAuditLogs, type AuditLogEntry } from '@/lib/api/admin/audit-logs';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const ACTION_LABELS: Record<string, string> = {
  ROLE_PERMISSION_UPDATED: 'Cập nhật quyền vai trò',
  USER_ROLE_UPDATED: 'Cập nhật vai trò người dùng',
  SHIPMENT_CREATED: 'Tạo vận đơn',
  SHIPMENT_WEBHOOK_RECEIVED: 'Nhận webhook vận đơn',
  ORDER_STATUS_UPDATED: 'Cập nhật trạng thái đơn hàng',
  ORDER_CANCELLED: 'Hủy đơn hàng',
  PRODUCT_CREATED: 'Tạo sản phẩm',
  PRODUCT_UPDATED: 'Cập nhật sản phẩm',
  PRODUCT_DELETED: 'Xóa sản phẩm',
};

const RESOURCE_LABELS: Record<string, string> = {
  ROLE: 'Vai trò',
  USER: 'Thành viên',
  SHIPMENT: 'Vận đơn',
  PRODUCT: 'Sản phẩm',
  ORDER: 'Đơn hàng',
};

const OUTCOME_LABELS: Record<string, string> = {
  SUCCESS: 'Thành công',
  FAILED: 'Thất bại',
  DENIED: 'Bị từ chối',
};

const dateTimeFormatter = new Intl.DateTimeFormat('vi-VN', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

function errorMessage(error: unknown) {
  return error instanceof ApiException ? error.error.message : 'Có lỗi xảy ra';
}

function actionLabel(action: string) {
  return ACTION_LABELS[action] ?? action;
}

function resourceLabel(resource: string) {
  return RESOURCE_LABELS[resource] ?? resource;
}

function outcomeLabel(outcome: string) {
  return OUTCOME_LABELS[outcome] ?? outcome;
}

function actorLabel(log: AuditLogEntry) {
  if (log.actorEmail) return log.actorEmail;
  if (log.actorType === 'WEBHOOK') return 'Webhook hệ thống';
  if (log.actorType === 'SYSTEM') return 'Hệ thống tự động';
  return log.actorType;
}

function actorTypeLabel(type: string) {
  if (type === 'ADMIN') return 'Quản trị viên';
  if (type === 'USER') return 'Người dùng';
  if (type === 'WEBHOOK') return 'Webhook';
  if (type === 'SYSTEM') return 'Hệ thống';
  return type;
}

function formatDateTime(value: string) {
  return dateTimeFormatter.format(new Date(value));
}

function compactJson(value: Record<string, unknown> | null) {
  if (!value || !Object.keys(value).length) return 'Không có dữ liệu';
  return JSON.stringify(value, null, 2);
}

function outcomeVariant(outcome: string): 'default' | 'secondary' | 'outline' | 'destructive' {
  if (outcome === 'SUCCESS') return 'secondary';
  if (outcome === 'DENIED' || outcome === 'FAILED') return 'destructive';
  return 'outline';
}

function getLogSummary(log: AuditLogEntry): string {
  const resourceName = RESOURCE_LABELS[log.resourceType] ?? log.resourceType;
  const resourceIdStr = log.resourceId ? `#${log.resourceId}` : '';

  switch (log.action) {
    case 'ROLE_PERMISSION_UPDATED': {
      const roleSlug = log.metadata?.roleSlug ?? '';
      return `Cập nhật quyền cho vai trò ${roleSlug ? `'${roleSlug}'` : `ID ${log.resourceId}`}.`;
    }
    case 'USER_ROLE_UPDATED': {
      const targetEmail = log.metadata?.targetEmail ?? '';
      return `Cập nhật vai trò của thành viên ${targetEmail ? `'${targetEmail}'` : `ID ${log.resourceId}`}.`;
    }
    case 'SHIPMENT_CREATED': {
      const orderId = log.metadata?.orderId ?? '';
      const carrier = log.metadata?.carrier ?? '';
      return `Tạo vận đơn ${resourceIdStr}${orderId ? ` cho đơn hàng #${orderId}` : ''}${carrier ? ` qua đơn vị ${carrier}` : ''}.`;
    }
    case 'SHIPMENT_WEBHOOK_RECEIVED': {
      const orderId = log.metadata?.orderId ?? '';
      const status = log.metadata?.status ?? '';
      return `Nhận webhook cập nhật trạng thái vận đơn ${resourceIdStr}${orderId ? ` (Đơn hàng #${orderId})` : ''}${status ? ` - Trạng thái: ${status}` : ''}.`;
    }
    case 'ORDER_STATUS_UPDATED': {
      const fromStatus = log.beforeData?.status ?? '';
      const toStatus = log.afterData?.status ?? '';
      return `Cập nhật trạng thái đơn hàng ${resourceIdStr}${fromStatus ? ` từ '${fromStatus}'` : ''}${toStatus ? ` sang '${toStatus}'` : ''}.`;
    }
    case 'ORDER_CANCELLED': {
      return `Đã hủy đơn hàng ${resourceIdStr}.`;
    }
    case 'PRODUCT_CREATED': {
      const name = log.afterData?.name ?? '';
      return `Tạo mới sản phẩm ${resourceIdStr}${name ? `: "${name}"` : ''}.`;
    }
    case 'PRODUCT_UPDATED': {
      const name = log.afterData?.name ?? log.beforeData?.name ?? '';
      return `Cập nhật thông tin sản phẩm ${resourceIdStr}${name ? `: "${name}"` : ''}.`;
    }
    case 'PRODUCT_DELETED': {
      const name = log.beforeData?.name ?? '';
      return `Xóa sản phẩm ${resourceIdStr}${name ? `: "${name}"` : ''}.`;
    }
    default:
      return `${actionLabel(log.action)} đối với ${resourceName.toLowerCase()} ${resourceIdStr}.`;
  }
}

const ShortenedCorrelationId = ({ id }: { id: string }) => {
  const { copied, copy } = useCopy();
  return (
    <div className="flex items-center gap-1.5 font-mono text-xs" onClick={(e) => e.stopPropagation()}>
      <span className="truncate max-w-16" title={id}>{id.substring(0, 8)}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground"
        onClick={() => {
          copy(id, id);
          toast.success('Đã sao chép mã truy vết');
        }}
      >
        {copied === id ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
      </Button>
    </div>
  );
};

export default function AuditLogsPage() {
  const [actor, setActor] = useQueryState('actor', parseAsString.withDefault(''));
  const [correlationId, setCorrelationId] = useQueryState('correlationId', parseAsString.withDefault(''));
  const [resourceId, setResourceId] = useQueryState('resourceId', parseAsString.withDefault(''));
  const [action, setAction] = useQueryState('action', parseAsString.withDefault('all'));
  const [resourceType, setResourceType] = useQueryState('resourceType', parseAsString.withDefault('all'));
  const [outcome, setOutcome] = useQueryState('outcome', parseAsString.withDefault('all'));
  const [sortBy, setSortBy] = useQueryState('sortBy', parseAsString.withDefault('createdAt'));
  const [sortDir, setSortDir] = useQueryState('sortDir', parseAsString.withDefault('desc'));
  const [currentPage, setCurrentPage] = useQueryState('page', parseAsInteger.withDefault(0));
  const [pageSize, setPageSize] = useQueryState('size', parseAsInteger.withDefault(20));

  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  const [isPending, startTransition] = useTransition();
  const deferredActor = useDeferredValue(actor);
  const deferredCorrelationId = useDeferredValue(correlationId);
  const deferredResourceId = useDeferredValue(resourceId);

  const queryParams = useMemo(() => ({
    actor: deferredActor.trim() || undefined,
    action: action === 'all' ? undefined : action,
    resourceType: resourceType === 'all' ? undefined : resourceType,
    outcome: outcome === 'all' ? undefined : outcome,
    correlationId: deferredCorrelationId.trim() || undefined,
    resourceId: deferredResourceId.trim() || undefined,
    sortBy: sortBy || undefined,
    sortDir: sortDir || undefined,
    page: currentPage,
    size: pageSize,
  }), [
    deferredActor,
    action,
    resourceType,
    outcome,
    deferredCorrelationId,
    deferredResourceId,
    sortBy,
    sortDir,
    currentPage,
    pageSize,
  ]);

  const auditQuery = useQuery({
    queryKey: ['audit-logs', queryParams],
    queryFn: () => getAuditLogs(queryParams),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });

  const logs = auditQuery.data?.data ?? [];
  const meta = auditQuery.data?.meta;
  const facets = auditQuery.data?.facets;

  const actionsList = useMemo(() => {
    if (facets?.actions && facets.actions.length > 0) {
      return facets.actions;
    }
    return Object.keys(ACTION_LABELS);
  }, [facets?.actions]);

  const resourceTypesList = useMemo(() => {
    if (facets?.resourceTypes && facets.resourceTypes.length > 0) {
      return facets.resourceTypes;
    }
    return Object.keys(RESOURCE_LABELS);
  }, [facets?.resourceTypes]);

  const outcomesList = useMemo(() => {
    if (facets?.outcomes && facets.outcomes.length > 0) {
      return facets.outcomes;
    }
    return Object.keys(OUTCOME_LABELS);
  }, [facets?.outcomes]);

  const totalElements = meta?.totalElements ?? 0;
  const totalPages = meta?.totalPages ?? 0;

  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage: currentPage + 1,
    totalPages,
    paginationItemsToDisplay: 5,
  });

  if (auditQuery.isError) {
    toast.error(errorMessage(auditQuery.error));
  }

  const from = totalElements === 0 ? 0 : currentPage * pageSize + 1;
  const to = Math.min((currentPage + 1) * pageSize, totalElements);

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Nhật ký hoạt động</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {meta ? `${meta.totalElements} sự kiện` : 'Theo dõi nhật ký hoạt động hệ thống và các thay đổi dữ liệu'}
          </p>
        </div>
        <Button variant="outline" size="sm" className="h-9" onClick={() => auditQuery.refetch()}>
          <RefreshCw className="mr-1.5 h-4 w-4" />
          Làm mới
        </Button>
      </div>

      {/* Toolbar: searches + dropdown filters */}
      <div className="flex flex-col gap-3">
        {/* Row 1: Search Inputs */}
        <div className="grid gap-2 md:grid-cols-3">
          {/* Search Actor */}
          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={actor}
              onChange={(e) => {
                const val = e.target.value;
                startTransition(() => {
                  void setActor(val);
                  void setCurrentPage(0);
                });
              }}
              placeholder="Tìm theo tác nhân (email hoặc ID)..."
              className="h-9 pl-9 pr-8"
            />
            {actor && (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Xóa tìm kiếm"
                onClick={() => {
                  startTransition(() => {
                    void setActor('');
                    void setCurrentPage(0);
                  });
                }}
                className="absolute inset-y-0 right-1 my-auto size-7"
              >
                <X className="size-4" />
              </Button>
            )}
          </div>

          {/* Search Correlation ID */}
          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={correlationId}
              onChange={(e) => {
                const val = e.target.value;
                startTransition(() => {
                  void setCorrelationId(val);
                  void setCurrentPage(0);
                });
              }}
              placeholder="Tìm theo mã truy vết (correlation_id)..."
              className="h-9 pl-9 pr-8"
            />
            {correlationId && (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Xóa tìm kiếm"
                onClick={() => {
                  startTransition(() => {
                    void setCorrelationId('');
                    void setCurrentPage(0);
                  });
                }}
                className="absolute inset-y-0 right-1 my-auto size-7"
              >
                <X className="size-4" />
              </Button>
            )}
          </div>

          {/* Search Resource ID */}
          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={resourceId}
              onChange={(e) => {
                const val = e.target.value;
                startTransition(() => {
                  void setResourceId(val);
                  void setCurrentPage(0);
                });
              }}
              placeholder="Tìm theo ID đối tượng (resource_id)..."
              className="h-9 pl-9 pr-8"
            />
            {resourceId && (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Xóa tìm kiếm"
                onClick={() => {
                  startTransition(() => {
                    void setResourceId('');
                    void setCurrentPage(0);
                  });
                }}
                className="absolute inset-y-0 right-1 my-auto size-7"
              >
                <X className="size-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Row 2: Select Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={action}
            onValueChange={(val) => {
              startTransition(() => {
                void setAction(val);
                void setCurrentPage(0);
              });
            }}
          >
            <SelectTrigger className="h-9 w-[190px]">
              <SelectValue placeholder="Tất cả hành động" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả hành động</SelectItem>
              {actionsList.map((value) => (
                <SelectItem key={value} value={value}>
                  {ACTION_LABELS[value] ?? value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={resourceType}
            onValueChange={(val) => {
              startTransition(() => {
                void setResourceType(val);
                void setCurrentPage(0);
              });
            }}
          >
            <SelectTrigger className="h-9 w-[170px]">
              <SelectValue placeholder="Tất cả đối tượng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả đối tượng</SelectItem>
              {resourceTypesList.map((value) => (
                <SelectItem key={value} value={value}>
                  {RESOURCE_LABELS[value] ?? value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={outcome}
            onValueChange={(val) => {
              startTransition(() => {
                void setOutcome(val);
                void setCurrentPage(0);
              });
            }}
          >
            <SelectTrigger className="h-9 w-[150px]">
              <SelectValue placeholder="Tất cả kết quả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả kết quả</SelectItem>
              {outcomesList.map((value) => (
                <SelectItem key={value} value={value}>
                  {OUTCOME_LABELS[value] ?? value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={`${sortBy},${sortDir}`}
            onValueChange={(val) => {
              const [by, dir] = val.split(',');
              startTransition(() => {
                void setSortBy(by);
                void setSortDir(dir);
                void setCurrentPage(0);
              });
            }}
          >
            <SelectTrigger className="h-9 w-[185px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt,desc">Thời gian: Mới nhất</SelectItem>
              <SelectItem value="createdAt,asc">Thời gian: Cũ nhất</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bảng nhật ký */}
      <div
        className={cn(
          'rounded-md border bg-card transition-opacity duration-150',
          (auditQuery.isFetching && !auditQuery.isLoading) || isPending ? 'opacity-60' : 'opacity-100',
        )}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Thời gian</TableHead>
              <TableHead>Người thực hiện</TableHead>
              <TableHead>Hành động</TableHead>
              <TableHead>Đối tượng</TableHead>
              <TableHead>Kết quả</TableHead>
              <TableHead>Tóm tắt</TableHead>
              <TableHead>Mã truy vết</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {auditQuery.isLoading ? (
              Array.from({ length: pageSize }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-60" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                </TableRow>
              ))
            ) : logs.length ? (
              logs.map((log) => (
                <TableRow
                  key={log.id}
                  className="align-top cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedLog(log)}
                >
                  {/* Thời gian */}
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {formatDateTime(log.createdAt)}
                  </TableCell>

                  {/* Người thực hiện */}
                  <TableCell>
                    <div className="min-w-36">
                      <p className="text-sm font-medium">{actorLabel(log)}</p>
                      <p className="font-mono text-[10px] text-muted-foreground">{log.actorType}</p>
                    </div>
                  </TableCell>

                  {/* Hành động */}
                  <TableCell>
                    <div className="min-w-40">
                      <p className="text-sm font-medium">{actionLabel(log.action)}</p>
                      <p className="font-mono text-[10px] text-muted-foreground">{log.action}</p>
                    </div>
                  </TableCell>

                  {/* Đối tượng */}
                  <TableCell>
                    <div className="min-w-24 text-sm">
                      <p className="font-medium">{resourceLabel(log.resourceType)}</p>
                      {log.resourceId ? (
                        <p className="font-mono text-[10px] text-muted-foreground">#{log.resourceId}</p>
                      ) : (
                        <p className="font-mono text-[10px] text-muted-foreground">{log.resourceType}</p>
                      )}
                    </div>
                  </TableCell>

                  {/* Kết quả */}
                  <TableCell>
                    <div className="flex flex-col items-start gap-1">
                      <Badge variant={outcomeVariant(log.outcome)} className="text-xs">
                        {outcomeLabel(log.outcome)}
                      </Badge>
                      <p className="font-mono text-[10px] text-muted-foreground self-center w-full text-left pl-1">
                        {log.outcome}
                      </p>
                    </div>
                  </TableCell>

                  {/* Tóm tắt */}
                  <TableCell className="text-sm text-foreground max-w-[280px] truncate" title={getLogSummary(log)}>
                    {getLogSummary(log)}
                  </TableCell>

                  {/* Mã truy vết */}
                  <TableCell>
                    <ShortenedCorrelationId id={log.correlationId} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  <Activity className="mx-auto mb-2 h-8 w-8 opacity-40" />
                  Không tìm thấy nhật ký tương ứng.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Footer */}
        {!auditQuery.isLoading && !auditQuery.isError && (
          <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <p className="text-sm whitespace-nowrap text-muted-foreground">
                {totalElements > 0 ? `${from}–${to} / ${totalElements} sự kiện` : '0 kết quả'}
              </p>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-2">
                <span className="text-sm whitespace-nowrap text-muted-foreground">Mỗi trang</span>
                <Select
                  value={String(pageSize)}
                  onValueChange={(v) => {
                    startTransition(() => {
                      void setPageSize(Number(v));
                      void setCurrentPage(0);
                    });
                  }}
                >
                  <SelectTrigger className="h-8 w-16">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_SIZE_OPTIONS.map((s) => (
                      <SelectItem key={s} value={String(s)}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        startTransition(() => {
                          void setCurrentPage(Math.max(0, currentPage - 1));
                        })
                      }
                      disabled={currentPage === 0}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" /> Trước
                    </Button>
                  </PaginationItem>
                  {showLeftEllipsis && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                  {pages.map((page) => (
                    <PaginationItem key={page}>
                      <Button
                        size="icon"
                        className="h-9 w-9"
                        variant={page === currentPage + 1 ? 'default' : 'outline'}
                        onClick={() =>
                          startTransition(() => {
                            void setCurrentPage(page - 1);
                          })
                        }
                      >
                        {page}
                      </Button>
                    </PaginationItem>
                  ))}
                  {showRightEllipsis && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                  <PaginationItem>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        startTransition(() => {
                          void setCurrentPage(Math.min(totalPages - 1, currentPage + 1));
                        })
                      }
                      disabled={currentPage >= totalPages - 1}
                    >
                      Sau <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        )}
      </div>

      {/* Drawer Chi tiết Nhật ký */}
      <Sheet open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <SheetContent className="flex flex-col gap-0 p-0 sm:max-w-xl md:max-w-2xl w-full">
          <SheetHeader className="border-b px-6 py-4">
            <SheetTitle>Chi tiết nhật ký hoạt động</SheetTitle>
            <SheetDescription>
              Xem thông tin chi tiết và dữ liệu thô (JSON) của sự kiện hệ thống.
            </SheetDescription>
          </SheetHeader>

          {selectedLog && (
            <div className="flex-1 overflow-y-auto p-6">
              <Tabs defaultValue="summary" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="summary">Tóm tắt</TabsTrigger>
                  <TabsTrigger value="json">JSON thô</TabsTrigger>
                </TabsList>

                {/* Tab: Tóm tắt */}
                <TabsContent value="summary" className="space-y-4 pt-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-[140px_1fr] items-start gap-2 text-sm border-b pb-3">
                      <span className="font-medium text-muted-foreground">Thời gian:</span>
                      <span>{formatDateTime(selectedLog.createdAt)}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] items-start gap-2 text-sm border-b pb-3">
                      <span className="font-medium text-muted-foreground">Người thực hiện:</span>
                      <div>
                        <span className="font-medium">{actorLabel(selectedLog)}</span>
                        <span className="text-muted-foreground text-xs ml-1.5">({actorTypeLabel(selectedLog.actorType)})</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] items-start gap-2 text-sm border-b pb-3">
                      <span className="font-medium text-muted-foreground">Hành động:</span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-medium">{actionLabel(selectedLog.action)}</span>
                        <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-mono">{selectedLog.action}</code>
                      </div>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] items-start gap-2 text-sm border-b pb-3">
                      <span className="font-medium text-muted-foreground">Đối tượng:</span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-medium">{resourceLabel(selectedLog.resourceType)}</span>
                        {selectedLog.resourceId && (
                          <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-mono">#{selectedLog.resourceId}</code>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] items-start gap-2 text-sm border-b pb-3">
                      <span className="font-medium text-muted-foreground">Kết quả:</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={outcomeVariant(selectedLog.outcome)}>{outcomeLabel(selectedLog.outcome)}</Badge>
                        <span className="font-mono text-xs text-muted-foreground">({selectedLog.outcome})</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] items-start gap-2 text-sm border-b pb-3 col-span-2">
                      <span className="font-medium text-muted-foreground">Nội dung tóm tắt:</span>
                      <span className="text-foreground leading-relaxed font-medium">{getLogSummary(selectedLog)}</span>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] items-start gap-2 text-sm border-b pb-3">
                      <span className="font-medium text-muted-foreground">Mã truy vết (correlation):</span>
                      <div className="flex items-center gap-1.5 font-mono text-xs">
                        <span className="break-all">{selectedLog.correlationId}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-foreground"
                          onClick={() => {
                            navigator.clipboard.writeText(selectedLog.correlationId);
                            toast.success('Đã sao chép mã truy vết');
                          }}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    {selectedLog.ipAddress && (
                      <div className="grid grid-cols-[140px_1fr] items-start gap-2 text-sm border-b pb-3">
                        <span className="font-medium text-muted-foreground">Địa chỉ IP:</span>
                        <span className="font-mono">{selectedLog.ipAddress}</span>
                      </div>
                    )}
                    {selectedLog.userAgent && (
                      <div className="grid grid-cols-[140px_1fr] items-start gap-2 text-sm pb-3">
                        <span className="font-medium text-muted-foreground">Thiết bị (User-Agent):</span>
                        <span className="text-xs text-muted-foreground font-mono break-all leading-normal">{selectedLog.userAgent}</span>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Tab: JSON thô */}
                <TabsContent value="json" className="space-y-4 pt-4 max-h-[65vh] overflow-y-auto pr-1">
                  <div className="space-y-4">
                    <JsonBlock title="before_data" value={selectedLog.beforeData} />
                    <JsonBlock title="after_data" value={selectedLog.afterData} />
                    <JsonBlock title="metadata" value={selectedLog.metadata} />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function JsonBlock({ title, value }: { title: string; value: Record<string, unknown> | null }) {
  return (
    <div className="rounded-md border bg-muted/40 p-2.5">
      <p className="mb-1.5 text-xs font-semibold text-muted-foreground font-mono">{title}</p>
      <pre className="max-h-60 overflow-auto whitespace-pre-wrap font-mono text-[11px] text-foreground/80 leading-relaxed bg-background/50 p-2 rounded border">
        {compactJson(value)}
      </pre>
    </div>
  );
}
