import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  Layers,
  CheckCircle2,
  Package,
  Store,
  Phone,
  Tag,
  MessageCircle,
  X,
  Share2,
  Clock,
  Sparkles,
  Edit3
} from 'lucide-react';
import { ProductItem, CartItem, ProductCategory, MuamalahOrder } from '../../types/muamalah';
import { MuamalahStorageService, BuyerProfile } from '../../services/muamalahStorage';

interface MuamalahQuViewProps {
  onBackToKasir?: () => void;
  onOpenSwitchModul?: () => void;
  onShowNotification?: (msg: string) => void;
  activeSubTab?: 'katalog' | 'keranjang' | 'pesanan' | 'kelola';
}

export const MuamalahQuView: React.FC<MuamalahQuViewProps> = ({
  onBackToKasir,
  onOpenSwitchModul,
  onShowNotification,
  activeSubTab = 'katalog',
}) => {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('semua');
  const [isCartOpen, setIsCartOpen] = useState<boolean>(activeSubTab === 'keranjang');
  const [isAddProductOpen, setIsAddProductOpen] = useState<boolean>(false);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState<boolean>(activeSubTab === 'pesanan');
  const [isSettingWaOpen, setIsSettingWaOpen] = useState<boolean>(false);

  // Buyer Info & WA
  const [buyerProfile, setBuyerProfile] = useState<BuyerProfile>({
    name: '',
    phone: '',
    address: '',
  });
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [sellerWhatsApp, setSellerWhatsApp] = useState<string>('6281234567890');
  const [newSellerWaInput, setNewSellerWaInput] = useState<string>('');

  // New Product Form State
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'sembako' as ProductCategory,
    price: '',
    stock: '',
    unit: 'pcs',
    emoji: '📦',
    sellerName: 'Warga RT 02',
    sellerRt: 'RT 02 / RW 05',
    description: '',
  });

  // Load Initial Data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setProducts(MuamalahStorageService.getProducts());
    setCart(MuamalahStorageService.getCart());
    setBuyerProfile(MuamalahStorageService.getBuyerProfile());
    const wa = MuamalahStorageService.getSellerWhatsApp();
    setSellerWhatsApp(wa);
    setNewSellerWaInput(wa);
  };

  // Sync with prop tab changes
  useEffect(() => {
    if (activeSubTab === 'keranjang') {
      setIsCartOpen(true);
    } else if (activeSubTab === 'pesanan') {
      setIsOrdersModalOpen(true);
    } else if (activeSubTab === 'kelola') {
      setIsAddProductOpen(true);
    }
  }, [activeSubTab]);

  // Total Quantity in Cart
  const totalCartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  // Total Price in Cart
  const totalCartAmount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cart]);

  // Format IDR Currency
  const formatIDR = (val: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sellerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sellerRt.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory =
        selectedCategory === 'semua' || item.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  // Add Item to Cart (matching onclick="tambahKeKeranjang(...)")
  const handleAddToCart = (product: ProductItem, qty: number = 1) => {
    if (product.stock <= 0) {
      if (onShowNotification) onShowNotification(`Stok ${product.name} sedang habis.`);
      return;
    }
    const updatedCart = MuamalahStorageService.addToCart(product, qty);
    setCart([...updatedCart]);
    if (navigator.vibrate) {
      try {
        navigator.vibrate(20);
      } catch {}
    }
    if (onShowNotification) {
      onShowNotification(`${product.name} dimasukkan ke keranjang`);
    }
  };

  // Change Quantity in Cart
  const handleUpdateCartQty = (productId: string, newQty: number) => {
    const updated = MuamalahStorageService.updateQuantity(productId, newQty);
    setCart([...updated]);
  };

  // Remove Item
  const handleRemoveFromCart = (productId: string) => {
    const updated = MuamalahStorageService.removeFromCart(productId);
    setCart([...updated]);
    if (onShowNotification) {
      onShowNotification('Barang dihapus dari keranjang');
    }
  };

  // Clear Cart
  const handleClearCart = () => {
    MuamalahStorageService.clearCart();
    setCart([]);
    if (onShowNotification) {
      onShowNotification('Keranjang belanja dikosongkan.');
    }
  };

  // WhatsApp Order Generator & Direct Link
  const handleCheckoutWhatsApp = () => {
    if (cart.length === 0) {
      if (onShowNotification) onShowNotification('Keranjang masih kosong!');
      return;
    }

    // Save buyer profile for future auto-fill
    MuamalahStorageService.saveBuyerProfile(buyerProfile);

    // Save order record
    const newOrder: MuamalahOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: `MQ-${Math.floor(100000 + Math.random() * 900000)}`,
      items: [...cart],
      totalAmount: totalCartAmount,
      buyerName: buyerProfile.name || 'Warga',
      buyerPhone: buyerProfile.phone || '-',
      buyerAddress: buyerProfile.address || '-',
      notes: orderNotes,
      createdAt: new Date().toISOString(),
      status: 'baru',
    };
    MuamalahStorageService.saveOrder(newOrder);

    // Build Formatted WhatsApp message
    let message = `*PESANAN MUAMALAHQU - WARGAQU*\n`;
    message += `No. Pesanan: #${newOrder.orderNumber}\n`;
    message += `Tanggal: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'medium', timeStyle: 'short' } as any)}\n\n`;
    message += `*Data Pemesan:*\n`;
    message += `👤 Nama: ${buyerProfile.name || 'Warga'}\n`;
    message += `🏠 Alamat/RT: ${buyerProfile.address || 'Komplek Warga'}\n`;
    message += `📞 Telp: ${buyerProfile.phone || '-'}\n\n`;
    message += `*Daftar Belanja:*\n`;

    cart.forEach((item, index) => {
      const itemSubtotal = item.product.price * item.quantity;
      message += `${index + 1}. ${item.product.name} (${item.quantity}x) = ${formatIDR(itemSubtotal)}\n`;
    });

    message += `\n*TOTAL: ${formatIDR(totalCartAmount)}*\n`;
    if (orderNotes.trim()) {
      message += `Catatan: ${orderNotes.trim()}\n`;
    }
    message += `\n_Mohon konfirmasi ketersediaan & jadwal pengantaran. Terima kasih!_`;

    const encoded = encodeURIComponent(message);
    const targetWa = sellerWhatsApp.replace(/[^0-9]/g, '');
    const waUrl = `https://wa.me/${targetWa}?text=${encoded}`;

    // Open WhatsApp URL
    window.open(waUrl, '_blank', 'noopener,noreferrer');

    if (onShowNotification) {
      onShowNotification('Pesanan diteruskan ke WhatsApp Penjual / Koperasi Warga!');
    }

    // Keep cart or offer option to clear
    setIsCartOpen(false);
  };

  // Add New Product
  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name.trim() || !newProduct.price) {
      if (onShowNotification) onShowNotification('Nama dan harga barang wajib diisi');
      return;
    }

    const priceNum = parseInt(newProduct.price.replace(/[^0-9]/g, ''), 10) || 0;
    const stockNum = parseInt(newProduct.stock.replace(/[^0-9]/g, ''), 10) || 10;

    const created = MuamalahStorageService.addProduct({
      name: newProduct.name.trim(),
      category: newProduct.category,
      price: priceNum,
      stock: stockNum,
      unit: newProduct.unit.trim() || 'pcs',
      emoji: newProduct.emoji.trim() || '📦',
      sellerName: newProduct.sellerName.trim() || 'Warga RT',
      sellerRt: newProduct.sellerRt.trim() || 'RT 02',
      description: newProduct.description.trim(),
    });

    setProducts([created, ...products]);
    setIsAddProductOpen(false);
    setNewProduct({
      name: '',
      category: 'sembako',
      price: '',
      stock: '',
      unit: 'pcs',
      emoji: '📦',
      sellerName: 'Warga RT 02',
      sellerRt: 'RT 02 / RW 05',
      description: '',
    });

    if (onShowNotification) {
      onShowNotification(`Produk ${created.name} berhasil ditambahkan ke MuamalahQu!`);
    }
  };

  // Save Seller WA Config
  const handleSaveSellerWa = () => {
    if (!newSellerWaInput.trim()) return;
    MuamalahStorageService.saveSellerWhatsApp(newSellerWaInput);
    setSellerWhatsApp(MuamalahStorageService.getSellerWhatsApp());
    setIsSettingWaOpen(false);
    if (onShowNotification) {
      onShowNotification('Nomor WhatsApp admin/penjual berhasil diperbarui.');
    }
  };

  // Categories list
  const categories = [
    { id: 'semua', label: 'Semua Produk', emoji: '🌟' },
    { id: 'sembako', label: 'Sembako', emoji: '🌾' },
    { id: 'kuliner', label: 'Kuliner UMKM', emoji: '🍜' },
    { id: 'kebutuhan', label: 'Kebutuhan Rumah', emoji: '🧼' },
    { id: 'herbal', label: 'Herbal & Madu', emoji: '🍯' },
    { id: 'kerajinan', label: 'Kerajinan', emoji: '🧶' },
  ];

  return (
    <div
      id="modul-muamalahqu"
      className="min-h-screen bg-slate-900 text-slate-100 flex flex-col max-w-md mx-auto shadow-2xl rounded-2xl overflow-hidden border border-slate-800 relative select-none"
    >
      {/* Header Toko / MuamalahQu */}
      <div className="bg-slate-800 px-4 py-3 flex items-center justify-between border-b border-slate-700 sticky top-0 z-20 shadow-md">
        <div className="flex items-center space-x-3">
          {/* Back button to Kasir or module switch */}
          {onBackToKasir && (
            <button
              onClick={onBackToKasir}
              className="p-1.5 -ml-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition active:scale-90"
              title="Kembali ke KasirQu"
            >
              <ArrowLeft className="w-5 h-5 text-emerald-400" />
            </button>
          )}

          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white text-lg shadow-sm">
              🛍️
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-800 rounded-full"></span>
          </div>

          <div>
            <div className="flex items-center space-x-1.5">
              <h2 className="font-bold text-base text-white tracking-tight">MuamalahQu Store</h2>
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-500/30">
                Warga
              </span>
            </div>
            <p className="text-xs text-emerald-400 font-medium">Belanja Aman & Mudah Warga</p>
          </div>
        </div>

        {/* Top Header Actions */}
        <div className="flex items-center space-x-2">
          {/* Add Product Button */}
          <button
            onClick={() => setIsAddProductOpen(true)}
            title="Tambah Jualan Warga"
            className="p-2 text-slate-300 hover:text-emerald-400 hover:bg-slate-700/60 rounded-xl transition"
          >
            <Plus className="w-5 h-5" />
          </button>

          {/* Ikon Keranjang Belanja dengan Badge */}
          <div
            className="relative cursor-pointer p-2 hover:bg-slate-700/60 rounded-xl transition active:scale-95"
            onClick={() => setIsCartOpen(true)}
            title="Buka Keranjang Belanja"
          >
            <span className="text-2xl leading-none">🛒</span>
            {totalCartCount > 0 && (
              <span
                id="cart-badge"
                className="absolute top-0.5 right-0.5 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-800 shadow-md animate-bounce"
              >
                {totalCartCount}
              </span>
            )}
          </div>

          {/* Switch Module Button */}
          {onOpenSwitchModul && (
            <button
              onClick={onOpenSwitchModul}
              title="Ganti Modul Aplikasi"
              className="p-2 text-slate-300 hover:text-emerald-400 hover:bg-slate-700/60 rounded-xl transition"
            >
              <Layers className="w-5 h-5 text-emerald-400" />
            </button>
          )}
        </div>
      </div>

      {/* Pencarian Produk */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 space-y-2.5">
        <div className="relative">
          <input
            type="text"
            id="search-produk"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kebutuhan warga / barang..."
            className="w-full bg-slate-950 text-slate-100 placeholder-slate-500 text-sm pl-10 pr-9 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500 transition shadow-inner"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Horizontal Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg font-medium transition flex items-center space-x-1 shrink-0 ${
                  isSelected
                    ? 'bg-emerald-600 text-white font-bold shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-750 hover:text-slate-100 border border-slate-700/60'
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Banner Ringkas UMKM Warga */}
      <div className="mx-3 mt-3 px-3.5 py-2.5 bg-gradient-to-r from-emerald-950/70 via-slate-800 to-slate-800/80 rounded-xl border border-emerald-500/30 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <span className="text-2xl">🌱</span>
          <div>
            <p className="text-xs font-bold text-white flex items-center gap-1">
              Pemberdayaan UMKM RT/RW
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 inline" />
            </p>
            <p className="text-[11px] text-emerald-300/90">
              Belanja produk tetangga, putar ekonomi paguyuban
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsSettingWaOpen(true)}
          className="text-[10px] bg-slate-900/80 hover:bg-slate-900 text-emerald-400 border border-emerald-500/40 px-2.5 py-1.5 rounded-lg font-bold shrink-0 transition"
        >
          Info Kontak
        </button>
      </div>

      {/* Daftar Produk (Grid ala Shopee 2 Kolom) */}
      <div className="flex-1 p-3 overflow-y-auto bg-slate-950/40">
        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-slate-400 flex flex-col items-center">
            <Package className="w-14 h-14 text-slate-600 mb-3 stroke-[1.5]" />
            <p className="text-sm font-semibold text-slate-300">Tidak ada produk ditemukan</p>
            <p className="text-xs text-slate-500 mt-1 max-w-[240px]">
              Coba kata kunci lain atau tambahkan produk jualan warga baru.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('semua');
              }}
              className="mt-4 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-emerald-400 font-bold rounded-xl border border-slate-700"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div id="product-grid" className="grid grid-cols-2 gap-3 pb-24">
            {filteredProducts.map((product) => {
              const inCartItem = cart.find(
                (c) => c.product.id === product.id || c.product.name === product.name
              );
              return (
                <div
                  key={product.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between hover:border-slate-700 transition group"
                >
                  <div>
                    {/* Visual box emoji with promo badge */}
                    <div className="h-32 bg-slate-800 flex items-center justify-center text-4xl relative group-hover:bg-slate-750 transition">
                      <span>{product.emoji}</span>
                      {product.isPromo && (
                        <span className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm">
                          PROMO
                        </span>
                      )}
                      <span className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-xs text-slate-300 text-[9px] font-medium px-1.5 py-0.5 rounded border border-slate-700">
                        {product.unit || 'pcs'}
                      </span>
                    </div>

                    <div className="p-3">
                      <h3
                        className="font-bold text-sm text-white line-clamp-1 group-hover:text-emerald-300 transition"
                        title={product.name}
                      >
                        {product.name}
                      </h3>

                      <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
                        <span>Stok: {product.stock}</span>
                        <span className="text-[10px] text-slate-500 truncate max-w-[75px]" title={product.sellerRt}>
                          {product.sellerRt}
                        </span>
                      </div>

                      <p className="text-emerald-400 font-bold text-sm mt-2">
                        {formatIDR(product.price)}
                      </p>

                      <p className="text-[10px] text-slate-400 truncate mt-0.5" title={product.sellerName}>
                        🏪 {product.sellerName}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 pt-0">
                    {inCartItem ? (
                      <div className="flex items-center justify-between bg-slate-800 rounded-xl p-1 border border-emerald-500/40">
                        <button
                          onClick={() => handleUpdateCartQty(product.id, inCartItem.quantity - 1)}
                          className="w-7 h-7 bg-slate-700 hover:bg-slate-600 text-white rounded-lg flex items-center justify-center transition"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold text-emerald-400 px-2">
                          {inCartItem.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateCartQty(product.id, inCartItem.quantity + 1)}
                          className="w-7 h-7 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center justify-center transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2 rounded-xl transition shadow-md active:scale-95 flex items-center justify-center space-x-1"
                      >
                        <span>+ Keranjang</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sticky Bottom Bar Checkout (ala Shopee/WhatsApp) */}
      <div className="bg-slate-800/98 px-4 py-3 flex items-center justify-between border-t border-slate-700 sticky bottom-0 z-20 shadow-2xl backdrop-blur-sm">
        <div className="flex flex-col cursor-pointer" onClick={() => setIsCartOpen(true)}>
          <span className="text-xs text-slate-400 font-medium">Total Keranjang:</span>
          <span className="font-extrabold text-base text-emerald-400 leading-tight">
            {formatIDR(totalCartAmount)}
          </span>
          <span className="text-[10px] text-slate-400">
            {totalCartCount} barang dipilih
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Detail Cart button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="bg-slate-700 hover:bg-slate-650 text-slate-200 p-2.5 rounded-xl border border-slate-600 text-xs font-bold transition flex items-center space-x-1"
            title="Lihat Rincian Keranjang"
          >
            <ShoppingCart className="w-4 h-4 text-emerald-400" />
            <span className="text-xs">{totalCartCount}</span>
          </button>

          {/* Checkout WA Button */}
          <button
            onClick={() => {
              if (cart.length === 0) {
                if (onShowNotification) onShowNotification('Pilih barang terlebih dahulu ke keranjang.');
                return;
              }
              setIsCartOpen(true);
            }}
            disabled={cart.length === 0}
            className={`font-bold text-sm px-4 py-2.5 rounded-xl transition shadow-lg flex items-center space-x-1.5 active:scale-95 ${
              cart.length > 0
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-60'
            }`}
          >
            <span>Checkout WA</span>
            <span className="text-base">💬</span>
          </button>
        </div>
      </div>

      {/* MODAL / DRAWER KERANJANG BELANJA */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-xs p-0 sm:p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
            {/* Modal Header */}
            <div className="bg-slate-800 px-4 py-3.5 flex items-center justify-between border-b border-slate-700">
              <div className="flex items-center space-x-2">
                <span className="text-xl">🛒</span>
                <div>
                  <h3 className="font-bold text-base text-white">Keranjang Belanja Warga</h3>
                  <p className="text-[11px] text-emerald-400">{cart.length} jenis produk dipilih</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {cart.length > 0 && (
                  <button
                    onClick={handleClearCart}
                    className="text-xs text-red-400 hover:text-red-300 font-semibold px-2 py-1 rounded-lg hover:bg-slate-700/60"
                  >
                    Kosongkan
                  </button>
                )}
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <span className="text-5xl block mb-3">🛒</span>
                  <p className="font-bold text-white text-base">Keranjang Anda Masih Kosong</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Yuk pilih kebutuhan harian atau produk UMKM warga untuk dimasukkan ke keranjang.
                  </p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md"
                  >
                    Mulai Belanja Sekarang
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-2.5">
                    {cart.map((item) => {
                      const itemSubtotal = item.product.price * item.quantity;
                      return (
                        <div
                          key={item.product.id}
                          className="bg-slate-800/90 border border-slate-700 rounded-xl p-3 flex items-center justify-between gap-3 shadow-xs"
                        >
                          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-2xl shrink-0">
                            {item.product.emoji}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-xs text-white truncate" title={item.product.name}>
                              {item.product.name}
                            </h4>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {formatIDR(item.product.price)} / {item.product.unit || 'pcs'}
                            </p>
                            <p className="text-xs font-bold text-emerald-400 mt-1">
                              Subtotal: {formatIDR(itemSubtotal)}
                            </p>
                          </div>

                          <div className="flex flex-col items-end space-y-2 shrink-0">
                            <button
                              onClick={() => handleRemoveFromCart(item.product.id)}
                              className="text-slate-500 hover:text-red-400 p-1"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-700">
                              <button
                                onClick={() => handleUpdateCartQty(item.product.id, item.quantity - 1)}
                                className="w-6 h-6 bg-slate-800 hover:bg-slate-700 text-white rounded flex items-center justify-center text-xs"
                              >
                                -
                              </button>
                              <span className="text-xs font-bold text-white px-2 min-w-[20px] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleUpdateCartQty(item.product.id, item.quantity + 1)}
                                className="w-6 h-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded flex items-center justify-center text-xs"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Formulir Data Pemesan & Alamat */}
                  <div className="mt-4 bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
                    <p className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>📍</span> Data Pemesan & Pengantaran
                    </p>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Nama Pemesan</label>
                        <input
                          type="text"
                          value={buyerProfile.name}
                          onChange={(e) => setBuyerProfile({ ...buyerProfile, name: e.target.value })}
                          placeholder="Contoh: Pak Budi"
                          className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">No. WhatsApp</label>
                        <input
                          type="tel"
                          value={buyerProfile.phone}
                          onChange={(e) => setBuyerProfile({ ...buyerProfile, phone: e.target.value })}
                          placeholder="0812xxxx"
                          className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Alamat Rumah / Blok RT</label>
                      <input
                        type="text"
                        value={buyerProfile.address}
                        onChange={(e) => setBuyerProfile({ ...buyerProfile, address: e.target.value })}
                        placeholder="Contoh: Blok C2 No. 8, RT 02"
                        className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Catatan Tambahan (Opsional)</label>
                      <input
                        type="text"
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        placeholder="Misal: Tolong antar sore setelah jam 4"
                        className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer with WA Checkout Action */}
            {cart.length > 0 && (
              <div className="bg-slate-800 p-4 border-t border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300">Total Tagihan ({totalCartCount} item):</span>
                  <span className="font-black text-lg text-emerald-400">
                    {formatIDR(totalCartAmount)}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Tujuan Order WA:</span>
                  <span className="font-mono text-emerald-400 font-semibold">+{sellerWhatsApp}</span>
                </div>

                <button
                  onClick={handleCheckoutWhatsApp}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm py-3 rounded-xl transition shadow-lg flex items-center justify-center space-x-2 active:scale-95"
                >
                  <span className="text-lg">💬</span>
                  <span>Kirim Pesanan ke WhatsApp Penjual</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL TAMBAH PRODUK JUALAN WARGA */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="bg-slate-800 px-4 py-3 flex items-center justify-between border-b border-slate-700">
              <div className="flex items-center space-x-2">
                <span className="text-xl">🏪</span>
                <h3 className="font-bold text-base text-white">Tambah Jualan Warga</h3>
              </div>
              <button
                onClick={() => setIsAddProductOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="p-4 space-y-3 overflow-y-auto flex-1">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Nama Barang / Produk *
                </label>
                <input
                  type="text"
                  required
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="Misal: Keripik Singkong Renyah 200g"
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Kategori</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, category: e.target.value as ProductCategory })
                    }
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
                  >
                    <option value="sembako">Sembako</option>
                    <option value="kuliner">Kuliner UMKM</option>
                    <option value="kebutuhan">Kebutuhan Rumah</option>
                    <option value="herbal">Herbal & Madu</option>
                    <option value="kerajinan">Kerajinan</option>
                    <option value="elektronik">Elektronik</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Ikon Emoji</label>
                  <input
                    type="text"
                    value={newProduct.emoji}
                    onChange={(e) => setNewProduct({ ...newProduct, emoji: e.target.value })}
                    placeholder="📦, 🍜, 🍯"
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500 text-center text-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Harga (Rp) *</label>
                  <input
                    type="number"
                    required
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    placeholder="Contoh: 15000"
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Stok Awal</label>
                  <input
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    placeholder="Contoh: 20"
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Nama Penjual</label>
                  <input
                    type="text"
                    value={newProduct.sellerName}
                    onChange={(e) => setNewProduct({ ...newProduct, sellerName: e.target.value })}
                    placeholder="Misal: Bu Siti"
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">RT / Lokasi</label>
                  <input
                    type="text"
                    value={newProduct.sellerRt}
                    onChange={(e) => setNewProduct({ ...newProduct, sellerRt: e.target.value })}
                    placeholder="Misal: RT 02"
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Keterangan Singkat</label>
                <textarea
                  rows={2}
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Deskripsi produk, rasa, ukuran, dll."
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 rounded-xl transition shadow-md active:scale-95"
                >
                  Simpan & Tayangkan di MuamalahQu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PENGATURAN WA TOKO / KOPERASI */}
      {isSettingWaOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                <span>💬</span> Konfigurasi WhatsApp Penjual
              </h3>
              <button
                onClick={() => setIsSettingWaOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Format nomor WhatsApp tujuan pemesanan online MuamalahQu (diawali dengan kode 62):
            </p>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Nomor WhatsApp Admin / Toko</label>
              <input
                type="text"
                value={newSellerWaInput}
                onChange={(e) => setNewSellerWaInput(e.target.value)}
                placeholder="6281234567890"
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setIsSettingWaOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={handleSaveSellerWa}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
