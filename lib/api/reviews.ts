import { apiFetch } from '@/lib/api/client';
import { toPage } from '@/lib/api/public/products';
import type { Page } from '@/types/pagination';

export interface Review {
  id: number;
  productId: number;
  userId: number;
  userName: string | null;
  orderId: number;
  rating: number;
  comment: string | null;
  images: string[] | null;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface ReviewStats {
  productId: number;
  averageRating: number;
  total: number;
  fiveStars: number;
  fourStars: number;
  threeStars: number;
  twoStars: number;
  oneStar: number;
}

export interface CreateReviewInput {
  productId: number;
  orderId: number;
  rating: number;
  comment?: string;
  images?: string[];
}

export async function getProductReviews(productId: number): Promise<Page<Review>> {
  const res = await apiFetch<Parameters<typeof toPage<Review>>[0]>(
    `/api/products/${productId}/reviews?status=approved&size=20`,
  );
  return toPage(res);
}

export async function getProductReviewStats(productId: number): Promise<ReviewStats> {
  const res = await apiFetch<{ data: ReviewStats }>(`/api/products/${productId}/reviews/stats`);
  return res.data;
}

export async function createReview(input: CreateReviewInput): Promise<Review> {
  const res = await apiFetch<{ data: Review }>('/api/reviews', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return res.data;
}

export async function reportReview(reviewId: number, reason: string): Promise<void> {
  await apiFetch(`/api/reviews/${reviewId}/report`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}
