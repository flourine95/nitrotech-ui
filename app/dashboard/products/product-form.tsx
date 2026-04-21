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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Field, FieldError } from '@/components/ui/field';
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

const RichTextEditor = dynamic(
  () => import('./rich-text-editor').then((mod) => ({ default: mod.RichTextEditor })),
  { ssr: false, loading: () => <div className="h-[200px] animate-pulse rounded-md border bg-muted" /> }
);

interface ProductFormProps {
  product?: Product;
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

  useEffect(() => {
    const { unsubscribe } = watch((values, { name: field }) => {
      if (field === 'name' && !slugTouched.current) {
        setValue('slug', slugify(values.name ?? ''));
      }
    });
    return unsubscribe;
  }, [watch, setValue]);

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

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Thông tin sản phẩm</CardTitle>
              <CardDescription>Tên, slug và mô tả hiển thị với khách hàng.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div>
                <Label htmlFor="name">
                  Tên sản phẩm <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="VD: iPhone 16 Pro Max"
                  autoFocus
                  aria-invalid={!!errors.name}
                  className="mt-1.5"
                />
                <FieldError errors={[errors.name]} className="mt-1" />
              </div>

              <div>
                <Label htmlFor="slug">
                  Slug <span className="text-destructive">*</span>
                </Label>
                <div className="relative mt-1.5">
                  <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground select-none">/</span>
                  <Input
                    id="slug"
                    {...register('slug')}
                    placeholder="iphone-16-pro-max"
                    onFocus={() => { slugTouched.current = true; }}
                    aria-invalid={!!errors.slug}
                    className="pl-6 font-mono"
                  />
                </div>
                <FieldError errors={[errors.slug]} className="mt-1" />
              </div>

              <div>
                <Label htmlFor="description">Mô tả</Label>
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
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Thư viện ảnh</CardTitle>
              <CardDescription>Kéo để sắp xếp thứ tự. Ảnh đầu tiên là ảnh chính.</CardDescription>
            </CardHeader>
            <CardContent>
              <GalleryEditor images={images} onChange={setImages} />
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Thông số kỹ thuật</CardTitle>
              <CardDescription>Các thông số chi tiết của sản phẩm.</CardDescription>
            </CardHeader>
            <CardContent>
              <KeyValueEditor value={specs} onChange={setSpecs} keyPlaceholder="VD: RAM" valuePlaceholder="VD: 8GB" />
            </CardContent>
          </Card>

          {isEdit && (
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Variants</CardTitle>
                <CardDescription>{variants.length} variant đã tạo.</CardDescription>
              </CardHeader>
              <CardContent>
                <VariantsEditor productId={product!.id} variants={variants} onChange={setVariants} />
              </CardContent>
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
          <div className="bg-muted/35 flex flex-col gap-4 rounded-[28px] border border-dashed p-3">

            {/* Thumbnail */}
            <Card className="bg-background/95 border-border/80 rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle>Thumbnail</CardTitle>
                <CardDescription>Ảnh đại diện hiển thị trong danh sách.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
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
                    <Button type="button" variant="ghost" size="sm" onClick={() => setValue('thumbnail', '')}>
                      Xóa
                    </Button>
                  )}
                </div>
                <Input
                  {...register('thumbnail')}
                  placeholder="Hoặc nhập URL ảnh..."
                  aria-invalid={!!errors.thumbnail}
                />
                <FieldError errors={[errors.thumbnail]} className="mt-1" />
              </CardContent>
            </Card>

            {/* Organization */}
            <Card className="bg-background/95 border-border/80 rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle>Phân loại</CardTitle>
                <CardDescription>Gắn danh mục và thương hiệu cho sản phẩm.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div>
                  <Label htmlFor="categoryId">
                    Danh mục <span className="text-destructive">*</span>
                  </Label>
                  <Controller
                    name="categoryId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value ? String(field.value) : ''}
                        onValueChange={(v) => field.onChange(Number(v))}
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
                    )}
                  />
                  <FieldError errors={[errors.categoryId]} className="mt-1" />
                </div>

                <div>
                  <Label htmlFor="brandId">Thương hiệu</Label>
                  <Controller
                    name="brandId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value ? String(field.value) : 'none'}
                        onValueChange={(v) => field.onChange(v === 'none' ? null : Number(v))}
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
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Status */}
            <Card className="bg-background/95 border-border/80 rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle>Trạng thái</CardTitle>
                <CardDescription>Kiểm soát hiển thị trên cửa hàng.</CardDescription>
              </CardHeader>
              <CardContent>
                <Separator className="mb-4" />
                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="active">Hiển thị trên cửa hàng</Label>
                    <p className="text-muted-foreground text-xs">Tắt để ẩn sản phẩm khỏi khách hàng.</p>
                  </div>
                  <Controller
                    name="active"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        id="active"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        aria-label="Hiển thị trên cửa hàng"
                      />
                    )}
                  />
                </div>
              </CardContent>
            </Card>

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
