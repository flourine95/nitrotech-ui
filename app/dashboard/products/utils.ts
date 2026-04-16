export const PAGE_SIZE = 20;

const priceFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

export function formatPrice(min: number | null, max: number | null): string {
  if (min === null) return '—';
  return min === max
    ? priceFormatter.format(min)
    : `${priceFormatter.format(min)} – ${priceFormatter.format(max!)}`;
}

export function formatVariantPrice(price: number): string {
  return priceFormatter.format(price);
}
