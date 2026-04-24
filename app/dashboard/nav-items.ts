import {
  LayoutDashboardIcon,
  PackageIcon,
  ShoppingCartIcon,
  UsersIcon,
  TrendingUpIcon,
  WarehouseIcon,
  TagIcon,
  FolderIcon,
  ImageIcon,
  SettingsIcon,
} from 'lucide-react';

export type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
};

export const mainNavItems: NavItem[] = [
  { label: 'Tổng quan', href: '/dashboard', icon: LayoutDashboardIcon },
  { label: 'Sản phẩm', href: '/dashboard/products', icon: PackageIcon },
  { label: 'Đơn hàng', href: '/dashboard/orders', icon: ShoppingCartIcon, badge: 12 },
  { label: 'Khách hàng', href: '/dashboard/customers', icon: UsersIcon },
  { label: 'Doanh thu', href: '/dashboard/revenue', icon: TrendingUpIcon },
  { label: 'Kho hàng', href: '/dashboard/inventory', icon: WarehouseIcon },
];

export const catalogNavItems: NavItem[] = [
  { label: 'Thương hiệu', href: '/dashboard/brands', icon: TagIcon },
  { label: 'Danh mục', href: '/dashboard/categories', icon: FolderIcon },
  { label: 'Hình ảnh', href: '/dashboard/media', icon: ImageIcon },
];

export const systemNavItems: NavItem[] = [
  { label: 'Cài đặt', href: '/dashboard/settings', icon: SettingsIcon },
];
