import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter, X } from 'lucide-react';

const sortOptions = [
  { label: 'Mới nhất', value: 'createdAt,desc' },
  { label: 'Giá tăng dần', value: 'price,asc' },
  { label: 'Giá giảm dần', value: 'price,desc' },
  { label: 'Tên A-Z', value: 'name,asc' },
  { label: 'Tên Z-A', value: 'name,desc' },
];

const pageSizeOptions = [
  { label: '24', value: 24 },
  { label: '48', value: 48 },
  { label: '96', value: 96 },
];

interface ProductToolbarProps {
  totalElements: number;
  size: number;
  onSizeChange: (size: number) => void;
  sort: string;
  onSortChange: (sort: string) => void;
  category: string | null;
  onCategoryRemove: () => void;
  brands: string[];
  onBrandRemove: (brand: string) => void;
  minPrice: number | null;
  maxPrice: number | null;
  onPriceRemove: () => void;
  hasActiveFilters: boolean;
  onClearAll: () => void;
  onPageReset: () => void;
}

export function ProductToolbar({
  totalElements,
  size,
  onSizeChange,
  sort,
  onSortChange,
  category,
  onCategoryRemove,
  brands,
  onBrandRemove,
  minPrice,
  maxPrice,
  onPriceRemove,
  hasActiveFilters,
  onClearAll,
  onPageReset,
}: ProductToolbarProps) {
  return (
    <div className="mb-6 flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{totalElements}</span> sản phẩm
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Mobile filter */}
          <Button variant="outline" size="sm" className="lg:hidden">
            <Filter data-icon="inline-start" />
            Lọc
          </Button>

          {/* Page size */}
          <div className="flex items-center gap-2">
            <Label htmlFor="pageSize" className="hidden text-sm text-muted-foreground sm:block">
              Hiển thị:
            </Label>
            <Select
              value={String(size)}
              onValueChange={(value) => {
                onSizeChange(Number(value));
                onPageReset();
              }}
            >
              <SelectTrigger id="pageSize" className="h-9 w-20 rounded-full text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={4} className="w-20 min-w-0">
                {pageSizeOptions.map((o) => (
                  <SelectItem key={o.value} value={String(o.value)}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <Label htmlFor="sort" className="hidden text-sm text-muted-foreground sm:block">
              Sắp xếp:
            </Label>
            <Select
              value={sort}
              onValueChange={(value) => {
                onSortChange(value);
                onPageReset();
              }}
            >
              <SelectTrigger id="sort" className="h-9 w-40 rounded-full text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={4} className="w-40 min-w-0">
                {sortOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Active filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Đang lọc:</span>
          {category && (
            <Button
              onClick={() => {
                onCategoryRemove();
                onPageReset();
              }}
              variant="outline"
              size="sm"
              className="h-7 gap-1.5 rounded-full border-blue-200 bg-blue-50 px-3 text-xs text-blue-700 hover:bg-blue-100 hover:text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300"
            >
              <span>{category}</span>
              <X data-icon />
            </Button>
          )}
          {brands.map((brand) => (
            <Button
              key={brand}
              onClick={() => {
                onBrandRemove(brand);
                onPageReset();
              }}
              variant="outline"
              size="sm"
              className="h-7 gap-1.5 rounded-full border-purple-200 bg-purple-50 px-3 text-xs text-purple-700 hover:bg-purple-100 hover:text-purple-800 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300"
            >
              <span>{brand}</span>
              <X data-icon />
            </Button>
          ))}
          {(minPrice !== null || maxPrice !== null) && (
            <Button
              onClick={() => {
                onPriceRemove();
                onPageReset();
              }}
              variant="outline"
              size="sm"
              className="h-7 gap-1.5 rounded-full border-green-200 bg-green-50 px-3 text-xs text-green-700 hover:bg-green-100 hover:text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300"
            >
              <span>
                {minPrice !== null && maxPrice !== null
                  ? `${minPrice.toLocaleString()}₫ - ${maxPrice.toLocaleString()}₫`
                  : minPrice !== null
                    ? `Trên ${minPrice.toLocaleString()}₫`
                    : `Dưới ${maxPrice?.toLocaleString()}₫`}
              </span>
              <X data-icon />
            </Button>
          )}
          <Button
            onClick={onClearAll}
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            Xóa tất cả
          </Button>
        </div>
      )}
    </div>
  );
}
