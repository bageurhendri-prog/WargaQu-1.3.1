import {
  UsahaAppData,
  UsahaProduct,
  UsahaCartItem,
  UsahaTransaction,
  UsahaExpenseModal,
  ReceiptSettings,
  BusinessCategory
} from '../types/usahaqu';

const STORAGE_KEY = 'usahaqu_data';

export const INITIAL_RECEIPT_SETTINGS: ReceiptSettings = {
  storeName: 'Kedai Bageur',
  storeAddress: 'Jl. Merdeka No. 45, Warga RT 02 / RW 05',
  storePhone: '0812-3456-7890',
  footerNote: 'Terima kasih atas kunjungannya! Semoga berkah dan sehat selalu.',
  showServiceFee: true,
  showQrisBadge: true,
  paperSize: '58mm',
};

export const INITIAL_USAHA_DATA: UsahaAppData = {
  category: 'FNB',
  storeName: 'Kedai Bageur',
  unit: 'porsi',
  wa: '08123456789',
  developerWa: '6281234567890',
  unpaidFee: 0,
  productCategories: ['Makanan', 'Minuman', 'Sembako', 'Snack', 'Jasa', 'Lainnya'],
  products: [
    { id: 'P01', name: 'Ayam Bakar Madu', category: 'Makanan', price: 25000, costPrice: 16000, stock: 15, unit: 'porsi', minStock: 5 },
    { id: 'P02', name: 'Es Teh Manis', category: 'Minuman', price: 5000, costPrice: 2000, stock: 40, unit: 'gelas', minStock: 10 },
    { id: 'P03', name: 'Nasi Putih', category: 'Makanan', price: 5000, costPrice: 2500, stock: 50, unit: 'porsi', minStock: 10 },
    { id: 'P04', name: 'Tahu Tempe Goreng', category: 'Makanan', price: 4000, costPrice: 2000, stock: 30, unit: 'porsi', minStock: 5 },
    { id: 'P05', name: 'Beras Organik 5kg', category: 'Sembako', price: 68000, costPrice: 58000, stock: 2, unit: 'pack', minStock: 5 }, // Contoh stok kritis (< 5)
  ],
  cart: [],
  transactions: [],
  expensesModal: [
    {
      id: 'EXP-01',
      date: new Date().toLocaleDateString('id-ID'),
      description: 'Kulakan Ayam Segar 10kg',
      amount: 320000,
      category: 'Bahan Baku',
      qty: 10,
      unit: 'kg',
      unitCost: 32000,
    },
    {
      id: 'EXP-02',
      date: new Date().toLocaleDateString('id-ID'),
      description: 'Beli Teh & Gula Pasir 5kg',
      amount: 85000,
      category: 'Bahan Baku',
      qty: 5,
      unit: 'kg',
      unitCost: 17000,
    }
  ],
  receiptSettings: INITIAL_RECEIPT_SETTINGS,
};

/**
 * Smart Speech-to-Text Parser for Stock / Kulakan:
 * Example inputs:
 *  - "Beras 50kg 900rb" -> Name: Beras, Qty: 50, Unit: kg, Total: 900000, Harga per kg: 18000. Harga jual kosong!
 *  - "Gula pasir 25 kg 375 ribu"
 *  - "Minyak goreng 20 liter 320.000"
 */
