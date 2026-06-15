import { apiFetch } from '@/lib/api/client';

export interface AuditLogEntry {
  id: number;
  correlationId: string;
  actorType: 'ADMIN' | 'USER' | 'SYSTEM' | 'WEBHOOK' | string;
  actorId: number | null;
  actorEmail: string | null;
  actorRoles: string[];
  action: string;
  resourceType: string;
  resourceId: string | null;
  outcome: 'SUCCESS' | 'FAILED' | 'DENIED' | string;
  beforeData: Record<string, unknown> | null;
  afterData: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface AuditLogParams {
  action?: string;
  actor?: string;
  resourceType?: string;
  outcome?: string;
  correlationId?: string;
  resourceId?: string;
  sortBy?: string;
  sortDir?: string;
  page?: number;
  size?: number;
}

export interface PageMeta {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface AuditLogFacets {
  actions: string[];
  resourceTypes: string[];
  outcomes: string[];
}

interface ApiResult<T> {
  data: T;
  meta?: PageMeta;
  facets?: AuditLogFacets;
}

export async function getAuditLogs(params: AuditLogParams = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  const res = await apiFetch<ApiResult<AuditLogEntry[]>>(`/api/admin/audit-logs${query ? `?${query}` : ''}`);
  return {
    data: res.data,
    meta: res.meta ?? {
      page: params.page ?? 0,
      size: params.size ?? 20,
      totalElements: res.data.length,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
    },
    facets: res.facets ?? {
      actions: [],
      resourceTypes: [],
      outcomes: [],
    },
  };
}
