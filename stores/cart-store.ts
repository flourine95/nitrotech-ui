import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Cart } from '@/types/cart';
import {
  getCart,
  addToCart as addToCartApi,
  updateCartItem as updateCartItemApi,
  removeCartItem as removeCartItemApi,
  clearCart as clearCartApi,
} from '@/lib/api/cart';

interface CartStore {
  // State
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;

  // Computed
  totalItems: number;
  subtotal: number;

  // Actions
  fetchCart: () => Promise<void>;
  addItem: (variantId: number, quantity: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  reset: () => void;
}

const initialState = {
  cart: null,
  isLoading: false,
  error: null,
  totalItems: 0,
  subtotal: 0,
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Fetch cart from server
      fetchCart: async () => {
        set({ isLoading: true, error: null });
        try {
          const cart = await getCart();
          set({
            cart,
            totalItems: cart.summary.totalItems,
            subtotal: cart.summary.subtotal,
            isLoading: false,
          });
        } catch (error) {
          const err = error as { error?: { code?: string; message?: string } };
          // If cart not found, it's ok (user hasn't added anything yet)
          if (err?.error?.code === 'CART_NOT_FOUND') {
            set({ cart: null, totalItems: 0, subtotal: 0, isLoading: false });
          } else {
            set({
              error: err?.error?.message || 'Không thể tải giỏ hàng',
              isLoading: false,
            });
          }
        }
      },

      // Add item to cart
      addItem: async (variantId: number, quantity: number) => {
        set({ isLoading: true, error: null });
        try {
          await addToCartApi({ variantId, quantity });
          // Refetch cart to get updated data
          await get().fetchCart();
        } catch (error) {
          const err = error as { error?: { code?: string; message?: string } };
          set({
            error: err?.error?.message || 'Không thể thêm vào giỏ hàng',
            isLoading: false,
          });
          throw error;
        }
      },

      // Update item quantity
      updateQuantity: async (itemId: number, quantity: number) => {
        set({ isLoading: true, error: null });
        try {
          await updateCartItemApi(itemId, { quantity });
          // Refetch cart to get updated data
          await get().fetchCart();
        } catch (error) {
          const err = error as { error?: { code?: string; message?: string } };
          set({
            error: err?.error?.message || 'Không thể cập nhật giỏ hàng',
            isLoading: false,
          });
          throw error;
        }
      },

      // Remove item from cart
      removeItem: async (itemId: number) => {
        set({ isLoading: true, error: null });
        try {
          await removeCartItemApi(itemId);
          // Refetch cart to get updated data
          await get().fetchCart();
        } catch (error) {
          const err = error as { error?: { code?: string; message?: string } };
          set({
            error: err?.error?.message || 'Không thể xóa sản phẩm',
            isLoading: false,
          });
          throw error;
        }
      },

      // Clear entire cart
      clearCart: async () => {
        set({ isLoading: true, error: null });
        try {
          await clearCartApi();
          set({ cart: null, totalItems: 0, subtotal: 0, isLoading: false });
        } catch (error) {
          const err = error as { error?: { code?: string; message?: string } };
          set({
            error: err?.error?.message || 'Không thể xóa giỏ hàng',
            isLoading: false,
          });
          throw error;
        }
      },

      // Reset stores
      reset: () => set(initialState),
    }),
    {
      name: 'cart-storage',
      // Only persist cart summary, not loading/error states
      partialize: (state) => ({
        cart: state.cart,
        totalItems: state.totalItems,
        subtotal: state.subtotal,
      }),
    }
  )
);
