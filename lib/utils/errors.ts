import { ApiException } from '@/lib/api/client';

export const API_ERROR_MAP: Record<string, string> = {
  // Promotion Errors
  PROMOTION_NOT_FOUND: 'Mã khuyến mãi không tồn tại hoặc đã hết hạn',
  PROMOTION_NOT_APPLICABLE: 'Đơn hàng chưa đủ điều kiện áp dụng mã này',
  PROMOTION_USAGE_LIMIT_REACHED: 'Mã khuyến mãi đã hết lượt sử dụng',
  PROMOTION_USER_LIMIT_REACHED: 'Bạn đã sử dụng hết lượt cho mã này',

  // Cart Errors
  CART_ITEM_NOT_FOUND: 'Sản phẩm không tồn tại trong giỏ hàng',
  INSUFFICIENT_STOCK: 'Không đủ số lượng hàng trong kho',
  CART_EMPTY: 'Giỏ hàng trống',

  // Auth Errors
  EMAIL_NOT_VERIFIED: 'Tài khoản chưa xác thực email',
  INVALID_CREDENTIALS: 'Email hoặc mật khẩu không đúng',
};

function getPromotionMinAmount(data: unknown) {
  if (!data || typeof data !== 'object' || !('minAmount' in data)) return null;

  const minAmount = (data as { minAmount?: unknown }).minAmount;
  return typeof minAmount === 'number' ? minAmount : null;
}

export function getFriendlyErrorMessage(
  error: unknown,
  fallbackMessage = 'Có lỗi xảy ra, vui lòng thử lại'
): string {
  if (!(error instanceof ApiException)) return fallbackMessage;

  const { code, data, message } = error.error;

  if (code === 'PROMOTION_NOT_APPLICABLE') {
    const minAmount = getPromotionMinAmount(data);
    if (minAmount !== null) {
      return `Đơn hàng chưa đủ điều kiện. Tối thiểu: ${minAmount.toLocaleString('vi-VN')} ₫`;
    }
  }

  if (API_ERROR_MAP[code]) {
    return API_ERROR_MAP[code];
  }

  return message || fallbackMessage;
}
