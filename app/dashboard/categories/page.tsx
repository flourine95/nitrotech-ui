"use client"
import { useState, useEffect, useRef } from "react"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { getCategories, createCategory, updateCategory, deleteCategory, type Category } from "@/lib/categories-api"
import { uploadFile } from "@/lib/upload-api"
import { ApiException } from "@/lib/api"
import MediaPickerDialog from "@/components/media-picker-dialog"

// ── Schema ────────────────────────────────────────────────────────────────────

const categorySchema = z.object({
  name: z.string().min(1, "Tên không được để trống"),
  slug: z.string().min(1, "Slug không được để trống").regex(/^[a-z0-9-]+$/, "Slug chỉ gồm chữ thường, số và dấu gạch ngang"),
  description: z.string().optional(),
  image: z.string().optional(),
  parentId: z.number().nullable(),
  active: z.boolean(),
})
type CategoryInput = z.infer<typeof categorySchema>

// ── Image Uploader ────────────────────────────────────────────────────────────

function ImageUploader({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [uploading, setUploading] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) { toast.error("Chỉ chấp nhận file ảnh"); return }
    setUploading(true)
    try {
      const result = await uploadFile(file, "categories")
      onChange(result.secure_url)
    } catch {
      toast.error("Upload thất bại, vui lòng thử lại")
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <>
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          {value && value.startsWith("http")
            ? <img src={value} alt="Ảnh danh mục" className="h-full w-full object-cover" />
            : <svg viewBox="0 0 24 24" className="h-6 w-6 text-slate-300" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          }
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" id="cat-img-upload" />
            <label htmlFor="cat-img-upload"
              className={`flex cursor-pointer items-center gap-1.5 rounded-xl border border-dashed border-slate-300 px-3 py-2 text-xs text-slate-600 transition-colors hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 ${uploading ? "pointer-events-none opacity-60" : ""}`}>
              {uploading
                ? <><svg viewBox="0 0 24 24" className="h-3.5 w-3.5 animate-spin" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity=".3"/><path d="M21 12a9 9 0 00-9-9"/></svg> Đang upload...</>
                : <><svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> Upload</>
              }
            </label>
            <button type="button" onClick={() => setShowPicker(true)}
              className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 transition-colors hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              Thư viện
            </button>
          </div>
          {value && (
            <button type="button" onClick={() => onChange("")} className="text-xs text-rose-400 hover:text-rose-600 transition-colors cursor-pointer">
              Xóa ảnh
            </button>
          )}
        </div>
      </div>
      {showPicker && (
        <MediaPickerDialog
          folder="categories"
          multiple={false}
          onInsert={urls => { if (urls[0]) onChange(urls[0]) }}
          onClose={() => setShowPicker(false)}
        />
      )}
    </>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────

function CategoryModal({ category, allCategories, onClose, onSaved }: {
  category: Category | null
  allCategories: Category[]
  onClose: () => void
  onSaved: (c: Category) => void
}) {
  const isEdit = !!category
  const { register, handleSubmit, setValue, watch, setError, formState: { errors, isSubmitting } } =
    useForm<CategoryInput>({
      resolver: zodResolver(categorySchema),
      defaultValues: category
        ? { name: category.name, slug: category.slug, description: category.description ?? "", image: category.image ?? "", parentId: category.parentId, active: category.active }
        : { name: "", slug: "", description: "", image: "", parentId: null, active: true },
    })

  const name = watch("name")
  const slugTouched = useRef(isEdit)
  const imageValue = watch("image")

  useEffect(() => {
    if (!slugTouched.current && name) {
      setValue("slug", name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""))
    }
  }, [name, setValue])

  // Exclude self and descendants from parent options
  const parentOptions = allCategories.filter((c) => c.id !== category?.id)

  async function onSubmit(data: CategoryInput) {
    try {
      const saved = isEdit
        ? await updateCategory(category!.id, { ...data, image: data.image || undefined })
        : await createCategory({ ...data, description: data.description || undefined, image: data.image || undefined })
      toast.success(isEdit ? "Đã cập nhật danh mục" : "Đã tạo danh mục")
      onSaved(saved)
    } catch (e) {
      if (e instanceof ApiException) {
        if (e.error.code === "CATEGORY_SLUG_EXISTS") setError("slug", { message: "Slug đã tồn tại" })
        else if (e.error.code === "CATEGORY_CIRCULAR_REF") setError("parentId", { message: "Không thể chọn danh mục con làm cha" })
        else if (e.error.errors) Object.entries(e.error.errors).forEach(([f, m]) => setError(f as keyof CategoryInput, { message: m }))
        else toast.error(e.error.message)
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">{isEdit ? "Sửa danh mục" : "Thêm danh mục"}</h2>
          <button onClick={onClose} className="cursor-pointer rounded-full p-1.5 text-slate-400 hover:bg-slate-100 transition-colors" aria-label="Đóng">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Tên danh mục</label>
            <input {...register("name")} placeholder="Laptop Gaming" className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2 ${errors.name ? "border-rose-400 focus:ring-rose-100" : "border-slate-200 focus:border-blue-400 focus:ring-blue-100"}`} />
            {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name.message}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Slug</label>
            <input {...register("slug")} placeholder="laptop-gaming" onFocus={() => { slugTouched.current = true }} className={`w-full rounded-xl border px-4 py-2.5 text-sm font-mono outline-none focus:ring-2 ${errors.slug ? "border-rose-400 focus:ring-rose-100" : "border-slate-200 focus:border-blue-400 focus:ring-blue-100"}`} />
            {errors.slug && <p className="mt-1 text-xs text-rose-500">{errors.slug.message}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Ảnh danh mục</label>
            <ImageUploader value={imageValue ?? ""} onChange={(url) => setValue("image", url)} />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Danh mục cha</label>
            <select
              className={`w-full cursor-pointer rounded-xl border bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 ${errors.parentId ? "border-rose-400 focus:ring-rose-100" : "border-slate-200 focus:border-blue-400 focus:ring-blue-100"}`}
              value={watch("parentId") ?? ""}
              onChange={(e) => setValue("parentId", e.target.value === "" ? null : Number(e.target.value))}
            >
              <option value="">— Không có (danh mục gốc) —</option>
              {parentOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.parentId ? `  ↳ ${c.name}` : c.name}
                </option>
              ))}
            </select>
            {errors.parentId && <p className="mt-1 text-xs text-rose-500">{errors.parentId.message}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Mô tả</label>
            <textarea {...register("description")} rows={2} placeholder="Mô tả ngắn..." className="w-full resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
          </div>

          <label className="flex cursor-pointer items-center gap-2.5">
            <input type="checkbox" {...register("active")} className="h-4 w-4 cursor-pointer rounded accent-blue-600" />
            <span className="text-sm text-slate-700">Kích hoạt</span>
          </label>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 cursor-pointer rounded-full border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">Hủy</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 cursor-pointer rounded-full bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-60">
              {isSubmitting ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Delete confirm ────────────────────────────────────────────────────────────

function DeleteConfirm({ category, onConfirm, onClose }: { category: Category; onConfirm: () => void; onClose: () => void }) {
  const hasChildren = category.children.length > 0
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
          <svg viewBox="0 0 24 24" className="h-6 w-6 text-rose-600" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
        </div>
        <h3 className="mb-1 font-bold text-slate-900">Xóa danh mục?</h3>
        <p className="mb-2 text-sm text-slate-500">Danh mục <span className="font-semibold text-slate-700">"{category.name}"</span> sẽ bị xóa.</p>
        {hasChildren && (
          <div className="mb-4 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-700">
            Danh mục này có <strong>{category.children.length} danh mục con</strong>. Các danh mục con sẽ trở thành danh mục gốc.
          </div>
        )}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 cursor-pointer rounded-full border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">Hủy</button>
          <button onClick={onConfirm} className="flex-1 cursor-pointer rounded-full bg-rose-600 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 transition-colors">Xóa</button>
        </div>
      </div>
    </div>
  )
}

// ── Tree row ──────────────────────────────────────────────────────────────────

function CategoryRow({ cat, depth, allFlat, onEdit, onDelete, onToggle }: {
  cat: Category
  depth: number
  allFlat: Category[]
  onEdit: (c: Category) => void
  onDelete: (c: Category) => void
  onToggle: (c: Category) => void
}) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = cat.children.length > 0

  return (
    <>
      <tr className="hover:bg-slate-50 transition-colors">
        <td className="px-5 py-3.5">
          <div className="flex items-center gap-2" style={{ paddingLeft: depth * 20 }}>
            {hasChildren ? (
              <button onClick={() => setExpanded(!expanded)} className="cursor-pointer text-slate-400 hover:text-slate-700 transition-colors" aria-label={expanded ? "Thu gọn" : "Mở rộng"}>
                <svg viewBox="0 0 24 24" className={`h-3.5 w-3.5 transition-transform ${expanded ? "" : "-rotate-90"}`} fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
              </button>
            ) : (
              <span className="w-3.5" />
            )}
            {depth > 0 && <span className="text-slate-300 text-xs">↳</span>}
            <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
              {cat.image && cat.image.startsWith("http")
                ? <img src={cat.image} alt="" className="h-full w-full object-cover" />
                : <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-slate-300" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              }
            </div>
            <span className="font-medium text-slate-900">{cat.name}</span>
          </div>
        </td>
        <td className="px-5 py-3.5 font-mono text-xs text-slate-500">{cat.slug}</td>
        <td className="px-5 py-3.5 text-sm text-slate-500 max-w-xs truncate">{cat.description ?? <span className="text-slate-300">—</span>}</td>
        <td className="px-5 py-3.5 text-center text-sm text-slate-500">
          {cat.parentId
            ? <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{allFlat.find((c) => c.id === cat.parentId)?.name ?? "—"}</span>
            : <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600">Gốc</span>}
        </td>
        <td className="px-5 py-3.5 text-center">
          <button
            onClick={() => onToggle(cat)}
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${cat.active ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${cat.active ? "bg-green-500" : "bg-slate-400"}`} />
            {cat.active ? "Hoạt động" : "Đã tắt"}
          </button>
        </td>
        <td className="px-5 py-3.5">
          <div className="flex items-center justify-end gap-1">
            <button onClick={() => onEdit(cat)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-amber-50 hover:text-amber-600 transition-colors" aria-label={`Sửa ${cat.name}`}>
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button onClick={() => onDelete(cat)} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors" aria-label={`Xóa ${cat.name}`}>
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
            </button>
          </div>
        </td>
      </tr>
      {expanded && hasChildren && cat.children.map((child) => (
        <CategoryRow key={child.id} cat={child} depth={depth + 1} allFlat={allFlat} onEdit={onEdit} onDelete={onDelete} onToggle={onToggle} />
      ))}
    </>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardCategoriesPage() {
  const [tree, setTree] = useState<Category[]>([])
  const [flat, setFlat] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all")
  const [modal, setModal] = useState<{ open: boolean; category: Category | null }>({ open: false, category: null })
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)

  async function load() {
    setLoading(true)
    try {
      const [treeData, flatData] = await Promise.all([
        getCategories({ tree: true }),
        getCategories(),
      ])
      setTree(treeData)
      setFlat(flatData)
    } catch {
      toast.error("Không thể tải danh sách danh mục")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  // Flatten tree for search/filter display
  function flattenTree(cats: Category[]): Category[] {
    return cats.flatMap((c) => [c, ...flattenTree(c.children)])
  }

  const displayList = search || filterActive !== "all"
    ? flat.filter((c) => {
        const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.slug.includes(search.toLowerCase())
        const matchActive = filterActive === "all" || (filterActive === "active" ? c.active : !c.active)
        return matchSearch && matchActive
      })
    : null // null = show tree

  async function handleToggle(cat: Category) {
    try {
      const updated = await updateCategory(cat.id, { active: !cat.active })
      toast.success(updated.active ? "Đã kích hoạt" : "Đã tắt kích hoạt")
      load()
    } catch {
      toast.error("Cập nhật thất bại")
    }
  }

  async function handleDelete(cat: Category) {
    try {
      await deleteCategory(cat.id)
      toast.success("Đã xóa danh mục")
      load()
    } catch (e) {
      toast.error(e instanceof ApiException ? e.error.message : "Xóa thất bại")
    } finally {
      setDeleteTarget(null)
    }
  }

  const totalActive = flat.filter((c) => c.active).length
  const totalRoot = flat.filter((c) => !c.parentId).length

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Danh mục</h1>
          <p className="mt-1 text-sm text-slate-500">{flat.length} danh mục · {totalRoot} gốc</p>
        </div>
        <button
          onClick={() => setModal({ open: true, category: null })}
          className="flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Thêm danh mục
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row">
        <div className="relative flex-1">
          <svg viewBox="0 0 24 24" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input
            type="search"
            placeholder="Tìm theo tên, slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border-0 bg-slate-100 py-2 pl-9 pr-4 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "active", "inactive"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setFilterActive(v)}
              className={`cursor-pointer rounded-xl px-3 py-2 text-sm font-medium transition-colors ${filterActive === v ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              {v === "all" ? "Tất cả" : v === "active" ? "Đang hoạt động" : "Đã tắt"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {loading ? (
          <div className="space-y-3 p-6">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-12 animate-pulse rounded-xl bg-slate-100" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Tên</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Slug</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Mô tả</th>
                  <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">Danh mục cha</th>
                  <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">Trạng thái</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayList
                  ? displayList.map((c) => (
                      <CategoryRow key={c.id} cat={c} depth={0} allFlat={flat} onEdit={(c) => setModal({ open: true, category: c })} onDelete={setDeleteTarget} onToggle={handleToggle} />
                    ))
                  : tree.map((c) => (
                      <CategoryRow key={c.id} cat={c} depth={0} allFlat={flat} onEdit={(c) => setModal({ open: true, category: c })} onDelete={setDeleteTarget} onToggle={handleToggle} />
                    ))
                }
              </tbody>
            </table>
            {(displayList ?? flattenTree(tree)).length === 0 && (
              <div className="py-16 text-center text-slate-400">
                <svg viewBox="0 0 24 24" className="mx-auto mb-3 h-10 w-10 text-slate-300" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                {search ? "Không tìm thấy danh mục nào" : "Chưa có danh mục nào"}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-2xl font-bold text-slate-900">{flat.length}</div>
          <div className="text-sm text-slate-500">Tổng danh mục</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-2xl font-bold text-green-600">{totalActive}</div>
          <div className="text-sm text-slate-500">Đang hoạt động</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-2xl font-bold text-blue-600">{totalRoot}</div>
          <div className="text-sm text-slate-500">Danh mục gốc</div>
        </div>
      </div>

      {/* Modals */}
      {modal.open && (
        <CategoryModal
          category={modal.category}
          allCategories={flat}
          onClose={() => setModal({ open: false, category: null })}
          onSaved={() => { setModal({ open: false, category: null }); load() }}
        />
      )}
      {deleteTarget && (
        <DeleteConfirm
          category={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => handleDelete(deleteTarget)}
        />
      )}
    </div>
  )
}
