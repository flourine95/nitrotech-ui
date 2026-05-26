import { apiFetch } from '@/lib/api/client';
import type { Page } from '@/types/pagination';

export interface ProductVariant {
  id: number;
  productId: number;
  sku: string;
  name: string;
  price: number;
  attributes: Record<string, string>;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: number;
  categoryId: number;
  categoryName: string | null;
  brandId: number | null;
  brandName: string | null;
  name: string;
  slug: string;
  description: string | null;
  thumbnail: string | null;
  specs: Record<string, string> | null;
  active: boolean;
  images: string[];
  variants: ProductVariant[] | null;
  variantCount: number;
  priceMin: number | null;
  priceMax: number | null;
  badge: string | null;
  rating: number | null;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductPickerItem {
  id: number;
  slug: string;
  name: string;
  categoryName: string;
  priceMin: number;
  priceMax: number;
  thumbnail: string | null;
  badge: string | null;
}

export interface CategoryFacet {
  id: number;
  name: string;
  slug: string;
  count: number;
}

export interface BrandFacet {
  id: number;
  name: string;
  slug: string;
  count: number;
}

export interface PriceRangeFacet {
  min: number;
  max: number | null;
  count: number;
}

export interface ProductFacets {
  categories: CategoryFacet[];
  brands: BrandFacet[];
  priceRanges: PriceRangeFacet[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
}

export interface ProductsQuery {
  search?: string;
  category?: string; // category slug
  brand?: string[]; // brand slugs (multi-value)
  minPrice?: number;
  maxPrice?: number;
  badge?: string;
  active?: boolean;
  deleted?: boolean;
  page?: number;
  size?: number;
  sort?: string;
}

export interface ProductSearchQuery {
  search?: string;
  category?: string;
  brand?: string;
  excludeId?: number[];
  limit?: number;
}

export interface ProductFacetsQuery {
  search?: string;
  category?: string;
  brand?: string[];
  minPrice?: number;
  maxPrice?: number;
  active?: boolean;
  badge?: string;
}

export interface CreateVariantBody {
  sku: string;
  name: string;
  price: number;
  attributes?: Record<string, string>;
  active: boolean;
}

export interface CreateProductBody {
  categoryId: number;
  brandId?: number | null;
  name: string;
  slug: string;
  description?: string | null;
  thumbnail?: string | null;
  specs?: Record<string, string> | null;
  active: boolean;
  images?: string[];
  variants?: CreateVariantBody[];
}

export interface UpdateProductBody {
  categoryId?: number;
  brandId?: number | null;
  name?: string;
  slug?: string;
  description?: string | null;
  thumbnail?: string | null;
  specs?: Record<string, string> | null;
  active?: boolean;
  images?: string[];
}

export async function getProducts(query?: ProductsQuery): Promise<Page<Product>> {
  const q = new URLSearchParams();
  if (query?.search?.trim()) q.set('search', query.search.trim());
  if (query?.category) q.set('category', query.category);
  if (query?.brand?.length) {
    query.brand.forEach(b => q.append('brand', b));
  }
  if (query?.minPrice !== undefined && query.minPrice !== null) q.set('minPrice', String(query.minPrice));
  if (query?.maxPrice !== undefined && query.maxPrice !== null) q.set('maxPrice', String(query.maxPrice));
  if (query?.badge) q.set('badge', query.badge);
  if (query?.active !== undefined) q.set('active', String(query.active));
  if (query?.deleted !== undefined) q.set('deleted', String(query.deleted));
  if (query?.page !== undefined) q.set('page', String(query.page));
  if (query?.size !== undefined) q.set('size', String(query.size));
  if (query?.sort) q.set('sort', query.sort);
  const qs = q.toString() ? `?${q}` : '';
  const res = await apiFetch<{ data: Product[]; meta: { page: number; size: number; totalElements: number; totalPages: number; hasNext: boolean; hasPrevious: boolean } }>(`/api/products${qs}`);
  
  // Map API response to Page<Product> format
  return {
    content: res.data,
    last: !res.meta.hasNext,
    totalPages: res.meta.totalPages,
    totalElements: res.meta.totalElements,
    size: res.meta.size,
    number: res.meta.page,
    first: !res.meta.hasPrevious,
    empty: res.data.length === 0,
  };
}

export async function searchProducts(query?: ProductSearchQuery): Promise<ProductPickerItem[]> {
  const q = new URLSearchParams();
  if (query?.search?.trim()) q.set('search', query.search.trim());
  if (query?.category) q.set('category', query.category);
  if (query?.brand) q.set('brand', query.brand);
  if (query?.excludeId?.length) {
    query.excludeId.forEach(id => q.append('excludeId', String(id)));
  }
  if (query?.limit !== undefined) q.set('limit', String(query.limit));
  const qs = q.toString() ? `?${q}` : '';
  const res = await apiFetch<{ data: ProductPickerItem[] }>(`/api/products/search${qs}`);
  return res.data;
}

export async function getProductFacets(query?: ProductFacetsQuery): Promise<ProductFacets> {
  const q = new URLSearchParams();
  if (query?.search?.trim()) q.set('search', query.search.trim());
  if (query?.category) q.set('category', query.category);
  if (query?.brand?.length) {
    query.brand.forEach(b => q.append('brand', b));
  }
  if (query?.minPrice !== undefined && query.minPrice !== null) q.set('minPrice', String(query.minPrice));
  if (query?.maxPrice !== undefined && query.maxPrice !== null) q.set('maxPrice', String(query.maxPrice));
  if (query?.active !== undefined) q.set('active', String(query.active));
  if (query?.badge) q.set('badge', query.badge);
  const qs = q.toString() ? `?${q}` : '';
  const res = await apiFetch<{ data: ProductFacets }>(`/api/products/facets${qs}`);
  return res.data;
}

export async function getProduct(id: number): Promise<Product> {
  const res = await apiFetch<{ data: Product }>(`/api/products/${id}`);
  return res.data;
}

export async function createProduct(body: CreateProductBody): Promise<Product> {
  const res = await apiFetch<{ data: Product; message: string }>('/api/products', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return res.data;
}

export async function updateProduct(id: number, body: UpdateProductBody): Promise<Product> {
  const res = await apiFetch<{ data: Product }>(`/api/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  return res.data;
}

export async function deleteProduct(id: number): Promise<void> {
  await apiFetch<{ message: string }>(`/api/products/${id}`, { method: 'DELETE' });
}

export async function restoreProduct(id: number): Promise<void> {
  await apiFetch<{ message: string }>(`/api/products/${id}/restore`, { method: 'PATCH' });
}

export async function hardDeleteProduct(id: number): Promise<void> {
  await apiFetch<{ message: string }>(`/api/products/${id}/permanent`, { method: 'DELETE' });
}

export async function createVariant(
  productId: number,
  body: CreateVariantBody,
): Promise<ProductVariant> {
  const res = await apiFetch<{ data: ProductVariant; message: string }>(
    `/api/products/${productId}/variants`,
    { method: 'POST', body: JSON.stringify(body) },
  );
  return res.data;
}

export async function updateVariant(
  productId: number,
  variantId: number,
  body: Partial<CreateVariantBody>,
): Promise<ProductVariant> {
  const res = await apiFetch<{ data: ProductVariant }>(
    `/api/products/${productId}/variants/${variantId}`,
    { method: 'PUT', body: JSON.stringify(body) },
  );
  return res.data;
}

export async function deleteVariant(productId: number, variantId: number): Promise<void> {
  await apiFetch<{ message: string }>(`/api/products/${productId}/variants/${variantId}`, {
    method: 'DELETE',
  });
}

// ── Bulk actions ──────────────────────────────────────────────────────────────

export interface BulkActionResult {
  success: number;
  failed: number;
  errors?: { id: number; message: string }[];
}

export async function bulkDeleteProducts(ids: number[]): Promise<BulkActionResult> {
  const results = await Promise.allSettled(ids.map((id) => deleteProduct(id)));
  const failed = results.filter((r) => r.status === 'rejected');
  return { success: results.length - failed.length, failed: failed.length };
}

export async function bulkRestoreProducts(ids: number[]): Promise<BulkActionResult> {
  const results = await Promise.allSettled(ids.map((id) => restoreProduct(id)));
  const failed = results.filter((r) => r.status === 'rejected');
  return { success: results.length - failed.length, failed: failed.length };
}

export async function bulkUpdateActive(ids: number[], active: boolean): Promise<BulkActionResult> {
  const results = await Promise.allSettled(ids.map((id) => updateProduct(id, { active })));
  const failed = results.filter((r) => r.status === 'rejected');
  return { success: results.length - failed.length, failed: failed.length };
}

export async function bulkHardDeleteProducts(ids: number[]): Promise<BulkActionResult> {
  const results = await Promise.allSettled(ids.map((id) => hardDeleteProduct(id)));
  const failed = results.filter((r) => r.status === 'rejected');
  return { success: results.length - failed.length, failed: failed.length };
}

// ── Export ────────────────────────────────────────────────────────────────────

export async function exportProducts(query?: ProductsQuery): Promise<Page<Product>> {
  // Fetch all pages for export (up to 10k)
  const q = new URLSearchParams();
  if (query?.search?.trim()) q.set('search', query.search.trim());
  if (query?.active !== undefined) q.set('active', String(query.active));
  if (query?.deleted !== undefined) q.set('deleted', String(query.deleted));
  if (query?.category !== undefined) q.set('category', String(query.category));
  if (query?.brand !== undefined) q.set('brand', String(query.brand));
  q.set('page', '0');
  q.set('size', '10000');
  if (query?.sort) q.set('sort', query.sort);
  const qs = q.toString() ? `?${q}` : '';
  const res = await apiFetch<{ data: Page<Product> }>(`/api/products${qs}`);
  return res.data;
}

// ── Import ────────────────────────────────────────────────────────────────────

export interface ImportRow {
  name: string;
  slug: string;
  description?: string;
  categoryId: number;
  brandId?: number;
  thumbnail?: string;
  active: boolean;
  priceMin?: number;
}

export interface ImportResult {
  success: number;
  failed: number;
  errors: { row: number; message: string }[];
}
