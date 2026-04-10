'use client';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Folder, FolderOpen, X } from 'lucide-react';
import { createCategory, updateCategory, type Category } from '@/lib/api/categories';
import { ApiException } from '@/lib/client';
import { categorySchema, type CategoryFormData } from '@/lib/schemas/categories';

export function CategoryPanel({ category, allCategories, onClose, onSaved }: {
  category: Category | null;
  allCategories: Category[];
  onClose: () => void;
  onSaved: (c: Category) => void;
}) {
  const isEdit = !!category;
  const slugTouched = useRef(isEdit);

  const { register, handleSubmit, setValue, watch, setError, formState: { errors, isSubmitting } } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: category
      ? { name: category.name, slug: category.slug, description: category.description ?? '', parentId: category.parentId, active: category.active }
      : { name: '', slug: '', description: '', parentId: null, active: true },
  });

  const name = watch('name');
  const parentId = watch('parentId');
  const active = watch('active');

  useEffect(() => {
    if (!slugTouched.current && name)
      setValue('slug', name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
  }, [name, setValue]);

  const parentOptions = allCategories.filter((c) => c.id !== category?.id);
  const selectedParent = parentOptions.find((c) => c.id === parentId);

  async function onSubmit(data: CategoryFormData) {
    try {
      const payload = {
        name: data.name,
        slug: data.slug,
        description: data.description || undefined,
        parentId: data.parentId ?? null,
        active: data.active,
      };
      const saved = isEdit
        ? await updateCategory(category!.id, payload)
        : await createCategory(payload);
      toast.success(isEdit ? 'Đã cập nhật danh mục' : 'Đã tạo danh mục');
      onSaved(saved);
    } catch (e) {
      if (e instanceof ApiException) {
        if (e.error.code === 'CATEGORY_SLUG_EXISTS') setError('slug', { message: 'Slug đã tồn tại' });
        else if (e.error.code === 'CATEGORY_CIRCULAR_REF') setError('parentId', { message: 'Tham chiếu vòng tròn' });
        else if (e.error.errors) Object.entries(e.error.errors).forEach(([f, m]) => setError(f as keyof CategoryFormData, { message: m }));
        else toast.error(e.error.message);
      }
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />
      <aside className="fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl" role="dialog" aria-modal="true">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <FolderOpen className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">{isEdit ? 'Sửa danh mục' : 'Thêm danh mục'}</h2>
              {isEdit && <p className="text-xs text-slate-400">ID #{category!.id}</p>}
            </div>
          </div>
          <button onClick={onClose} className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700" aria-label="Đóng">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col overflow-y-auto" noValidate>
          <div className="flex-1 space-y-5 px-6 py-5">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Tên danh mục <span className="text-rose-500">*</span>
              </label>
              <input {...register('name')} placeholder="VD: Điện tử, Thời trang..." autoFocus
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-colors focus:ring-2 ${errors.name ? 'border-rose-300 bg-rose-50 focus:ring-rose-100' : 'border-slate-200 bg-slate-50 focus:border-blue-400 focus:bg-white focus:ring-blue-100'}`} />
              {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name.message}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Slug <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute top-1/2 left-3.5 -translate-y-1/2 select-none text-xs text-slate-400">/</span>
                <input {...register('slug')} placeholder="dien-tu" onFocus={() => { slugTouched.current = true; }}
                  className={`w-full rounded-xl border py-2.5 pr-3.5 pl-6 font-mono text-sm outline-none transition-colors focus:ring-2 ${errors.slug ? 'border-rose-300 bg-rose-50 focus:ring-rose-100' : 'border-slate-200 bg-slate-50 focus:border-blue-400 focus:bg-white focus:ring-blue-100'}`} />
              </div>
              {errors.slug && <p className="mt-1 text-xs text-rose-500">{errors.slug.message}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Danh mục cha</label>
              <select value={parentId ?? ''} onChange={(e) => setValue('parentId', e.target.value ? Number(e.target.value) : null)}
                className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100">
                <option value="">— Danh mục gốc —</option>
                {parentOptions.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {selectedParent && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-400">
                  <Folder className="h-3 w-3" />
                  Nằm trong: <span className="font-medium text-slate-600">{selectedParent.name}</span>
                </p>
              )}
              {errors.parentId && <p className="mt-1 text-xs text-rose-500">{errors.parentId.message}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Mô tả</label>
              <textarea {...register('description')} rows={3} placeholder="Mô tả ngắn..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100" />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-slate-700">Kích hoạt</p>
                <p className="text-xs text-slate-400">Hiển thị trên cửa hàng</p>
              </div>
              <button type="button" role="switch" aria-checked={active} onClick={() => setValue('active', !active)}
                className={`relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${active ? 'bg-blue-600' : 'bg-slate-300'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${active ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          <div className="border-t border-slate-100 px-6 py-4">
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 cursor-pointer rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">Hủy</button>
              <button type="submit" disabled={isSubmitting} className="flex-1 cursor-pointer rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60">
                {isSubmitting ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo danh mục'}
              </button>
            </div>
          </div>
        </form>
      </aside>
    </>
  );
}
