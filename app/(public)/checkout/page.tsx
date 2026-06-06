'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cart.store';
import { createOrder } from '@/lib/api/orders';
import { createAddress, getAddresses } from '@/lib/api/addresses';
import type { CreateOrderData } from '@/schemas/order';
import type { ShippingAddress } from '@/types/order';
import type { PaymentMethod } from '@/schemas/order';
import type { Address } from '@/types/address';
import ShippingForm from './shipping-form';
import PaymentMethodSelector from './payment-method';
import OrderSummary from './order-summary';

type CheckoutStep = 'shipping' | 'payment' | 'review';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, isLoading: cartLoading, fetchCart, clearCart } = useCartStore();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);

  // Form data
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [promotionCode, setPromotionCode] = useState('');
  const [note, setNote] = useState('');
  const [defaultAddress, setDefaultAddress] = useState(false);
  const [shouldSaveAddress, setShouldSaveAddress] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);

  useEffect(() => {
    void fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    async function loadSavedAddress() {
      try {
        const addresses = await getAddresses();
        setSavedAddresses(addresses);
        const address = addresses.find((item) => item.isDefault) ?? addresses[0];
        if (!address) return;
        if (!address.district || !address.districtCode) return;

        setShippingAddress({
          name: address.name,
          phone: address.phone,
          address: address.address,
          ward: address.ward,
          wardCode: address.wardCode,
          district: address.district || '',
          districtCode: address.districtCode || '',
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
    if (orderCompleted) return;
    if (!cartLoading && (!cart || cart.items.length === 0)) {
      toast.error('Giỏ hàng trống');
      router.push('/cart');
    }
  }, [cart, cartLoading, orderCompleted, router]);

  const handleShippingSubmit = (
    address: ShippingAddress,
    defaultAddress: boolean,
    shouldSaveAddress: boolean,
  ) => {
    setShippingAddress(address);
    setDefaultAddress(defaultAddress);
    setShouldSaveAddress(shouldSaveAddress);
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
      };

      if (shouldSaveAddress) {
        await createAddress({ ...shippingAddress, isDefault: defaultAddress });
      }

      const order = await createOrder(orderData);
      setOrderCompleted(true);

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
            `Đơn hàng chưa đủ điều kiện. Tối thiểu: ${data?.minAmount?.toLocaleString('vi-VN')} ₫`,
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
              `Sản phẩm hết hàng: ${items.map((i) => `${i.productName} (${i.variantName})`).join(', ')}`,
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
      <main className="bg-muted/30">
        <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-6 py-8">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      </main>
    );
  }

  const currentStepNumber = currentStep === 'shipping' ? 1 : currentStep === 'payment' ? 2 : 3;

  return (
    <main className="bg-muted/30">
      <div className="mx-auto min-h-[calc(100vh-96px)] max-w-7xl px-6 py-8 lg:py-10">
        <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">Thanh toán</h1>
            <p className="mt-2 text-sm text-slate-500">
              Bước {currentStepNumber}/3 để hoàn tất đơn hàng của bạn.
            </p>
          </div>

          {/* Progress Steps */}
          <CheckoutStepper currentStep={currentStep} />
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* Main Content */}
          <div className="min-w-0">
            {currentStep === 'shipping' && (
              <ShippingForm
                initialData={shippingAddress}
                initialSaveAddress={defaultAddress}
                savedAddresses={savedAddresses}
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
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <h2 className="text-lg font-semibold text-slate-950">Địa chỉ giao hàng</h2>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      onClick={() => setCurrentStep('shipping')}
                    >
                      Sửa
                    </Button>
                  </div>
                  {shippingAddress && (
                    <div className="space-y-1 text-sm leading-6">
                      <p className="font-semibold text-slate-950">{shippingAddress.name}</p>
                      <p className="text-slate-500">{shippingAddress.phone}</p>
                      <p className="text-slate-500">
                        {[
                          shippingAddress.address,
                          shippingAddress.ward,
                          shippingAddress.district,
                          shippingAddress.city,
                        ]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    </div>
                  )}
                </div>

                {/* Payment Method Review */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <h2 className="text-lg font-semibold text-slate-950">Phương thức thanh toán</h2>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      onClick={() => setCurrentStep('payment')}
                    >
                      Sửa
                    </Button>
                  </div>
                  <p className="text-sm text-slate-600">
                    {paymentMethod === 'cod' && 'Thanh toán khi nhận hàng (COD)'}
                    {paymentMethod === 'vnpay' && 'VNPay'}
                    {paymentMethod === 'momo' && 'Momo'}
                  </p>
                </div>

                {/* Note */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="mb-4 text-lg font-semibold text-slate-950">Ghi chú đơn hàng</h2>
                  <textarea
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                    rows={3}
                    placeholder="Ghi chú cho người bán (tùy chọn)"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    maxLength={500}
                  />
                  <p className="mt-2 text-xs text-slate-500">{note.length}/500 ký tự</p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                  <Button
                    variant="outline"
                    className="rounded-full sm:w-auto"
                    onClick={handleBack}
                    disabled={isSubmitting}
                  >
                    <ChevronLeft />
                    Quay lại
                  </Button>
                  <Button
                    className="w-full rounded-full sm:w-48"
                    size="lg"
                    onClick={handlePlaceOrder}
                    disabled={isSubmitting}
                  >
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
          <div className="w-full lg:max-w-[360px]">
            <OrderSummary
              cart={cart}
              promotionCode={promotionCode}
              onPromotionCodeChange={setPromotionCode}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

function CheckoutStepper({ currentStep }: { currentStep: CheckoutStep }) {
  const steps = [
    {
      step: 1,
      label: 'Giao hàng',
      active: currentStep === 'shipping',
      completed: currentStep === 'payment' || currentStep === 'review',
    },
    {
      step: 2,
      label: 'Thanh toán',
      active: currentStep === 'payment',
      completed: currentStep === 'review',
    },
    {
      step: 3,
      label: 'Xác nhận',
      active: currentStep === 'review',
      completed: false,
    },
  ];

  return (
    <div className="rounded-full border border-slate-200 bg-white px-5 py-3 shadow-sm">
      <div className="grid grid-cols-[auto_48px_auto_48px_auto] items-start gap-x-3">
        <StepIndicator {...steps[0]} />
        <div className="mt-4 h-px bg-slate-200" />
        <StepIndicator {...steps[1]} />
        <div className="mt-4 h-px bg-slate-200" />
        <StepIndicator {...steps[2]} />
      </div>
    </div>
  );
}

function StepIndicator({
  step,
  label,
  active,
  completed,
}: {
  step: number;
  label: string;
  active: boolean;
  completed: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={`flex size-8 items-center justify-center rounded-full border text-sm font-semibold transition-colors ${
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
        className={`text-xs font-medium ${active ? 'text-foreground' : 'text-muted-foreground'}`}
      >
        {label}
      </span>
    </div>
  );
}
