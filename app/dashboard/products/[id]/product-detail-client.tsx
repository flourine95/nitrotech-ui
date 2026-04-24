'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Ellipsis,
  Package,
  Pencil,
  Plus,
  Trash2,
  AlertTriangle,
  TrendingDown,
} from 'lucide-react';
import type { Product, ProductVariant } from '@/lib/api/products';
import { deleteProduct, updateProduct } from '@/lib/api/products';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
          <span className="max-w-[200px] truncate font-medium text-foreground">{product.name}</span>
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
                  <p className="font-medium">Danh sách biến thể</p>
                  <p className="text-sm text-muted-foreground">Click vào biến thể để chỉnh sửa.</p>
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
                  <p className="text-sm text-muted-foreground">Chưa có biến thể nào</p>
                  <Button variant="ghost" size="sm" onClick={handleAddVariant} className="mt-3">
                    <Plus className="h-4 w-4" />
                    Thêm biến thể đầu tiên
                  </Button>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Variants Tab — removed, edit page handles CRUD */}

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="mt-0 pt-6">
          <InventoryTab product={product} />
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="mt-0 pt-6">
          <ActivityTab product={product} />
        </TabsContent>
      </Tabs>

      {/* Delete dialog */}
      <AlertDialog open={deleteTarget} onOpenChange={setDeleteTarget}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <Trash2 className="h-5 w-5" />
            </AlertDialogMedia>
            <AlertDialogTitle>Xóa sản phẩm?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn sắp xóa <strong className="text-foreground">{product.name}</strong>. Sản phẩm sẽ
              bị ẩn và có thể khôi phục lại sau.
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

// ── Inventory Tab ─────────────────────────────────────────────────────────────

const MOCK_WAREHOUSES = ['Kho Hà Nội', 'Kho TP.HCM', 'Kho Đà Nẵng'];

const MOCK_INVENTORY: Record<string, Record<string, number>> = {
  'Đen - 128GB': { 'Kho Hà Nội': 42, 'Kho TP.HCM': 28, 'Kho Đà Nẵng': 5 },
  'Đen - 256GB': { 'Kho Hà Nội': 18, 'Kho TP.HCM': 11, 'Kho Đà Nẵng': 2 },
  'Trắng - 128GB': { 'Kho Hà Nội': 35, 'Kho TP.HCM': 22, 'Kho Đà Nẵng': 8 },
  'Trắng - 256GB': { 'Kho Hà Nội': 9, 'Kho TP.HCM': 4, 'Kho Đà Nẵng': 0 },
};

const LOW_THRESHOLD = 10;

function stockLevel(qty: number): 'out' | 'low' | 'ok' {
  if (qty === 0) return 'out';
  if (qty <= LOW_THRESHOLD) return 'low';
  return 'ok';
}

function StockBadge({ qty }: { qty: number }) {
  const level = stockLevel(qty);
  if (level === 'out')
    return <span className="text-xs font-medium text-destructive">Hết hàng</span>;
  if (level === 'low') return <span className="text-xs font-medium text-amber-600">{qty}</span>;
  return <span className="text-sm tabular-nums">{qty}</span>;
}

