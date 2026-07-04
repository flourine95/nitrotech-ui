'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { createReview } from '@/lib/api/reviews';
import { cn } from '@/lib/utils';

export function OrderReviewButton({
  orderId,
  productId,
  productName,
}: {
  orderId: number;
  productId: number;
  productName: string;
}) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    setSubmitting(true);
    try {
      await createReview({
        orderId,
        productId,
        rating,
        comment: comment.trim() || undefined,
      });
      toast.success('Đã gửi đánh giá, chờ admin duyệt');
      setOpen(false);
    } catch {
      toast.error('Không thể gửi đánh giá');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        Đánh giá
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đánh giá sản phẩm</DialogTitle>
            <DialogDescription>{productName}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex gap-1" aria-label="Chọn số sao">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="rounded-md p-1 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => setRating(star)}
                  aria-label={`${star} sao`}
                >
                  <Star
                    className={cn(
                      'size-6',
                      star <= rating ? 'fill-yellow-500 text-yellow-500' : 'fill-muted text-muted',
                    )}
                  />
                </button>
              ))}
            </div>
            <Textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn"
              maxLength={2000}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button type="button" onClick={() => void submit()} disabled={submitting}>
              Gửi đánh giá
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
