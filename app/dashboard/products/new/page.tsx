import { cookies } from 'next/headers';
import { backendFetch } from '@/lib/server';
import { ProductForm } from '../product-form';
import type { Category } from '@/lib/api/categories';
import type { Brand } from '@/lib/api/brands';
import type { Page } from '@/lib/types/pagination';

async function fetchFormData() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const [catsRes, brandsRes] = await Promise.all([
    backendFetch('/api/categories?tree=false&size=200', { cookieHeader }),
    backendFetch('/api/brands?size=100', { cookieHeader }),
  ]);

  const [catsJson, brandsJson] = await Promise.all([catsRes.json(), brandsRes.json()]);

  const cats: Category[] = Array.isArray(catsJson.data)
    ? catsJson.data
    : ((catsJson.data as Page<Category>).content ?? []);
  const brands: Brand[] = (brandsJson.data as Page<Brand>).content ?? [];

  return { categories: cats, brands };
}

export default async function NewProductPage() {
  const { categories, brands } = await fetchFormData();
  return <ProductForm categories={categories} brands={brands} />;
}
