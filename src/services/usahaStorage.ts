import { UsahaAppData, UsahaProduct, UsahaCartItem, UsahaTransaction, BusinessCategory } from '../types/usahaqu';

const STORAGE_KEY = 'usahaqu_data';

export const INITIAL_USAHA_DATA: UsahaAppData = {
  category: 'FNB',
  storeName: 'Kedai Bageur',
  unit: 'porsi',
  wa: '08123456789',
  developerWa: '6281234567890',
  unpaidFee: 0,
  products: [
    { id: 'P01', name: 'Ayam Bakar Madu', price: 25000, stock: 15 },
    { id: 'P02', name: 'Es Teh Manis', price: 5000, stock: 40 },
    { id: 'P03', name: 'Nasi Putih', price: 5000, stock: 50 },
    { id: 'P04', name: 'Tahu Tempe Goreng', price: 4000, stock: 30 }
  ],
  cart: [],
  transactions: []
};

export const UsahaStorageService = {
  getAppData(): UsahaAppData {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_USAHA_DATA));
        return INITIAL_USAHA_DATA;
      }
      return { ...INITIAL_USAHA_DATA, ...JSON.parse(data) };
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
  }
};
