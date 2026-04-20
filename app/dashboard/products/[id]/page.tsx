import { notFound } from 'next/navigation';
import { ProductDetailClient } from './product-detail-client';
import { backendFetch } from '@/lib/server';
import { cookies } from 'next/headers';
import type { Product } from '@/lib/api/products';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function fetchProduct(id: number) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const res = await backendFetch(`/api/products/${id}`, { cookieHeader });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to fetch product');
  const json = await res.json();
  return json.data;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const productId = Number(id);

  if (isNaN(productId)) notFound();

  const product = await fetchProduct(productId);

  if (!product) notFound();

  return <ProductDetailClient product={product} />;
}
