'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cart.store';
import { createOrder } from '@/lib/api/orders';
import { createAddress, getAddresses } from '@/lib/api/addresses';
import type { CreateOrderData } from '@/schemas/order';
import type { ShippingAddress } from '@/types/order';
import type { PaymentMethod } from '@/schemas/order';
import ShippingForm from './shipping-form';
import PaymentMethodSelector from './payment-method';
import OrderSummary from './order-summary';

type CheckoutStep = 'shipping' | 'payment' | 'review';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, isLoading: cartLoading, fetchCart, clearCart } = useCartStore();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [promotionCode, setPromotionCode] = useState('');
  const [note, setNote] = useState('');
  const [saveAddress, setSaveAddress] = useState(false);

  useEffect(() => {
    void fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    async function loadSavedAddress() {
      try {
        const addresses = await getAddresses();
        const address = addresses.find((item) => item.isDefault) ?? addresses[0];
        if (!address) return;

        setShippingAddress({
          name: address.name,
          phone: address.phone,
          address: address.address,
          ward: address.ward,
          wardCode: address.wardCode,
          district: address.district,
          districtCode: address.districtCode,
          city: address.city,
          cityCode: address.cityCode,
          country: address.country,
        });
      } catch {
        // Checkout still works with a freshly entered address.
      }
    }

    void loadSavedAddress();
  }, []);

  // Redirect if cart is empty
  useEffect(() => {
    if (!cartLoading && (!cart || cart.items.length === 0)) {
      toast.error('Giỏ hàng trống');
      router.push('/cart');
    }
  }, [cart, cartLoading, router]);

  const handleShippingSubmit = (address: ShippingAddress, save: boolean) => {
    setShippingAddress(address);
    setSaveAddress(save);
    setCurrentStep('payment');
  };

  const handlePaymentSubmit = (method: PaymentMethod) => {
    setPaymentMethod(method);
    setCurrentStep('review');
  };

  const handlePlaceOrder = async () => {
    if (!shippingAddress) {
      toast.error('Vui lòng nhập địa chỉ giao hàng');
      setCurrentStep('shipping');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData: CreateOrderData = {
        shippingAddress,
        paymentMethod,
        promotionCode: promotionCode || undefined,
        note: note || undefined,
        saveAddress,
      };

      if (saveAddress) {
        await createAddress({ ...shippingAddress, isDefault: true });
      }

      const order = await createOrder(orderData);

      // Clear cart after successful order
      await clearCart();

      toast.success('Đặt hàng thành công!');
      router.push(`/account/orders/${order.id}`);
    } catch (error) {
      const err = error as { error?: { code?: string; message?: string; data?: unknown } };
      const code = err?.error?.code;

      switch (code) {
        case 'CART_EMPTY':
          toast.error('Giỏ hàng trống');
          router.push('/cart');
          break;
        case 'PROMOTION_NOT_FOUND':
          toast.error('Mã khuyến mãi không tồn tại hoặc đã hết hạn');
          setPromotionCode('');
          break;
        case 'PROMOTION_NOT_APPLICABLE': {
          const data = err.error?.data as { minAmount?: number; currentAmount?: number };
          toast.error(
            `Đơn hàng chưa đủ điều kiện. Tối thiểu: ${data?.minAmount?.toLocaleString('vi-VN')} ₫`
          );
          setPromotionCode('');
          break;
        }
        case 'VARIANT_OUT_OF_STOCK': {
          const data = err.error?.data as {
            outOfStockItems?: Array<{ productName: string; variantName: string }>;
          };
          const items = data?.outOfStockItems || [];
          if (items.length > 0) {
            toast.error(
              `Sản phẩm hết hàng: ${items.map((i) => `${i.productName} (${i.variantName})`).join(', ')}`
            );
          } else {
            toast.error('Một số sản phẩm đã hết hàng');
          }
          // Refetch cart to update stock status
          await fetchCart();
          router.push('/cart');
          break;
        }
        default:
          toast.error(err?.error?.message || 'Đặt hàng thất bại');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentStep === 'payment') {
      setCurrentStep('shipping');
    } else if (currentStep === 'review') {
      setCurrentStep('payment');
    }
  };

  if (cartLoading || !cart) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-8">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Thanh toán</h1>
        <p className="mt-2 text-muted-foreground">
          Hoàn tất đơn hàng của bạn trong {currentStep === 'shipping' ? '3' : currentStep === 'payment' ? '2' : '1'} bước
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8 flex items-center justify-center gap-4">
        <StepIndicator
          step={1}
          label="Giao hàng"
          active={currentStep === 'shipping'}
          completed={currentStep === 'payment' || currentStep === 'review'}
        />
        <div className="h-px w-16 bg-border" />
        <StepIndicator
          step={2}
          label="Thanh toán"
          active={currentStep === 'payment'}
          completed={currentStep === 'review'}
        />
        <div className="h-px w-16 bg-border" />
        <StepIndicator step={3} label="Xác nhận" active={currentStep === 'review'} completed={false} />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {currentStep === 'shipping' && (
            <ShippingForm
              initialData={shippingAddress}
              initialSaveAddress={saveAddress}
              onSubmit={handleShippingSubmit}
            />
          )}

          {currentStep === 'payment' && (
            <PaymentMethodSelector
              selectedMethod={paymentMethod}
              onSubmit={handlePaymentSubmit}
              onBack={handleBack}
            />
          )}

          {currentStep === 'review' && (
            <div className="space-y-6">
              {/* Shipping Address Review */}
              <div className="rounded-lg border bg-card p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Địa chỉ giao hàng</h2>
                  <Button variant="ghost" size="sm" onClick={() => setCurrentStep('shipping')}>
                    Sửa
                  </Button>
                </div>
                {shippingAddress && (
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">{shippingAddress.name}</p>
                    <p className="text-muted-foreground">{shippingAddress.phone}</p>
                    <p className="text-muted-foreground">
                      {[shippingAddress.address, shippingAddress.ward, shippingAddress.district, shippingAddress.city]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  </div>
                )}
              </div>

              {/* Payment Method Review */}
              <div className="rounded-lg border bg-card p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Phương thức thanh toán</h2>
                  <Button variant="ghost" size="sm" onClick={() => setCurrentStep('payment')}>
                    Sửa
                  </Button>
                </div>
                <p className="text-sm">
                  {paymentMethod === 'cod' && 'Thanh toán khi nhận hàng (COD)'}
                  {paymentMethod === 'vnpay' && 'VNPay'}
                  {paymentMethod === 'momo' && 'Momo'}
                </p>
              </div>

              {/* Note */}
              <div className="rounded-lg border bg-card p-6">
                <h2 className="mb-4 text-lg font-semibold">Ghi chú đơn hàng</h2>
                <textarea
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  rows={3}
                  placeholder="Ghi chú cho người bán (tùy chọn)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={500}
                />
                <p className="mt-1 text-xs text-muted-foreground">{note.length}/500 ký tự</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
                  <ChevronLeft />
                  Quay lại
                </Button>
                <Button className="flex-1" size="lg" onClick={handlePlaceOrder} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    'Đặt hàng'
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <OrderSummary
            cart={cart}
            promotionCode={promotionCode}
            onPromotionCodeChange={setPromotionCode}
          />
        </div>
      </div>
    </div>
  );
}

interface StepIndicatorProps {
  step: number;
  label: string;
  active: boolean;
  completed: boolean;
}

function StepIndicator({ step, label, active, completed }: StepIndicatorProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`flex size-10 items-center justify-center rounded-full border-2 font-semibold transition-colors ${
          completed
            ? 'border-primary bg-primary text-primary-foreground'
            : active
              ? 'border-primary bg-background text-primary'
              : 'border-muted bg-background text-muted-foreground'
        }`}
      >
        {step}
      </div>
      <span
        className={`text-sm font-medium ${active ? 'text-foreground' : 'text-muted-foreground'}`}
      >
        {label}
      </span>
    </div>
  );
}
