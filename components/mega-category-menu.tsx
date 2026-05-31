'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, Menu } from 'lucide-react';
import { getCategories } from '@/lib/api/public/categories';
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
  const categories = (categoriesData?.data ?? []).filter((c) => c.parentId === null && c.active);

  // Get active category with children
  const activeCat = categories.find((c) => c.id === activeCategory);

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="gap-2 rounded-full px-4 py-2 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-900 data-[state=open]:bg-slate-100 data-[state=open]:text-slate-900">
            <Menu data-icon="inline-start" />
            Danh mục
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="w-[800px]">
              {categories.length > 0 ? (
                <div className="flex min-h-[400px]">
                  {/* Left: Main Categories */}
                  <div className="flex w-[280px] flex-col border-r border-border bg-muted p-4">
                    <h4 className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Danh mục
                    </h4>
                    <nav className="flex flex-col gap-1">
                      {categories.map((cat) => (
                        <NavigationMenuLink key={cat.id} asChild>
                          <Link
                            href={`/products?category=${encodeURIComponent(cat.slug)}`}
                            onMouseEnter={() => setActiveCategory(cat.id)}
                            className={`flex items-center justify-between gap-2 rounded-full px-3 py-2 text-sm transition-colors ${
                              activeCategory === cat.id
                                ? 'bg-background font-medium text-foreground shadow-sm'
                                : 'text-foreground hover:bg-background/50'
                            }`}
                          >
                            <span className="truncate">{cat.name}</span>
                            {cat.children && cat.children.length > 0 && (
                              <ChevronRight data-icon className="shrink-0 text-muted-foreground" aria-hidden="true" />
                            )}
                          </Link>
                        </NavigationMenuLink>
                      ))}
                    </nav>
                  </div>

                  {/* Right: Subcategories */}
                  <div className="flex flex-1 flex-col p-6">
                    {activeCat && activeCat.children.length > 0 ? (
                      <>
                        <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {activeCat.name}
                        </h4>
                        <nav className="grid grid-cols-2 gap-2">
                          {activeCat.children
                            .filter((sub) => sub.active)
                            .map((sub) => (
                              <NavigationMenuLink key={sub.id} asChild>
                                <Link
                                  href={`/products?category=${encodeURIComponent(sub.slug)}`}
                                  className="group flex items-center gap-2 rounded-full px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                                >
                                  <span className="truncate">{sub.name}</span>
                                </Link>
                              </NavigationMenuLink>
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
