import type { Product } from '@/lib/api/products';
import type { Page } from '@/lib/types/pagination';

export const mockProducts: Product[] = [
  {
    id: 1,
    categoryId: 1,
    categoryName: 'Laptop Gaming',
    brandId: 1,
    brandName: 'Apple',
    name: 'MacBook Pro M4 14"',
    slug: 'macbook-pro-m4-14',
    description: 'Laptop cao cấp với chip M4, màn hình Liquid Retina XDR 14 inch.',
    thumbnail:
      'https://cdn.shadcnstudio.com/ss-assets/blocks/dashboard-application/widgets/image-7.png',
    specs: {
      CPU: 'Apple M4',
      RAM: '16GB',
      Storage: '512GB SSD',
      Display: '14.2" Liquid Retina XDR',
    },
    active: true,
    images: [],
    variants: null,
    variantCount: 3,
    priceMin: 42990000,
    priceMax: 69990000,
    createdAt: '2025-01-10T08:00:00Z',
    updatedAt: '2025-04-01T10:00:00Z',
  },
  {
    id: 2,
    categoryId: 2,
    categoryName: 'Card đồ họa',
    brandId: 2,
    brandName: 'NVIDIA',
    name: 'RTX 4080 Super 16GB',
    slug: 'rtx-4080-super-16gb',
    description: 'Card đồ họa flagship với 16GB GDDR6X, hiệu năng vượt trội.',
    thumbnail: null,
    specs: { VRAM: '16GB GDDR6X', TDP: '320W', Interface: 'PCIe 4.0 x16' },
    active: true,
    images: [],
    variants: null,
    variantCount: 1,
    priceMin: 22500000,
    priceMax: 22500000,
    createdAt: '2025-01-15T09:00:00Z',
    updatedAt: '2025-03-20T11:00:00Z',
  },
  {
    id: 3,
    categoryId: 1,
    categoryName: 'Laptop Gaming',
    brandId: 3,
    brandName: 'ASUS',
    name: 'ASUS ROG Strix G16 2025',
    slug: 'asus-rog-strix-g16-2025',
    description: 'Laptop gaming mạnh mẽ với RTX 4070, màn hình 165Hz.',
    thumbnail: null,
    specs: {
      CPU: 'Intel Core i9-14900HX',
      GPU: 'RTX 4070',
      RAM: '32GB DDR5',
      Display: '16" QHD 165Hz',
    },
    active: true,
    images: [],
    variants: null,
    variantCount: 2,
    priceMin: 35990000,
    priceMax: 42990000,
    createdAt: '2025-02-01T10:00:00Z',
    updatedAt: '2025-04-05T09:00:00Z',
  },
  {
    id: 4,
    categoryId: 3,
    categoryName: 'RAM & SSD',
    brandId: 4,
    brandName: 'Samsung',
    name: 'Samsung 990 Pro 2TB NVMe',
    slug: 'samsung-990-pro-2tb',
    description: 'SSD NVMe PCIe 4.0 tốc độ cao, đọc 7450MB/s.',
    thumbnail: null,
    specs: {
      Capacity: '2TB',
      Interface: 'PCIe 4.0 NVMe',
      ReadSpeed: '7450 MB/s',
      WriteSpeed: '6900 MB/s',
    },
    active: true,
    images: [],
    variants: null,
    variantCount: 2,
    priceMin: 1690000,
    priceMax: 3290000,
    createdAt: '2025-01-20T11:00:00Z',
    updatedAt: '2025-03-15T14:00:00Z',
  },
  {
    id: 5,
    categoryId: 4,
    categoryName: 'CPU & Bo mạch',
    brandId: 5,
    brandName: 'Intel',
    name: 'Intel Core i9-14900K',
    slug: 'intel-core-i9-14900k',
    description: 'CPU desktop cao cấp 24 nhân, xung nhịp boost 6.0GHz.',
    thumbnail: null,
    specs: { Cores: '24 (8P+16E)', MaxBoost: '6.0 GHz', TDP: '125W', Socket: 'LGA1700' },
    active: true,
    images: [],
    variants: null,
    variantCount: 1,
    priceMin: 8990000,
    priceMax: 8990000,
    createdAt: '2025-01-25T08:30:00Z',
    updatedAt: '2025-02-28T10:00:00Z',
  },
  {
    id: 6,
    categoryId: 5,
    categoryName: 'Màn hình',
    brandId: 6,
    brandName: 'LG',
    name: 'LG UltraGear 27GR95QE 27" OLED',
    slug: 'lg-ultragear-27gr95qe',
    description: 'Màn hình gaming OLED 27 inch, 240Hz, 0.03ms response time.',
    thumbnail: null,
    specs: { Panel: 'OLED', Resolution: '2560x1440', RefreshRate: '240Hz', ResponseTime: '0.03ms' },
    active: true,
    images: [],
    variants: null,
    variantCount: 1,
    priceMin: 12990000,
    priceMax: 12990000,
    createdAt: '2025-02-10T09:00:00Z',
    updatedAt: '2025-04-10T08:00:00Z',
  },
  {
    id: 7,
    categoryId: 3,
    categoryName: 'RAM & SSD',
    brandId: 7,
    brandName: 'Corsair',
    name: 'Corsair Vengeance DDR5 32GB 6000MHz',
    slug: 'corsair-vengeance-ddr5-32gb',
    description: 'RAM DDR5 tốc độ cao 6000MHz, tối ưu cho Intel 13th/14th gen.',
    thumbnail: null,
    specs: { Capacity: '32GB (2x16GB)', Speed: '6000MHz', Type: 'DDR5', Latency: 'CL36' },
    active: true,
    images: [],
    variants: null,
    variantCount: 2,
    priceMin: 2490000,
    priceMax: 4290000,
    createdAt: '2025-02-15T10:00:00Z',
    updatedAt: '2025-03-30T11:00:00Z',
  },
  {
    id: 8,
    categoryId: 1,
    categoryName: 'Laptop',
    brandId: 8,
    brandName: 'Dell',
    name: 'Dell XPS 15 9530 OLED',
    slug: 'dell-xps-15-9530-oled',
    description: 'Laptop cao cấp màn hình OLED 3.5K, thiết kế mỏng nhẹ.',
    thumbnail: null,
    specs: {
      CPU: 'Intel Core i7-13700H',
      RAM: '32GB',
      Storage: '1TB SSD',
      Display: '15.6" OLED 3.5K',
    },
    active: false,
    images: [],
    variants: null,
    variantCount: 2,
    priceMin: 38500000,
    priceMax: 45000000,
    createdAt: '2025-03-01T08:00:00Z',
    updatedAt: '2025-04-12T09:00:00Z',
  },
];

export function mockProductsPage(query?: {
  search?: string;
  active?: boolean;
  page?: number;
  size?: number;
}): Page<Product> {
  const page = query?.page ?? 0;
  const size = query?.size ?? 20;

  let filtered = mockProducts;

  if (query?.search) {
    const s = query.search.toLowerCase();
    filtered = filtered.filter(
      (p) => p.name.toLowerCase().includes(s) || p.brandName?.toLowerCase().includes(s),
    );
  }

  if (query?.active !== undefined) {
    filtered = filtered.filter((p) => p.active === query.active);
  }

  const totalElements = filtered.length;
  const totalPages = Math.ceil(totalElements / size);
  const content = filtered.slice(page * size, page * size + size);

  return {
    content,
    totalElements,
    totalPages,
    number: page,
    size,
    first: page === 0,
    last: page >= totalPages - 1,
    empty: content.length === 0,
  };
}
