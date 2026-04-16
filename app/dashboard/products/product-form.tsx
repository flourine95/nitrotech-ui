'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ArrowLeft, ImageIcon, Save } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { KeyValueEditor } from './key-value-editor';
import { GalleryEditor } from './gallery-editor';
import { VariantsEditor } from './variants-editor';


interface ProductFormProps {
  product?: Product; // undefined = create mode
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
      : {
          name: '',
          slug: '',
          description: '',
          categoryId: undefined,
          brandId: null,
          thumbnail: '',
          active: true,
        },
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
        const catList = Array.isArray(cats)
          ? cats
          : ((cats as { content: Category[] }).content ?? []);
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
          images, // always send current images array
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
          variants: [], // variants added after creation via VariantsEditor
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

  const inputCls = (hasError: boolean) =>
    `w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-colors focus:ring-2 ${hasError ? 'border-rose-300 bg-rose-50 focus:ring-rose-100' : 'border-slate-200 bg-slate-50 focus:border-blue-400 focus:bg-white focus:ring-blue-100'}`;

  const labelCls = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500';

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" asChild className="rounded-lg text-slate-400">
            <Link href="/dashboard/products">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {isEdit ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
            </h1>
            {isEdit && <p className="text-xs text-slate-400">ID #{product!.id}</p>}
          </div>
        </div>
        <Button type="submit" disabled={isSubmitting} size="lg" className="rounded-xl">
          <Save className="h-4 w-4" />
          {isSubmitting ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo sản phẩm'}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ── Left column (2/3) ── */}
        <div className="space-y-6 lg:col-span-2">
          {/* Basic info */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-slate-900">Thông tin cơ bản</h2>
            <div className="space-y-4">
              <div>
                <label className={labelCls}>
                  Tên sản phẩm <span className="text-rose-500">*</span>
                </label>
                <input
                  {...register('name')}
                  placeholder="VD: iPhone 16 Pro Max"
                  autoFocus
                  className={inputCls(!!errors.name)}
                />
                {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name.message}</p>}
              </div>
              <div>
                <label className={labelCls}>
                  Slug <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute top-1/2 left-3.5 -translate-y-1/2 text-xs text-slate-400 select-none">
                    /
                  </span>
                  <input
                    {...register('slug')}
                    placeholder="iphone-16-pro-max"
                    onFocus={() => {
                      slugTouched.current = true;
                    }}
                    className={`w-full rounded-xl border py-2.5 pr-3.5 pl-6 font-mono text-sm transition-colors outline-none focus:ring-2 ${errors.slug ? 'border-rose-300 bg-rose-50 focus:ring-rose-100' : 'border-slate-200 bg-slate-50 focus:border-blue-400 focus:bg-white focus:ring-blue-100'}`}
                  />
                </div>
                {errors.slug && <p className="mt-1 text-xs text-rose-500">{errors.slug.message}</p>}
              </div>
              <div>
                <label className={labelCls}>Mô tả</label>
                <textarea
                  {...register('description')}
                  rows={4}
                  placeholder="Mô tả chi tiết sản phẩm..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm transition-colors outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>

          {/* Specs */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-slate-900">Thông số kỹ thuật</h2>
            <KeyValueEditor
              value={specs}
              onChange={setSpecs}
              keyPlaceholder="VD: RAM"
              valuePlaceholder="VD: 8GB"
            />
          </div>

          {/* Gallery */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-1 text-sm font-semibold text-slate-900">Thư viện ảnh</h2>
            <p className="mb-4 text-xs text-slate-400">
              Kéo để sắp xếp thứ tự. Ảnh đầu tiên là ảnh chính trong gallery.
            </p>
            <GalleryEditor images={images} onChange={setImages} />
          </div>

          {/* Variants */}
          {isEdit && (
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Variants</h2>
                  <p className="text-xs text-slate-400">{variants.length} variant</p>
                </div>
              </div>
              <VariantsEditor productId={product!.id} variants={variants} onChange={setVariants} />
            </div>
          )}

          {!isEdit && (
            <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-blue-600">
              Sau khi tạo sản phẩm, bạn có thể thêm variants trong trang chỉnh sửa.
            </div>
          )}
        </div>

        {/* ── Right column (1/3) ── */}
        <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          {/* Thumbnail */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Thumbnail</h2>
            {/* Đã thêm class 'relative' vào div bọc ngoài để Image fill hoạt động */}
            <div
              className="relative mb-3 flex aspect-video cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 transition-colors hover:border-blue-400 hover:bg-blue-50"
              onClick={() => setShowThumbPicker(true)}
            >
              {thumbnail && thumbnail.startsWith('http') ? (
                <Image
                  src={thumbnail}
                  alt="Thumbnail"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-400">
                  <ImageIcon className="h-8 w-8" />
                  <span className="text-xs">Nhấn để chọn ảnh</span>
                </div>
              )}
            </div>
            <input
              {...register('thumbnail')}
              placeholder="Hoặc nhập URL..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs transition-colors outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
            {errors.thumbnail && (
              <p className="mt-1 text-xs text-rose-500">{errors.thumbnail.message}</p>
            )}
          </div>

          {/* Category + Brand */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Phân loại</h2>
            <div className="space-y-3">
              <div>
                <label className={labelCls}>
                  Danh mục <span className="text-rose-500">*</span>
                </label>
                <Select
                  value={watch('categoryId') ? String(watch('categoryId')) : ''}
                  onValueChange={(v) => setValue('categoryId', Number(v), { shouldValidate: true })}
                >
                  <SelectTrigger
                    className={`w-full rounded-xl py-2.5 text-sm ${errors.categoryId ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-slate-50'}`}
                  >
                    <SelectValue placeholder="— Chọn danh mục —" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoryId && (
                  <p className="mt-1 text-xs text-rose-500">{errors.categoryId.message}</p>
                )}
              </div>
              <div>
                <label className={labelCls}>Thương hiệu</label>
                <Select
                  value={watch('brandId') ? String(watch('brandId')) : 'none'}
                  onValueChange={(v) => setValue('brandId', v === 'none' ? null : Number(v))}
                >
                  <SelectTrigger className="w-full rounded-xl border-slate-200 bg-slate-50 py-2.5 text-sm">
                    <SelectValue placeholder="— Không có —" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— Không có —</SelectItem>
                    {brands.map((b) => (
                      <SelectItem key={b.id} value={String(b.id)}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Active toggle */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Hiển thị trên cửa hàng</p>
                <p className="text-xs text-slate-400">Khách hàng có thể thấy sản phẩm này</p>
              </div>
              <Switch
                checked={active}
                onCheckedChange={(val) => setValue('active', val)}
                aria-label="Hiển thị trên cửa hàng"
              />
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
