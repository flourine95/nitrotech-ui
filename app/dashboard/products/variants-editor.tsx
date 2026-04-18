'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  type CreateVariantBody, type ProductVariant,
  createVariant, deleteVariant, updateVariant,
} from '@/lib/api/products';
import { ApiException } from '@/lib/client';
import { KeyValueEditor } from './key-value-editor';
import { formatVariantPrice } from './utils';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogMedia, AlertDialogTitle,
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
    if (!form.sku.trim()) { toast.error('SKU không được để trống'); return; }
    if (!form.name.trim()) { toast.error('Tên không được để trống'); return; }
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0) {
      toast.error('Giá không hợp lệ'); return;
    }
    onSave(form);
  }

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">SKU *</label>
          <input
            value={form.sku}
            onChange={(e) => set('sku', e.target.value)}
            placeholder="SKU-001"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-mono text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Tên *</label>
          <input
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Size S"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Giá *</label>
          <input
            type="number"
            min={0}
            value={form.price}
            onChange={(e) => set('price', e.target.value)}
            placeholder="100000"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
          />
        </div>
        <div className="flex items-end">
          <div className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2">
            <span className="text-xs text-slate-600">Hiển thị</span>
            <Switch
              checked={form.active}
              onCheckedChange={(val) => set('active', val)}
              aria-label="Hiển thị variant"
            />
          </div>
        </div>
      </div>

      <div className="mt-3">
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Thuộc tính</label>
        <KeyValueEditor
          value={form.attributes}
          onChange={(v) => set('attributes', v)}
          keyPlaceholder="size"
          valuePlaceholder="S"
        />
      </div>

      <div className="mt-3 flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel} className="rounded-xl">
          <X className="h-3.5 w-3.5" /> Hủy
        </Button>
        <Button type="button" size="sm" onClick={handleSave} disabled={saving} className="rounded-xl">
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
      toast.success('Đã thêm variant');
    } catch (e) {
      if (e instanceof ApiException && e.error.code === 'VARIANT_SKU_EXISTS')
        toast.error('SKU đã tồn tại');
      else toast.error('Thêm variant thất bại');
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
      onChange(variants.map((v) => v.id === updated.id ? updated : v));
      setEditingId(null);
      toast.success('Đã cập nhật variant');
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
      toast.success('Đã xóa variant');
    } catch {
      toast.error('Xóa variant thất bại');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  const fmt = formatVariantPrice;

  return (
    <div className="space-y-3">
      {variants.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">SKU</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Tên</th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Giá</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Thuộc tính</th>
                <th className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">Hiển thị</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {variants.map((v) =>
                editingId === v.id ? (
                  <tr key={v.id}>
                    <td colSpan={6} className="p-2">
                      <VariantInlineForm
                        initial={{ sku: v.sku, name: v.name, price: String(v.price), attributes: v.attributes ?? {}, active: v.active }}
                        onSave={(form) => handleEdit(v, form)}
                        onCancel={() => setEditingId(null)}
                        saving={saving}
                      />
                    </td>
                  </tr>
                ) : (
                  <tr key={v.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{v.sku}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{v.name}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">{fmt(v.price)}</td>
                    <td className="px-4 py-3">
                      {v.attributes && Object.keys(v.attributes).length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(v.attributes).map(([k, val]) => (
                            <span key={k} className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600">
                              {k}: {val}
                            </span>
                          ))}
                        </div>
                      ) : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex h-2 w-2 rounded-full ${v.active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => setEditingId(v.id)}
                              className="rounded-lg text-slate-400 hover:bg-amber-50 hover:text-amber-600"
                              aria-label="Sửa variant"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top"><p>Sửa</p></TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => setDeleteTarget(v)}
                              className="rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                              aria-label="Xóa variant"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top"><p>Xóa</p></TooltipContent>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
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
          className="w-full rounded-xl border-dashed text-slate-500 hover:border-ring hover:bg-primary/5 hover:text-primary"
        >
          <Plus className="h-3.5 w-3.5" />
          Thêm variant
        </Button>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-rose-100 text-rose-600"><Trash2 className="h-5 w-5" /></AlertDialogMedia>
            <AlertDialogTitle>Xóa variant?</AlertDialogTitle>
            <AlertDialogDescription>
              Xóa variant <strong className="text-slate-900">{deleteTarget?.name}</strong> ({deleteTarget?.sku})?
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
