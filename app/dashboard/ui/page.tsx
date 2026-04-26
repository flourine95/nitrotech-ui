'use client';
import { useMemo, useState } from 'react';
import { Eye, EyeOff, Package, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, type DataTableColumn } from '@/components/data-table';
import type { DateRange } from 'react-day-picker';
import { DataTableToolbar,
  type FilterChip,
  type SortOption,
  type SortRule,
  type ColumnVisibilityItem,
  type DateRangeFilter,
} from '@/components/data-table-toolbar';
import { BulkActionBar, type BulkAction } from '@/components/bulk-action-bar';
import { useTableSelection } from '@/hooks/use-table-selection';
import { toast } from 'sonner';

interface MockProduct {
  id: number;
  name: string;
  category: string;
  price: number;
  active: boolean;
  createdAt: string;
}

const CATEGORIES = ['Điện thoại', 'Laptop', 'Phụ kiện', 'Màn hình'];

const ALL_PRODUCTS: MockProduct[] = Array.from({ length: 47 }, (_, i) => ({
  id: i + 1,
  name: `Sản phẩm ${i + 1}`,
  category: CATEGORIES[i % 4],
  price: (i + 1) * 150_000 + 99_000,
  active: i % 3 !== 0,
  createdAt: new Date(Date.now() - i * 86_400_000).toISOString(),
}));

const SORT_OPTIONS: SortOption[] = [
  { value: 'createdAt', label: 'Ngày tạo' },
  { value: 'price', label: 'Giá' },
  { value: 'name', label: 'Tên' },
];

const PAGE_SIZE = 10;

const COLUMN_LABELS: Record<string, string> = {
  name: 'Sản phẩm',
  category: 'Danh mục',
  price: 'Giá',
  createdAt: 'Ngày tạo',
  actions: 'Hành động',
};

