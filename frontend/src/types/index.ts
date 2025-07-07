export interface Product {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  status: 'published' | 'draft';
  collection: {
    id: number;
    title: string;
  };
  variants: ProductVariant[];
  sales_count: number;
  created_at: string;
  updated_at: string;
  buy_limit?: number;
  retail_price?: number;
  wholesale_price?: number;
  wholesale_config?: string;
}

export interface ProductVariant {
  id: string;
  title: string;
  prices: Price[];
  inventory_quantity: number;
  product_id?: number;
}

export interface Price {
  currency_code: string;
  amount: number;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  handle: string;
  is_active: boolean;
  products_count: number;
  rank: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  display_id: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  payment_status: 'awaiting' | 'captured' | 'cancelled' | 'failed';
  fulfillment_status: 'not_fulfilled' | 'fulfilled';
  currency_code: string;
  total: number;
  subtotal: number;
  discount_total: number;
  items: OrderItem[];
  billing_address: Address;
  shipping_address?: Address;
  customer: Customer;
  payment_method: string;
  cards?: Card[];
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  total: number;
  variant: ProductVariant;
  thumbnail?: string;
}

export interface Address {
  email: string;
  phone: string;
}

export interface Customer {
  email: string;
  phone: string;
}

export interface Card {
  info: string;
}

export interface Payment {
  payment_id: string;
  payment_url: string;
  qr_code: string;
  trade_no: string;
  total_amount: number;
  currency: string;
  payment_method: string;
  expires_at: string;
}

export interface PaymentStatus {
  order_id: number;
  payment_status: 'paid' | 'pending';
  trade_no: string;
  total_amount: number;
  payment_method: string;
  is_paid: boolean;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface ProductsResponse {
  products: Product[];
  count: number;
  offset: number;
  limit: number;
  total: number;
}

export interface CategoriesResponse {
  product_categories: Category[];
  count: number;
}

export interface CreateOrderRequest {
  product_id: number;
  quantity: number;
  customer_email: string;
  customer_phone?: string;
  payment_method?: string;
  coupon_code?: string;
}

export interface CreateOrderResponse {
  order: Order;
  payment_url: string;
} 