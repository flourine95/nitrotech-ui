import { apiFetch } from '@/lib/client';
import type {
  Promotion,
  PromotionValidationResult,
  PromotionValidationResponse,
  PromotionListResponse,
} from '@/lib/types/promotion';
import type { ValidatePromotionData } from '@/lib/schemas/promotion';

// POST /api/promotions/validate - Validate promotion code
export async function validatePromotion(
  data: ValidatePromotionData
): Promise<PromotionValidationResult> {
  const res = await apiFetch<PromotionValidationResponse>('/api/promotions/validate', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.data;
}

// GET /api/promotions - Get active promotions
export async function getPromotions(params?: {
  page?: number;
  limit?: number;
}): Promise<PromotionListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());

  const query = searchParams.toString();
  return apiFetch<PromotionListResponse>(`/api/promotions${query ? `?${query}` : ''}`);
}
