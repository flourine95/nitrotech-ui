import type { Product, ProductVariant } from '@/lib/api/public/products';

export interface CartItem {
  id: number;
  cartId: number;
  variantId: number;
  quantity: number;
  variant: ProductVariant & {
    product: Pick<Product, 'id' | 'name' | 'slug' | 'thumbnail'>;
  };
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
