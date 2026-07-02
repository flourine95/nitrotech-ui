'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, ShoppingBag, Trash2, Tag, Truck, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useCartStore } from '@/stores/cart-store';
import { validatePromotion } from '@/lib/api/promotions';
import type { PromotionValidationResult } from '@/types/promotion';
import { getSystemConfig, type SystemConfig } from '@/lib/api/config';
import { getFriendlyErrorMessage } from '@/lib/utils/errors';

export function CartContent() {
  const router = useRouter();
  const { cart, isLoading, fetchCart, updateQuantity, removeItem } = useCartStore();
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<PromotionValidationResult | null>(null);
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);
  const [config, setConfig] = useState<SystemConfig | null>(null);

  useEffect(() => {
    void fetchCart();
    getSystemConfig()
      .then(setConfig)
      .catch(() => {
        setConfig({
          shipping: {
            freeThreshold: 500000,
            flatFee: 30000,
          },
        });
      });
  }, [fetchCart]);

  const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
    try {
      await updateQuantity(itemId, newQuantity);
      toast.success('Đã cập nhật giỏ hàng');
    } catch (error) {
      toast.error(getFriendlyErrorMessage(error, 'Cập nhật thất bại'));
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      await removeItem(itemId);
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
    } catch {
      toast.error('Xóa sản phẩm thất bại');
    }
  };

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      toast.error('Vui lòng nhập mã giảm giá');
      return;
    }

    setIsApplyingVoucher(true);
    try {
      const voucher = await validatePromotion({
        code: voucherCode.trim().toUpperCase(),
        orderAmount: cart?.summary.subtotal || 0,
      });
      setAppliedVoucher(voucher);
      setVoucherCode(voucher.code);
      toast.success('Áp dụng mã giảm giá thành công');
    } catch (error) {
      toast.error(getFriendlyErrorMessage(error, 'Mã giảm giá không hợp lệ'));
    } finally {
      setIsApplyingVoucher(false);
    }
  };

  const handleCheckout = () => {
    const qs = appliedVoucher ? `?promotion=${encodeURIComponent(appliedVoucher.code)}` : '';
    router.push(`/checkout${qs}`);
  };

  const subtotal = cart?.summary.subtotal || 0;
  const freeThreshold = config?.shipping.freeThreshold ?? 500000;
  const isFreeShipping = subtotal >= freeThreshold;
  const shippingFee = isFreeShipping ? 0 : (config?.shipping.flatFee ?? 30000);
  const discount = appliedVoucher?.discountAmount || cart?.summary.discount || 0;
  const total = subtotal - discount;

  if (isLoading && !cart) {
    return <CartSkeleton />;
  }

  if (!cart || cart.items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <main className="bg-slate-50 py-8">
      <div className="mx-auto max-w-7xl px-6">
        {/* Breadcrumb */}
        <Link
          href="/products"
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Tiếp tục mua sắm
        </Link>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Giỏ hàng của bạn</h1>
          <p className="mt-2 text-slate-500">
            {cart.summary.totalItems} sản phẩm · Miễn phí vận chuyển cho đơn từ {freeThreshold.toLocaleString('vi-VN')}₫
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="flex flex-col gap-4">
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:shadow-md"
                >
                  <div className="flex gap-5">
                    {/* Product Image */}
                    <Link
                      href={`/products/${item.variant.product.slug}`}
                      className="relative size-28 shrink-0 overflow-hidden rounded-xl bg-slate-100"
                    >
                      <Image
                        src={item.variant.product.thumbnail || '/placeholder.png'}
                        alt={item.variant.product.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    </Link>

                    {/* Product Info */}
                    <div className="flex flex-1 flex-col">
                      <div className="flex-1">
                        <Link
                          href={`/products/${item.variant.product.slug}`}
                          className="text-base font-semibold text-slate-900 transition-colors hover:text-blue-600"
                        >
                          {item.variant.product.name}
                        </Link>
                        <p className="mt-1 text-sm text-slate-500">{item.variant.name}</p>
                        {item.variant.attributes && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {Object.entries(item.variant.attributes).map(([key, value]) => (
                              <span
                                key={key}
                                className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                              >
                                {value as string}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleUpdateQuantity(item.variantId, item.quantity - 1)}
                            disabled={item.quantity <= 1 || isLoading}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-10 text-center text-base font-semibold text-slate-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.variantId, item.quantity + 1)}
                            disabled={isLoading}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="text-lg font-bold text-slate-900">
                            {(item.variant.price * item.quantity).toLocaleString('vi-VN')}₫
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-xs text-slate-400">
                              {item.variant.price.toLocaleString('vi-VN')}₫ / sp
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveItem(item.variantId)}
                      disabled={isLoading}
                      className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Voucher Section */}
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2 text-slate-900">
                <Tag className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold">Mã giảm giá</h3>
              </div>
              <div className="mt-4 flex gap-3">
                <Input
                  placeholder="Nhập mã giảm giá"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleApplyVoucher} disabled={isApplyingVoucher} className="shrink-0">
                  {isApplyingVoucher ? 'Đang áp dụng...' : 'Áp dụng'}
                </Button>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-bold text-slate-900">Tóm tắt đơn hàng</h2>

              {/* Price Breakdown */}
              <div className="mt-6 space-y-3 border-t border-slate-100 pt-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Tạm tính</span>
                  <span className="font-medium text-slate-900">
                    {cart.summary.subtotal.toLocaleString('vi-VN')}₫
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Giảm giá</span>
                    <span className="font-medium text-green-600">
                      -{discount.toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Phí vận chuyển</span>
                  <span className={`font-medium ${isFreeShipping ? 'font-semibold text-green-600' : 'text-slate-900'}`}>
                    {isFreeShipping ? 'Miễn phí' : 'Tính khi thanh toán'}
                  </span>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold text-slate-900">Tổng cộng</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {total.toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <Button
                className="mt-6 h-12 w-full rounded-full bg-slate-900 text-base font-semibold hover:bg-slate-700"
                onClick={handleCheckout}
              >
                Tiến hành thanh toán
              </Button>

              {/* Trust Badges */}
              <div className="mt-6 space-y-2 border-t border-slate-100 pt-6">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Thanh toán an toàn & bảo mật
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Hỗ trợ trả góp 0% lãi suất
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4 text-amber-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  Đổi trả miễn phí trong 30 ngày
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function EmptyCart() {
  return (
    <main className="bg-slate-50 py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white py-20 text-center">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-100">
            <ShoppingBag className="h-12 w-12 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Giỏ hàng trống</h2>
          <p className="mt-2 max-w-md text-slate-500">
            Bạn chưa có sản phẩm nào trong giỏ hàng. Khám phá các sản phẩm công nghệ đỉnh cao của chúng tôi!
          </p>
          <Link href="/products">
            <Button className="mt-8 h-12 rounded-full bg-slate-900 px-8 text-base font-semibold hover:bg-slate-700">
              Khám phá sản phẩm
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

function CartSkeleton() {
  return (
    <main className="bg-slate-50 py-8">
      <div className="mx-auto max-w-7xl px-6">
        <Skeleton className="mb-6 h-8 w-48" />
        <Skeleton className="mb-8 h-5 w-64" />
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="mb-4 rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex gap-5">
                  <Skeleton className="size-28 shrink-0 rounded-xl" />
                  <div className="flex-1">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="mt-2 h-4 w-1/2" />
                    <Skeleton className="mt-4 h-9 w-32" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-1">
            <Skeleton className="h-96 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </main>
  );
}
