'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CheckCircle2, ChevronLeft, Clipboard, Clock3, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cart.store';
import { createOrder, getOrder } from '@/lib/api/orders';
import { createAddress, getAddresses } from '@/lib/api/addresses';
import type { CreateOrderData } from '@/schemas/order';
import type { Order, ShippingAddress } from '@/types/order';
import type { PaymentMethod } from '@/schemas/order';
import type { Address } from '@/types/address';
import ShippingForm from './shipping-form';
import PaymentMethodSelector from './payment-method';
import OrderSummary from './order-summary';

type CheckoutStep = 'shipping' | 'payment' | 'review';

const SEPAY_BANK = process.env.NEXT_PUBLIC_SEPAY_BANK || 'BIDV';
const SEPAY_ACCOUNT = process.env.NEXT_PUBLIC_SEPAY_ACCOUNT || '0000000001';
const SEPAY_ACCOUNT_HOLDER = process.env.NEXT_PUBLIC_SEPAY_ACCOUNT_HOLDER || 'NGUYEN PHI LONG';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, isLoading: cartLoading, fetchCart, clearCart } = useCartStore();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [sepayOrder, setSepayOrder] = useState<Order | null>(null);
  const [isRefreshingOrder, setIsRefreshingOrder] = useState(false);

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

      if (order.paymentMethod === 'sepay') {
        setSepayOrder(order);
        void clearCart();
        toast.success('Đặt hàng thành công!');
        return;
      }

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

  if (sepayOrder) {
    return (
      <SepayPaymentView
        order={sepayOrder}
        isRefreshing={isRefreshingOrder}
        onOrderChange={setSepayOrder}
        onRefreshingChange={setIsRefreshingOrder}
      />
    );
  }

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
                    {paymentMethod === 'sepay' && 'Chuyển khoản VietQR qua SePay'}
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

function SepayPaymentView({
  order,
  isRefreshing,
  onOrderChange,
  onRefreshingChange,
}: {
  order: Order;
  isRefreshing: boolean;
  onOrderChange: (order: Order) => void;
  onRefreshingChange: (refreshing: boolean) => void;
}) {
  const router = useRouter();
  const paymentCode = `NT${order.id}`;
  const isPaid = order.status === 'confirmed';
  const qrUrl = buildSepayQrUrl(order.finalAmount, paymentCode);

  useEffect(() => {
    if (isPaid) return;

    let cancelled = false;
    const refresh = async () => {
      try {
        const latestOrder = await getOrder(order.id);
        if (cancelled) return;
        onOrderChange(latestOrder);
        if (latestOrder.status === 'confirmed') {
          toast.success('Thanh toán đã được xác nhận');
        }
      } catch {
        // Keep the current payment screen visible if a polling attempt fails.
      }
    };

    const interval = window.setInterval(() => void refresh(), 5000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [isPaid, onOrderChange, order.id]);

  const handleCopy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`Đã sao chép ${label}`);
    } catch {
      toast.error('Không thể sao chép, vui lòng thử lại');
    }
  };

  const handleRefresh = async () => {
    onRefreshingChange(true);
    try {
      const latestOrder = await getOrder(order.id);
      onOrderChange(latestOrder);
      if (latestOrder.status === 'confirmed') {
        toast.success('Thanh toán đã được xác nhận');
      } else {
        toast.info('Đơn hàng vẫn đang chờ thanh toán');
      }
    } catch {
      toast.error('Không thể cập nhật trạng thái đơn hàng');
    } finally {
      onRefreshingChange(false);
    }
  };

  return (
    <main className="bg-muted/30">
      <div className="mx-auto min-h-[calc(100vh-96px)] max-w-5xl px-6 py-8 lg:py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Thanh toán chuyển khoản
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Đơn hàng #{order.id} sẽ tự cập nhật khi SePay xác nhận tiền vào.
          </p>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="overflow-hidden rounded-xl border border-slate-100 bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrUrl}
                alt={`QR thanh toán đơn hàng ${order.id}`}
                className="aspect-square w-full object-contain"
              />
            </div>
            <p className="mt-4 text-center text-sm text-slate-500">
              Quét mã bằng ứng dụng ngân hàng để tự điền số tiền và nội dung chuyển khoản.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">Thông tin chuyển khoản</h2>
                  <p className="mt-1 text-sm text-slate-500">Chuyển đúng số tiền và nội dung.</p>
                </div>
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${
                    isPaid ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {isPaid ? <CheckCircle2 className="size-4" /> : <Clock3 className="size-4" />}
                  {isPaid ? 'Đã thanh toán' : 'Chờ thanh toán'}
                </span>
              </div>

              <div className="mt-6 space-y-3">
                <PaymentInfoRow label="Ngân hàng" value={SEPAY_BANK} />
                <PaymentInfoRow
                  label="Số tài khoản"
                  value={SEPAY_ACCOUNT}
                  onCopy={() => void handleCopy(SEPAY_ACCOUNT, 'số tài khoản')}
                />
                <PaymentInfoRow label="Chủ tài khoản" value={SEPAY_ACCOUNT_HOLDER} />
                <PaymentInfoRow
                  label="Số tiền"
                  value={`${order.finalAmount.toLocaleString('vi-VN')} ₫`}
                  strong
                  onCopy={() => void handleCopy(String(Math.round(order.finalAmount)), 'số tiền')}
                />
                <PaymentInfoRow
                  label="Nội dung"
                  value={paymentCode}
                  strong
                  onCopy={() => void handleCopy(paymentCode, 'nội dung chuyển khoản')}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">Sau khi chuyển khoản</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Trang này tự kiểm tra trạng thái đơn hàng vài giây một lần. Khi giao dịch khớp
                mã {paymentCode} và đúng số tiền, trạng thái sẽ chuyển sang đã thanh toán.
              </p>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Button
                  className="rounded-full"
                  variant="outline"
                  onClick={() => void handleRefresh()}
                  disabled={isRefreshing}
                >
                  {isRefreshing ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <RefreshCw className="size-4" />
                  )}
                  Kiểm tra lại
                </Button>
                <Button
                  className="rounded-full"
                  onClick={() => router.push(`/account/orders/${order.id}`)}
                >
                  Xem đơn hàng
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function PaymentInfoRow({
  label,
  value,
  strong,
  onCopy,
}: {
  label: string;
  value: string;
  strong?: boolean;
  onCopy?: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm text-slate-500">{label}</span>
      <div className="flex min-w-0 items-center gap-2">
        <span
          className={`break-all text-right text-sm ${strong ? 'font-bold text-slate-950' : 'font-medium text-slate-800'}`}
        >
          {value}
        </span>
        {onCopy && (
          <button
            type="button"
            className="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:text-slate-900"
            onClick={onCopy}
            aria-label={`Sao chép ${label}`}
          >
            <Clipboard className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function buildSepayQrUrl(amount: number, description: string) {
  const params = new URLSearchParams({
    acc: SEPAY_ACCOUNT,
    bank: SEPAY_BANK,
    amount: String(Math.round(amount)),
    des: description,
    template: 'compact',
    showinfo: 'false',
  });

  return `https://qr.sepay.vn/img?${params.toString()}`;
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
