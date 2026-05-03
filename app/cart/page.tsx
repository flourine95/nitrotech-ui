'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCartStore } from '@/store/cart.store';
import { cn } from '@/lib/utils';

export default function CartPage() {
  const router = useRouter();
  const { cart, isLoading, fetchCart, updateQuantity, removeItem } = useCartStore();

  useEffect(() => {
    void fetchCart();
  }, [fetchCart]);

  const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
    try {
      await updateQuantity(itemId, newQuantity);
      toast.success('Đã cập nhật giỏ hàng');
    } catch (error) {
      const err = error as { error?: { code?: string; message?: string } };
      const code = err?.error?.code;

      switch (code) {
        case 'CART_ITEM_NOT_FOUND':
          toast.error('Sản phẩm không tồn tại trong giỏ hàng');
          break;
        case 'INSUFFICIENT_STOCK':
          toast.error('Không đủ hàng trong kho');
          break;
        default:
          toast.error(err?.error?.message || 'Cập nhật thất bại');
      }
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      await removeItem(itemId);
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
    } catch (error) {
      toast.error('Xóa sản phẩm thất bại');
    }
  };

  const handleCheckout = () => {
    router.push('/checkout');
  };

  if (isLoading && !cart) {
    return <CartSkeleton />;
  }

  if (!cart || cart.items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Giỏ hàng</h1>
        <p className="mt-2 text-muted-foreground">
          {cart.summary.totalItems} sản phẩm trong giỏ hàng
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="flex flex-col gap-4">
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50"
              >
                {/* Product Image */}
                <Link
                  href={`/products/${item.variant.product.slug}`}
                  className="relative size-24 shrink-0 overflow-hidden rounded-md"
                >
                  <Image
                    src={item.variant.product.thumbnail || '/placeholder.png'}
                    alt={item.variant.product.name}
                    fill
                    className="object-cover"
                  />
                </Link>

                {/* Product Info */}
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <Link
                      href={`/products/${item.variant.product.slug}`}
                      className="font-medium hover:text-primary"
                    >
                      {item.variant.product.name}
                    </Link>
                    <p className="mt-1 text-sm text-muted-foreground">{item.variant.name}</p>
                    {item.variant.attributes && (
                      <div className="mt-1 flex flex-wrap gap-2">
                        {Object.entries(item.variant.attributes).map(([key, value]) => (
                          <span
                            key={key}
                            className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                          >
                            {value as string}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-8"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1 || isLoading}
                      >
                        <Minus />
                      </Button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-8"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        disabled={isLoading}
                      >
                        <Plus />
                      </Button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="font-semibold">
                        {(item.variant.price * item.quantity).toLocaleString('vi-VN')} ₫
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-xs text-muted-foreground">
                          {item.variant.price.toLocaleString('vi-VN')} ₫ / sản phẩm
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Remove Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => handleRemoveItem(item.id)}
                  disabled={isLoading}
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold">Tóm tắt đơn hàng</h2>

            <div className="mt-4 flex flex-col gap-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tạm tính</span>
                <span className="font-medium">
                  {cart.summary.subtotal.toLocaleString('vi-VN')} ₫
                </span>
              </div>

              {cart.summary.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Giảm giá</span>
                  <span className="font-medium text-green-600">
                    -{cart.summary.discount.toLocaleString('vi-VN')} ₫
                  </span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Phí vận chuyển</span>
                <span className="font-medium">
                  {cart.summary.shipping === 0
                    ? 'Miễn phí'
                    : `${cart.summary.shipping.toLocaleString('vi-VN')} ₫`}
                </span>
              </div>

              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="font-semibold">Tổng cộng</span>
                  <span className="text-xl font-bold text-primary">
                    {cart.summary.total.toLocaleString('vi-VN')} ₫
                  </span>
                </div>
              </div>
            </div>

            <Button className="mt-6 w-full" size="lg" onClick={handleCheckout}>
              Tiến hành thanh toán
            </Button>

            <Link href="/products">
              <Button variant="outline" className="mt-3 w-full">
                Tiếp tục mua sắm
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyCart() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="mb-4 rounded-full bg-muted p-6">
          <ShoppingBag className="size-12 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-semibold">Giỏ hàng trống</h2>
        <p className="mt-2 text-muted-foreground">
          Bạn chưa có sản phẩm nào trong giỏ hàng
        </p>
        <Link href="/products">
          <Button className="mt-6" size="lg">
            Khám phá sản phẩm
          </Button>
        </Link>
      </div>
    </div>
  );
}

function CartSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="mb-6 h-10 w-48" />
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="mb-4 flex gap-4 rounded-lg border p-4">
              <Skeleton className="size-24 shrink-0" />
              <div className="flex-1">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="mt-2 h-4 w-1/2" />
                <Skeleton className="mt-4 h-8 w-32" />
              </div>
            </div>
          ))}
        </div>
        <div className="lg:col-span-1">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  );
}
