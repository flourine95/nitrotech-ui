import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { backendFetch } from '@/lib/api/server';
import type { Category } from '@/lib/api/admin/categories';
import type { Brand } from '@/lib/api/admin/brands';
import type { Page } from '@/types/pagination';
import { ProductForm } from '@/app/dashboard/products/product-form';

async function fetchPageData(id: number) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  // Fetch product, categories, brands in parallel — no waterfall
  const [productRes, catsRes, brandsRes] = await Promise.all([
    backendFetch(`/api/admin/products/${id}`, { cookieHeader }),
    backendFetch('/api/admin/categories?deleted=false', { cookieHeader }),
    backendFetch('/api/admin/brands?size=100&deleted=false', { cookieHeader }),
  ]);

  if (productRes.status === 404) return null;
  if (!productRes.ok) throw new Error('Failed to fetch product');

  const [productJson, catsJson, brandsJson] = await Promise.all([
    productRes.json(),
    catsRes.json(),
    brandsRes.json(),
  ]);

  const cats: Category[] = Array.isArray(catsJson.data)
    ? catsJson.data
    : ((catsJson.data as Page<Category>).content ?? []);
  const brands: Brand[] = (brandsJson.data as Page<Brand>).content ?? [];

  return { product: productJson.data, categories: cats, brands };
}

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await fetchPageData(Number(id));

  if (!data) notFound();

  return <ProductForm product={data.product} categories={data.categories} brands={data.brands} />;
}
