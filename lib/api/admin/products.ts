import { apiFetch } from '@/lib/api/client';
import type { Page } from '@/types/pagination';
import { toPage, type Product, type ProductVariant } from '@/lib/api/public/products';

export type { Product, ProductVariant } from '@/lib/api/public/products';

export interface AdminProductsQuery {
  search?: string;
  category?: string;
  brand?: string[];
  minPrice?: number;
  maxPrice?: number;
  badge?: string;
  active?: boolean;
  deleted?: boolean;
  page?: number;
  size?: number;
  sort?: string;
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

function buildAdminProductsQuery(query?: AdminProductsQuery) {
  const q = new URLSearchParams();
  if (query?.search?.trim()) q.set('search', query.search.trim());
  if (query?.category) q.set('category', query.category);
  if (query?.brand?.length) query.brand.forEach((b) => q.append('brand', b));
  if (query?.badge) q.set('badge', query.badge);
  if (query?.minPrice !== undefined && query.minPrice !== null) q.set('minPrice', String(query.minPrice));
  if (query?.maxPrice !== undefined && query.maxPrice !== null) q.set('maxPrice', String(query.maxPrice));
  if (query?.active !== undefined) q.set('active', String(query.active));
  if (query?.deleted !== undefined) q.set('deleted', String(query.deleted));
  if (query?.page !== undefined) q.set('page', String(query.page));
  if (query?.size !== undefined) q.set('size', String(query.size));
  if (query?.sort) q.set('sort', query.sort);
  return q.toString() ? `?${q}` : '';
}

export async function getAdminProducts(query?: AdminProductsQuery): Promise<Page<Product>> {
  const res = await apiFetch<Parameters<typeof toPage<Product>>[0]>(
    `/api/admin/products${buildAdminProductsQuery(query)}`,
  );
  return toPage(res);
}

export async function createProduct(body: CreateProductBody): Promise<Product> {
  const res = await apiFetch<{ data: Product; message: string }>('/api/admin/products', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return res.data;
}

export async function updateProduct(id: number, body: UpdateProductBody): Promise<Product> {
  const res = await apiFetch<{ data: Product }>(`/api/admin/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  return res.data;
}

export async function deleteProduct(id: number): Promise<void> {
  await apiFetch<{ message: string }>(`/api/admin/products/${id}`, { method: 'DELETE' });
}

export async function restoreProduct(id: number): Promise<void> {
  await apiFetch<{ message: string }>(`/api/admin/products/${id}/restore`, { method: 'PATCH' });
}

export async function hardDeleteProduct(id: number): Promise<void> {
  await apiFetch<{ message: string }>(`/api/admin/products/${id}/permanent`, { method: 'DELETE' });
}

export async function createVariant(
  productId: number,
  body: CreateVariantBody,
): Promise<ProductVariant> {
  const res = await apiFetch<{ data: ProductVariant; message: string }>(
    `/api/admin/products/${productId}/variants`,
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
    `/api/admin/products/${productId}/variants/${variantId}`,
    { method: 'PUT', body: JSON.stringify(body) },
  );
  return res.data;
}

export async function deleteVariant(productId: number, variantId: number): Promise<void> {
  await apiFetch<{ message: string }>(`/api/admin/products/${productId}/variants/${variantId}`, {
    method: 'DELETE',
  });
}

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

export async function exportProducts(query?: AdminProductsQuery): Promise<Page<Product>> {
  return getAdminProducts({ ...query, page: 0, size: 10000 });
}

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
