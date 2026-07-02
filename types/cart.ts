import type { Product } from '@/lib/api/public/products';

export interface CartVariant {
  id: number;
  productId: number;
  sku: string;
  name: string;
  price: number;
  attributes: Record<string, string>;
  active: boolean;
  imageId: number | null;
  imageUrl: string | null;
  weightGrams: number | null;
  lengthCm: number | null;
  widthCm: number | null;
  heightCm: number | null;
  stockQuantity: number | null;
  lowStockThreshold: number | null;
  inStock: boolean | null;
  lowStock: boolean | null;
  product: Pick<Product, 'id' | 'name' | 'slug' | 'thumbnail'>;
}

export interface CartItem {
  id: number;
  cartId: number;
  variantId: number;
  quantity: number;
  variant: CartVariant;
  subtotal: number;
  createdAt: string;
  updatedAt: string;
}

export interface Cart {
  id: number;
  userId: number;
  items: CartItem[];
  summary: {
    totalItems: number;
    subtotal: number;
    discount: number;
    shipping: number;
    total: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CartResponse {
  data: Cart;
}

export interface CartItemResponse {
  data: CartItem;
  message: string;
}
