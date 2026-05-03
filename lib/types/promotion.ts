import type { DiscountType } from '../schemas/promotion';

export interface Promotion {
  id: number;
  code: string;
  description: string | null;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount: number;
  usageLimit: number | null;
  usagePerUser: number;
  startAt: string;
  endAt: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PromotionValidationResult {
  code: string;
  description: string | null;
  discountType: DiscountType;
  discountValue: number;
  discountAmount: number;
  minOrderAmount: number;
  finalAmount: number;
}

export interface PromotionValidationResponse {
  data: PromotionValidationResult;
  message: string;
}

export interface PromotionListResponse {
  data: Promotion[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
