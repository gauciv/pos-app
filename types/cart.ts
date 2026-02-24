export interface CartItem {
  product_id: string;
  product_name: string;
  unit_price: number;
  quantity: number;
  stock_quantity: number;
  line_total: number;
}

export interface CartState {
  items: CartItem[];
  store_id: string | null;
  store_name: string | null;
}
