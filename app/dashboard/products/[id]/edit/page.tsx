import { notFound } from 'next/navigation';
import { getProduct } from '@/lib/api/products';
import { backendFetch } from '@/lib/server';
import { cookies } from 'next/headers';
import { ProductForm } from '../../product-form';

// Server-side fetch using auth cookies directly
async function fetchProduct(id: number) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const res = await backendFetch(`/api/products/${id}`, { cookieHeader });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to fetch product');
  const json = await res.json();
  return json.data;
}

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await fetchProduct(Number(id));

  if (!product) notFound();

  return <ProductForm product={product} />;
}
