export type Profile = {
  id: string;
  full_name: string;
  phone: string;
  role: 'user' | 'admin';
  is_verified: boolean;
  created_at: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  full_description: string;
  ingredients: string;
  usage_instructions: string;
  price: number;
  stock_quantity: number;
  category: string;
  image_url: string;
  images: string[];
  is_featured: boolean;
  created_at: string;
};

export type CartItem = {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  product?: Product;
};

export type OrderStatus = 
  | 'pending_payment'
  | 'payment_confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'completed'
  | 'cancelled';

export type Order = {
  id: string;
  user_id: string;
  order_number: string;
  total_amount: number;
  status: OrderStatus;
  shipping_address: string;
  phone_number: string;
  notes: string;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_purchase: number;
  product?: Product;
};
