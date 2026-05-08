# Database Schema - Entity Reference

**Date:** May 3, 2026  
**Database:** PostgreSQL  
**Purpose:** Frontend reference for UI development

---

## 📋 Table of Contents

1. [Categories](#categories)
2. [Brands](#brands)
3. [Products](#products)
4. [Product Variants](#product-variants)
5. [Product Images](#product-images)
6. [Users](#users)
7. [Orders](#orders)
8. [Order Items](#order-items)
9. [Carts](#carts)
10. [Cart Items](#cart-items)
11. [Addresses](#addresses)
12. [Reviews](#reviews)
13. [Wishlists](#wishlists)
14. [Promotions](#promotions)
15. [Inventories](#inventories)

---

## Categories

**Table:** `categories`  
**Description:** Product categories with hierarchical structure

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | BIGINT | NO | AUTO | Primary key |
| `name` | VARCHAR | NO | - | Category name |
| `slug` | VARCHAR | NO | - | URL-friendly slug (unique) |
| `description` | TEXT | YES | NULL | Category description |
| `image` | VARCHAR | YES | NULL | Category image URL |
| `parent_id` | BIGINT | YES | NULL | Parent category ID (self-reference) |
| `active` | BOOLEAN | NO | true | Active status |
| `sort_order` | INTEGER | NO | 0 | Display order within parent |
| `created_at` | TIMESTAMP | NO | NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP | NO | NOW() | Last update timestamp |
| `deleted_at` | TIMESTAMP | YES | NULL | Soft delete timestamp |

**Indexes:**
- PRIMARY KEY: `id`
- UNIQUE: `slug`
- INDEX: `parent_id`
- INDEX: `deleted_at`

**Relationships:**
- Self-referencing: `parent_id` → `categories.id`
- Has many: `products`

**Notes:**
- Hierarchical structure (max 3 levels recommended)
- `sort_order` is continuous (0, 1, 2, 3...)
- Soft delete: `deleted_at IS NULL` = active

---

## Brands

**Table:** `brands`  
**Description:** Product brands/manufacturers

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | BIGINT | NO | AUTO | Primary key |
| `name` | VARCHAR | NO | - | Brand name |
| `slug` | VARCHAR | NO | - | URL-friendly slug (unique) |
| `logo` | VARCHAR | YES | NULL | Brand logo URL |
| `description` | TEXT | YES | NULL | Brand description |
| `active` | BOOLEAN | NO | true | Active status |
| `created_at` | TIMESTAMP | NO | NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP | NO | NOW() | Last update timestamp |
| `deleted_at` | TIMESTAMP | YES | NULL | Soft delete timestamp |

**Indexes:**
- PRIMARY KEY: `id`
- UNIQUE: `slug`
- INDEX: `deleted_at`

**Relationships:**
- Has many: `products`

---

## Products

**Table:** `products`  
**Description:** Main product information

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | BIGINT | NO | AUTO | Primary key |
| `category_id` | BIGINT | NO | - | Category ID |
| `brand_id` | BIGINT | YES | NULL | Brand ID |
| `name` | VARCHAR | NO | - | Product name |
| `slug` | VARCHAR | NO | - | URL-friendly slug (unique) |
| `description` | TEXT | YES | NULL | Product description |
| `thumbnail` | VARCHAR | YES | NULL | Main product image URL |
| `specs` | JSONB | YES | NULL | Product specifications (JSON) |
| `active` | BOOLEAN | NO | true | Active status |
| `created_at` | TIMESTAMP | NO | NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP | NO | NOW() | Last update timestamp |
| `deleted_at` | TIMESTAMP | YES | NULL | Soft delete timestamp |

**Indexes:**
- PRIMARY KEY: `id`
- UNIQUE: `slug`
- INDEX: `category_id`
- INDEX: `brand_id`
- INDEX: `deleted_at`

**Relationships:**
- Belongs to: `categories`
- Belongs to: `brands`
- Has many: `product_variants`
- Has many: `product_images`

**JSON Fields:**
```json
// specs example
{
  "cpu": "Intel Core i7-12700H",
  "ram": "16GB DDR5",
  "storage": "512GB NVMe SSD",
  "display": "15.6\" FHD 144Hz"
}
```

---

## Product Variants

**Table:** `product_variants`  
**Description:** Product variations (SKU level)

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | BIGINT | NO | AUTO | Primary key |
| `product_id` | BIGINT | NO | - | Product ID |
| `sku` | VARCHAR | NO | - | Stock Keeping Unit (unique) |
| `name` | VARCHAR | NO | - | Variant name |
| `price` | DECIMAL(15,2) | NO | - | Variant price |
| `attributes` | JSONB | YES | NULL | Variant attributes (JSON) |
| `active` | BOOLEAN | NO | true | Active status |
| `created_at` | TIMESTAMP | NO | NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP | NO | NOW() | Last update timestamp |
| `deleted_at` | TIMESTAMP | YES | NULL | Soft delete timestamp |

**Indexes:**
- PRIMARY KEY: `id`
- UNIQUE: `sku`
- INDEX: `product_id`
- INDEX: `deleted_at`

**Relationships:**
- Belongs to: `products`
- Has one: `inventory`

**JSON Fields:**
```json
// attributes example
{
  "color": "Silver",
  "storage": "512GB",
  "ram": "16GB"
}
```

---

## Product Images

**Table:** `product_images`  
**Description:** Product image gallery

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | BIGINT | NO | AUTO | Primary key |
| `product_id` | BIGINT | NO | - | Product ID |
| `url` | VARCHAR | NO | - | Image URL |
| `alt` | VARCHAR | YES | NULL | Alt text for SEO |
| `sort_order` | INTEGER | NO | 0 | Display order |
| `created_at` | TIMESTAMP | NO | NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP | NO | NOW() | Last update timestamp |

**Indexes:**
- PRIMARY KEY: `id`
- INDEX: `product_id`

**Relationships:**
- Belongs to: `products`

---

## Users

**Table:** `users`  
**Description:** User accounts

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | BIGINT | NO | AUTO | Primary key |
| `name` | VARCHAR | NO | - | Full name |
| `email` | VARCHAR | NO | - | Email address (unique) |
| `password` | VARCHAR | YES | NULL | Hashed password |
| `phone` | VARCHAR | YES | NULL | Phone number |
| `avatar` | VARCHAR | YES | NULL | Avatar image URL |
| `status` | ENUM | NO | inactive | User status |
| `provider` | ENUM | NO | local | Auth provider |
| `provider_id` | VARCHAR | YES | NULL | OAuth provider ID |
| `created_at` | TIMESTAMP | NO | NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP | NO | NOW() | Last update timestamp |
| `deleted_at` | TIMESTAMP | YES | NULL | Soft delete timestamp |

**Indexes:**
- PRIMARY KEY: `id`
- UNIQUE: `email`
- INDEX: `deleted_at`

**Enums:**
- `status`: `inactive`, `active`, `banned`, `suspended`
- `provider`: `local`, `google`, `facebook`

**Relationships:**
- Has many: `orders`
- Has many: `addresses`
- Has many: `reviews`
- Has one: `cart`
- Has many: `wishlists`

---

## Orders

**Table:** `orders`  
**Description:** Customer orders

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | BIGINT | NO | AUTO | Primary key |
| `user_id` | BIGINT | NO | - | User ID |
| `shipping_address` | JSONB | NO | - | Shipping address (JSON) |
| `status` | VARCHAR | NO | pending | Order status |
| `payment_method` | VARCHAR | NO | cod | Payment method |
| `total_amount` | DECIMAL(15,2) | NO | - | Subtotal before discount |
| `discount_amount` | DECIMAL(15,2) | NO | 0 | Discount amount |
| `shipping_fee` | DECIMAL(15,2) | NO | 0 | Shipping fee |
| `final_amount` | DECIMAL(15,2) | NO | - | Final amount to pay |
| `promotion_code` | VARCHAR | YES | NULL | Applied promotion code |
| `note` | TEXT | YES | NULL | Customer note |
| `created_at` | TIMESTAMP | NO | NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP | NO | NOW() | Last update timestamp |
| `deleted_at` | TIMESTAMP | YES | NULL | Soft delete timestamp |

**Indexes:**
- PRIMARY KEY: `id`
- INDEX: `user_id`
- INDEX: `status`
- INDEX: `deleted_at`

**Relationships:**
- Belongs to: `users`
- Has many: `order_items`

**Status Values:**
- `pending` - Order placed
- `confirmed` - Order confirmed
- `processing` - Being prepared
- `shipped` - Out for delivery
- `delivered` - Completed
- `cancelled` - Cancelled

**JSON Fields:**
```json
// shipping_address example
{
  "name": "John Doe",
  "phone": "0123456789",
  "address": "123 Main St",
  "ward": "Ward 1",
  "district": "District 1",
  "city": "Ho Chi Minh",
  "country": "Vietnam"
}
```

---

## Order Items

**Table:** `order_items`  
**Description:** Items in an order

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | BIGINT | NO | AUTO | Primary key |
| `order_id` | BIGINT | NO | - | Order ID |
| `variant_id` | BIGINT | NO | - | Product variant ID |
| `quantity` | INTEGER | NO | - | Quantity ordered |
| `price` | DECIMAL(15,2) | NO | - | Price at time of order |
| `created_at` | TIMESTAMP | NO | NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP | NO | NOW() | Last update timestamp |

**Indexes:**
- PRIMARY KEY: `id`
- INDEX: `order_id`
- INDEX: `variant_id`

**Relationships:**
- Belongs to: `orders`
- Belongs to: `product_variants`

---

## Carts

**Table:** `carts`  
**Description:** Shopping carts

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | BIGINT | NO | AUTO | Primary key |
| `user_id` | BIGINT | NO | - | User ID (unique) |
| `created_at` | TIMESTAMP | NO | NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP | NO | NOW() | Last update timestamp |

**Indexes:**
- PRIMARY KEY: `id`
- UNIQUE: `user_id`

**Relationships:**
- Belongs to: `users`
- Has many: `cart_items`

---

## Cart Items

**Table:** `cart_items`  
**Description:** Items in shopping cart

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | BIGINT | NO | AUTO | Primary key |
| `cart_id` | BIGINT | NO | - | Cart ID |
| `variant_id` | BIGINT | NO | - | Product variant ID |
| `quantity` | INTEGER | NO | - | Quantity in cart |
| `created_at` | TIMESTAMP | NO | NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP | NO | NOW() | Last update timestamp |

**Indexes:**
- PRIMARY KEY: `id`
- INDEX: `cart_id`
- INDEX: `variant_id`
- UNIQUE: `(cart_id, variant_id)`

**Relationships:**
- Belongs to: `carts`
- Belongs to: `product_variants`

---

## Addresses

**Table:** `addresses`  
**Description:** User saved addresses

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | BIGINT | NO | AUTO | Primary key |
| `user_id` | BIGINT | NO | - | User ID |
| `name` | VARCHAR | NO | - | Recipient name |
| `phone` | VARCHAR | NO | - | Phone number |
| `address` | VARCHAR | NO | - | Street address |
| `ward` | VARCHAR | NO | - | Ward/Commune |
| `district` | VARCHAR | NO | - | District |
| `city` | VARCHAR | NO | - | City/Province |
| `country` | VARCHAR | NO | Vietnam | Country |
| `is_default` | BOOLEAN | NO | false | Default address flag |
| `created_at` | TIMESTAMP | NO | NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP | NO | NOW() | Last update timestamp |

**Indexes:**
- PRIMARY KEY: `id`
- INDEX: `user_id`

**Relationships:**
- Belongs to: `users`

---

## Reviews

**Table:** `reviews`  
**Description:** Product reviews

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | BIGINT | NO | AUTO | Primary key |
| `user_id` | BIGINT | NO | - | User ID |
| `product_id` | BIGINT | NO | - | Product ID |
| `order_id` | BIGINT | NO | - | Order ID (verified purchase) |
| `rating` | INTEGER | NO | - | Rating (1-5) |
| `comment` | TEXT | YES | NULL | Review comment |
| `created_at` | TIMESTAMP | NO | NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP | NO | NOW() | Last update timestamp |

**Indexes:**
- PRIMARY KEY: `id`
- INDEX: `user_id`
- INDEX: `product_id`
- INDEX: `order_id`
- UNIQUE: `(user_id, product_id, order_id)`

**Relationships:**
- Belongs to: `users`
- Belongs to: `products`
- Belongs to: `orders`

**Constraints:**
- `rating` must be between 1 and 5

---

## Wishlists

**Table:** `wishlists`  
**Description:** User wishlists

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | BIGINT | NO | AUTO | Primary key |
| `user_id` | BIGINT | NO | - | User ID |
| `product_id` | BIGINT | NO | - | Product ID |
| `created_at` | TIMESTAMP | NO | NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP | NO | NOW() | Last update timestamp |

**Indexes:**
- PRIMARY KEY: `id`
- INDEX: `user_id`
- INDEX: `product_id`
- UNIQUE: `(user_id, product_id)`

**Relationships:**
- Belongs to: `users`
- Belongs to: `products`

---

## Promotions

**Table:** `promotions`  
**Description:** Discount promotions

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | BIGINT | NO | AUTO | Primary key |
| `code` | VARCHAR | NO | - | Promotion code (unique) |
| `description` | TEXT | YES | NULL | Promotion description |
| `discount_type` | VARCHAR | NO | - | Type: percentage or fixed |
| `discount_value` | DECIMAL(15,2) | NO | - | Discount value |
| `min_order_amount` | DECIMAL(15,2) | NO | 0 | Minimum order amount |
| `usage_limit` | INTEGER | YES | NULL | Total usage limit |
| `usage_per_user` | INTEGER | NO | 1 | Usage limit per user |
| `start_at` | TIMESTAMP | NO | - | Start date |
| `end_at` | TIMESTAMP | NO | - | End date |
| `active` | BOOLEAN | NO | true | Active status |
| `created_at` | TIMESTAMP | NO | NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP | NO | NOW() | Last update timestamp |

**Indexes:**
- PRIMARY KEY: `id`
- UNIQUE: `code`
- INDEX: `active`

**Discount Types:**
- `percentage` - Percentage discount (e.g., 10%)
- `fixed` - Fixed amount discount (e.g., 50,000 VND)

---

## Inventories

**Table:** `inventories`  
**Description:** Product variant stock levels

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | BIGINT | NO | AUTO | Primary key |
| `variant_id` | BIGINT | NO | - | Product variant ID (unique) |
| `quantity` | INTEGER | NO | 0 | Available quantity |
| `low_stock_threshold` | INTEGER | NO | 10 | Low stock alert threshold |
| `created_at` | TIMESTAMP | NO | NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP | NO | NOW() | Last update timestamp |

**Indexes:**
- PRIMARY KEY: `id`
- UNIQUE: `variant_id`

**Relationships:**
- Belongs to: `product_variants`

---

## 📊 Entity Relationship Diagram (ERD)

```
users
  ├── orders
  │     └── order_items → product_variants
  ├── addresses
  ├── reviews → products
  ├── cart
  │     └── cart_items → product_variants
  └── wishlists → products

categories (self-referencing)
  └── products
        ├── product_variants
        │     └── inventories
        └── product_images

brands
  └── products

promotions
  └── promotion_usages → users
```

---

## 🎯 Common Queries for Frontend

### Get Active Categories Tree
```sql
SELECT * FROM categories 
WHERE deleted_at IS NULL 
ORDER BY parent_id NULLS FIRST, sort_order;
```

### Get Product with Variants
```sql
SELECT p.*, pv.* 
FROM products p
LEFT JOIN product_variants pv ON p.id = pv.product_id
WHERE p.id = ? AND p.deleted_at IS NULL;
```

### Get User Cart
```sql
SELECT ci.*, pv.*, p.name, p.thumbnail
FROM cart_items ci
JOIN carts c ON ci.cart_id = c.id
JOIN product_variants pv ON ci.variant_id = pv.id
JOIN products p ON pv.product_id = p.id
WHERE c.user_id = ?;
```

---

**Total Tables:** 18  
**Total Relationships:** 25+  
**Soft Delete Tables:** 10 (categories, brands, products, product_variants, users, orders)
