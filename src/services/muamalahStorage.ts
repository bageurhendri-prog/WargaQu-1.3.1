import { ProductItem, CartItem, MuamalahOrder } from '../types/muamalah';

const STORAGE_KEYS = {
  PRODUCTS: 'muamalahqu_products_v1',
  CART: 'muamalahqu_cart_v1',
  SELLER_WA: 'muamalahqu_seller_wa_v1',
  BUYER_INFO: 'muamalahqu_buyer_info_v1',
  ORDERS: 'muamalahqu_orders_v1',
};

export const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: 'prod-1',
    name: 'Beras Organik WargaQu 5kg',
    category: 'sembako',
    price: 65000,
    stock: 24,
    unit: '5kg',
    emoji: '📦',
    sellerName: 'Koperasi Warga RT 03',
    sellerRt: 'RT 03 / RW 05',
    description: 'Beras pulen pilihan petani lokal tanpa pestisida kimiawi.',
    isPromo: true,
  },
  {
    id: 'prod-2',
    name: 'Minyak Goreng Sehat 2L',
    category: 'sembako',
    price: 34000,
    stock: 12,
    unit: '2 Liter',
    emoji: '🍳',
    sellerName: 'Warung Bu Hartini',
    sellerRt: 'RT 02 / RW 05',
    description: 'Minyak kelapa sawit higienis jernih, tahan 2x penggorengan.',
  },
  {
    id: 'prod-3',
    name: 'Telur Ayam Negeri Segar 1kg',
    category: 'sembako',
    price: 28000,
    stock: 30,
    unit: '1 kg',
    emoji: '🥚',
    sellerName: 'Peternakan Berkah Warga',
    sellerRt: 'RT 01 / RW 05',
    description: 'Telur segar langsung dari kandang, utuh dan berkualitas tinggi.',
  },
  {
    id: 'prod-4',
    name: 'Madu Hutan Murni 250ml',
    category: 'herbal',
    price: 55000,
    stock: 15,
    unit: '250ml',
    emoji: '🍯',
    sellerName: 'Herbal Pak Joko',
    sellerRt: 'RT 04 / RW 05',
    description: 'Madu murni alami untuk daya tahan tubuh keluarga.',
    isPromo: true,
  },
  {
    id: 'prod-5',
    name: 'Kopi Robusta Paguyuban 250g',
    category: 'kuliner',
    price: 35000,
    stock: 20,
    unit: '250 gram',
    emoji: '☕',
    sellerName: 'Kedai Kopi Pos Ronda',
    sellerRt: 'RT 03 / RW 05',
    description: 'Kopi sangrai aroma mantap racikan pemuda paguyuban.',
  },
  {
    id: 'prod-6',
    name: 'Sambal Bawang Ulek Bu RT 150g',
    category: 'kuliner',
    price: 18000,
    stock: 18,
    unit: '150 gram',
    emoji: '🌶️',
    sellerName: 'Dapur Bu RT',
    sellerRt: 'RT 02 / RW 05',
    description: 'Sambal bawang segar gurih pedas nampol tanpa pengawet.',
  },
  {
    id: 'prod-7',
    name: 'Sabun Cuci Piring Herbal 500ml',
    category: 'kebutuhan',
    price: 12500,
    stock: 40,
    unit: '500ml',
    emoji: '🧼',
    sellerName: 'UMKM Mandiri Warga',
    sellerRt: 'RT 01 / RW 05',
    description: 'Sabun ekstrak jeruk nipis wangi, ampuh angkat minyak membandel.',
  },
  {
    id: 'prod-8',
    name: 'Gula Pasir Kristal Putih 1kg',
    category: 'sembako',
    price: 17500,
    stock: 35,
    unit: '1 kg',
    emoji: '🌾',
    sellerName: 'Warung Bu Hartini',
    sellerRt: 'RT 02 / RW 05',
    description: 'Gula kristal putih manis alami dan higienis.',
  },
];

export interface BuyerProfile {
  name: string;
  phone: string;
  address: string;
}

export const MuamalahStorageService = {
  getProducts(): ProductItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
        return INITIAL_PRODUCTS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_PRODUCTS;
    }
  },

  saveProducts(products: ProductItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.error('Failed to save Muamalah products', e);
    }
  },

  addProduct(product: Omit<ProductItem, 'id'>): ProductItem {
    const products = this.getProducts();
    const newProduct: ProductItem = {
      ...product,
      id: `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };
    const updated = [newProduct, ...products];
    this.saveProducts(updated);
    return newProduct;
  },

  getCart(): CartItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CART);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveCart(cart: CartItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart', e);
    }
  },

  addToCart(product: ProductItem, quantity: number = 1): CartItem[] {
    const cart = this.getCart();
    const existingIndex = cart.findIndex((item) => item.product.id === product.id || item.product.name === product.name);

    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({ product, quantity });
    }

    this.saveCart(cart);
    return cart;
  },

  updateQuantity(productId: string, quantity: number): CartItem[] {
    let cart = this.getCart();
    if (quantity <= 0) {
      cart = cart.filter((item) => item.product.id !== productId && item.product.name !== productId);
    } else {
      cart = cart.map((item) => {
        if (item.product.id === productId || item.product.name === productId) {
          return { ...item, quantity };
        }
        return item;
      });
    }
    this.saveCart(cart);
    return cart;
  },

  removeFromCart(productId: string): CartItem[] {
    const cart = this.getCart().filter((item) => item.product.id !== productId && item.product.name !== productId);
    this.saveCart(cart);
    return cart;
  },

  clearCart(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.CART);
    } catch (e) {
      console.error('Failed to clear cart', e);
    }
  },

  getSellerWhatsApp(): string {
    try {
      return localStorage.getItem(STORAGE_KEYS.SELLER_WA) || '6281234567890';
    } catch {
      return '6281234567890';
    }
  },

  saveSellerWhatsApp(phone: string): void {
    try {
      // Normalize number
      let clean = phone.replace(/[^0-9]/g, '');
      if (clean.startsWith('0')) {
        clean = '62' + clean.slice(1);
      }
      localStorage.setItem(STORAGE_KEYS.SELLER_WA, clean);
    } catch (e) {
      console.error('Failed to save seller WA', e);
    }
  },

  getBuyerProfile(): BuyerProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BUYER_INFO);
      if (!data) {
        return {
          name: 'Warga RT 02',
          phone: '08123456789',
          address: 'Blok B3 No. 12',
        };
      }
      return JSON.parse(data);
    } catch {
      return {
        name: 'Warga RT 02',
        phone: '08123456789',
        address: 'Blok B3 No. 12',
      };
    }
  },

  saveBuyerProfile(profile: BuyerProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.BUYER_INFO, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save buyer profile', e);
    }
  },

  getOrders(): MuamalahOrder[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveOrder(order: MuamalahOrder): void {
    try {
      const orders = this.getOrders();
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([order, ...orders]));
    } catch (e) {
      console.error('Failed to save order', e);
    }
  },
};
