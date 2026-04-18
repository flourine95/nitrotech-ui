'use client';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Building2, Upload, ImageIcon, X } from 'lucide-react';
import { createBrand, updateBrand, type Brand } from '@/lib/api/brands';
import { ApiException } from '@/lib/client';
import { slugify } from '@/lib/utils';
import MediaPickerDialog from '@/components/media-picker-dialog';

// ── Schema ────────────────────────────────────────────────────────────────────

const brandSchema = z.object({
  name: z.string().min(1, 'Tên không được để trống'),
  slug: z.string().min(1, 'Slug không được để trống').regex(/^[a-z0-9-]+$/, 'Chỉ chữ thường, số, gạch ngang'),
  logo: z.string().url('Logo phải là URL hợp lệ').or(z.literal('')),
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
    if (!file.type.startsWith('image/')) { toast.error('Chỉ chấp nhận file ảnh'); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error('Ảnh tối đa 2MB'); return; }
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
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/50">
          {value && value.startsWith('http') ? (
            <img src={value} alt="Logo" className="h-full w-full object-contain p-1" />
          ) : (
            <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
          )}
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" id="brand-logo-upload" />
            <label
              htmlFor="brand-logo-upload"
              className={`flex cursor-pointer items-center gap-1.5 rounded-xl border border-dashed border-slate-300 px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary ${uploading ? 'pointer-events-none opacity-60' : ''}`}
            >
              <Upload className="h-3.5 w-3.5" />
              {uploading ? 'Đang upload...' : 'Upload'}
            </label>
            <button
              type="button"
              onClick={() => setShowPicker(true)}
              className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
            >
              <ImageIcon className="h-3.5 w-3.5" />
              Thư viện
            </button>
          </div>
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Hoặc nhập URL trực tiếp..."
            className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground outline-none transition-colors focus:border-ring focus:bg-background focus:ring-2 focus:ring-ring/20"
          />
        </div>
      </div>
      {showPicker && (
        <MediaPickerDialog
          folder="brands"
          multiple={false}
          onInsert={(urls) => { if (urls[0]) onChange(urls[0]); }}
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

  const { register, handleSubmit, setValue, watch, setError, formState: { errors, isSubmitting } } = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
    defaultValues: brand
      ? { name: brand.name, slug: brand.slug, logo: brand.logo ?? '', description: brand.description ?? '', active: brand.active }
      : { name: '', slug: '', logo: '', description: '', active: true },
  });

  const name = watch('name');
  const logoValue = watch('logo');
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
        if (e.error.code === 'BRAND_SLUG_EXISTS') setError('slug', { message: 'Slug đã tồn tại' });
        else if (e.error.errors) Object.entries(e.error.errors).forEach(([f, m]) => setError(f as keyof BrandFormData, { message: m }));
        else toast.error(e.error.message);
      }
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />
      <aside className="fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col bg-card shadow-2xl" role="dialog" aria-modal="true">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">{isEdit ? 'Sửa thương hiệu' : 'Thêm thương hiệu'}</h2>
              {isEdit && <p className="text-xs text-muted-foreground/70">ID #{brand!.id}</p>}
            </div>
          </div>
          <button onClick={onClose} className="cursor-pointer rounded-lg p-1.5 text-muted-foreground/70 transition-colors hover:bg-muted hover:text-foreground/80" aria-label="Đóng">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col overflow-y-auto" noValidate>
          <div className="flex-1 space-y-5 px-6 py-5">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Tên thương hiệu <span className="text-rose-500">*</span>
              </label>
              <input
                {...register('name')}
                placeholder="VD: Apple, Samsung..."
                autoFocus
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-colors focus:ring-2 ${errors.name ? 'border-rose-300 bg-rose-50 focus:ring-rose-100' : 'border-border bg-muted/50 focus:border-ring focus:bg-background focus:ring-ring/20'}`}
              />
              {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name.message}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Slug <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute top-1/2 left-3.5 -translate-y-1/2 select-none text-xs text-muted-foreground/70">/</span>
                <input
                  {...register('slug')}
                  placeholder="apple"
                  onFocus={() => { slugTouched.current = true; }}
                  className={`w-full rounded-xl border py-2.5 pr-3.5 pl-6 font-mono text-sm outline-none transition-colors focus:ring-2 ${errors.slug ? 'border-rose-300 bg-rose-50 focus:ring-rose-100' : 'border-border bg-muted/50 focus:border-ring focus:bg-background focus:ring-ring/20'}`}
                />
              </div>
              {errors.slug && <p className="mt-1 text-xs text-rose-500">{errors.slug.message}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Logo</label>
              <LogoUploader value={logoValue} onChange={(url) => setValue('logo', url, { shouldValidate: true })} />
              {errors.logo && <p className="mt-1 text-xs text-rose-500">{errors.logo.message}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Mô tả</label>
              <textarea
                {...register('description')}
                rows={3}
                placeholder="Mô tả ngắn về thương hiệu..."
                className="w-full resize-none rounded-xl border border-border bg-muted/50 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-ring focus:bg-background focus:ring-2 focus:ring-ring/20"
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border bg-muted/50 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground/80">Hiển thị trên cửa hàng</p>
                <p className="text-xs text-muted-foreground/70">Khách hàng có thể thấy thương hiệu này</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={active}
                onClick={() => setValue('active', !active)}
                className={`relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${active ? 'bg-primary' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${active ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          <div className="border-t border-border px-6 py-4">
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 cursor-pointer rounded-xl border border-border py-2.5 text-sm font-semibold text-foreground/80 transition-colors hover:bg-muted/50">
                Hủy
              </button>
              <button type="submit" disabled={isSubmitting} className="flex-1 cursor-pointer rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60">
                {isSubmitting ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo thương hiệu'}
              </button>
            </div>
          </div>
        </form>
      </aside>
    </>
  );
}
