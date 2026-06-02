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
  imageId: number | null;
  imageUrl: string | null;
  stockQuantity: number | null;
  lowStockThreshold: number | null;
  inStock: boolean | null;
  lowStock: boolean | null;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: number;
  categoryId: number;
  categoryName: string | null;
  categorySlug?: string | null;
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

export interface ProductsQuery {
  search?: string;
  category?: string;
  brand?: string[];
  minPrice?: number;
  maxPrice?: number;
  badge?: string;
  active?: boolean;
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

export function toPage<T>(res: {
  data: T[];
  meta: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}): Page<T> {
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

function appendProductQuery(q: URLSearchParams, query?: ProductsQuery | ProductFacetsQuery) {
  if (query?.search?.trim()) q.set('search', query.search.trim());
  if (query?.category) q.set('category', query.category);
  if (query?.brand?.length) query.brand.forEach((b) => q.append('brand', b));
  if (query?.minPrice !== undefined && query.minPrice !== null) {
    q.set('minPrice', String(query.minPrice));
  }
  if (query?.maxPrice !== undefined && query.maxPrice !== null) {
    q.set('maxPrice', String(query.maxPrice));
  }
  if (query?.badge) q.set('badge', query.badge);
  if ('active' in (query ?? {}) && query?.active !== undefined) q.set('active', String(query.active));
}

export async function getProducts(query?: ProductsQuery): Promise<Page<Product>> {
  const q = new URLSearchParams();
  appendProductQuery(q, query);
  if (query?.page !== undefined) q.set('page', String(query.page));
  if (query?.size !== undefined) q.set('size', String(query.size));
  if (query?.sort) q.set('sort', query.sort);
  const qs = q.toString() ? `?${q}` : '';
  const res = await apiFetch<Parameters<typeof toPage<Product>>[0]>(`/api/products${qs}`);
  return toPage(res);
}

export async function searchProducts(query?: ProductSearchQuery): Promise<ProductPickerItem[]> {
  const q = new URLSearchParams();
  if (query?.search?.trim()) q.set('search', query.search.trim());
  if (query?.category) q.set('category', query.category);
  if (query?.brand) q.set('brand', query.brand);
  if (query?.excludeId?.length) query.excludeId.forEach((id) => q.append('excludeId', String(id)));
  if (query?.limit !== undefined) q.set('limit', String(query.limit));
  const qs = q.toString() ? `?${q}` : '';
  const res = await apiFetch<{ data: ProductPickerItem[] }>(`/api/products/search${qs}`);
  return res.data;
}

export async function getProductFacets(query?: ProductFacetsQuery): Promise<ProductFacets> {
  const q = new URLSearchParams();
  appendProductQuery(q, query);
  if (query?.active !== undefined) q.set('active', String(query.active));
  const qs = q.toString() ? `?${q}` : '';
  const res = await apiFetch<{ data: ProductFacets }>(`/api/products/facets${qs}`);
  return res.data;
}

export async function getProduct(id: number): Promise<Product> {
  const res = await apiFetch<{ data: Product }>(`/api/products/${id}`);
  return res.data;
}
