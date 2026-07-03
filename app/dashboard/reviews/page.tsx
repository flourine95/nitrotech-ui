'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckIcon, XIcon } from 'lucide-react';
import { toast } from 'sonner';
import { ProductRating } from '@/components/product-rating';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  approveReview,
  getAdminReviews,
  rejectReview,
} from '@/lib/api/admin/reviews';
import type { Review } from '@/lib/api/reviews';

const statuses = [
  { value: 'pending', label: 'Chờ duyệt' },
  { value: 'approved', label: 'Đã duyệt' },
  { value: 'rejected', label: 'Đã từ chối' },
  { value: 'all', label: 'Tất cả' },
];

const statusLabel: Record<Review['status'], string> = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Đã từ chối',
};

export default function ReviewsPage() {
  const [status, setStatus] = useState('pending');
  const queryClient = useQueryClient();
  const reviewsQuery = useQuery({
    queryKey: ['admin-reviews', status],
    queryFn: () => getAdminReviews(status),
  });

  const approveMutation = useMutation({
    mutationFn: approveReview,
    onSuccess: async () => {
      toast.success('Đã duyệt đánh giá');
      await queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: rejectReview,
    onSuccess: async () => {
      toast.success('Đã từ chối đánh giá');
      await queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
    },
  });

  const reviews = reviewsQuery.data?.content ?? [];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Đánh giá sản phẩm</h1>
          <p className="text-sm text-muted-foreground">Duyệt đánh giá khách hàng trước khi hiển thị.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {statuses.map((item) => (
            <Button
              key={item.value}
              type="button"
              variant={status === item.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatus(item.value)}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="grid grid-cols-[1fr_120px_160px] gap-4 border-b border-border px-4 py-3 text-xs font-medium text-muted-foreground">
          <div>Nội dung</div>
          <div>Trạng thái</div>
          <div className="text-right">Thao tác</div>
        </div>
        {reviewsQuery.isLoading && (
          <div className="px-4 py-10 text-center text-sm text-muted-foreground">Đang tải đánh giá...</div>
        )}
        {!reviewsQuery.isLoading && reviews.length === 0 && (
          <div className="px-4 py-10 text-center text-sm text-muted-foreground">Không có đánh giá.</div>
        )}
        {reviews.map((review) => (
          <div
            key={review.id}
            className="grid grid-cols-[1fr_120px_160px] gap-4 border-b border-border px-4 py-4 last:border-b-0"
          >
            <div className="min-w-0">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  {review.userName ?? `User #${review.userId}`}
                </span>
                <ProductRating rating={review.rating} showReviews={false} size="sm" />
                <span className="text-xs text-muted-foreground">
                  Product #{review.productId} · Order #{review.orderId}
                </span>
              </div>
              <p className="line-clamp-3 text-sm text-muted-foreground">
                {review.comment || 'Không có nội dung'}
              </p>
            </div>
            <div>
              <Badge variant={review.status === 'rejected' ? 'destructive' : 'outline'}>
                {statusLabel[review.status]}
              </Badge>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label="Duyệt đánh giá"
                disabled={approveMutation.isPending || review.status === 'approved'}
                onClick={() => approveMutation.mutate(review.id)}
              >
                <CheckIcon />
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="icon-sm"
                aria-label="Từ chối đánh giá"
                disabled={rejectMutation.isPending || review.status === 'rejected'}
                onClick={() => rejectMutation.mutate(review.id)}
              >
                <XIcon />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
