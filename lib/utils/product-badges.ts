export type ProductBadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

const BADGE_LABELS: Record<string, string> = {
  new: 'Mới',
  bestseller: 'Bán chạy',
  lowstock: 'Sắp hết hàng',
  preorder: 'Đặt trước',
  sale: 'Khuyến mãi',
  hot: 'Nổi bật',
};

const BADGE_VARIANTS: Record<string, ProductBadgeVariant> = {
  new: 'secondary',
  bestseller: 'default',
  lowstock: 'destructive',
  preorder: 'outline',
  sale: 'destructive',
  hot: 'default',
};

export function getProductBadgeLabel(badge: string) {
  return BADGE_LABELS[normalizeBadge(badge)] ?? badge;
}

export function getProductBadgeVariant(badge: string): ProductBadgeVariant {
  return BADGE_VARIANTS[normalizeBadge(badge)] ?? 'secondary';
}

function normalizeBadge(badge: string) {
  return badge.trim().toLowerCase();
}
