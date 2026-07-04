import { apiFetch } from '@/lib/api/client';
import { toPage } from '@/lib/api/public/products';
import type { Review } from '@/lib/api/reviews';
import type { Page } from '@/types/pagination';

export async function getAdminReviews(status?: string): Promise<Page<Review>> {
  const q = new URLSearchParams();
  if (status && status !== 'all') q.set('status', status);
  const qs = q.toString() ? `?${q}` : '';
  const res = await apiFetch<Parameters<typeof toPage<Review>>[0]>(`/api/admin/reviews${qs}`);
  return toPage(res);
}

export async function approveReview(id: number): Promise<Review> {
  const res = await apiFetch<{ data: Review }>(`/api/admin/reviews/${id}/approve`, {
    method: 'PATCH',
  });
  return res.data;
}

export async function rejectReview(id: number): Promise<Review> {
  const res = await apiFetch<{ data: Review }>(`/api/admin/reviews/${id}/reject`, {
    method: 'PATCH',
  });
  return res.data;
}