export function parseSmartStockText(rawText: string): {
  name: string;
  qty: number;
  unit: string;
  totalCost: number;
  unitCost: number;
} | null {
  const text = rawText.trim();
  if (!text) return null;

  // 1. Extract price (e.g. "900rb", "375 ribu", "320.000", "450 rb", "1.5jt", "1500000")
  let totalCost = 0;
  const priceRegex = /(\d+(?:[.,]\d+)?)\s*(rb|ribu|k|jt|juta)?(?:\b|$)/gi;
  
  // Find all number matches with suffixes
  const matches = [...text.matchAll(priceRegex)];
  let priceMatch: RegExpMatchArray | null = null;
  let remainingText = text;

  // Usually the price is at the end or contains rb/ribu/jt
  for (let i = matches.length - 1; i >= 0; i--) {
    const m = matches[i];
    const suffix = (m[2] || '').toLowerCase();
    const numVal = parseFloat(m[1].replace(',', '.'));

    if (suffix === 'rb' || suffix === 'ribu' || suffix === 'k') {
      totalCost = Math.round(numVal * 1000);
      priceMatch = m;
      break;
    } else if (suffix === 'jt' || suffix === 'juta') {
      totalCost = Math.round(numVal * 1000000);
      priceMatch = m;
      break;
    } else if (numVal >= 1000) {
      // Direct raw number like 900000
      totalCost = Math.round(numVal);
      priceMatch = m;
      break;
    }
  }

  // 2. Extract Qty and Unit (e.g. "50kg", "25 kg", "20 liter", "10 dus", "5 karton", "50 pcs")
  const qtyUnitRegex = /(\d+(?:[.,]\d+)?)\s*(kg|kilogram|g|gram|liter|ltr|l|dus|karton|sak|karung|pack|pcs|butir|porsi|unit|jam|btl|botol|ikat|buah)/i;
  const qtyMatch = remainingText.match(qtyUnitRegex);

  let qty = 1;
  let unit = 'kg';

  if (qtyMatch) {
    qty = parseFloat(qtyMatch[1].replace(',', '.')) || 1;
    unit = qtyMatch[2].toLowerCase();
  }

  // 3. Extract Item Name by removing qty/unit and price parts
  let name = text;
  if (priceMatch) {
    name = name.replace(priceMatch[0], '');
  }
  if (qtyMatch) {
    name = name.replace(qtyMatch[0], '');
  }

  // Clean up punctuation, spaces, prepositions like "seharga", "total", "Rp"
  name = name
    .replace(/(?:seharga|total|harga|rp|sebesar)\s*/gi, '')
    .replace(/[.,:;\\/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Fallback name if stripped too much
  if (!name) {
    name = 'Barang Kulakan Baru';
  } else {
    // Capitalize first letters
    name = name
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }

  const unitCost = qty > 0 && totalCost > 0 ? Math.round(totalCost / qty) : 0;

  return {
    name,
    qty,
    unit,
    totalCost,
    unitCost,
  };
}

/**
 * Smart Speech-to-Text Parser for Orders:
 * Example inputs:
 *  - "Ayam Bakar 2, Es Teh 1"
 *  - "Nasi Goreng 3 + Es Jeruk 2"
 *  - "Beras 5kg 1 dan Minyak Goreng 2"
 */
export function parseSmartOrderSegments(rawText: string): Array<{ name: string; qty: number }> {
  if (!rawText.trim()) return [];

  // Split by comma, plus, newline, or " dan "
  const rawSegments = rawText
    .split(/[,+\n]|(?:\s+dan\s+)/gi)
    .map((s) => s.trim())
    .filter(Boolean);

  const results: Array<{ name: string; qty: number }> = [];

  for (const seg of rawSegments) {
    // Check pattern: "Item Name <Qty>" (e.g. "Ayam Bakar 2" or "Ayam Bakar 2 porsi")
    const matchEnd = seg.match(/^(.+?)\s+(\d+)(?:\s*(?:porsi|pcs|unit|gelas|cup|buah|btl|pack))?$/i);
    // Check pattern: "<Qty> Item Name" (e.g. "2 Ayam Bakar")
    const matchStart = seg.match(/^(\d+)\s*(?:porsi|pcs|unit|gelas|cup|buah|btl|pack)?\s+(.+)$/i);

    if (matchEnd) {
      const name = matchEnd[1].trim();
      const qty = parseInt(matchEnd[2], 10) || 1;
      if (name) results.push({ name, qty });
    } else if (matchStart) {
      const qty = parseInt(matchStart[1], 10) || 1;
      const name = matchStart[2].trim();
      if (name) results.push({ name, qty });
    } else {
      // Single item without explicit qty -> default qty 1
      const cleanName = seg.replace(/^(?:pesan|beli|minta)\s+/i, '').trim();
      if (cleanName) {
        results.push({ name: cleanName, qty: 1 });
      }
    }
  }

  return results;
}

export const UsahaStorageService = {
  getAppData(): UsahaAppData {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_USAHA_DATA));
        return INITIAL_USAHA_DATA;
      }
      const parsed = JSON.parse(data);
      return {
        ...INITIAL_USAHA_DATA,
        ...parsed,
        productCategories: parsed.productCategories && parsed.productCategories.length > 0
          ? parsed.productCategories
          : INITIAL_USAHA_DATA.productCategories,
        expensesModal: parsed.expensesModal || INITIAL_USAHA_DATA.expensesModal,
        receiptSettings: {
          ...INITIAL_RECEIPT_SETTINGS,
          ...(parsed.receiptSettings || {}),
        },
      };
    } catch {
      return INITIAL_USAHA_DATA;
    }
  },

  saveAppData(data: UsahaAppData): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save usahaqu_data to localStorage', e);
    }
  },

  resetToDefault(): UsahaAppData {
    this.saveAppData(INITIAL_USAHA_DATA);
    return INITIAL_USAHA_DATA;
  },
};
