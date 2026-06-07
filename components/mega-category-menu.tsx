'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, Menu } from 'lucide-react';
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

  return (
    <NavigationMenu viewport={false}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="gap-2 rounded-full px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground data-[state=open]:bg-muted data-[state=open]:text-foreground">
            <Menu data-icon="inline-start" />
            Danh mục
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="w-[800px]">
              {categories.length > 0 ? (
                <div className="flex min-h-[400px]">
                  {/* Left: Main Categories */}
                  <div className="flex w-[280px] flex-col border-r border-border bg-muted p-4">
                    <h4 className="mb-4 px-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                      Danh mục
                    </h4>
                    <nav className="flex flex-col gap-1">
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

                  {/* Right: Subcategories */}
                  <div className="flex flex-1 flex-col p-6">
                    {activeCat && activeCat.children.length > 0 ? (
                      <>
                        <h4 className="mb-4 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                          {activeCat.name}
                        </h4>
                        <nav className="grid grid-cols-2 gap-2">
                          {activeCat.children
                            .filter((sub) => sub.active)
                            .map((sub) => (
                              <SubcategoryMenuItem key={sub.id} category={sub} />
                            ))}
                        </nav>
                      </>
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
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
  const className = `flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
    active
      ? 'bg-background font-medium text-foreground shadow-sm'
      : hasProducts
        ? 'text-foreground hover:bg-background/50'
        : 'text-muted-foreground'
  }`;

  if (!hasProducts) {
    return (
      <div onMouseEnter={onMouseEnter} className={className} aria-disabled="true">
        <span className="truncate">{category.name}</span>
        <span className="shrink-0 rounded-full bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
          Sắp có hàng
        </span>
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
        <span className="truncate">{category.name}</span>
        {category.children && category.children.length > 0 && (
          <ChevronRight data-icon className="shrink-0 text-muted-foreground" aria-hidden="true" />
        )}
      </Link>
    </NavigationMenuLink>
  );
}

function SubcategoryMenuItem({ category }: { category: Category }) {
  const hasProducts = categoryHasProducts(category);

  if (!hasProducts) {
    return (
      <div
        className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground"
        aria-disabled="true"
      >
        <span className="truncate">{category.name}</span>
        <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium">
          Sắp có hàng
        </span>
      </div>
    );
  }

  return (
    <NavigationMenuLink asChild>
      <Link
        href={`/products?category=${encodeURIComponent(category.slug)}`}
        className="group flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
      >
        <span className="truncate">{category.name}</span>
      </Link>
    </NavigationMenuLink>
  );
}

function categoryHasProducts(category: Category): boolean {
  return category.productCount > 0 || category.children.some(categoryHasProducts);
}
