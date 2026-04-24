'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  type CreateVariantBody,
  type ProductVariant,
  createVariant,
  deleteVariant,
  updateVariant,
} from '@/lib/api/products';
import { ApiException } from '@/lib/client';
import { KeyValueEditor } from './key-value-editor';
import { formatVariantPrice } from './utils';
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

interface VariantFormState {
  sku: string;
  name: string;
  price: string;
  attributes: Record<string, string>;
  active: boolean;
}

function emptyForm(): VariantFormState {
  return { sku: '', name: '', price: '', attributes: {}, active: true };
}

function VariantInlineForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial: VariantFormState;
  onSave: (data: VariantFormState) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState(initial);

  function set<K extends keyof VariantFormState>(key: K, val: VariantFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  function handleSave() {
    if (!form.sku.trim()) {
      toast.error('SKU không được để trống');
      return;
    }
    if (!form.name.trim()) {
      toast.error('Tên không được để trống');
      return;
    }
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0) {
      toast.error('Giá không hợp lệ');
      return;
    }
    onSave(form);
  }

  return (
    <div className="rounded-lg border p-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="space-y-1.5">
          <Label className="text-xs">
            SKU <span className="text-destructive">*</span>
          </Label>
          <Input
            value={form.sku}
            onChange={(e) => set('sku', e.target.value)}
            placeholder="SKU-001"
            className="font-mono"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">
            Tên <span className="text-destructive">*</span>
          </Label>
          <Input
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Size S"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">
            Giá <span className="text-destructive">*</span>
          </Label>
          <Input
            type="number"
            min={0}
            value={form.price}
            onChange={(e) => set('price', e.target.value)}
            placeholder="100000"
          />
        </div>
        <div className="flex items-end">
          <div className="flex w-full items-center justify-between rounded-md border px-3 py-2">
            <Label className="text-xs font-normal">Hiển thị</Label>
            <Switch
              checked={form.active}
              onCheckedChange={(val) => set('active', val)}
              aria-label="Hiển thị biến thể"
            />
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-1.5">
        <Label className="text-xs">Thuộc tính</Label>
        <KeyValueEditor
          value={form.attributes}
          onChange={(v) => set('attributes', v)}
          keyPlaceholder="size"
          valuePlaceholder="S"
        />
      </div>

      <div className="mt-3 flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          <X className="h-3.5 w-3.5" /> Hủy
        </Button>
        <Button type="button" size="sm" onClick={handleSave} disabled={saving}>
          <Check className="h-3.5 w-3.5" /> {saving ? 'Đang lưu...' : 'Lưu'}
        </Button>
      </div>
    </div>
  );
}

interface VariantsEditorProps {
  productId: number;
  variants: ProductVariant[];
  onChange: (variants: ProductVariant[]) => void;
}

export function VariantsEditor({ productId, variants, onChange }: VariantsEditorProps) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ProductVariant | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleAdd(form: VariantFormState) {
    setSaving(true);
    try {
      const body: CreateVariantBody = {
        sku: form.sku.trim(),
        name: form.name.trim(),
        price: Number(form.price),
        attributes: Object.keys(form.attributes).length > 0 ? form.attributes : undefined,
        active: form.active,
      };
      const created = await createVariant(productId, body);
      onChange([...variants, created]);
      setAdding(false);
      toast.success('Đã thêm biến thể');
    } catch (e) {
      if (e instanceof ApiException && e.error.code === 'VARIANT_SKU_EXISTS')
        toast.error('SKU đã tồn tại');
      else toast.error('Thêm biến thể thất bại');
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(variant: ProductVariant, form: VariantFormState) {
    setSaving(true);
    try {
      const updated = await updateVariant(productId, variant.id, {
        sku: form.sku.trim(),
        name: form.name.trim(),
        price: Number(form.price),
        attributes: form.attributes,
        active: form.active,
      });
      onChange(variants.map((v) => (v.id === updated.id ? updated : v)));
      setEditingId(null);
      toast.success('Đã cập nhật biến thể');
    } catch (e) {
      if (e instanceof ApiException && e.error.code === 'VARIANT_SKU_EXISTS')
        toast.error('SKU đã tồn tại');
      else toast.error('Cập nhật thất bại');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(variant: ProductVariant) {
    setDeleting(true);
    try {
      await deleteVariant(productId, variant.id);
      onChange(variants.filter((v) => v.id !== variant.id));
      toast.success('Đã xóa biến thể');
    } catch {
      toast.error('Xóa biến thể thất bại');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  const fmt = formatVariantPrice;

  return (
    <div className="space-y-3">
      {variants.length > 0 && (
        <Table className="border">
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead className="text-right">Giá</TableHead>
              <TableHead>Thuộc tính</TableHead>
              <TableHead className="text-center">Hiển thị</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {variants.map((v) =>
              editingId === v.id ? (
                <TableRow key={v.id}>
                  <TableCell colSpan={6} className="p-2">
                    <VariantInlineForm
                      key={v.id}
                      initial={{
                        sku: v.sku,
                        name: v.name,
                        price: String(v.price),
                        attributes: v.attributes ?? {},
                        active: v.active,
                      }}
                      onSave={(form) => handleEdit(v, form)}
                      onCancel={() => setEditingId(null)}
                      saving={saving}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow key={v.id} className="hover:bg-transparent">
                  <TableCell className="font-mono text-muted-foreground">{v.sku}</TableCell>
                  <TableCell className="font-medium">{v.name}</TableCell>
                  <TableCell className="text-right font-semibold">{fmt(v.price)}</TableCell>
                  <TableCell>
                    {v.attributes && Object.keys(v.attributes).length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(v.attributes).map(([k, val]) => (
                          <Badge key={k} variant="secondary">
                            {k}: {val}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground/50">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <span
                      className={`inline-flex h-2 w-2 rounded-full ${v.active ? 'bg-green-500' : 'bg-muted-foreground/40'}`}
                      aria-label={v.active ? 'Hiển thị' : 'Ẩn'}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingId(v.id)}
                            aria-label="Sửa variant"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p>Sửa</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteTarget(v)}
                            aria-label="Xóa variant"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p>Xóa</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ),
            )}
          </TableBody>
        </Table>
      )}

      {adding ? (
        <VariantInlineForm
          initial={emptyForm()}
          onSave={handleAdd}
          onCancel={() => setAdding(false)}
          saving={saving}
        />
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setAdding(true)}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm biến thể
        </Button>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-rose-100 text-rose-600">
              <Trash2 className="h-5 w-5" />
            </AlertDialogMedia>
            <AlertDialogTitle>Xóa biến thể?</AlertDialogTitle>
            <AlertDialogDescription>
              Xóa biến thể <strong className="text-foreground">{deleteTarget?.name}</strong> (
              {deleteTarget?.sku})?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
              disabled={deleting}
            >
              {deleting ? 'Đang xóa...' : 'Xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
