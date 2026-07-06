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
  ACCOUNT_INACTIVE: 'Tài khoản chưa được kích hoạt. Vui lòng xác thực email.',
  ACCOUNT_SUSPENDED: 'Tài khoản của bạn đã bị tạm khóa. Vui lòng liên hệ quản trị viên.',
  ACCOUNT_BANNED: 'Tài khoản của bạn đã bị khóa vĩnh viễn.',
  INVALID_CREDENTIALS: 'Email hoặc mật khẩu không đúng',
  EMAIL_ALREADY_EXISTS: 'Email đã được đăng ký',
  EMAIL_NOT_FOUND: 'Không tìm thấy tài khoản với email này',
  USER_NOT_FOUND: 'Không tìm thấy người dùng',
  ROLE_NOT_FOUND: 'Một hoặc nhiều vai trò không tồn tại',
  PERMISSION_NOT_FOUND: 'Một hoặc nhiều quyền không tồn tại',
  SELF_LOCKOUT_GUARD: 'Không thể tự gỡ quyền quản trị quan trọng của chính mình',
  SELF_STATUS_CHANGE: 'Không thể tự khóa tài khoản của chính mình',
  SYSTEM_ROLE_PROTECTED: 'Không thể chỉnh sửa vai trò hệ thống',
  INVALID_RESET_TOKEN: 'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn',
  INVALID_VERIFICATION_TOKEN: 'Liên kết xác thực email không hợp lệ hoặc đã hết hạn',
  VALIDATION_ERROR: 'Dữ liệu không hợp lệ',
  INVALID_REQUEST_BODY: 'Dữ liệu gửi lên không hợp lệ',
  AUTH_REQUIRED: 'Vui lòng đăng nhập để tiếp tục',
  NETWORK_ERROR: 'Không thể kết nối đến server. Vui lòng thử lại sau.',
  INTERNAL_ERROR: 'Hệ thống đang gặp lỗi, vui lòng thử lại sau',
  FORBIDDEN: 'Bạn không có quyền thực hiện thao tác này',
  UNAUTHORIZED: 'Vui lòng đăng nhập để tiếp tục',
  INVALID_PARAMETER: 'Tham số không hợp lệ',
  INVALID_SORT_FIELD: 'Tiêu chí sắp xếp không hợp lệ',

  // Admin/domain errors
  ORDER_NOT_FOUND: 'Không tìm thấy đơn hàng',
  ORDER_CANNOT_CANCEL: 'Không thể hủy đơn hàng ở trạng thái hiện tại',
  INVALID_STATUS_TRANSITION: 'Không thể chuyển sang trạng thái này',
  SHIPMENT_NOT_FOUND: 'Không tìm thấy vận đơn',
  SHIPMENT_ALREADY_EXISTS: 'Đơn hàng này đã có vận đơn',
  INVALID_ORDER_STATUS: 'Trạng thái đơn hàng không phù hợp để tạo vận đơn',
  BRAND_NOT_FOUND: 'Không tìm thấy thương hiệu',
  BRAND_HAS_PRODUCTS: 'Không thể xóa thương hiệu đang có sản phẩm',
  BRAND_SLUG_EXISTS: 'Slug thương hiệu đã tồn tại',
  CATEGORY_NOT_FOUND: 'Không tìm thấy danh mục',
  CATEGORY_HAS_CHILDREN: 'Không thể xóa danh mục đang có danh mục con',
  CATEGORY_HAS_PRODUCTS: 'Không thể xóa danh mục đang có sản phẩm',
  CATEGORY_SLUG_EXISTS: 'Slug danh mục đã tồn tại',
  CATEGORY_CIRCULAR_REF: 'Không thể di chuyển danh mục vào chính cây con của nó',
  PRODUCT_NOT_FOUND: 'Không tìm thấy sản phẩm',
  PRODUCT_SLUG_EXISTS: 'Slug sản phẩm đã tồn tại',
  VARIANT_NOT_FOUND: 'Không tìm thấy biến thể',
  VARIANT_SKU_EXISTS: 'SKU đã tồn tại',
  ADDRESS_NOT_FOUND: 'Không tìm thấy địa chỉ',
  ADDRESS_ACCESS_DENIED: 'Bạn không có quyền truy cập địa chỉ này',
  DEFAULT_ADDRESS_CONFLICT: 'Địa chỉ mặc định đã thay đổi, vui lòng thử lại',
  CANNOT_DELETE_DEFAULT_ADDRESS: 'Không thể xóa địa chỉ mặc định',
  REVIEW_NOT_FOUND: 'Không tìm thấy đánh giá',
  REVIEW_ALREADY_EXISTS: 'Bạn đã đánh giá sản phẩm này cho đơn hàng này',
  REVIEW_NOT_ALLOWED: 'Chỉ có thể đánh giá sản phẩm từ đơn đã giao',
  REVIEW_REPORT_ALREADY_EXISTS: 'Bạn đã báo cáo đánh giá này',
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
