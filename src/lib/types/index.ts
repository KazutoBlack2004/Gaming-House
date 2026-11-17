export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  active: boolean;
  created_at: string;
}

export interface ProductVariant {
  id: string;
  product_id?: string;
  title: string;
  sku?: string;
  price?: number;
  stock: number;
  attributes: Record<string, string>;
}

export interface Product {
  id: string;
  category_id?: string;
  title: string;
  slug: string;
  description: string;
  sku?: string;
  price: number;
  compare_at_price?: number;
  stock: number;
  images: string[];
  featured: boolean;
  active: boolean;
  has_variants?: boolean;
  variants?: ProductVariant[];
  metadata?: Record<string, any>;
  created_at: string;
  category?: Category;
}

export interface CartItem {
  cartItemId: string;
  product: Product;
  quantity: number;
  variantId?: string;
  variantTitle?: string;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  notes?: string;
}

export type ShippingCarrierId = 'bluexpress' | 'bluexpress_punto' | 'retiro';

export interface Order {
  id: string;
  order_number: number;
  external_payment_id?: string;
  payment_method?: string;
  payment_status: 'pending' | 'approved' | 'rejected' | 'refunded' | 'cancelled';
  shipping_status: 'unfulfilled' | 'processing' | 'shipped' | 'delivered' | 'returned';
  shipping_carrier?: ShippingCarrierId;
  shipping_cost?: number;
  tracking_number?: string;
  total_amount: number;
  currency: string;
  payer_email: string;
  payer_name: string;
  payer_phone?: string;
  shipping_address: ShippingAddress;
  created_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  variant_id?: string;
  variant_title?: string;
  title: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface AuditLog {
  id: string;
  admin_id?: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  table_name: string;
  record_id?: string;
  summary?: string;
  old_data?: Record<string, any>;
  new_data?: Record<string, any>;
  ip_address?: string;
  created_at: string;
}

export interface AdminProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'superadmin';
  created_at: string;
}
