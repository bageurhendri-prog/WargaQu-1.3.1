export type BusinessCategory = 'FNB' | 'RETAIL' | 'SERVICE' | 'RENTAL';

export interface UsahaProduct {
  id: string;
  name: string;
  category: string;
  price: number; // Harga Jual
  costPrice?: number; // Harga Modal / HPP / Kulakan per unit
  stock: number; // Stok saat ini (tidak boleh minus, min 0)
  unit?: string; // pcs, porsi, kg, liter, unit, jam, dll
  minStock?: number; // Batas stok kritis (default 5)
  isAutoAdded?: boolean; // Ditambahkan otomatis via smart order
}

export interface UsahaCartItem {
  id: string;
  name: string;
  category?: string;
  price: number;
  costPrice?: number;
  qty: number;
  subtotal: number;
  isCriticalStock?: boolean;
}

export interface UsahaTransaction {
  id: string;
  date: string;
  meta: string;
  items: UsahaCartItem[];
  subtotal: number;
  serviceFee: number;
  grandTotal: number;
  paymentMethod?: 'tunai' | 'qris' | 'transfer' | 'bon';
  cashAmount?: number;
  changeAmount?: number;
}

export interface UsahaExpenseModal {
  id: string;
  date: string;
  description: string;
  amount: number;
  category?: string;
  qty?: number;
  unit?: string;
  unitCost?: number;
}

export interface ReceiptSettings {
  storeName: string;
  storeAddress: string;
  storePhone: string;
  footerNote: string;
  showServiceFee: boolean;
  showQrisBadge: boolean;
  paperSize: '58mm' | '80mm';
}

export interface UsahaAppData {
  category: BusinessCategory;
  storeName: string;
  unit: string;
  wa: string;
  developerWa: string;
  unpaidFee: number;
  productCategories: string[];
  products: UsahaProduct[];
  cart: UsahaCartItem[];
  transactions: UsahaTransaction[];
  expensesModal: UsahaExpenseModal[];
  receiptSettings: ReceiptSettings;
}
