'use client';
import { useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ImagePlus, Upload, X } from 'lucide-react';
import { createVariant, updateVariant, type ProductVariant } from '@/lib/api/products';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import MediaPickerDialog from '@/components/media-picker-dialog';

interface VariantFormSheetProps {
  open: boolean;
  onClose: () => void;
  productId: number;
  productName: string;
  variant?: ProductVariant;
}

export function VariantFormSheet({
  open,
  onClose,
  productId,
  productName,
  variant,
}: VariantFormSheetProps) {
  const queryClient = useQueryClient();
  const isEdit = !!variant;

  const [sku, setSku] = useState(variant?.sku ?? '');
  const [name, setName] = useState(variant?.name ?? '');
  const [price, setPrice] = useState(variant?.price?.toString() ?? '');
  const [active, setActive] = useState(variant?.active ?? true);
  const [attributes, setAttributes] = useState<Record<string, string>>(variant?.attributes ?? {});
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  const createMutation = useMutation({
    mutationFn: () =>
      createVariant(productId, {
        sku,
        name,
        price: parseFloat(price),
        attributes: Object.keys(attributes).length > 0 ? attributes : undefined,
        active,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Đã tạo phiên bản');
      onClose();
    },
    onError: () => toast.error('Tạo phiên bản thất bại'),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      updateVariant(productId, variant!.id, {
        sku,
        name,
        price: parseFloat(price),
        attributes: Object.keys(attributes).length > 0 ? attributes : undefined,
        active,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Đã cập nhật phiên bản');
      onClose();
    },
    onError: () => toast.error('Cập nhật phiên bản thất bại'),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!sku.trim() || !name.trim() || !price) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }
    if (isEdit) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  }

  function addAttribute() {
    const key = `attr_${Date.now()}`;
    setAttributes({ ...attributes, [key]: '' });
  }

  function updateAttributeKey(oldKey: string, newKey: string) {
    const newAttrs = { ...attributes };
    const value = newAttrs[oldKey];
    delete newAttrs[oldKey];
    newAttrs[newKey] = value;
    setAttributes(newAttrs);
  }

  function updateAttributeValue(key: string, value: string) {
    setAttributes({ ...attributes, [key]: value });
  }

  function removeAttribute(key: string) {
    const newAttrs = { ...attributes };
    delete newAttrs[key];
    setAttributes(newAttrs);
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-2xl">
          <SheetHeader className="border-b border-border/70 px-6 pt-6 pb-5">
            <SheetTitle className="text-2xl">
              {isEdit ? 'Chỉnh sửa phiên bản' : 'Thêm phiên bản'}
            </SheetTitle>
            <SheetDescription>
              {productName} / {isEdit ? variant.name : 'Phiên bản mới'}
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="no-scrollbar flex-1 overflow-y-auto px-6 py-6">
              <div className="grid gap-6">
                {/* Basic info card */}
                <div className="rounded-2xl border bg-card shadow-none">
                  <div className="flex flex-col gap-2 space-y-1.5 p-6">
                    <div className="text-base font-semibold tracking-tight">Thông tin cơ bản</div>
                    <div className="text-sm text-muted-foreground">
                      SKU, tên và giá bán của phiên bản này.
                    </div>
                  </div>
                  <div className="grid gap-4 p-6 pt-0">
                    <div className="grid gap-2">
                      <Label htmlFor="sku">
                        SKU <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="sku"
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                        placeholder="VD: IP16-BLK-256"
                        className="h-12"
                        disabled={isPending}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="name">
                        Tên phiên bản <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="VD: Đen - 256GB"
                        className="h-12"
                        disabled={isPending}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="price">
                        Giá bán <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="price"
                          type="number"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          placeholder="0"
                          className="h-12 pr-12"
                          disabled={isPending}
                        />
                        <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm text-muted-foreground">
                          đ
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Attributes card */}
                <div className="rounded-2xl border bg-card shadow-none">
                  <div className="flex flex-col gap-2 space-y-1.5 p-6">
                    <div className="text-base font-semibold tracking-tight">Thuộc tính</div>
                    <div className="text-sm text-muted-foreground">
                      Các thuộc tính phân biệt phiên bản này (màu sắc, kích thước...).
                    </div>
                  </div>
                  <div className="grid gap-4 p-6 pt-0">
                    {Object.entries(attributes).map(([key, value]) => (
                      <div key={key} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                        <div className="grid gap-2">
                          <Label>Tên thuộc tính</Label>
                          <Input
                            value={key.startsWith('attr_') ? '' : key}
                            onChange={(e) => updateAttributeKey(key, e.target.value)}
                            placeholder="VD: Màu sắc"
                            className="h-12"
                            disabled={isPending}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Giá trị</Label>
                          <Input
                            value={value}
                            onChange={(e) => updateAttributeValue(key, e.target.value)}
                            placeholder="VD: Đen"
                            className="h-12"
                            disabled={isPending}
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeAttribute(key)}
                            className="h-12 w-12"
                            disabled={isPending}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={addAttribute}
                      className="w-fit px-0 text-emerald-600 hover:text-emerald-700"
                      disabled={isPending}
                    >
                      <ImagePlus className="h-4 w-4" />
                      Thêm thuộc tính
                    </Button>
                  </div>
                </div>

                {/* Status card */}
                <div className="rounded-2xl border bg-card shadow-none">
                  <div className="flex flex-col gap-2 space-y-1.5 p-6">
                    <div className="text-base font-semibold tracking-tight">Trạng thái</div>
                    <div className="text-sm text-muted-foreground">
                      Bật/tắt phiên bản này trên cửa hàng.
                    </div>
                  </div>
                  <div className="p-6 pt-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="active" className="text-sm font-medium">
                          Hiển thị trên cửa hàng
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Tắt để ẩn phiên bản này khỏi khách hàng
                        </p>
                      </div>
                      <Switch
                        id="active"
                        checked={active}
                        onCheckedChange={setActive}
                        disabled={isPending}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-border/70 px-6 py-4 sm:flex-row sm:justify-between">
              <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>
                Hủy
              </Button>
              <Button type="submit" disabled={isPending} className="px-8">
                {isPending ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Lưu phiên bản'}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {showMediaPicker && (
        <MediaPickerDialog
          folder="products"
          multiple={false}
          onInsert={(urls) => {
            // Handle image selection for variant
            toast.info('Tính năng ảnh cho phiên bản đang được phát triển');
            setShowMediaPicker(false);
          }}
          onClose={() => setShowMediaPicker(false)}
        />
      )}
    </>
  );
}
