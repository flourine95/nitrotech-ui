import type { Product } from '@/lib/api/products';

export const PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
export type PageSizeOption = (typeof PAGE_SIZE_OPTIONS)[number];

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

// ── Sort options ──────────────────────────────────────────────────────────────

export const SORT_OPTIONS = [
  { value: 'createdAt,desc', label: 'Mới nhất' },
  { value: 'createdAt,asc', label: 'Cũ nhất' },
  { value: 'name,asc', label: 'Tên A → Z' },
  { value: 'name,desc', label: 'Tên Z → A' },
  { value: 'updatedAt,desc', label: 'Cập nhật gần nhất' },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]['value'];

export const SORT_VALUES = SORT_OPTIONS.map((o) => o.value) as SortValue[];

// ── CSV export ────────────────────────────────────────────────────────────────

function escapeCsv(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return '';
  const s = String(val);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function productsToCSV(products: Product[]): string {
  const headers = [
    'ID',
    'Tên',
    'Slug',
    'Danh mục',
    'Thương hiệu',
    'Giá min',
    'Giá max',
    'Số variants',
    'Trạng thái',
    'Ngày tạo',
  ];
  const rows = products.map((p) => [
    p.id,
    p.name,
    p.slug,
    p.categoryName ?? '',
    p.brandName ?? '',
    p.priceMin ?? '',
    p.priceMax ?? '',
    p.variantCount,
    p.active ? 'Hiển thị' : 'Ẩn',
    new Date(p.createdAt).toLocaleDateString('vi-VN'),
  ]);
  return [headers, ...rows].map((r) => r.map(escapeCsv).join(',')).join('\n');
}

export function downloadCSV(content: string, filename: string) {
  const bom = '\uFEFF'; // UTF-8 BOM for Excel
  const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── CSV import parse ──────────────────────────────────────────────────────────

export interface ParsedImportRow {
  row: number;
  name: string;
  slug: string;
  categoryId: number;
  brandId?: number;
  description?: string;
  thumbnail?: string;
  active: boolean;
  error?: string;
}

export function parseImportCSV(text: string): ParsedImportRow[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  // skip header row
  return lines.slice(1).map((line, i) => {
    const cols = line.split(',').map((c) => c.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
    const [name, slug, categoryIdStr, brandIdStr, description, thumbnail, activeStr] = cols;
    const categoryId = Number(categoryIdStr);
    const errors: string[] = [];
    if (!name) errors.push('Thiếu tên');
    if (!slug) errors.push('Thiếu slug');
    if (!categoryId || isNaN(categoryId)) errors.push('categoryId không hợp lệ');
    return {
      row: i + 2,
      name: name ?? '',
      slug: slug ?? '',
      categoryId,
      brandId: brandIdStr ? Number(brandIdStr) : undefined,
      description: description || undefined,
      thumbnail: thumbnail || undefined,
      active: activeStr?.toLowerCase() !== 'false',
      error: errors.length > 0 ? errors.join(', ') : undefined,
    };
  });
}
