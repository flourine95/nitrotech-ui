'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Ellipsis, Package, Pencil, Plus, Trash2 } from 'lucide-react';
import type { Product, ProductVariant } from '@/lib/api/products';
import { deleteProduct, updateProduct } from '@/lib/api/products';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { formatPrice } from '../utils';
import { VariantFormSheet } from './variant-form-sheet';

interface ProductDetailClientProps {
  product: Product;
}

// Mock data for features not yet in backend
const mockStock = [
  { warehouse: 'Kho Hà Nội', quantity: 150, status: 'in-stock' },
  { warehouse: 'Kho TP.HCM', quantity: 85, status: 'in-stock' },
  { warehouse: 'Kho Đà Nẵng', quantity: 12, status: 'low' },
];

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [deleteTarget, setDeleteTarget] = useState(false);
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | undefined>();
  const [selectedImage, setSelectedImage] = useState(
    product.thumbnail ?? (product.images && product.images[0]) ?? '',
  );

  const toggleActiveMutation = useMutation({
    mutationFn: () => updateProduct(product.id, { active: !product.active }),
    onSuccess: (updated) => {
      void queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(updated.active ? 'Đã hiển thị' : 'Đã ẩn');
    },
    onError: () => toast.error('Cập nhật thất bại'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteProduct(product.id),
    onSuccess: () => {
      toast.success('Đã xóa sản phẩm');
      router.push('/dashboard/products');
    },
    onError: () => toast.error('Xóa thất bại'),
  });

  function handleAddVariant() {
    setEditingVariant(undefined);
    setShowVariantForm(true);
  }

  function handleEditVariant(variant: ProductVariant) {
    setEditingVariant(variant);
    setShowVariantForm(true);
  }

  function handleCloseVariantForm() {
    setShowVariantForm(false);
    setEditingVariant(undefined);
  }

  const allImages = [
    product.thumbnail,
    ...(product.images ?? []).filter((img) => img !== product.thumbnail),
  ].filter(Boolean) as string[];

  const totalStock = mockStock.reduce((sum, s) => sum + s.quantity, 0);
  const lowStockCount = product.variants?.filter((v) => v.active).length ?? 0;
  const avgStock = product.variantCount > 0 ? Math.round(totalStock / product.variantCount) : 0;

  return (
    <div className="flex min-w-0 flex-col">
      {/* Header — same pattern as ProductForm */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
            <Link href="/dashboard/products" aria-label="Quay lại">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <Link href="/dashboard/products" className="hover:text-foreground">
            Sản phẩm
          </Link>
          <span>/</span>
          <span className="font-medium text-foreground truncate max-w-[200px]">{product.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9" onClick={handleAddVariant}>
            <Plus className="h-4 w-4" />
            Thêm biến thể
          </Button>
          <Button variant="outline" size="sm" className="h-9" asChild>
            <Link href={`/dashboard/products/${product.id}/edit`}>
              <Pencil className="h-4 w-4" />
              Chỉnh sửa
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Ellipsis className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/products/${product.slug}`} target="_blank">
                  Xem trên cửa hàng
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(true)}>
                Xóa sản phẩm
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="min-w-0 pb-2">
        <div className="overflow-x-auto border-b">
          <TabsList variant="line" className="h-auto justify-start gap-5 bg-transparent p-0">
            <TabsTrigger
              value="overview"
              className="rounded-none border-x-0 border-t-0 border-b-2 border-transparent px-0 pt-0 pb-3 text-sm data-[state=active]:border-b-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Tổng quan
            </TabsTrigger>
            <TabsTrigger
              value="variants"
              className="rounded-none border-x-0 border-t-0 border-b-2 border-transparent px-0 pt-0 pb-3 text-sm data-[state=active]:border-b-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Biến thể
            </TabsTrigger>
            <TabsTrigger
              value="inventory"
              className="rounded-none border-x-0 border-t-0 border-b-2 border-transparent px-0 pt-0 pb-3 text-sm data-[state=active]:border-b-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Kho hàng
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="rounded-none border-x-0 border-t-0 border-b-2 border-transparent px-0 pt-0 pb-3 text-sm data-[state=active]:border-b-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Hoạt động
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-0 pt-6">
          <div className="grid min-w-0 gap-8 xl:grid-cols-[360px_minmax(0,1fr)] xl:items-start">
            {/* Left: Gallery */}
            <div className="flex min-w-0 flex-col gap-5">
              <div className="rounded-3xl border border-border/60 bg-muted/20 p-4">
                <div className="relative h-[300px] overflow-hidden rounded-2xl border border-border/60 bg-background md:h-[360px]">
                  {selectedImage && selectedImage.startsWith('http') ? (
                    <Image
                      src={selectedImage}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1280px) 360px, (min-width: 768px) 50vw, 100vw"
                    />
                  ) : (
                    <Package className="absolute inset-0 m-auto h-16 w-16 text-muted-foreground" />
                  )}
                </div>
                <div className="mt-4 flex min-w-0 gap-3 overflow-x-auto pb-1">
                  {allImages.length > 0 ? (
                    allImages.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedImage(img)}
                        className={`relative h-18 w-18 shrink-0 overflow-hidden rounded-xl border bg-background transition-all ${
                          selectedImage === img
                            ? 'border-foreground ring-2 ring-foreground/10'
                            : 'border-border/60 opacity-80 hover:opacity-100'
                        }`}
                      >
                        {img.startsWith('http') ? (
                          <Image src={img} alt="" fill className="object-cover" sizes="72px" />
                        ) : (
                          <Package className="absolute inset-0 m-auto h-6 w-6 text-muted-foreground" />
                        )}
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Không có ảnh</p>
                  )}
                </div>
              </div>

              {/* Product info card */}
              <div className="rounded-2xl border bg-card shadow-none">
                <div className="flex flex-col gap-2 space-y-1.5 p-6">
                  <div className="text-base font-semibold tracking-tight">Thông tin sản phẩm</div>
                  <div className="text-sm text-muted-foreground">
                    Thông tin cơ bản về sản phẩm này.
                  </div>
                </div>
                <div className="grid gap-4 p-6 pt-0 sm:grid-cols-2">
                  <div>
                    <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                      Danh mục
                    </p>
                    <p className="mt-2 font-medium">{product.categoryName ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                      Thương hiệu
                    </p>
                    <p className="mt-2 font-medium">{product.brandName ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                      Giá thấp nhất
                    </p>
                    <p className="mt-2 font-medium">
                      {product.priceMin ? `${product.priceMin.toLocaleString('vi-VN')}đ` : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                      Giá cao nhất
                    </p>
                    <p className="mt-2 font-medium">
                      {product.priceMax ? `${product.priceMax.toLocaleString('vi-VN')}đ` : '—'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Stats & Variants */}
            <div className="grid min-w-0 gap-4">
              {/* Stats cards */}
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border bg-card shadow-none">
                  <div className="p-5">
                    <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                      Tổng tồn kho
                    </p>
                    <p className="mt-3 text-3xl font-semibold tracking-tight">{totalStock}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Trên {product.variantCount} biến thể
                    </p>
                  </div>
                </div>
                <div className="rounded-2xl border bg-card shadow-none">
                  <div className="p-5">
                    <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                      Sắp hết hàng
                    </p>
                    <p className="mt-3 text-3xl font-semibold tracking-tight">{lowStockCount}</p>
                    <p className="mt-1 text-sm text-muted-foreground">Biến thể dưới ngưỡng</p>
                  </div>
                </div>
                <div className="rounded-2xl border bg-card shadow-none">
                  <div className="p-5">
                    <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                      Trung bình
                    </p>
                    <p className="mt-3 text-3xl font-semibold tracking-tight">{avgStock}</p>
                    <p className="mt-1 text-sm text-muted-foreground">Đơn vị mỗi biến thể</p>
                  </div>
                </div>
              </div>

              {/* Variants list */}
              <div className="flex min-w-0 items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium">Danh sách phiên bản</p>
                  <p className="text-sm text-muted-foreground">Click vào phiên bản để chỉnh sửa.</p>
                </div>
              </div>

              {product.variants && product.variants.length > 0 ? (
                <div className="space-y-3">
                  {product.variants.map((variant, idx) => (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => handleEditVariant(variant)}
                      className={`w-full rounded-2xl border p-3 text-left transition-colors ${
                        idx === 0
                          ? 'border-foreground/20 bg-background shadow-sm'
                          : 'border-border/60 bg-background/70 hover:border-border hover:bg-background'
                      }`}
                    >
                      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_100px_auto] lg:items-center">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-border/60 bg-muted/30">
                            {product.thumbnail && product.thumbnail.startsWith('http') ? (
                              <Image
                                src={product.thumbnail}
                                alt={variant.name}
                                fill
                                className="object-cover"
                                sizes="56px"
                              />
                            ) : (
                              <Package className="absolute inset-0 m-auto h-6 w-6 text-muted-foreground" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate font-medium">{variant.name}</p>
                              {idx === 0 && (
                                <Badge
                                  variant="secondary"
                                  className="rounded-md px-2 py-0.5 text-[11px] font-semibold"
                                >
                                  Chính
                                </Badge>
                              )}
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                              <span>{variant.sku}</span>
                              <span>•</span>
                              <span className={variant.active ? '' : 'text-rose-600'}>
                                {variant.active ? 'Còn hàng' : 'Hết hàng'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                            Giá
                          </p>
                          <p className="mt-1 font-medium">
                            {variant.price.toLocaleString('vi-VN')}đ
                          </p>
                        </div>
                        <div className="flex items-center justify-end">
                          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground">
                            <Ellipsis className="h-4 w-4" />
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border bg-card py-12">
                  <Package className="mb-3 h-10 w-10 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">Chưa có phiên bản nào</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleAddVariant}
                    className="mt-3 text-emerald-600 hover:text-emerald-700"
                  >
                    <Plus className="h-4 w-4" />
                    Thêm phiên bản đầu tiên
                  </Button>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Variants Tab */}
        <TabsContent value="variants" className="mt-0 pt-6">
          <div className="rounded-2xl border bg-card p-6">
            <p className="text-sm text-muted-foreground">Tab Biến thể - Đang phát triển</p>
          </div>
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="mt-0 pt-6">
          <div className="rounded-2xl border bg-card p-6">
            <p className="text-sm text-muted-foreground">Tab Kho hàng - Đang phát triển</p>
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="mt-0 pt-6">
          <div className="rounded-2xl border bg-card p-6">
            <p className="text-sm text-muted-foreground">Tab Hoạt động - Đang phát triển</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete dialog */}
      <AlertDialog open={deleteTarget} onOpenChange={setDeleteTarget}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-rose-100 text-rose-600">
              <Trash2 className="h-5 w-5" />
            </AlertDialogMedia>
            <AlertDialogTitle>Xóa sản phẩm?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn sắp xóa <strong className="text-slate-900">{product.name}</strong>. Sản phẩm sẽ bị
              ẩn và có thể khôi phục lại sau.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Đang xóa...' : 'Xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Variant form sheet */}
      <VariantFormSheet
        open={showVariantForm}
        onClose={handleCloseVariantForm}
        productId={product.id}
        productName={product.name}
        variant={editingVariant}
      />
    </div>
  );
}
