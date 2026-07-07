'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Ellipsis,
  Package,
  Pencil,
  Plus,
  Save,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import type { Product, ProductVariant } from '@/lib/api/admin/products';
import { deleteProduct, setVariantInventory } from '@/lib/api/admin/products';
import { getAuditLogs, type AuditLogEntry } from '@/lib/api/admin/audit-logs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import { formatViDateTime } from '@/lib/utils/formatting';
import { VariantFormSheet } from './variant-form-sheet';

interface ProductDetailClientProps {
  product: Product;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [variants, setVariants] = useState(product.variants ?? []);
  const [activeTab, setActiveTab] = useState('overview');
  const [deleteTarget, setDeleteTarget] = useState(false);
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | undefined>();
  const [selectedImage, setSelectedImage] = useState(
    product.thumbnail ?? (product.images && product.images[0]) ?? '',
  );

  const deleteMutation = useMutation({
    mutationFn: () => deleteProduct(product.id),
    onSuccess: () => {
      toast.success('Đã xóa sản phẩm');
      router.push('/dashboard/products');
    },
    onError: () => toast.error('Xóa thất bại'),
  });

  const auditQuery = useQuery({
    queryKey: ['audit-logs', 'product', product.id],
    queryFn: () =>
      getAuditLogs({
        resourceType: 'PRODUCT',
        resourceId: String(product.id),
        sortBy: 'createdAt',
        sortDir: 'desc',
        size: 20,
      }),
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

  const totalStock = variants.reduce((sum, v) => sum + (v.stockQuantity ?? 0), 0);
  const lowStockCount = variants.filter((v) => v.lowStock).length;
  const avgStock = variants.length > 0 ? Math.round(totalStock / variants.length) : 0;

  function updateVariantInventory(variantId: number, quantity: number, lowStockThreshold: number) {
    setVariants((current) =>
      current.map((variant) =>
        variant.id === variantId
          ? {
              ...variant,
              stockQuantity: quantity,
              lowStockThreshold,
              inStock: quantity > 0,
              lowStock: quantity <= lowStockThreshold,
            }
          : variant,
      ),
    );
  }

  function handleVariantSaved(saved: ProductVariant) {
    setVariants((current) =>
      current.some((variant) => variant.id === saved.id)
        ? current.map((variant) => (variant.id === saved.id ? saved : variant))
        : [...current, saved],
    );
    void queryClient.invalidateQueries({ queryKey: ['audit-logs', 'product', product.id] });
    router.refresh();
  }

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
                      Trên {variants.length} biến thể
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

              {variants.length > 0 ? (
                <div className="space-y-3">
                  {variants.map((variant, idx) => (
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
                                {variant.active ? 'Đang hiển thị' : 'Đang ẩn'}
                              </span>
                              <span>•</span>
                              <span>{stockLabel(variant)}</span>
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
          <InventoryTab variants={variants} onSaved={updateVariantInventory} />
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="mt-0 pt-6">
          <ActivityTab logs={auditQuery.data?.data ?? []} isLoading={auditQuery.isLoading} />
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
        key={editingVariant?.id ?? 'new'}
        open={showVariantForm}
        onClose={handleCloseVariantForm}
        onSaved={handleVariantSaved}
        productId={product.id}
        productName={product.name}
        variant={editingVariant}
      />
    </div>
  );
}

// ── Inventory Tab ─────────────────────────────────────────────────────────────

const DEFAULT_LOW_STOCK_THRESHOLD = 5;

function stockLabel(variant: ProductVariant) {
  if (variant.stockQuantity == null) return 'Chưa nhập tồn kho';
  if (variant.stockQuantity <= 0) return 'Hết hàng';
  if (variant.lowStock) return `Sắp hết (${variant.stockQuantity})`;
  return `Còn ${variant.stockQuantity}`;
}

function stockLevel(qty: number, threshold: number): 'out' | 'low' | 'ok' {
  if (qty === 0) return 'out';
  if (qty <= threshold) return 'low';
  return 'ok';
}

function StockBadge({ qty, threshold }: { qty: number; threshold: number }) {
  const level = stockLevel(qty, threshold);
  if (level === 'out')
    return <span className="text-xs font-medium text-destructive">Hết hàng</span>;
  if (level === 'low') return <span className="text-xs font-medium text-amber-600">{qty}</span>;
  return <span className="text-sm tabular-nums">{qty}</span>;
}

function InventoryTab({
  variants,
  onSaved,
}: {
  variants: ProductVariant[];
  onSaved: (variantId: number, quantity: number, lowStockThreshold: number) => void;
}) {
  const queryClient = useQueryClient();
  const [drafts, setDrafts] = useState(() =>
    Object.fromEntries(
      variants.map((variant) => [
        variant.id,
        {
          quantity: String(variant.stockQuantity ?? 0),
          lowStockThreshold: String(variant.lowStockThreshold ?? DEFAULT_LOW_STOCK_THRESHOLD),
        },
      ]),
    ),
  );

  const saveMutation = useMutation({
    mutationFn: ({
      variantId,
      quantity,
      lowStockThreshold,
    }: {
      variantId: number;
      quantity: number;
      lowStockThreshold?: number;
    }) => setVariantInventory(variantId, { quantity, lowStockThreshold }),
    onSuccess: (data) => {
      onSaved(data.variantId, data.quantity, data.lowStockThreshold);
      void queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Đã cập nhật tồn kho');
    },
    onError: () => toast.error('Cập nhật tồn kho thất bại'),
  });

  function updateDraft(variantId: number, key: 'quantity' | 'lowStockThreshold', value: string) {
    setDrafts((current) => ({
      ...current,
      [variantId]: {
        quantity: current[variantId]?.quantity ?? '0',
        lowStockThreshold:
          current[variantId]?.lowStockThreshold ?? String(DEFAULT_LOW_STOCK_THRESHOLD),
        [key]: value,
      },
    }));
  }

  function save(variant: ProductVariant) {
    const draft = drafts[variant.id];
    const quantity = Number(draft?.quantity ?? 0);
    const lowStockThreshold = Number(draft?.lowStockThreshold ?? DEFAULT_LOW_STOCK_THRESHOLD);
    if (!Number.isInteger(quantity) || quantity < 0) {
      toast.error('Số lượng không hợp lệ');
      return;
    }
    if (!Number.isInteger(lowStockThreshold) || lowStockThreshold < 0) {
      toast.error('Ngưỡng cảnh báo không hợp lệ');
      return;
    }
    saveMutation.mutate({
      variantId: variant.id,
      quantity,
      lowStockThreshold:
        lowStockThreshold === (variant.lowStockThreshold ?? DEFAULT_LOW_STOCK_THRESHOLD)
          ? undefined
          : lowStockThreshold,
    });
  }

  const totalStock = variants.reduce((sum, variant) => sum + (variant.stockQuantity ?? 0), 0);
  const lowCount = variants.filter((variant) => variant.lowStock).length;

  return (
    <div className="flex flex-col gap-6">
      {lowCount > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="size-4 shrink-0 text-amber-500" />
          <span>{lowCount} biến thể sắp hết hoặc đã hết hàng</span>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Biến thể</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">SKU</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                Tồn hiện tại
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Số lượng</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Ngưỡng cảnh báo
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {variants.map((variant) => {
              const qty = variant.stockQuantity ?? 0;
              const threshold = variant.lowStockThreshold ?? DEFAULT_LOW_STOCK_THRESHOLD;
              const hasIssue = stockLevel(qty, threshold) !== 'ok';
              const draft = drafts[variant.id] ?? {
                quantity: String(qty),
                lowStockThreshold: String(threshold),
              };
              return (
                <tr key={variant.id} className={hasIssue ? 'bg-amber-50/40' : ''}>
                  <td className="px-4 py-3 font-medium">{variant.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {variant.sku}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <StockBadge qty={qty} threshold={threshold} />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      value={draft.quantity}
                      onChange={(event) => updateDraft(variant.id, 'quantity', event.target.value)}
                      className="h-9 w-28"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      value={draft.lowStockThreshold}
                      onChange={(event) =>
                        updateDraft(variant.id, 'lowStockThreshold', event.target.value)
                      }
                      className="h-9 w-28"
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => save(variant)}
                      disabled={saveMutation.isPending}
                    >
                      <Save className="h-4 w-4" />
                      Lưu
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t bg-muted/20">
              <td
                className="px-4 py-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase"
                colSpan={2}
              >
                Tổng tồn kho
              </td>
              <td className="px-4 py-3 text-right font-semibold tabular-nums">{totalStock}</td>
              <td colSpan={3} />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function auditSummary(log: AuditLogEntry) {
  if (log.action === 'PRODUCT_CREATED') return 'Tạo sản phẩm';
  if (log.action === 'PRODUCT_UPDATED') return 'Cập nhật sản phẩm';
  if (log.action === 'PRODUCT_DELETED') return 'Xóa sản phẩm';
  if (log.action === 'PRODUCT_VARIANT_CREATED') return 'Thêm biến thể';
  if (log.action === 'PRODUCT_VARIANT_UPDATED') return 'Cập nhật biến thể';
  if (log.action === 'PRODUCT_VARIANT_DELETED') return 'Xóa biến thể';
  if (log.action === 'PRODUCT_INVENTORY_UPDATED') return 'Cập nhật tồn kho';
  return log.action;
}

function auditDetail(log: AuditLogEntry) {
  const sku = typeof log.metadata?.sku === 'string' ? log.metadata.sku : null;
  const variantId = log.metadata?.variantId;
  if (log.action === 'PRODUCT_INVENTORY_UPDATED') {
    const beforeQty = log.beforeData?.quantity;
    const afterQty = log.afterData?.quantity;
    return `SKU ${sku ?? variantId ?? '—'}: ${beforeQty ?? '—'} → ${afterQty ?? '—'}`;
  }
  if (log.action.startsWith('PRODUCT_VARIANT_')) {
    const name = typeof log.afterData?.name === 'string'
      ? log.afterData.name
      : typeof log.beforeData?.name === 'string'
        ? log.beforeData.name
        : null;
    return [name, sku].filter(Boolean).join(' · ') || null;
  }
  const changed = Object.keys(log.afterData ?? {});
  return changed.length > 0 ? `Thay đổi: ${changed.join(', ')}` : null;
}

function ActivityTab({ logs, isLoading }: { logs: AuditLogEntry[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="rounded-lg border bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
        Đang tải lịch sử hoạt động...
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="rounded-lg border bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
        Chưa có lịch sử hoạt động cho sản phẩm này.
      </div>
    );
  }

  return (
    <div className="grid gap-0">
      {logs.map((log, index) => {
        const isLast = index === logs.length - 1;
        const detail = auditDetail(log);
        return (
          <div key={log.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={index === 0 ? 'mt-1.5 size-2 rounded-full bg-foreground' : 'mt-1.5 size-2 rounded-full bg-border'} />
              {!isLast && <div className="my-1 w-px flex-1 bg-border/60" />}
            </div>
            <div className={isLast ? 'min-w-0 pb-0' : 'min-w-0 pb-4'}>
              <p className="text-sm leading-tight font-medium">{auditSummary(log)}</p>
              {detail && <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p>}
              <p className="mt-1 text-xs text-muted-foreground">
                {log.actorEmail ?? log.actorType} · {formatViDateTime(log.createdAt)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
