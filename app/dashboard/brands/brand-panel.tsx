'use client';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Building2, Upload, ImageIcon } from 'lucide-react';
import { createBrand, updateBrand, type Brand } from '@/lib/api/brands';
import { ApiException } from '@/lib/client';
import { slugify, cn } from '@/lib/utils';
import MediaPickerDialog from '@/components/media-picker-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';

// ── Schema ────────────────────────────────────────────────────────────────────

const brandSchema = z.object({
  name: z.string().min(1, 'Tên không được để trống'),
  slug: z
    .string()
    .min(1, 'Đường dẫn không được để trống')
    .regex(/^[a-z0-9-]+$/, 'Chỉ chữ thường, số và dấu gạch ngang'),
  logo: z
    .string()
    .refine((v) => v === '' || /^https?:\/\/.+/.test(v), 'Logo phải là URL hợp lệ')
    .optional()
    .or(z.literal('')),
  description: z.string().optional(),
  active: z.boolean(),
});
type BrandFormData = z.infer<typeof brandSchema>;

// ── Logo Uploader ─────────────────────────────────────────────────────────────

function LogoUploader({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Chỉ chấp nhận file ảnh');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ảnh tối đa 2MB');
      return;
    }
    setUploading(true);
    try {
      const { uploadFile } = await import('@/lib/api/upload');
      const result = await uploadFile(file, 'brands');
      onChange(result.secure_url);
    } catch {
      toast.error('Upload thất bại');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <>
      <div className="flex items-center gap-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
          {value && value.startsWith('http') ? (
            <img src={value} alt="Logo" className="h-full w-full object-contain p-1" />
          ) : (
            <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
          )}
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="hidden"
              id="brand-logo-upload"
            />
            <label
              htmlFor="brand-logo-upload"
              className={cn(
                'flex cursor-pointer items-center gap-1.5 rounded-md border border-dashed px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-ring hover:bg-primary/5 hover:text-primary',
                uploading && 'pointer-events-none opacity-60',
              )}
            >
              <Upload className="h-3.5 w-3.5" />
              {uploading ? 'Đang tải lên...' : 'Tải lên'}
            </label>
            <button
              type="button"
              onClick={() => setShowPicker(true)}
              className="flex cursor-pointer items-center gap-1.5 rounded-md border px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-ring hover:bg-primary/5 hover:text-primary"
            >
              <ImageIcon className="h-3.5 w-3.5" />
              Thư viện
            </button>
          </div>
          <Input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Hoặc nhập URL ảnh..."
            className="text-xs"
          />
        </div>
      </div>
      {showPicker && (
        <MediaPickerDialog
          folder="brands"
          multiple={false}
          onInsert={(urls) => {
            if (urls[0]) onChange(urls[0]);
          }}
          onClose={() => setShowPicker(false)}
        />
      )}
    </>
  );
}

// ── Panel ─────────────────────────────────────────────────────────────────────

