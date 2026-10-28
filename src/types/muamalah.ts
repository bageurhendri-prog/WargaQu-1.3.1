export type ProductCategory = 
  | 'sembako'
  | 'kuliner'
  | 'kebutuhan'
  | 'herbal'
  | 'kerajinan'
  | 'elektronik';

export interface ProductItem {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  stock: number;
  unit?: string;
  emoji: string;
  sellerName: string;
  sellerRt: string;
  description?: string;
  isPromo?: boolean;
}

export interface CartItem {
  product: ProductItem;
  quantity: number;
}

export interface MuamalahOrder {
  id: string;
  orderNumber: string;
  items: CartItem[];
  totalAmount: number;
  buyerName: string;
  buyerPhone: string;
  buyerAddress: string;
  notes: string;
  createdAt: string;
  status: 'baru' | 'diproses' | 'selesai' | 'dibatalkan';
}
