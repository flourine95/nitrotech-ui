'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import type { PaymentMethod } from '@/schemas/order';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onSubmit: (method: PaymentMethod) => void;
  onBack: () => void;
}

export default function PaymentMethodSelector({
  selectedMethod,
  onSubmit,
  onBack,
}: PaymentMethodSelectorProps) {
  const [method, setMethod] = useState<PaymentMethod>(selectedMethod);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(method);
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border bg-card p-6">
      <h2 className="mb-6 text-lg font-semibold">Phương thức thanh toán</h2>

      <RadioGroup value={method} onValueChange={(value) => setMethod(value as PaymentMethod)}>
        <div className="space-y-3">
          {/* COD */}
          <div className="flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50">
            <RadioGroupItem value="cod" id="cod" className="mt-0.5" />
            <div className="flex-1">
              <Label htmlFor="cod" className="cursor-pointer font-medium">
                Thanh toán khi nhận hàng (COD)
              </Label>
              <p className="mt-1 text-sm text-muted-foreground">
                Thanh toán bằng tiền mặt khi nhận hàng
              </p>
            </div>
          </div>

          {/* VNPay */}
          <div className="flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50">
            <RadioGroupItem value="vnpay" id="vnpay" className="mt-0.5" />
            <div className="flex-1">
              <Label htmlFor="vnpay" className="cursor-pointer font-medium">
                VNPay
              </Label>
              <p className="mt-1 text-sm text-muted-foreground">
                Thanh toán qua ví điện tử VNPay, thẻ ATM, thẻ tín dụng
              </p>
            </div>
          </div>

          {/* Momo */}
          <div className="flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50">
            <RadioGroupItem value="momo" id="momo" className="mt-0.5" />
            <div className="flex-1">
              <Label htmlFor="momo" className="cursor-pointer font-medium">
                Momo
              </Label>
              <p className="mt-1 text-sm text-muted-foreground">
                Thanh toán qua ví điện tử Momo
              </p>
            </div>
          </div>
        </div>
      </RadioGroup>

      <div className="mt-6 flex gap-3">
        <Button type="button" variant="outline" onClick={onBack}>
          <ChevronLeft />
          Quay lại
        </Button>
        <Button type="submit" className="flex-1" size="lg">
          Tiếp tục
          <ChevronRight />
        </Button>
      </div>
    </form>
  );
}
