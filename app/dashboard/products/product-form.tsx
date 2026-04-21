'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ArrowLeft, ImagePlus } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  createProduct,
  type CreateProductBody,
  type Product,
  type ProductVariant,
  updateProduct,
} from '@/lib/api/products';
import type { Category } from '@/lib/api/categories';
import { getCategories } from '@/lib/api/categories';
import type { Brand } from '@/lib/api/brands';
import { getBrands } from '@/lib/api/brands';
import { ApiException } from '@/lib/client';
import { slugify } from '@/lib/utils';
import { productSchema, type ProductFormData } from '@/lib/schemas/products';
import MediaPickerDialog from '@/components/media-picker-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { KeyValueEditor } from './key-value-editor';
import { GalleryEditor } from './gallery-editor';
import { VariantsEditor } from './variants-editor';

// Lazy load RichTextEditor (Tiptap is heavy)
const RichTextEditor = dynamic(
  () => import('./rich-text-editor').then((mod) => ({ default: mod.RichTextEditor })),
  { ssr: false, loading: () => <div className="h-[200px] animate-pulse rounded-md border bg-muted" /> }
);

interface ProductFormProps {
  product?: Product;
}

const inputCls = (hasError?: boolean) =>
  `border-input placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:ring-1 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50${hasError ? ' border-destructive' : ''}`;

const labelCls = 'text-sm font-medium';

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-destructive">{message}</p>;
}

