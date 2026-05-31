import { apiFetch } from '@/lib/api/client';
import type { PromotionValidationResult, PromotionValidationResponse } from '@/types/promotion';
import type { ValidatePromotionData } from '@/schemas/promotion';

// GET /api/promotions/validate - Validate promotion code
export async function validatePromotion(
  data: ValidatePromotionData
): Promise<PromotionValidationResult> {
  const params = new URLSearchParams({
    code: data.code,
    orderAmount: String(data.orderAmount),
  });
  const res = await apiFetch<PromotionValidationResponse>(`/api/promotions/validate?${params}`);
  return res.data;
}
