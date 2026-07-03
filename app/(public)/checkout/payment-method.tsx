'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PaymentMethod } from '@/schemas/order';
import { cn } from '@/lib/utils';

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
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-950">Phương thức thanh toán</h2>
        <p className="mt-1 text-sm text-slate-500">Chọn cách thanh toán phù hợp với bạn.</p>
      </div>

      <div className="space-y-3" role="radiogroup" aria-label="Phương thức thanh toán">
        <PaymentOption
          value="cod"
          selected={method === 'cod'}
          title="Thanh toán khi nhận hàng (COD)"
          description="Thanh toán bằng tiền mặt khi nhận hàng"
          onSelect={setMethod}
        />
        <PaymentOption
          value="sepay"
          selected={method === 'sepay'}
          title="Chuyển khoản VietQR qua SePay"
          description="Quét mã VietQR, hệ thống tự xác nhận khi nhận được tiền"
          onSelect={setMethod}
        />
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-between">
        <Button type="button" variant="outline" className="rounded-full sm:w-auto" onClick={onBack}>
          <ChevronLeft />
          Quay lại
        </Button>
        <Button type="submit" className="w-full rounded-full sm:w-48" size="lg">
          Tiếp tục
          <ChevronRight />
        </Button>
      </div>
    </form>
  );
}

function PaymentOption({
  value,
  selected,
  title,
  description,
  onSelect,
}: {
  value: PaymentMethod;
  selected: boolean;
  title: string;
  description: string;
  onSelect: (value: PaymentMethod) => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      className={cn(
        'flex w-full cursor-pointer items-start gap-3 rounded-2xl border bg-white p-4 text-left transition-colors hover:bg-slate-50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
        selected
          ? 'border-primary/25 bg-primary/[0.03] ring-1 ring-primary/10'
          : 'border-slate-200',
      )}
      onClick={() => onSelect(value)}
    >
      <span
        className={cn(
          'mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors',
          selected ? 'border-primary bg-primary' : 'border-slate-300 bg-white',
        )}
        aria-hidden="true"
      >
        {selected && <span className="size-2 rounded-full bg-primary-foreground" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-medium text-slate-950">{title}</span>
        <span className="mt-1 block text-sm text-slate-500">{description}</span>
      </span>
    </button>
  );
}