function Card({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="bg-card text-card-foreground rounded-2xl border">
      <div className="flex flex-col space-y-1 p-6">
        <p className="font-semibold tracking-tight">{title}</p>
        {description && <p className="text-muted-foreground text-sm">{description}</p>}
      </div>
      <div className="p-6 pt-0">{children}</div>
    </div>
  );
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const isEdit = !!product;
  const slugTouched = useRef(isEdit);

  const [specs, setSpecs] = useState<Record<string, string>>(
    (product?.specs as Record<string, string>) ?? {},
  );
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [variants, setVariants] = useState<ProductVariant[]>(product?.variants ?? []);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [showThumbPicker, setShowThumbPicker] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          name: product.name,
          slug: product.slug,
          description: product.description ?? '',
          categoryId: product.categoryId,
          brandId: product.brandId ?? null,
          thumbnail: product.thumbnail ?? '',
          active: product.active,
        }
      : { name: '', slug: '', description: '', categoryId: undefined, brandId: null, thumbnail: '', active: true },
  });

  const name = watch('name');
  const thumbnail = watch('thumbnail');
  const active = watch('active');

  useEffect(() => {
    if (!slugTouched.current && name) setValue('slug', slugify(name));
  }, [name, setValue]);

  useEffect(() => {
    Promise.all([getCategories({ tree: false }), getBrands({ size: 100 })])
      .then(([cats, brnds]) => {
        const catList = Array.isArray(cats) ? cats : ((cats as { content: Category[] }).content ?? []);
        setCategories(catList);
        setBrands(brnds.content);
      })
      .catch(() => {});
  }, []);

  async function onSubmit(data: ProductFormData) {
    try {
      if (isEdit) {
        await updateProduct(product!.id, {
          ...data,
          description: data.description || null,
          thumbnail: data.thumbnail || null,
          brandId: data.brandId ?? null,
          specs: Object.keys(specs).length > 0 ? specs : null,
          images,
        });
        toast.success('Đã cập nhật sản phẩm');
        router.push('/dashboard/products');
      } else {
        const body: CreateProductBody = {
          ...data,
          description: data.description || null,
          thumbnail: data.thumbnail || null,
          brandId: data.brandId ?? null,
          specs: Object.keys(specs).length > 0 ? specs : null,
          images,
          variants: [],
        };
        const created = await createProduct(body);
        toast.success('Đã tạo sản phẩm');
        router.push(`/dashboard/products/${created.id}/edit`);
      }
    } catch (e) {
      if (e instanceof ApiException) {
        if (e.error.code === 'PRODUCT_SLUG_EXISTS')
          setError('slug', { message: 'Slug đã tồn tại' });
        else if (e.error.errors)
          Object.entries(e.error.errors).forEach(([f, m]) =>
            setError(f as keyof ProductFormData, { message: m as string }),
          );
        else toast.error(e.error.message);
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* Page header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
            <Link href="/dashboard/products" aria-label="Quay lại">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <Link href="/dashboard/products" className="hover:text-foreground">Sản phẩm</Link>
          <span>/</span>
          <span className="text-foreground font-medium">
            {isEdit ? product!.name : 'Thêm mới'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" asChild>
            <Link href="/dashboard/products">Hủy</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Lưu sản phẩm'}
          </Button>
        </div>
      </div>

      {/* Body: 2-col grid */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.78fr)]">

        {/* ── Left column ── */}
        <div className="flex flex-col gap-6">

          <Card title="Thông tin sản phẩm" description="Tên, slug và mô tả hiển thị với khách hàng.">
            <div className="flex flex-col gap-4">
              <div>
                <label className={labelCls} htmlFor="name">
                  Tên sản phẩm <span className="text-destructive">*</span>
                </label>
                <input
                  id="name"
                  {...register('name')}
                  placeholder="VD: iPhone 16 Pro Max"
                  autoFocus
                  className={`mt-1.5 ${inputCls(!!errors.name)}`}
                />
                <FieldError message={errors.name?.message} />
              </div>

              <div>
                <label className={labelCls} htmlFor="slug">
                  Slug <span className="text-destructive">*</span>
                </label>
                <div className="relative mt-1.5">
                  <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground select-none">/</span>
                  <input
                    id="slug"
                    {...register('slug')}
                    placeholder="iphone-16-pro-max"
                    onFocus={() => { slugTouched.current = true; }}
                    className={`${inputCls(!!errors.slug)} pl-6 font-mono`}
                  />
                </div>
                <FieldError message={errors.slug?.message} />
              </div>

              <div>
                <label className={labelCls} htmlFor="description">Mô tả</label>
                <div className="mt-1.5">
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <RichTextEditor
                        content={field.value ?? ''}
                        onChange={field.onChange}
                        disabled={isSubmitting}
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card title="Thư viện ảnh" description="Kéo để sắp xếp thứ tự. Ảnh đầu tiên là ảnh chính.">
            <GalleryEditor images={images} onChange={setImages} />
          </Card>

          <Card title="Thông số kỹ thuật" description="Các thông số chi tiết của sản phẩm.">
            <KeyValueEditor value={specs} onChange={setSpecs} keyPlaceholder="VD: RAM" valuePlaceholder="VD: 8GB" />
          </Card>

          {isEdit && (
            <Card title="Variants" description={`${variants.length} variant đã tạo.`}>
              <VariantsEditor productId={product!.id} variants={variants} onChange={setVariants} />
            </Card>
          )}

          {!isEdit && (
            <p className="text-sm text-muted-foreground px-1">
              Sau khi tạo sản phẩm, bạn có thể thêm variants trong trang chỉnh sửa.
            </p>
          )}
        </div>

        {/* ── Right column ── */}
        <div className="flex flex-col gap-4 xl:self-start xl:sticky xl:top-4">
          {/* Wrapper dashed như mẫu */}
          <div className="bg-muted/35 flex flex-col gap-4 rounded-[28px] border border-dashed p-3">

            {/* Thumbnail */}
            <div className="bg-background/95 border-border/80 rounded-2xl border shadow-sm">
              <div className="p-6 pb-3">
                <p className="font-semibold tracking-tight">Thumbnail</p>
                <p className="text-muted-foreground text-sm">Ảnh đại diện hiển thị trong danh sách.</p>
              </div>
              <div className="px-6 pb-6 flex flex-col gap-3">
                {/* Preview */}
                <div
                  className="bg-muted/50 relative flex aspect-square w-20 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed transition-colors hover:border-ring"
                  onClick={() => setShowThumbPicker(true)}
                >
                  {thumbnail && thumbnail.startsWith('http') ? (
                    <Image src={thumbnail} alt="Thumbnail" fill sizes="80px" className="object-cover rounded-2xl" />
                  ) : (
                    <ImagePlus className="text-muted-foreground/70 h-5 w-5" />
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setShowThumbPicker(true)}>
                    Chọn ảnh
                  </Button>
                  {thumbnail && (
                    <Button type="button" variant="ghost" size="sm" disabled={!thumbnail} onClick={() => setValue('thumbnail', '')}>
                      Xóa
                    </Button>
                  )}
                </div>
                <input
                  {...register('thumbnail')}
                  placeholder="Hoặc nhập URL ảnh..."
                  className={inputCls(!!errors.thumbnail)}
                />
                <FieldError message={errors.thumbnail?.message} />
              </div>
            </div>

            {/* Organization */}
            <div className="bg-background/95 border-border/80 rounded-2xl border shadow-sm">
              <div className="p-6 pb-3">
                <p className="font-semibold tracking-tight">Phân loại</p>
                <p className="text-muted-foreground text-sm">Gắn danh mục và thương hiệu cho sản phẩm.</p>
              </div>
              <div className="px-6 pb-6 flex flex-col gap-4">
                <div>
                  <label className={labelCls} htmlFor="categoryId">
                    Danh mục <span className="text-destructive">*</span>
                  </label>
                  <Select
                    value={watch('categoryId') ? String(watch('categoryId')) : ''}
                    onValueChange={(v) => setValue('categoryId', Number(v), { shouldValidate: true })}
                  >
                    <SelectTrigger id="categoryId" className={`mt-1.5 w-full${errors.categoryId ? ' border-destructive' : ''}`}>
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError message={errors.categoryId?.message} />
                </div>

                <div>
                  <label className={labelCls} htmlFor="brandId">Thương hiệu</label>
                  <Select
                    value={watch('brandId') ? String(watch('brandId')) : 'none'}
                    onValueChange={(v) => setValue('brandId', v === 'none' ? null : Number(v))}
                  >
                    <SelectTrigger id="brandId" className="mt-1.5 w-full">
                      <SelectValue placeholder="Không có" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Không có</SelectItem>
                      {brands.map((b) => (
                        <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="bg-background/95 border-border/80 rounded-2xl border shadow-sm">
              <div className="p-6 pb-3">
                <p className="font-semibold tracking-tight">Trạng thái</p>
                <p className="text-muted-foreground text-sm">Kiểm soát hiển thị trên cửa hàng.</p>
              </div>
              <div className="px-6 pb-6">
                <Separator className="mb-4" />
                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <label className={labelCls} htmlFor="active">Hiển thị trên cửa hàng</label>
                    <p className="text-muted-foreground text-xs">Tắt để ẩn sản phẩm khỏi khách hàng.</p>
                  </div>
                  <Switch
                    id="active"
                    checked={active}
                    onCheckedChange={(val) => setValue('active', val)}
                    aria-label="Hiển thị trên cửa hàng"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {showThumbPicker && (
        <MediaPickerDialog
          folder="products"
          multiple={false}
          onInsert={(urls) => {
            if (urls[0]) setValue('thumbnail', urls[0], { shouldValidate: true });
          }}
          onClose={() => setShowThumbPicker(false)}
        />
      )}
    </form>
  );
}
