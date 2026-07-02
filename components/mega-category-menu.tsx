'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronRight,
  CircleDashed,
  Cpu,
  Keyboard,
  Laptop,
  Menu,
  Monitor,
  Network,
  Package,
} from 'lucide-react';
import { getCategories } from '@/lib/api/public/categories';
import type { Category } from '@/lib/api/public/categories';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';

export function MegaCategoryMenu() {
  const [activeCategory, setActiveCategory] = useState<number | null>(null);

  // Fetch categories tree
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories(),
    staleTime: 10 * 60 * 1000, // Cache 10 phút
  });

  // Extract root categories (parentId === null)
  const categories = useMemo(
    () => (categoriesData?.data ?? []).filter((c) => c.parentId === null && c.active),
    [categoriesData?.data]
  );

  // Get active category with children
  const activeCategoryId = categories.some((c) => c.id === activeCategory)
    ? activeCategory
    : categories[0]?.id;
  const activeCat = categories.find((c) => c.id === activeCategoryId);
  const activeChildren = (activeCat?.children ?? []).filter((sub) => sub.active);

  return (
    <NavigationMenu viewport={false}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="h-10 gap-2 rounded-full border border-border bg-background px-4 text-sm font-semibold text-foreground shadow-xs hover:bg-muted data-[state=open]:bg-muted data-[state=open]:text-foreground">
            <Menu data-icon="inline-start" className="size-4" />
            Danh mục
          </NavigationMenuTrigger>
          <NavigationMenuContent className="md:-translate-x-28 lg:-translate-x-36">
            <div className="w-[min(820px,calc(100vw-3rem))]">
              {categories.length > 0 ? (
                <div className="grid min-h-[320px] grid-cols-[300px_1fr]">
                  <div className="flex flex-col border-r border-border bg-muted/45 p-3">
                    <h4 className="mb-2 px-3 pt-1 text-[11px] font-bold tracking-[0.12em] text-muted-foreground uppercase">
                      Danh mục
                    </h4>
                    <nav className="flex flex-col gap-0.5">
                      {categories.map((cat) => (
                        <CategoryMenuItem
                          key={cat.id}
                          category={cat}
                          active={activeCategoryId === cat.id}
                          onMouseEnter={() => setActiveCategory(cat.id)}
                        />
                      ))}
                    </nav>
                  </div>

                  <div className="flex flex-col bg-background p-5">
                    {activeCat && activeChildren.length > 0 ? (
                      <>
                        <div className="mb-4 flex items-end justify-between gap-4">
                          <div>
                            <h4 className="text-sm font-semibold text-foreground">{activeCat.name}</h4>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Chọn nhanh nhóm sản phẩm đang kinh doanh
                            </p>
                          </div>
                          <Link
                            href={`/products?category=${encodeURIComponent(activeCat.slug)}`}
                            className="shrink-0 text-xs font-semibold text-primary hover:underline"
                          >
                            Xem tất cả
                          </Link>
                        </div>
                        <nav className="grid grid-cols-2 gap-x-5 gap-y-1">
                          {activeChildren.map((sub) => (
                            <SubcategoryMenuItem key={sub.id} category={sub} />
                          ))}
                        </nav>
                      </>
                    ) : (
                      <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
                        {activeCat
                          ? 'Không có danh mục con'
                          : 'Di chuột qua danh mục để xem chi tiết'}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                  Đang tải danh mục...
                </div>
              )}
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

function CategoryMenuItem({
  category,
  active,
  onMouseEnter,
}: {
  category: Category;
  active: boolean;
  onMouseEnter: () => void;
}) {
  const hasProducts = categoryHasProducts(category);
  const className = `group flex min-h-10 items-center justify-between gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
    active
      ? 'bg-background font-semibold text-foreground ring-1 ring-border'
      : hasProducts
        ? 'text-foreground hover:bg-background/70'
        : 'text-muted-foreground hover:bg-background/40'
  }`;
  const content = (
    <>
      <span className="flex min-w-0 items-center gap-2.5">
        <CategoryIcon category={category} />
        <span className="truncate">{category.name}</span>
      </span>
      {hasProducts ? (
        category.children.length > 0 && (
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        )
      ) : (
        <span className="size-1.5 shrink-0 rounded-full bg-muted-foreground/45" aria-label="Sắp có hàng" />
      )}
    </>
  );

  if (!hasProducts) {
    return (
      <div onMouseEnter={onMouseEnter} className={className} aria-disabled="true">
        {content}
      </div>
    );
  }

  return (
    <NavigationMenuLink asChild>
      <Link
        href={`/products?category=${encodeURIComponent(category.slug)}`}
        onMouseEnter={onMouseEnter}
        className={className}
      >
        {content}
      </Link>
    </NavigationMenuLink>
  );
}

function SubcategoryMenuItem({ category }: { category: Category }) {
  const hasProducts = categoryHasProducts(category);

  if (!hasProducts) {
    return (
      <div
        className="flex min-h-10 items-center justify-between gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground"
        aria-disabled="true"
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <CategoryIcon category={category} />
          <span className="min-w-0 leading-snug">{category.name}</span>
        </span>
        <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-medium">
          <span className="size-1.5 rounded-full bg-muted-foreground/40" aria-hidden="true" />
          Sắp có
        </span>
      </div>
    );
  }

  return (
    <NavigationMenuLink asChild>
      <Link
        href={`/products?category=${encodeURIComponent(category.slug)}`}
        className="group flex min-h-10 items-center justify-between gap-3 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <CategoryIcon category={category} />
          <span className="min-w-0 leading-snug">{category.name}</span>
        </span>
        <ChevronRight className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
      </Link>
    </NavigationMenuLink>
  );
}

function categoryHasProducts(category: Category): boolean {
  return category.productCount > 0 || category.children.some(categoryHasProducts);
}

function CategoryIcon({ category }: { category: Category }) {
  const key = `${category.slug} ${category.name}`.toLowerCase();
  const className = 'size-4 shrink-0 text-muted-foreground group-hover:text-foreground';

  if (key.includes('laptop') || key.includes('máy tính xách tay')) {
    return <Laptop className={className} aria-hidden="true" />;
  }
  if (key.includes('màn hình') || key.includes('monitor')) {
    return <Monitor className={className} aria-hidden="true" />;
  }
  if (key.includes('linh kiện') || key.includes('cpu') || key.includes('pc')) {
    return <Cpu className={className} aria-hidden="true" />;
  }
  if (key.includes('phụ kiện') || key.includes('gear') || key.includes('thiết bị ngoại vi')) {
    return <Keyboard className={className} aria-hidden="true" />;
  }
  if (key.includes('mạng') || key.includes('network')) {
    return <Network className={className} aria-hidden="true" />;
  }
  if (!categoryHasProducts(category)) {
    return <CircleDashed className={className} aria-hidden="true" />;
  }

  return <Package className={className} aria-hidden="true" />;
}
