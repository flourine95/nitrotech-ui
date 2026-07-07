import { cookies } from 'next/headers';
import { backendFetch } from '@/lib/api/server';
import { ProductForm } from '../product-form';
import type { Category } from '@/lib/api/admin/categories';
import type { Brand } from '@/lib/api/admin/brands';
import type { Page } from '@/types/pagination';

async function fetchFormData() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const [catsRes, brandsRes] = await Promise.all([
    backendFetch('/api/admin/categories?deleted=false', { cookieHeader }),
    backendFetch('/api/admin/brands?size=100&deleted=false', { cookieHeader }),
  ]);

  const [catsJson, brandsJson] = await Promise.all([catsRes.json(), brandsRes.json()]);

  const cats: Category[] = Array.isArray(catsJson.data)
    ? catsJson.data
    : ((catsJson.data as Page<Category>).content ?? []);
  const brands: Brand[] = Array.isArray(brandsJson.data)
    ? brandsJson.data
    : ((brandsJson.data as Page<Brand>).content ?? []);

  return { categories: cats, brands };
}

export default async function NewProductPage() {
  const { categories, brands } = await fetchFormData();
  return <ProductForm categories={categories} brands={brands} />;
}