function InventoryTab({ product }: { product: Product }) {
  const variants = product.variants ?? [];

  // Use real variant names if available, else fall back to mock keys
  const rows =
    variants.length > 0
      ? variants.map((v) => ({
          name: v.name,
          data: MOCK_INVENTORY[v.name] ?? { 'Kho Hà Nội': 0, 'Kho TP.HCM': 0, 'Kho Đà Nẵng': 0 },
        }))
      : Object.entries(MOCK_INVENTORY).map(([name, data]) => ({ name, data }));

  const totals = MOCK_WAREHOUSES.reduce<Record<string, number>>((acc, wh) => {
    acc[wh] = rows.reduce((s, r) => s + (r.data[wh] ?? 0), 0);
    return acc;
  }, {});
  const grandTotal = Object.values(totals).reduce((s, v) => s + v, 0);

  const lowCount = rows.filter((r) =>
    MOCK_WAREHOUSES.some((wh) => stockLevel(r.data[wh] ?? 0) !== 'ok'),
  ).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Summary strip */}
      {lowCount > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="size-4 shrink-0 text-amber-500" />
          <span>{lowCount} biến thể sắp hết hoặc đã hết hàng</span>
        </div>
      )}

      {/* Inventory grid */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Biến thể</th>
              {MOCK_WAREHOUSES.map((wh) => (
                <th key={wh} className="px-4 py-3 text-right font-medium text-muted-foreground">
                  {wh}
                </th>
              ))}
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Tổng</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((row) => {
              const rowTotal = MOCK_WAREHOUSES.reduce((s, wh) => s + (row.data[wh] ?? 0), 0);
              const hasIssue = MOCK_WAREHOUSES.some((wh) => stockLevel(row.data[wh] ?? 0) !== 'ok');
              return (
                <tr key={row.name} className={hasIssue ? 'bg-amber-50/40' : ''}>
                  <td className="px-4 py-3 font-medium">{row.name}</td>
                  {MOCK_WAREHOUSES.map((wh) => (
                    <td key={wh} className="px-4 py-3 text-right">
                      <StockBadge qty={row.data[wh] ?? 0} />
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right font-medium tabular-nums">{rowTotal}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t bg-muted/20">
              <td className="px-4 py-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Tổng kho
              </td>
              {MOCK_WAREHOUSES.map((wh) => (
                <td key={wh} className="px-4 py-3 text-right font-semibold tabular-nums">
                  {totals[wh]}
                </td>
              ))}
              <td className="px-4 py-3 text-right font-semibold tabular-nums">{grandTotal}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">
        * Dữ liệu kho hàng thực tế sẽ được đồng bộ khi tính năng quản lý kho được triển khai.
      </p>
    </div>
  );
}

// ── Activity Tab ──────────────────────────────────────────────────────────────

type ActivityType = 'create' | 'update' | 'price' | 'status' | 'stock' | 'delete';

interface ActivityItem {
  id: string;
  type: ActivityType;
  actor: string;
  message: string;
  detail?: string;
  time: string;
}

const MOCK_ACTIVITY: ActivityItem[] = [
  { id: '1', type: 'create', actor: 'Nguyễn Văn A', message: 'Tạo sản phẩm', time: '2 giờ trước' },
  {
    id: '2',
    type: 'update',
    actor: 'Nguyễn Văn A',
    message: 'Cập nhật mô tả',
    time: '2 giờ trước',
  },
  {
    id: '3',
    type: 'price',
    actor: 'Trần Thị B',
    message: 'Thay đổi giá biến thể',
    detail: 'Đen - 256GB: 28.990.000đ → 27.490.000đ',
    time: '5 giờ trước',
  },
  {
    id: '4',
    type: 'status',
    actor: 'Trần Thị B',
    message: 'Hiển thị sản phẩm',
    time: 'Hôm qua, 14:32',
  },
  {
    id: '5',
    type: 'stock',
    actor: 'Lê Văn C',
    message: 'Nhập kho Hà Nội',
    detail: '+50 Đen - 128GB',
    time: 'Hôm qua, 09:15',
  },
  {
    id: '6',
    type: 'update',
    actor: 'Nguyễn Văn A',
    message: 'Cập nhật ảnh sản phẩm',
    time: '3 ngày trước',
  },
  {
    id: '7',
    type: 'price',
    actor: 'Trần Thị B',
    message: 'Thay đổi giá biến thể',
    detail: 'Trắng - 256GB: 29.990.000đ → 28.990.000đ',
    time: '5 ngày trước',
  },
  {
    id: '8',
    type: 'create',
    actor: 'Nguyễn Văn A',
    message: 'Thêm biến thể Trắng - 256GB',
    time: '1 tuần trước',
  },
];

const ACTIVITY_ICON: Record<ActivityType, string> = {
  create: '✦',
  update: '✎',
  price: '₫',
  status: '◉',
  stock: '⊕',
  delete: '✕',
};

const ACTIVITY_COLOR: Record<ActivityType, string> = {
  create: 'bg-green-100 text-green-700',
  update: 'bg-blue-100 text-blue-700',
  price: 'bg-amber-100 text-amber-700',
  status: 'bg-purple-100 text-purple-700',
  stock: 'bg-cyan-100 text-cyan-700',
  delete: 'bg-destructive/10 text-destructive',
};

function ActivityTab({ product: _ }: { product: Product }) {
  return (
    <div className="flex flex-col gap-1">
      {MOCK_ACTIVITY.map((item, idx) => (
        <div key={item.id} className="flex gap-3">
          {/* Timeline line */}
          <div className="flex flex-col items-center">
            <span
              className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${ACTIVITY_COLOR[item.type]}`}
            >
              {ACTIVITY_ICON[item.type]}
            </span>
            {idx < MOCK_ACTIVITY.length - 1 && <div className="mt-1 w-px flex-1 bg-border" />}
          </div>

          {/* Content */}
          <div className={`min-w-0 pb-5 ${idx === MOCK_ACTIVITY.length - 1 ? 'pb-0' : ''}`}>
            <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
              <span className="text-sm font-medium">{item.actor}</span>
              <span className="text-sm text-muted-foreground">{item.message}</span>
            </div>
            {item.detail && <p className="mt-0.5 text-xs text-muted-foreground">{item.detail}</p>}
            <p className="mt-1 text-xs text-muted-foreground/60">{item.time}</p>
          </div>
        </div>
      ))}

      <p className="mt-4 text-xs text-muted-foreground">
        * Lịch sử hoạt động thực tế sẽ được ghi lại khi tính năng audit log được triển khai.
      </p>
    </div>
  );
}
