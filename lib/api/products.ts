import { apiFetch } from '@/lib/client';
import type { Page } from '@/lib/types/pagination';

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
  createdAt: string;
  updatedAt: string;
}

export interface ProductsQuery {
  search?: string;
  active?: boolean;
  deleted?: boolean;
  categoryId?: number;
  brandId?: number;
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

export async function getProducts(query?: ProductsQuery): Promise<Page<Product>> {
  const q = new URLSearchParams();
  if (query?.search?.trim()) q.set('search', query.search.trim());
  if (query?.active !== undefined) q.set('active', String(query.active));
  if (query?.deleted !== undefined) q.set('deleted', String(query.deleted));
  if (query?.categoryId !== undefined) q.set('categoryId', String(query.categoryId));
  if (query?.brandId !== undefined) q.set('brandId', String(query.brandId));
  if (query?.page !== undefined) q.set('page', String(query.page));
  if (query?.size !== undefined) q.set('size', String(query.size));
  if (query?.sort) q.set('sort', query.sort);
  const qs = q.toString() ? `?${q}` : '';
  const res = await apiFetch<{ data: Page<Product> }>(`/api/products${qs}`);
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
  if (query?.categoryId !== undefined) q.set('categoryId', String(query.categoryId));
  if (query?.brandId !== undefined) q.set('brandId', String(query.brandId));
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
