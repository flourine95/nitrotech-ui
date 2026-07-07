import {
  LayoutDashboardIcon,
  PackageIcon,
  ShoppingCartIcon,
  UsersIcon,
  TrendingUpIcon,
  TagIcon,
  FolderIcon,
  ImageIcon,
  SettingsIcon,
  FlaskConicalIcon,
  ShieldCheckIcon,
  ActivityIcon,
  MessageSquareIcon,
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
  { label: 'Tài khoản', href: '/dashboard/users', icon: UsersIcon },
  { label: 'Doanh thu', href: '/dashboard/revenue', icon: TrendingUpIcon },
];

export const catalogNavItems: NavItem[] = [
  { label: 'Thương hiệu', href: '/dashboard/brands', icon: TagIcon },
  { label: 'Danh mục', href: '/dashboard/categories', icon: FolderIcon },
  { label: 'Đánh giá', href: '/dashboard/reviews', icon: MessageSquareIcon },
  { label: 'Hình ảnh', href: '/dashboard/media', icon: ImageIcon },
];

export const systemNavItems: NavItem[] = [
  { label: 'Phân quyền', href: '/dashboard/access', icon: ShieldCheckIcon },
  { label: 'Nhật ký hoạt động', href: '/dashboard/audit-logs', icon: ActivityIcon },
  { label: 'Cài đặt', href: '/dashboard/settings', icon: SettingsIcon },
];

/** Dev-only: UI component sandbox */
export const devNavItems: NavItem[] = [
  { label: 'UI Sandbox', href: '/dashboard/ui', icon: FlaskConicalIcon },
];
