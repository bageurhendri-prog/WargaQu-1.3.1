export type BusinessCategory = 'FNB' | 'RETAIL' | 'SERVICE' | 'RENTAL';

export interface UsahaProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
}

export interface UsahaCartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  subtotal: number;
}

export interface UsahaTransaction {
  id: string;
  date: string;
  meta: string;
  items: UsahaCartItem[];
  subtotal: number;
  serviceFee: number;
  grandTotal: number;
}

export interface UsahaAppData {
  category: BusinessCategory;
  storeName: string;
  unit: string;
  wa: string;
  developerWa: string;
  unpaidFee: number;
  products: UsahaProduct[];
  cart: UsahaCartItem[];
  transactions: UsahaTransaction[];
}