export function BrandPanel({
  brand,
  onClose,
  onSaved,
}: {
  brand: Brand | null;
  onClose: () => void;
  onSaved: (b: Brand) => void;
}) {
  const isEdit = !!brand;
  const slugTouched = useRef(isEdit);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
    defaultValues: brand
      ? {
          name: brand.name,
          slug: brand.slug,
          logo: brand.logo ?? '',
          description: brand.description ?? '',
          active: brand.active,
        }
      : { name: '', slug: '', logo: '', description: '', active: true },
  });

  const name = watch('name');
  const logoValue = watch('logo') ?? '';
  const active = watch('active');

  useEffect(() => {
    if (!slugTouched.current && name) setValue('slug', slugify(name));
  }, [name, setValue]);

  async function onSubmit(data: BrandFormData) {
    try {
      const payload = { ...data, logo: data.logo || null, description: data.description || null };
      const saved = isEdit
        ? await updateBrand(brand!.id, payload)
        : await createBrand(payload as Brand);
      toast.success(isEdit ? 'Đã cập nhật thương hiệu' : 'Đã tạo thương hiệu');
      onSaved(saved);
    } catch (e) {
      if (e instanceof ApiException) {
        if (e.error.code === 'BRAND_SLUG_EXISTS')
          setError('slug', { message: 'Đường dẫn này đã được dùng, hãy chọn tên khác.' });
        else if (e.error.errors)
          Object.entries(e.error.errors).forEach(([f, m]) =>
            setError(f as keyof BrandFormData, { message: m }),
          );
        else toast.error(e.error.message);
      }
    }
  }

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="flex w-full max-w-md flex-col gap-0 p-0"
      >
        {/* Header */}
        <SheetHeader className="flex-row items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Building2 className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <SheetTitle className="text-sm font-semibold">
                {isEdit ? 'Sửa thương hiệu' : 'Thêm thương hiệu'}
              </SheetTitle>
              {isEdit && (
                <p className="text-xs text-muted-foreground/70">ID #{brand!.id}</p>
              )}
            </div>
          </div>
        </SheetHeader>

        {/* Form */}
        <form
          id="brand-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-1 flex-col overflow-y-auto"
          noValidate
        >
          <div className="flex-1 space-y-5 px-6 py-5">
            {/* Tên */}
            <div>
              <Label htmlFor="brand-name" className="mb-1.5">
                Tên thương hiệu <span className="text-destructive" aria-hidden="true">*</span>
              </Label>
              <Input
                id="brand-name"
                {...register('name')}
                placeholder="VD: Apple, Samsung..."
                autoFocus
                aria-required="true"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'brand-name-error' : undefined}
                className={errors.name ? 'border-destructive/50 bg-destructive/5' : ''}
              />
              {errors.name && (
                <p id="brand-name-error" role="alert" className="mt-1 text-xs text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Slug */}
            <div>
              <Label htmlFor="brand-slug" className="mb-1.5">
                Đường dẫn (slug) <span className="text-destructive" aria-hidden="true">*</span>
              </Label>
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-xs text-muted-foreground/70 select-none" aria-hidden="true">
                  /
                </span>
                <Input
                  id="brand-slug"
                  {...register('slug')}
                  placeholder="apple"
                  onFocus={() => { slugTouched.current = true; }}
                  aria-required="true"
                  aria-invalid={!!errors.slug}
                  aria-describedby={errors.slug ? 'brand-slug-error' : 'brand-slug-hint'}
                  className={cn('pl-6 font-mono', errors.slug ? 'border-destructive/50 bg-destructive/5' : '')}
                />
              </div>
              {errors.slug ? (
                <p id="brand-slug-error" role="alert" className="mt-1 text-xs text-destructive">
                  {errors.slug.message}
                </p>
              ) : (
                <p id="brand-slug-hint" className="mt-1 text-xs text-muted-foreground/60">
                  Tự động tạo từ tên. Dùng để tạo URL cho thương hiệu.
                </p>
              )}
            </div>

            {/* Logo */}
            <div>
              <Label className="mb-1.5">Logo</Label>
              <LogoUploader
                value={logoValue}
                onChange={(url) => setValue('logo', url, { shouldValidate: true })}
              />
              {errors.logo && (
                <p role="alert" className="mt-1 text-xs text-destructive">
                  {errors.logo.message}
                </p>
              )}
            </div>

            {/* Mô tả */}
            <div>
              <Label htmlFor="brand-desc" className="mb-1.5">Mô tả</Label>
              <textarea
                id="brand-desc"
                {...register('description')}
                rows={3}
                placeholder="VD: Thương hiệu công nghệ hàng đầu Hàn Quốc..."
                className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            {/* Toggle active */}
            <div className="flex items-center justify-between rounded-md border px-4 py-3">
              <div>
                <Label htmlFor="brand-active" className="text-sm font-medium">
                  Hiển thị trên cửa hàng
                </Label>
                <p className="text-xs text-muted-foreground">
                  Bật để khách hàng thấy thương hiệu này khi mua hàng
                </p>
              </div>
              <Switch
                id="brand-active"
                checked={active}
                onCheckedChange={(v) => setValue('active', v)}
                aria-label="Hiển thị trên cửa hàng"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <SheetFooter className="flex-row gap-3 border-t px-6 py-4">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" form="brand-form" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo thương hiệu'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
