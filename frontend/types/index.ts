export type Category = {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  products_count?: number;
  children?: Category[];
  description?: string | null;
  image?: string | null;
  show_in_collections?: boolean;
};

export type Brand = {
  id: number;
  name: string;
  slug: string;
};

export type ProductImage = {
  id: number;
  url: string;
  alt_text: string | null;
  is_primary: boolean;
};

export type ProductVariant = {
  id: number;
  name: string;
  price: number | null;
};

export type Product = {
  id: number;
  name: string;
  slug: string;
  sku: string | null;
  selling_price: number | string;
  currency: string;
  warranty_months: number;
  status: string;
  stock_quantity: number;
  in_stock: boolean;
  badge: "NEW_ARRIVAL" | "BEST_SELLER" | "SALE" | null;
  is_featured: boolean;
  image: string | null;
  category?: Category;
  brand?: Brand | null;
};

export type ProductDetail = Omit<Product, "sku"> & {
  description: string | null;
  features: { title: string; description: string }[];
  images: ProductImage[];
  variants: ProductVariant[];
};

export type HeroContent = {
  badge?: string;
  title_before?: string;
  title_accent?: string;
  title_after?: string;
  subtitle?: string;
  cta?: string;
  explore?: string;
  image?: string;
  image_alt?: string;
  free_shipping?: string;
  on_every_order?: string;
};

export type GuaranteeContent = {
  shipping?: { title?: string; text?: string };
  warranty?: { title?: string; year?: string; text?: string };
  returns?: { title?: string; text?: string };
};

export type HomeContent = {
  hero?: HeroContent;
  guarantees?: GuaranteeContent;
};

export type StoreSettings = {
  store_name: string;
  promo_code: string | null;
  promo_percent: number;
  promo_title: string | null;
  promo_title_ar: string | null;
  shipping_cost: number;
  support_email: string | null;
  support_phone: string | null;
  home?: Partial<Record<"ar" | "en", HomeContent>> | null;
  testimonials?: Partial<
    Record<"ar" | "en", { name: string; location: string; rating: number; title: string; text: string }[]>
  > | null;
  // Which story source the storefront renders: built-ins or admin rows.
  testimonials_mode?: "default" | "custom" | null;
  sections?: Partial<Record<"hero" | "collections" | "promo" | "favorites" | "stories", boolean>> | null;
};

export type OrderPayload = {
  items: { product_id: number; variant_id?: number | null; quantity: number }[];
  customer: {
    first_name: string;
    last_name: string;
    phone: string;
    email?: string;
    address: string;
    city: string;
  };
  notes?: string;
  discount_code?: string;
} & UtmPayload;

export type UtmPayload = {
  source?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
};

export type OrderConfirmation = {
  order_number: string;
  total: number;
  currency: string;
  status: string;
  payment_method: string;
  items: {
    product_name: string;
    variant_name: string | null;
    quantity: number;
    unit_price: number;
    total: number;
  }[];
};

/* ---------------- Admin types (mirror backend controllers) ---------------- */

export type AdminUser = { id: number; name: string; email: string };

/** Raw category model row as returned by /api/admin/categories. */
export type AdminCategory = {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  children?: AdminCategory[];
};

/** Laravel paginator JSON envelope. */
export type Paginated<T> = {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  from: number | null;
  to: number | null;
  total: number;
};

export type AdminStats = {
  total_products: number;
  total_stock: number;
  low_stock: number;
  out_of_stock: number;
  pending_orders: number;
  todays_orders: number;
  todays_revenue: number;
  currency?: string;
};

export type Currency = {
  id: number;
  code: string;
  name: string;
};

export type AdminProduct = {
  id: number;
  name: string;
  slug: string;
  sku: string;
  selling_price: string;
  currency: string;
  warranty_months: number;
  stock_quantity: number;
  status: string;
  badge: string | null;
  is_featured: boolean;
  deleted_at: string | null;
  category?: { id: number; name: string; slug: string } | null;
  brand?: { id: number; name: string; slug: string } | null;
  images?: ProductImage[];
};

