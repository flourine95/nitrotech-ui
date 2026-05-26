import type { Metadata } from 'next';
import { ProductsClient } from './products-client';

export const metadata: Metadata = { title: 'Sản phẩm' };

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <ProductsClient />
      </div>
    </main>
  );
}
