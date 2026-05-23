import { apiFetch } from '@/lib/client';
import type { Cart, CartResponse, CartItemResponse } from '@/types/cart';
import type { AddToCartData, UpdateCartItemData } from '@/schemas/cart';

// GET /api/cart - Get user cart
export async function getCart(): Promise<Cart> {
  const res = await apiFetch<CartResponse>('/api/cart');
  return res.data;
}

// POST /api/cart - Add item to cart
export async function addToCart(data: AddToCartData) {
  const res = await apiFetch<CartItemResponse>('/api/cart', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.data;
}

// PUT /api/cart/{itemId} - Update cart item quantity
export async function updateCartItem(itemId: number, data: UpdateCartItemData) {
  const res = await apiFetch<CartItemResponse>(`/api/cart/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return res.data;
}

// DELETE /api/cart/{itemId} - Remove cart item
export async function removeCartItem(itemId: number) {
  return apiFetch<{ message: string }>(`/api/cart/${itemId}`, {
    method: 'DELETE',
  });
}

// DELETE /api/cart - Clear cart
export async function clearCart() {
  return apiFetch<{ message: string }>('/api/cart', {
    method: 'DELETE',
  });
}