export default function DashboardUIPage() {
  const [scenario, setScenario] = useState<'normal' | 'loading' | 'error' | 'empty'>('normal');

  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [sortRules, setSortRules] = useState<SortRule[]>([{ field: 'createdAt', direction: 'desc' }]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);

  const [hiddenCols, setHiddenCols] = useState<Set<string>>(new Set());

  function toggleColumn(key: string, visible: boolean) {
    setHiddenCols((prev) => {
      const next = new Set(prev);
      if (visible) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let result = ALL_PRODUCTS.filter((p) => {
      const matchSearch = !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
      const matchCat = selectedCategories.length === 0 || selectedCategories.includes(p.category);
      const matchStatus =
        selectedStatuses.length === 0 ||
        (selectedStatuses.includes('active') && p.active) ||
        (selectedStatuses.includes('inactive') && !p.active);
      const matchDate =
        !dateRange?.from ||
        (() => {
          const d = new Date(p.createdAt);
          const from = dateRange.from!;
          const to = dateRange.to ?? dateRange.from!;
          return d >= from && d <= to;
        })();
      return matchSearch && matchCat && matchStatus && matchDate;
    });

    result = [...result].sort((a, b) => {
      for (const rule of sortRules) {
        let av: number, bv: number;
        if (rule.field === 'price') { av = a.price; bv = b.price; }
        else if (rule.field === 'name') { av = a.name.localeCompare(b.name); bv = 0; }
        else { av = new Date(a.createdAt).getTime(); bv = new Date(b.createdAt).getTime(); }
        const diff = rule.field === 'name' ? av : (av - bv);
        if (diff !== 0) return rule.direction === 'asc' ? diff : -diff;
      }
      return 0;
    });

    return result;
  }, [search, selectedCategories, selectedStatuses, dateRange, sortRules]);

  const totalElements = filtered.length;
  const totalPages = Math.ceil(totalElements / pageSize);
  const pageData = filtered.slice(page * pageSize, (page + 1) * pageSize);

  const { selectedIds, allSelected, someSelected, toggleSelect, toggleSelectAll, clearSelection } =
    useTableSelection(pageData.map((p) => p.id));

  const filters: FilterChip[] = [
    {
      key: 'category',
      label: 'Danh mục',
      options: CATEGORIES.map((c) => ({
        value: c,
        label: c,
        count: ALL_PRODUCTS.filter((p) => p.category === c).length,
      })),
      selected: selectedCategories,
      onChange: (v) => { setSelectedCategories(v); setPage(0); clearSelection(); },
    },
    {
      key: 'status',
      label: 'Trạng thái',
      options: [
        { value: 'active', label: 'Hiển thị', count: ALL_PRODUCTS.filter((p) => p.active).length },
        { value: 'inactive', label: 'Ẩn', count: ALL_PRODUCTS.filter((p) => !p.active).length },
      ],
      selected: selectedStatuses,
      onChange: (v) => { setSelectedStatuses(v); setPage(0); clearSelection(); },
    },
  ];

  const columnVisibility: ColumnVisibilityItem[] = Object.entries(COLUMN_LABELS).map(
    ([key, label]) => ({ key, label, visible: !hiddenCols.has(key) }),
  );

  const dateFilters: DateRangeFilter[] = [
    {
      key: 'createdAt',
      label: 'Ngày tạo',
      value: dateRange,
      onChange: (v) => { setDateRange(v); setPage(0); clearSelection(); },
    },
  ];

  const columns: DataTableColumn<MockProduct>[] = [
    {
      key: 'name',
      header: 'Sản phẩm',
      hidden: hiddenCols.has('name'),
      cell: (row) => (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{row.name}</span>
          <Badge variant={row.active ? 'default' : 'secondary'} className="text-[11px]">
            {row.active ? 'Hiển thị' : 'Ẩn'}
          </Badge>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Danh mục',
      hidden: hiddenCols.has('category'),
      cell: (row) => <span className="text-sm text-muted-foreground">{row.category}</span>,
    },
    {
      key: 'price',
      header: 'Giá',
      className: 'text-right',
      hidden: hiddenCols.has('price'),
      cell: (row) => (
        <span className="text-sm text-muted-foreground">{row.price.toLocaleString('vi-VN')}₫</span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Ngày tạo',
      hidden: hiddenCols.has('createdAt'),
      cell: (row) => (
        <span className="text-sm whitespace-nowrap text-muted-foreground">
          {new Date(row.createdAt).toLocaleDateString('vi-VN')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      hidden: hiddenCols.has('actions'),
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost" size="icon"
            className="size-8 text-muted-foreground hover:bg-amber-500/10 hover:text-amber-600"
            onClick={() => toast.info(`Sửa: ${row.name}`)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost" size="icon"
            className="size-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            onClick={() => toast.error(`Xóa: ${row.name}`)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const bulkActions: BulkAction[] = [
    {
      key: 'show',
      label: 'Hiển thị',
      icon: <Eye className="h-3.5 w-3.5" />,
      onClick: async () => {
        await new Promise((r) => setTimeout(r, 600));
        toast.success(`Đã hiển thị ${selectedIds.size} sản phẩm`);
        clearSelection();
      },
    },
    {
      key: 'hide',
      label: 'Ẩn',
      icon: <EyeOff className="h-3.5 w-3.5" />,
      onClick: async () => {
        await new Promise((r) => setTimeout(r, 600));
        toast.success(`Đã ẩn ${selectedIds.size} sản phẩm`);
        clearSelection();
      },
    },
    {
      key: 'delete',
      label: 'Xóa',
      icon: <Trash2 className="h-3.5 w-3.5" />,
      destructive: true,
      confirm: {
        title: `Xóa ${selectedIds.size} sản phẩm?`,
        description: 'Các sản phẩm sẽ được chuyển vào thùng rác.',
        icon: <Trash2 className="h-5 w-5" />,
      },
      onClick: async () => {
        await new Promise((r) => setTimeout(r, 600));
        toast.success(`Đã xóa ${selectedIds.size} sản phẩm`);
        clearSelection();
      },
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">UI Sandbox</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          DataTable · DataTableToolbar · BulkActionBar
        </p>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Scenario:</span>
        {(['normal', 'loading', 'error', 'empty'] as const).map((s) => (
          <Button key={s} size="sm" variant={scenario === s ? 'default' : 'outline'} className="h-8" onClick={() => setScenario(s)}>
            {s}
          </Button>
        ))}
      </div>

      <DataTableToolbar
        searchValue={search}
        onSearchChange={(val) => { setSearch(val); setPage(0); }}
        searchPlaceholder="Tìm tên, danh mục..."
        filters={filters}
        sortOptions={SORT_OPTIONS}
        sortRules={sortRules}
        onSortChange={(rules) => { setSortRules(rules); setPage(0); }}
        columns={columnVisibility}
        onColumnVisibilityChange={toggleColumn}
        dateFilters={dateFilters}
        onResetFilters={() => {
          setSearch('');
          setSelectedCategories([]);
          setSelectedStatuses([]);
          setDateRange(undefined);
          setSortRules([]);
          setPage(0);
          clearSelection();
        }}
      />

      <DataTable
        columns={columns}
        data={scenario === 'empty' ? [] : scenario === 'normal' ? pageData : []}
        rowKey={(row) => row.id}
        loading={scenario === 'loading'}
        isError={scenario === 'error'}
        selectable
        selectedIds={selectedIds as Set<string | number>}
        allSelected={allSelected}
        someSelected={someSelected}
        onToggleSelect={(id) => toggleSelect(id as number)}
        onToggleSelectAll={() => toggleSelectAll(pageData.map((p) => p.id))}
        currentPage={page}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={pageSize}
        pageSizeOptions={[10, 20, 50]}
        onPageChange={(p) => { setPage(p); clearSelection(); }}
        onPageSizeChange={(s) => { setPageSize(s); setPage(0); clearSelection(); }}
        rowLabel="sản phẩm"
        emptyIcon={<Package className="h-10 w-10 text-muted-foreground/30" />}
        emptyTitle={search ? `Không tìm thấy "${search}"` : 'Chưa có sản phẩm nào'}
        emptyDescription={
          search ? (
            <button className="text-primary underline-offset-4 hover:underline" onClick={() => setSearch('')}>
              Xóa tìm kiếm
            </button>
          ) : undefined
        }
      />

      <BulkActionBar selectedCount={selectedIds.size} actions={bulkActions} onClearSelection={clearSelection} />
    </div>
  );
}
