import { apiFetch } from '@/lib/api/client';
import type { Cart, CartResponse, CartItemResponse } from '@/types/cart';
import type { AddToCartData, UpdateCartItemData } from '@/schemas/cart';

// GET /api/cart - Get user cart
export async function getCart(): Promise<Cart> {
  const res = await apiFetch<CartResponse>('/api/cart');
  return res.data;
}

// POST /api/cart/items - Add item to cart
export async function addToCart(data: AddToCartData) {
  const res = await apiFetch<CartItemResponse>('/api/cart/items', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.data;
}

// PUT /api/cart/items/{variantId} - Update cart item quantity
export async function updateCartItem(variantId: number, data: UpdateCartItemData) {
  const res = await apiFetch<CartItemResponse>(`/api/cart/items/${variantId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return res.data;
}

// DELETE /api/cart/items/{variantId} - Remove cart item
export async function removeCartItem(variantId: number) {
  return apiFetch<{ message: string }>(`/api/cart/items/${variantId}`, {
    method: 'DELETE',
  });
}

// DELETE /api/cart - Clear cart
export async function clearCart() {
  return apiFetch<{ message: string }>('/api/cart', {
    method: 'DELETE',
  });
}
