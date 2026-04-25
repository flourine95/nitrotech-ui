'use client';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Check, ChevronsUpDown, FolderOpen } from 'lucide-react';
import { createCategory, updateCategory, type Category } from '@/lib/api/categories';
import { ApiException } from '@/lib/client';
import { categorySchema, type CategoryFormData } from '@/lib/schemas/categories';
import { slugify, cn } from '@/lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';

export function CategoryPanel({
  category,
  allCategories,
  onClose,
  onSaved,
}: {
  category: Category | null;
  allCategories: Category[];
  onClose: () => void;
  onSaved: (c: Category) => void;
}) {
  const isEdit = !!category;
  const slugTouched = useRef(isEdit);
  const [parentOpen, setParentOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: category
      ? {
          name: category.name,
          slug: category.slug,
          description: category.description ?? '',
          parentId: category.parentId,
          active: category.active,
        }
      : { name: '', slug: '', description: '', parentId: null, active: true },
  });

  const name = watch('name');
  const parentId = watch('parentId');
  const active = watch('active');

  useEffect(() => {
    if (!slugTouched.current && name) setValue('slug', slugify(name));
  }, [name, setValue]);

  const parentOptions = allCategories.filter((c) => c.id !== category?.id);

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
        if (e.error.code === 'CATEGORY_SLUG_EXISTS')
          setError('slug', { message: 'Slug đã tồn tại' });
        else if (e.error.code === 'CATEGORY_CIRCULAR_REF')
          setError('parentId', { message: 'Không thể chọn danh mục con làm danh mục cha' });
        else if (e.error.errors)
          Object.entries(e.error.errors).forEach(([f, m]) =>
            setError(f as keyof CategoryFormData, { message: m }),
          );
        else toast.error(e.error.message);
      }
    }
  }

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="flex w-full max-w-md flex-col gap-0 p-0"
      >
        {/* Header */}
        <SheetHeader className="flex-row items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FolderOpen className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <SheetTitle className="text-sm font-semibold">
                {isEdit ? 'Sửa danh mục' : 'Thêm danh mục'}
              </SheetTitle>
              {isEdit && (
                <p className="text-xs text-muted-foreground/70">ID #{category!.id}</p>
              )}
            </div>
          </div>
        </SheetHeader>

        {/* Form body */}
        <form
          id="category-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-1 flex-col overflow-y-auto"
          noValidate
        >
          <div className="flex-1 space-y-5 px-6 py-5">
            {/* Tên */}
            <div>
              <Label htmlFor="cat-name" className="mb-1.5 block text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Tên danh mục <span className="text-destructive" aria-hidden="true">*</span>
              </Label>
              <input
                id="cat-name"
                {...register('name')}
                placeholder="VD: Điện tử, Thời trang..."
                autoFocus
                aria-required="true"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'cat-name-error' : undefined}
                className={cn(
                  'w-full rounded-xl border px-3.5 py-2.5 text-sm transition-colors outline-none focus:ring-2',
                  errors.name
                    ? 'border-destructive/50 bg-destructive/5 focus:ring-destructive/20'
                    : 'border-border bg-muted/50 focus:border-ring focus:bg-background focus:ring-ring/20',
                )}
              />
              {errors.name && (
                <p id="cat-name-error" role="alert" className="mt-1 text-xs text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Slug */}
            <div>
              <Label htmlFor="cat-slug" className="mb-1.5 block text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Đường dẫn (slug) <span className="text-destructive" aria-hidden="true">*</span>
              </Label>
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-xs text-muted-foreground/70 select-none" aria-hidden="true">
                  /
                </span>
                <input
                  id="cat-slug"
                  {...register('slug')}
                  placeholder="dien-tu"
                  onFocus={() => { slugTouched.current = true; }}
                  aria-required="true"
                  aria-invalid={!!errors.slug}
                  aria-describedby={errors.slug ? 'cat-slug-error' : 'cat-slug-hint'}
                  className={cn(
                    'w-full rounded-xl border py-2.5 pr-3.5 pl-6 font-mono text-sm transition-colors outline-none focus:ring-2',
                    errors.slug
                      ? 'border-destructive/50 bg-destructive/5 focus:ring-destructive/20'
                      : 'border-border bg-muted/50 focus:border-ring focus:bg-background focus:ring-ring/20',
                  )}
                />
              </div>
              {errors.slug ? (
                <p id="cat-slug-error" role="alert" className="mt-1 text-xs text-destructive">
                  {errors.slug.message === 'Slug đã tồn tại'
                    ? 'Đường dẫn này đã được dùng, hãy chọn tên khác.'
                    : errors.slug.message}
                </p>
              ) : (
                <p id="cat-slug-hint" className="mt-1 text-xs text-muted-foreground/60">
                  Tự động tạo từ tên. Dùng để tạo URL cho danh mục.
                </p>
              )}
            </div>

            {/* Danh mục cha */}
            <div>
              <Label htmlFor="cat-parent" className="mb-1.5 block text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Danh mục cha
              </Label>
              <Popover open={parentOpen} onOpenChange={setParentOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="cat-parent"
                    variant="outline"
                    role="combobox"
                    aria-expanded={parentOpen}
                    aria-haspopup="listbox"
                    className="w-full justify-between font-normal"
                  >
                    <span className="truncate">
                      {parentId
                        ? (parentOptions.find((c) => c.id === parentId)?.name ?? 'Không tìm thấy')
                        : '— Danh mục gốc —'}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" aria-hidden="true" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Tìm danh mục..." />
                    <CommandList>
                      <CommandEmpty>Không tìm thấy danh mục.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="__root__"
                          onSelect={() => { setValue('parentId', null); setParentOpen(false); }}
                          className="gap-2"
                        >
                          <Check className={cn('h-4 w-4', parentId === null ? 'opacity-100' : 'opacity-0')} aria-hidden="true" />
                          — Danh mục gốc —
                        </CommandItem>
                        {parentOptions.map((c) => (
                          <CommandItem
                            key={c.id}
                            value={c.name}
                            onSelect={() => { setValue('parentId', c.id); setParentOpen(false); }}
                            className="gap-2"
                          >
                            <Check className={cn('h-4 w-4', parentId === c.id ? 'opacity-100' : 'opacity-0')} aria-hidden="true" />
                            {c.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {errors.parentId && (
                <p role="alert" className="mt-1 text-xs text-destructive">
                  {errors.parentId.message}
                </p>
              )}
            </div>

            {/* Mô tả */}
            <div>
              <Label htmlFor="cat-desc" className="mb-1.5 block text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Mô tả
              </Label>
              <textarea
                id="cat-desc"
                {...register('description')}
                rows={3}
                placeholder="VD: Bao gồm laptop, máy tính bảng và phụ kiện..."
                className="w-full resize-none rounded-xl border border-border bg-muted/50 px-3.5 py-2.5 text-sm transition-colors outline-none focus:border-ring focus:bg-background focus:ring-2 focus:ring-ring/20"
              />
            </div>

            {/* Toggle active */}
            <div className="flex items-center justify-between rounded-xl border border-border bg-muted/50 px-4 py-3">
              <div>
                <Label htmlFor="cat-active" className="text-sm font-medium">
                  Hiển thị trên cửa hàng
                </Label>
                <p className="text-xs text-muted-foreground/70">
                  Bật để khách hàng thấy danh mục này khi mua hàng
                </p>
              </div>
              <Switch
                id="cat-active"
                checked={active}
                onCheckedChange={(v) => setValue('active', v)}
                aria-label="Hiển thị trên cửa hàng"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <SheetFooter className="flex-row gap-3 border-t px-6 py-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onClose}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            form="category-form"
            className="flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo danh mục'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
