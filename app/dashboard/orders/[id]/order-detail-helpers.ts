import type { AuditLogEntry } from '@/lib/api/admin/audit-logs';
import type { AdminOrderStatus } from '@/lib/api/admin/orders';
import { orderStatusConfig } from '../order-display';

export function auditSummary(log: AuditLogEntry) {
  const beforeStatus = typeof log.beforeData?.status === 'string' ? log.beforeData.status : null;
  const afterStatus = typeof log.afterData?.status === 'string' ? log.afterData.status : null;
  const reason = typeof log.metadata?.reason === 'string' ? log.metadata.reason : null;
  const note = typeof log.metadata?.note === 'string' ? log.metadata.note : null;

  if (log.action === 'ORDER_STATUS_UPDATED') {
    const from = beforeStatus ? (orderStatusConfig[beforeStatus as AdminOrderStatus]?.label ?? beforeStatus) : null;
    const to = afterStatus ? (orderStatusConfig[afterStatus as AdminOrderStatus]?.label ?? afterStatus) : null;
    return {
      title: from && to ? `Đổi trạng thái từ ${from} sang ${to}` : 'Cập nhật trạng thái đơn',
      detail: reason ?? note,
    };
  }

  return {
    title: log.action,
    detail: reason ?? note,
  };
}
