export type Product = {
  slug: string
  name: string
  cat: string
  catSlug: string
  price: string
  priceNum: number
  old: string
  discount: string
  badge: string
  badgeColor: string
  rating: number
  reviews: number
  inStock: boolean
  stockCount: number
  sku: string
  brand: string
  specs: { label: string; value: string }[]
  variants: string[]
  colors: { name: string; color: string; ring: string }[]
  warranty: string
  description: string
  relatedSlugs: string[]
}

const products: Record<string, Product> = {
  "macbook-pro-m4": {
    slug: "macbook-pro-m4",
    name: "MacBook Pro M4",
    cat: "Laptop",
    catSlug: "laptop",
    price: "42.990.000₫",
    priceNum: 42990000,
    old: "47.990.000₫",
    discount: "-10%",
    badge: "Mới",
    badgeColor: "bg-blue-100 text-blue-700",
    rating: 4.9,
    reviews: 189,
    inStock: true,
    stockCount: 12,
    sku: "MBP-M4-16-512",
    brand: "Apple",
    specs: [
      { label: "Chip", value: "Apple M4 Pro 14-core CPU, 20-core GPU" },
      { label: "RAM", value: "16GB Unified Memory" },
      { label: "Bộ nhớ", value: "512GB SSD" },
      { label: "Màn hình", value: '16.2" Liquid Retina XDR, 3456×2234, 120Hz' },
      { label: "Pin", value: "100Wh, sạc MagSafe 140W, đến 24 giờ" },
      { label: "Kết nối", value: "3x Thunderbolt 4, HDMI, SD card, MagSafe 3" },
      { label: "Hệ điều hành", value: "macOS Sequoia" },
      { label: "Trọng lượng", value: "2.14 kg" },
      { label: "Bảo hành", value: "12 tháng chính hãng Apple" },
    ],
    variants: ["16GB / 512GB", "24GB / 512GB", "24GB / 1TB", "36GB / 1TB"],
    colors: [
      { name: "Space Black", color: "bg-slate-900", ring: "ring-slate-900" },
      { name: "Silver", color: "bg-slate-300", ring: "ring-slate-400" },
    ],
    warranty: "12 tháng chính hãng Apple VN/A",
    description:
      "MacBook Pro M4 với chip M4 Pro mạnh mẽ, màn hình Liquid Retina XDR tuyệt đẹp và thời lượng pin lên đến 24 giờ. Lý tưởng cho các chuyên gia sáng tạo và lập trình viên.",
    relatedSlugs: ["dell-xps-15", "asus-rog-strix-g16", "corsair-32gb-ddr5"],
  },
  "rtx-4080-super": {
    slug: "rtx-4080-super",
    name: "RTX 4080 Super",
    cat: "Card đồ họa",
    catSlug: "gpu",
    price: "22.500.000₫",
    priceNum: 22500000,
    old: "25.000.000₫",
    discount: "-10%",
    badge: "-10%",
    badgeColor: "bg-amber-100 text-amber-700",
    rating: 4.7,
    reviews: 156,
    inStock: true,
    stockCount: 8,
    sku: "RTX4080S-16G",
    brand: "NVIDIA",
    specs: [
      { label: "VRAM", value: "16GB GDDR6X" },
      { label: "Bus", value: "256-bit" },
      { label: "Boost Clock", value: "2.55 GHz" },
      { label: "CUDA Cores", value: "10.240" },
      { label: "TDP", value: "320W" },
      { label: "Kết nối", value: "PCIe 4.0 x16" },
      { label: "Cổng xuất", value: "3x DisplayPort 1.4a, 1x HDMI 2.1" },
      { label: "Bảo hành", value: "36 tháng" },
    ],
    variants: ["16GB GDDR6X"],
    colors: [],
    warranty: "36 tháng chính hãng",
    description:
      "RTX 4080 Super mang đến hiệu năng gaming 4K vượt trội với kiến trúc Ada Lovelace thế hệ mới. DLSS 3.5 và Frame Generation giúp tăng FPS đáng kể.",
    relatedSlugs: [
      "intel-i9-14900k",
      "corsair-32gb-ddr5",
      "samsung-990-pro-2tb",
    ],
  },
  "asus-rog-strix-g16": {
    slug: "asus-rog-strix-g16",
    name: "ASUS ROG Strix G16",
    cat: "Laptop Gaming",
    catSlug: "laptop-gaming",
    price: "35.990.000₫",
    priceNum: 35990000,
    old: "39.990.000₫",
    discount: "-10%",
    badge: "Hot",
    badgeColor: "bg-rose-100 text-rose-700",
    rating: 4.8,
    reviews: 234,
    inStock: true,
    stockCount: 5,
    sku: "ROG-G16-RTX4070",
    brand: "ASUS",
    specs: [
      { label: "CPU", value: "Intel Core i9-14900H" },
      { label: "GPU", value: "NVIDIA RTX 4070 8GB" },
      { label: "RAM", value: "32GB DDR5 4800MHz" },
      { label: "Bộ nhớ", value: "1TB NVMe SSD PCIe 4.0" },
      { label: "Màn hình", value: '16" QHD 240Hz IPS, 3ms' },
      { label: "Pin", value: "90Wh, sạc 240W" },
      { label: "Hệ điều hành", value: "Windows 11 Home" },
      { label: "Trọng lượng", value: "2.5 kg" },
      { label: "Bảo hành", value: "24 tháng" },
    ],
    variants: ["RTX 4070 / 32GB", "RTX 4080 / 32GB"],
    colors: [
      { name: "Eclipse Gray", color: "bg-slate-700", ring: "ring-slate-700" },
    ],
    warranty: "24 tháng chính hãng ASUS",
    description:
      "ASUS ROG Strix G16 là laptop gaming mạnh mẽ với CPU Intel Core i9 và GPU RTX 4070, màn hình QHD 240Hz cho trải nghiệm gaming đỉnh cao.",
    relatedSlugs: ["macbook-pro-m4", "rtx-4080-super", "corsair-32gb-ddr5"],
  },
  "samsung-990-pro-2tb": {
    slug: "samsung-990-pro-2tb",
    name: "Samsung 990 Pro 2TB",
    cat: "SSD NVMe",
    catSlug: "storage",
    price: "3.290.000₫",
    priceNum: 3290000,
    old: "3.890.000₫",
    discount: "-15%",
    badge: "Sale",
    badgeColor: "bg-green-100 text-green-700",
    rating: 4.9,
    reviews: 412,
    inStock: true,
    stockCount: 30,
    sku: "990PRO-2TB",
    brand: "Samsung",
    specs: [
      { label: "Dung lượng", value: "2TB" },
      { label: "Giao tiếp", value: "PCIe 4.0 x4, NVMe 2.0" },
      { label: "Tốc độ đọc", value: "7.450 MB/s" },
      { label: "Tốc độ ghi", value: "6.900 MB/s" },
      { label: "NAND", value: "Samsung V-NAND TLC" },
      { label: "Form factor", value: "M.2 2280" },
      { label: "TBW", value: "1.200 TBW" },
      { label: "Bảo hành", value: "60 tháng" },
    ],
    variants: ["1TB", "2TB", "4TB"],
    colors: [],
    warranty: "60 tháng chính hãng Samsung",
    description:
      "Samsung 990 Pro là SSD NVMe PCIe 4.0 hàng đầu với tốc độ đọc 7.450 MB/s, lý tưởng cho gaming, sáng tạo nội dung và workstation.",
    relatedSlugs: ["rtx-4080-super", "corsair-32gb-ddr5", "intel-i9-14900k"],
  },
  "intel-i9-14900k": {
    slug: "intel-i9-14900k",
    name: "Intel Core i9-14900K",
    cat: "CPU",
    catSlug: "cpu",
    price: "8.990.000₫",
    priceNum: 8990000,
    old: "10.500.000₫",
    discount: "-14%",
    badge: "Sale",
    badgeColor: "bg-green-100 text-green-700",
    rating: 4.8,
    reviews: 98,
    inStock: true,
    stockCount: 15,
    sku: "I9-14900K",
    brand: "Intel",
    specs: [
      { label: "Nhân / Luồng", value: "24 nhân (8P + 16E) / 32 luồng" },
      { label: "Base Clock", value: "3.2 GHz (P-core)" },
      { label: "Boost Clock", value: "6.0 GHz (P-core)" },
      { label: "Cache", value: "36MB Intel Smart Cache" },
      { label: "TDP", value: "125W (PBP) / 253W (MTP)" },
      { label: "Socket", value: "LGA1700" },
      { label: "RAM hỗ trợ", value: "DDR4 3200 / DDR5 5600" },
      { label: "Bảo hành", value: "36 tháng" },
    ],
    variants: ["i9-14900K", "i9-14900KF"],
    colors: [],
    warranty: "36 tháng chính hãng Intel",
    description:
      "Intel Core i9-14900K là CPU flagship với 24 nhân, boost clock 6.0 GHz, hiệu năng đỉnh cao cho gaming và workstation.",
    relatedSlugs: [
      "rtx-4080-super",
      "corsair-32gb-ddr5",
      "samsung-990-pro-2tb",
    ],
  },
  "lg-ultragear-27": {
    slug: "lg-ultragear-27",
    name: 'LG UltraGear 27" 4K 144Hz',
    cat: "Màn hình",
    catSlug: "monitors",
    price: "12.990.000₫",
    priceNum: 12990000,
    old: "14.500.000₫",
    discount: "-10%",
    badge: "-10%",
    badgeColor: "bg-amber-100 text-amber-700",
    rating: 4.7,
    reviews: 203,
    inStock: true,
    stockCount: 10,
    sku: "LG-27GP950-B",
    brand: "LG",
    specs: [
      { label: "Kích thước", value: "27 inch" },
      { label: "Độ phân giải", value: "3840×2160 (4K UHD)" },
      { label: "Tần số quét", value: "144Hz (OC 160Hz)" },
      { label: "Thời gian phản hồi", value: "1ms GTG" },
      { label: "Tấm nền", value: "IPS Nano" },
      { label: "HDR", value: "VESA DisplayHDR 600" },
      {
        label: "Kết nối",
        value: "2x HDMI 2.1, 1x DisplayPort 1.4, 4x USB 3.0",
      },
      { label: "Bảo hành", value: "36 tháng" },
    ],
    variants: ['27" 4K 144Hz'],
    colors: [{ name: "Black", color: "bg-slate-900", ring: "ring-slate-900" }],
    warranty: "36 tháng chính hãng LG",
    description:
      "LG UltraGear 27GP950 là màn hình gaming 4K 144Hz với tấm nền IPS Nano, HDR600 và HDMI 2.1 — lý tưởng cho PS5, Xbox Series X và PC gaming.",
    relatedSlugs: ["rtx-4080-super", "asus-rog-strix-g16", "intel-i9-14900k"],
  },
  "corsair-32gb-ddr5": {
    slug: "corsair-32gb-ddr5",
    name: "Corsair Vengeance 32GB DDR5",
    cat: "RAM",
    catSlug: "storage",
    price: "2.490.000₫",
    priceNum: 2490000,
    old: "2.990.000₫",
    discount: "-17%",
    badge: "Sale",
    badgeColor: "bg-green-100 text-green-700",
    rating: 4.8,
    reviews: 167,
    inStock: true,
    stockCount: 25,
    sku: "CMK32GX5M2B6000C36",
    brand: "Corsair",
    specs: [
      { label: "Dung lượng", value: "32GB (2×16GB)" },
      { label: "Loại", value: "DDR5" },
      { label: "Tốc độ", value: "6000MHz" },
      { label: "Timing", value: "CL36-36-36-76" },
      { label: "Điện áp", value: "1.35V" },
      { label: "XMP", value: "Intel XMP 3.0" },
      { label: "Tản nhiệt", value: "Aluminum heatspreader" },
      { label: "Bảo hành", value: "Lifetime" },
    ],
    variants: ["16GB (1×16GB)", "32GB (2×16GB)", "64GB (2×32GB)"],
    colors: [
      { name: "Black", color: "bg-slate-900", ring: "ring-slate-900" },
      {
        name: "White",
        color: "bg-white ring-1 ring-slate-200",
        ring: "ring-slate-400",
      },
    ],
    warranty: "Bảo hành trọn đời",
    description:
      "Corsair Vengeance DDR5-6000 với XMP 3.0, tốc độ cao và độ trễ thấp, lý tưởng cho Intel 12th/13th/14th Gen và AMD Ryzen 7000.",
    relatedSlugs: ["intel-i9-14900k", "samsung-990-pro-2tb", "rtx-4080-super"],
  },
  "dell-xps-15": {
    slug: "dell-xps-15",
    name: "Dell XPS 15 OLED",
    cat: "Laptop",
    catSlug: "laptop",
    price: "38.500.000₫",
    priceNum: 38500000,
    old: "42.000.000₫",
    discount: "-8%",
    badge: "Mới",
    badgeColor: "bg-blue-100 text-blue-700",
    rating: 4.6,
    reviews: 87,
    inStock: true,
    stockCount: 7,
    sku: "XPS15-9530-OLED",
    brand: "Dell",
    specs: [
      { label: "CPU", value: "Intel Core i7-13700H" },
      { label: "RAM", value: "32GB DDR5 4800MHz" },
      { label: "Bộ nhớ", value: "1TB SSD PCIe 4.0" },
      { label: "Màn hình", value: '15.6" OLED 3.5K 60Hz, 100% DCI-P3' },
      { label: "GPU", value: "NVIDIA RTX 4060 8GB" },
      { label: "Pin", value: "86Wh, đến 13 giờ" },
      { label: "Hệ điều hành", value: "Windows 11 Home" },
      { label: "Trọng lượng", value: "1.86 kg" },
      { label: "Bảo hành", value: "12 tháng" },
    ],
    variants: ["i7 / 32GB / 1TB", "i9 / 64GB / 2TB"],
    colors: [
      {
        name: "Platinum Silver",
        color: "bg-slate-300",
        ring: "ring-slate-400",
      },
    ],
    warranty: "12 tháng chính hãng Dell",
    description:
      "Dell XPS 15 với màn hình OLED 3.5K sắc nét, thiết kế mỏng nhẹ và hiệu năng mạnh mẽ từ Intel Core i7 thế hệ 13.",
    relatedSlugs: ["macbook-pro-m4", "asus-rog-strix-g16", "corsair-32gb-ddr5"],
  },
}

export function getProduct(slug: string): Product | null {
  return products[slug] ?? null
}

export function getAllProducts(): Product[] {
  return Object.values(products)
}

export function getRelatedProducts(slugs: string[]): Product[] {
  return slugs.map((s) => products[s]).filter(Boolean)
}