export type AdminProductDetail = {
  id: number;
  name: string;
  slug: string;
  sku: string;
  barcode: string | null;
  description: string | null;
  features: { title: string; description: string }[];
  brand_id: number | null;
  category_id: number | null;
  selling_price: string;
  currency: string;
  warranty_months: number;
  stock_quantity: number;
  status: string;
  badge: "NEW_ARRIVAL" | "BEST_SELLER" | "SALE" | null;
  is_featured: boolean;
  deleted_at: string | null;
  images: ProductImage[];
  variants: { id: number; name: string; sku: string | null; price: string | null }[];
  category: { id: number; name: string } | null;
  brand: { id: number; name: string } | null;
};

export type ProductOption = {
  id: number;
  name: string;
  sku: string;
  stock_quantity: number;
};

export type PriceRecord = {
  id: number;
  price: number;
  currency: string;
  valid_from: string | null;
  valid_to: string | null;
  reason: string | null;
  created_by: string | null;
};

export type ProductHistory = {
  current_stock: number;
  price_history: PriceRecord[];
  batches: {
    id: number;
    batch_number: string;
    supplier: string | null;
    quantity_received: number;
    quantity_remaining: number;
    purchase_price: number;
    currency: string;
    arrival_date: string;
    invoice: string | null;
  }[];
  movements: {
    id: number;
    type: string;
    quantity: number;
    batch: string | null;
    reference_type: string | null;
    reference_id: number | null;
    reason: string | null;
    created_at: string;
  }[];
  orders: {
    order_id: number;
    order_number: string;
    customer_name: string;
    quantity: number;
    unit_price: number;
    total: number;
    status: string;
    date: string;
  }[];
};

export type AdminOrder = {
  id: number;
  order_number: string;
  customer_name: string;
  phone: string;
  city: string | null;
  source: string;
  total: number;
  currency: string;
  payment_status: string;
  status: string;
  created_at: string;
};

export type AdminOrderDetail = {
  id: number;
  order_number: string;
  status: string;
  payment_method: string;
  payment_status: string;
  shipping_method: string;
  shipping_status: string;
  subtotal: number;
  shipping_cost: number;
  discount: number;
  discount_code: string | null;
  total: number;
  currency: string;
  source: string;
  utm: Record<string, string>;
  customer_notes: string | null;
  internal_notes: string | null;
  created_at: string;
  customer: {
    id: number;
    name: string;
    phone: string;
    email: string | null;
    address: string | null;
    city: string | null;
  };
  items: {
    id: number;
    product_name: string;
    variant_name: string | null;
    sku: string | null;
    product_slug: string | null;
    quantity: number;
    unit_price: number;
    total: number;
    warranty_months: number;
    warranty: {
      serial_number: string | null;
      start_date: string;
      end_date: string;
      status: string;
    } | null;
  }[];
};

export type AdminCustomer = {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  email: string | null;
  city: string | null;
  country: string | null;
  orders_count: number;
  lifetime_value: number;
  created_at: string;
};

export type AdminWarranty = {
  id: number;
  order_number: string | null;
  product_name: string | null;
  serial_number: string | null;
  warranty_months: number;
  start_date: string;
  end_date: string;
  effective_status: string;
};

export type InventoryBatchRow = {
  id: number;
  product: { id: number; name: string; sku: string } | null;
  supplier: { id: number; name: string } | null;
  batch_number: string | null;
  quantity_received: number;
  quantity_remaining: number;
  purchase_price: string | null;
  currency: string;
  arrival_date: string;
  supplier_invoice_number: string | null;
};

export type InventoryMovementRow = {
  id: number;
  product: { id: number; name: string; sku: string } | null;
  batch: { id: number; batch_number: string } | null;
  type: string;
  quantity: number;
  reference_type: string | null;
  reference_id: number | null;
  reason: string | null;
  created_at: string;
};

export type ReturnItem = {
  id: number;
  product: { id: number; name: string } | null;
  quantity: number;
  condition: string;
  action: string;
};

export type AdminReturn = {
  id: number;
  order: { id: number; order_number: string } | null;
  customer: { id: number; first_name: string; last_name: string; phone: string } | null;
  status: string;
  reason: string | null;
  items: ReturnItem[] | [];
  created_at: string;
};
