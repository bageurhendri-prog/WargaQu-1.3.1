import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Search,
  ShoppingCart,
  Boxes,
  Receipt,
  Settings,
  Plus,
  Minus,
  ArrowLeft,
  Layers,
  Share2,
  Printer,
  CheckCircle2,
  QrCode,
  X,
  FileSpreadsheet,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import {
  UsahaAppData,
  UsahaProduct,
  UsahaCartItem,
  UsahaTransaction,
  BusinessCategory
} from '../../types/usahaqu';
import { UsahaStorageService, INITIAL_USAHA_DATA } from '../../services/usahaStorage';

interface UsahaQuViewProps {
  onBackToKasir?: () => void;
  onOpenSwitchModul?: () => void;
  onShowNotification?: (msg: string) => void;
  activeSubTab?: 'pos' | 'stock' | 'closing';
  onSelectSubTab?: (tab: 'pos' | 'stock' | 'closing') => void;
}

export const UsahaQuView: React.FC<UsahaQuViewProps> = ({
  onBackToKasir,
  onOpenSwitchModul,
  onShowNotification,
  activeSubTab,
  onSelectSubTab,
}) => {
  // App State matching usahaqu_data
  const [appData, setAppData] = useState<UsahaAppData>(() => UsahaStorageService.getAppData());
  const [internalTab, setInternalTab] = useState<'pos' | 'stock' | 'closing'>('pos');

  const activeTab = activeSubTab || internalTab;
  const setActiveTab = (tab: 'pos' | 'stock' | 'closing') => {
    setInternalTab(tab);
    if (onSelectSubTab) onSelectSubTab(tab);
  };

  // POS / Order Inputs
  const [dynamicFieldInput, setDynamicFieldInput] = useState<string>('');
  const [voiceCommandInput, setVoiceCommandInput] = useState<string>('');
  const [searchCatalogQuery, setSearchCatalogQuery] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechStatusText, setSpeechStatusText] = useState<string>(
    'Mikrofon siap digunakan. Klik mic atau ketik pesanan.'
  );

  // New Product Inputs in Tab 2
  const [newProdName, setNewProdName] = useState<string>('');
  const [newProdPrice, setNewProdPrice] = useState<string>('');
  const [newProdStock, setNewProdStock] = useState<string>('');

  // Modals
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);
  const [isQrisModalOpen, setIsQrisModalOpen] = useState<boolean>(false);

  // Wizard Temporary Form State
  const [wizardCategory, setWizardCategory] = useState<BusinessCategory>(appData.category);
  const [wizardStoreName, setWizardStoreName] = useState<string>(appData.storeName);
  const [wizardUnit, setWizardUnit] = useState<string>(appData.unit);
  const [wizardWa, setWizardWa] = useState<string>(appData.wa);

  // Web Speech Recognition Ref
  const recognitionRef = useRef<any>(null);

  // Save to localStorage whenever appData updates
  useEffect(() => {
    UsahaStorageService.saveAppData(appData);
  }, [appData]);

  // Open Wizard on first launch if empty
  useEffect(() => {
    const raw = localStorage.getItem('usahaqu_data');
    if (!raw) {
      setIsWizardOpen(true);
    }
  }, []);

  // Dynamic field label based on Business Category
  const getDynamicFieldLabel = (cat: BusinessCategory) => {
    switch (cat) {
      case 'RETAIL':
        return 'No. Member';
      case 'SERVICE':
        return 'No. Polisi / Nopol';
      case 'RENTAL':
        return 'Durasi / Jaminan';
      case 'FNB':
      default:
        return 'No. Meja';
    }
  };

  const dynamicFieldLabel = getDynamicFieldLabel(appData.category);

  // Totals Calculation
  const subtotal = appData.cart.reduce((sum, item) => sum + item.subtotal, 0);
  const serviceFee = Math.round(subtotal * 0.01); // Auto 1%
  const grandTotal = subtotal + serviceFee;

  // Closing / Rekap Stats
  const totalTrxCount = appData.transactions.length;
  const totalOmset = appData.transactions.reduce((sum, t) => sum + t.grandTotal, 0);

  // --------------------------------------------------------------------------
  // CART OPERATIONS
  // --------------------------------------------------------------------------
  const handleAddToCart = (productId: string) => {
    const prod = appData.products.find((p) => p.id === productId);
    if (!prod || prod.stock <= 0) {
      notify('Stok produk habis!');
      return;
    }

    setAppData((prev) => {
      const existing = prev.cart.find((item) => item.id === productId);
      let updatedCart: UsahaCartItem[];

      if (existing) {
        if (existing.qty < prod.stock) {
          updatedCart = prev.cart.map((item) =>
            item.id === productId
              ? { ...item, qty: item.qty + 1, subtotal: (item.qty + 1) * item.price }
              : item
          );
        } else {
          notify('Stok tidak mencukupi!');
          return prev;
        }
      } else {
        updatedCart = [
          ...prev.cart,
          {
            id: prod.id,
            name: prod.name,
            price: prod.price,
            qty: 1,
            subtotal: prod.price,
          },
        ];
      }

      return { ...prev, cart: updatedCart };
    });
  };

  const handleUpdateQty = (index: number, delta: number) => {
    setAppData((prev) => {
      const item = prev.cart[index];
      if (!item) return prev;

      const prod = prev.products.find((p) => p.id === item.id);
      const newQty = item.qty + delta;

      let updatedCart = [...prev.cart];

      if (newQty <= 0) {
        updatedCart.splice(index, 1);
      } else if (prod && newQty > prod.stock) {
        notify('Stok maksimum tercapai!');
        updatedCart[index] = {
          ...item,
          qty: prod.stock,
          subtotal: prod.stock * item.price,
        };
      } else {
        updatedCart[index] = {
          ...item,
          qty: newQty,
          subtotal: newQty * item.price,
        };
      }

      return { ...prev, cart: updatedCart };
    });
  };

  const handleClearCart = () => {
    setAppData((prev) => ({ ...prev, cart: [] }));
    notify('Keranjang pesanan dikosongkan.');
  };

  // --------------------------------------------------------------------------
  // CHECKOUT & AUTO BILLING (1%)
  // --------------------------------------------------------------------------
  const handleCheckout = (type: 'save' | 'wa' | 'print') => {
    if (appData.cart.length === 0) {
      notify('Keranjang masih kosong!');
      return;
    }

    const currentSubtotal = appData.cart.reduce((sum, item) => sum + item.subtotal, 0);
    const currentServiceFee = Math.round(currentSubtotal * 0.01);
    const currentGrandTotal = currentSubtotal + currentServiceFee;
    const metaVal = dynamicFieldInput.trim() || '-';

    const newTrx: UsahaTransaction = {
      id: 'TRX-' + Date.now().toString().slice(-6),
      date: new Date().toLocaleString('id-ID'),
      meta: metaVal,
      items: [...appData.cart],
      subtotal: currentSubtotal,
      serviceFee: currentServiceFee,
      grandTotal: currentGrandTotal,
    };

    // Update stock & transactions & unpaid fee
    setAppData((prev) => {
      const updatedProducts = prev.products.map((p) => {
        const cartItem = prev.cart.find((ci) => ci.id === p.id);
        if (cartItem) {
          return { ...p, stock: Math.max(0, p.stock - cartItem.qty) };
        }
        return p;
      });

      return {
        ...prev,
        products: updatedProducts,
        transactions: [newTrx, ...prev.transactions],
        unpaidFee: prev.unpaidFee + currentServiceFee,
        cart: [],
      };
    });

    setDynamicFieldInput('');

    if (type === 'wa') {
      sendTransactionWA(newTrx);
    } else if (type === 'print') {
      notify(`Struk nota ${newTrx.id} dicetak (Simulasi Thermal Bluetooth).`);
    } else {
      notify(`Transaksi ${newTrx.id} berhasil disimpan!`);
    }
  };

  const sendTransactionWA = (trx: UsahaTransaction) => {
    let text = `*${appData.storeName}*\nNota: ${trx.id}\nWaktu: ${trx.date}\nCatatan: ${trx.meta}\n--------------------\n`;
    trx.items.forEach((i) => {
      text += `${i.name} x${i.qty} = Rp ${i.subtotal.toLocaleString('id-ID')}\n`;
    });
    text += `--------------------\nTotal: Rp ${trx.grandTotal.toLocaleString('id-ID')}\nTerima Kasih!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // --------------------------------------------------------------------------
  // VOICE ORDER & TEXT PARSER
  // --------------------------------------------------------------------------
  const toggleSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      notify('Browser Anda tidak mendukung Web Speech Recognition.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      setSpeechStatusText('Mikrofon dimatikan.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'id-ID';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechStatusText('Mendengarkan suara...');
      };

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setVoiceCommandInput(text);
        setSpeechStatusText(`Terdeteksi: "${text}"`);
        setIsListening(false);
        processVoiceOrderText(text);
      };

      recognition.onerror = () => {
        setSpeechStatusText('Gagal mendengarkan suara. Coba ketik manual.');
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      notify('Gagal memulai pengenalan suara.');
      setIsListening(false);
    }
  };

  const handleProcessVoiceText = () => {
    if (!voiceCommandInput.trim()) {
      notify('Ketik perintah pesanan terlebih dahulu.');
      return;
    }
    processVoiceOrderText(voiceCommandInput);
  };

  const processVoiceOrderText = (text: string) => {
    const lower = text.toLowerCase();
    let found = false;

    appData.products.forEach((p) => {
      if (lower.includes(p.name.toLowerCase())) {
        handleAddToCart(p.id);
        found = true;
      }
    });

    if (found) {
      notify(`Pesanan dari suara berhasil diproses ke keranjang!`);
    } else {
      notify(`Produk tidak cocok dengan katalog saat ini.`);
    }
  };

  // --------------------------------------------------------------------------
  // SMART STOK OPERATIONS
  // --------------------------------------------------------------------------
  const handleAddNewProduct = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const name = newProdName.trim();
    const price = parseInt(newProdPrice);
    const stock = parseInt(newProdStock);

    if (!name || isNaN(price) || isNaN(stock) || price <= 0 || stock < 0) {
      notify('Lengkapi data produk dengan benar (Nama, Harga > 0, Stok >= 0)!');
      return;
    }

    const newProd: UsahaProduct = {
      id: 'P' + Date.now().toString().slice(-4),
      name,
      price,
      stock,
    };

    setAppData((prev) => ({
      ...prev,
      products: [...prev.products, newProd],
    }));

    setNewProdName('');
    setNewProdPrice('');
    setNewProdStock('');
    notify(`Produk "${name}" berhasil ditambahkan ke katalog!`);
  };

  const handleAdjustStock = (id: string, amount: number) => {
    setAppData((prev) => {
      const updated = prev.products.map((p) => {
        if (p.id === id) {
          const nextStock = Math.max(0, p.stock + amount);
          return { ...p, stock: nextStock };
        }
        return p;
      });
      return { ...prev, products: updated };
    });
  };

  // --------------------------------------------------------------------------
  // CLOSING & AUTO BILLING QRIS
  // --------------------------------------------------------------------------
  const triggerClosingProcess = () => {
    // Threshold 10.000 untuk memunculkan QRIS pembayaran otomatis
    if (appData.unpaidFee >= 10000) {
      setIsQrisModalOpen(true);
    } else {
      sendDeveloperReport();
    }
  };

  const handleConfirmQrisPayment = () => {
    sendDeveloperReport();
    setAppData((prev) => ({ ...prev, unpaidFee: 0 }));
    setIsQrisModalOpen(false);
    notify('Pembayaran biaya layanan berhasil dikonfirmasi. Terima kasih!');
  };

  const sendDeveloperReport = () => {
    const totalOmsetVal = appData.transactions.reduce((sum, t) => sum + t.grandTotal, 0);
    const reportText = `📊 REKAP BIAYA LAYANAN USAHAQU\n----------------------------------\nToko: ${appData.storeName}\nTotal Transaksi: ${appData.transactions.length}\nTotal Omset: Rp ${totalOmsetVal.toLocaleString('id-ID')}\nKontribusi Layanan (1%): Rp ${appData.unpaidFee.toLocaleString('id-ID')}\nStatus: [ LUNAS / TERCATAT ]\n----------------------------------`;

    window.open(
      `https://wa.me/${appData.developerWa || appData.wa}?text=${encodeURIComponent(reportText)}`,
      '_blank'
    );
  };

  // --------------------------------------------------------------------------
  // WIZARD SETUP
  // --------------------------------------------------------------------------
  const handleOpenWizard = () => {
    setWizardCategory(appData.category);
    setWizardStoreName(appData.storeName);
    setWizardUnit(appData.unit);
    setWizardWa(appData.wa);
    setIsWizardOpen(true);
  };

  const handleSaveWizard = () => {
    setAppData((prev) => ({
      ...prev,
      category: wizardCategory,
      storeName: wizardStoreName.trim() || 'UsahaQu Store',
      unit: wizardUnit.trim() || 'pcs',
      wa: wizardWa.trim() || '08123456789',
    }));
    setIsWizardOpen(false);
    notify('Konfigurasi UsahaQu berhasil disimpan!');
  };

  // Helper notification
  const notify = (msg: string) => {
    if (onShowNotification) onShowNotification(msg);
  };

  // Filtered Catalog
  const filteredCatalog = appData.products.filter((p) =>
    p.name.toLowerCase().includes(searchCatalogQuery.toLowerCase())
  );

  return (
    <div
      id="modul-usahaqu"
      className="flex-1 min-h-0 bg-gray-900 text-gray-100 flex flex-col w-full max-w-4xl mx-auto shadow-2xl overflow-y-auto select-none"
    >
      {/* =========================================================================
          1. HEADER USAHAQU
          ========================================================================= */}
      <header className="bg-emerald-800 text-white shadow-md sticky top-0 z-40 shrink-0">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2.5">
            {onBackToKasir && (
              <button
                onClick={onBackToKasir}
                title="Kembali ke KasirQu"
                className="p-1.5 bg-emerald-900/60 hover:bg-emerald-700 text-emerald-200 hover:text-white rounded-xl transition"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            {onOpenSwitchModul && (
              <button
                onClick={onOpenSwitchModul}
                title="Ganti Modul Aplikasi"
                className="p-1.5 bg-emerald-900/60 hover:bg-emerald-700 text-emerald-200 hover:text-white rounded-xl transition"
              >
                <Layers className="w-4 h-4" />
              </button>
            )}
            <div>
              <h1 id="appTitle" className="text-lg md:text-xl font-bold tracking-wider leading-tight">
                {appData.storeName}
              </h1>
              <p id="appCategoryBadge" className="text-xs text-emerald-200">
                Kategori: {appData.category} ({appData.unit})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenWizard}
              className="bg-emerald-700 hover:bg-emerald-600 text-xs px-3 py-1.5 rounded-lg border border-emerald-600 transition flex items-center gap-1 shadow-inner font-medium text-white"
            >
              <Settings className="w-3.5 h-3.5" /> Ganti Kategori
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. MAIN CONTAINER & TABS
          ========================================================================= */}
      <main className="flex-1 w-full p-4 pb-24 space-y-4">
        {/* Tab Navigation */}
        <div className="flex bg-gray-800 p-1 rounded-xl shadow border border-emerald-900/50">
          <button
            onClick={() => setActiveTab('pos')}
            id="tabPos"
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition ${
              activeTab === 'pos'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Kasir / Order
          </button>
          <button
            onClick={() => setActiveTab('stock')}
            id="tabStock"
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition ${
              activeTab === 'stock'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Smart Stok
          </button>
          <button
            onClick={() => setActiveTab('closing')}
            id="tabClosing"
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition ${
              activeTab === 'closing'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Closing / Rekap
          </button>
        </div>

        {/* ---------------------------------------------------------------------
            TAB 1: KASIR / SMART ORDER
            --------------------------------------------------------------------- */}
        {activeTab === 'pos' && (
          <section id="sectionPos" className="space-y-4">
            {/* Voice Order & Input Utama */}
            <div className="bg-gray-800 p-4 rounded-2xl shadow-lg border border-emerald-900/40">
              <div className="flex justify-between items-center mb-3">
                <h2 className="font-bold text-sm text-emerald-400 flex items-center gap-2">
                  <Mic className="w-4 h-4 text-emerald-400" /> Smart Order (Suara / Ketik)
                </h2>
                <span className="text-xs text-gray-400" id="currentDynamicFieldLabel">
                  {dynamicFieldLabel}
                </span>
              </div>

              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  id="dynamicFieldInput"
                  value={dynamicFieldInput}
                  onChange={(e) => setDynamicFieldInput(e.target.value)}
                  placeholder={`${dynamicFieldLabel} ...`}
                  className="w-1/3 bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
                <input
                  type="text"
                  id="voiceCommandInput"
                  value={voiceCommandInput}
                  onChange={(e) => setVoiceCommandInput(e.target.value)}
                  placeholder='Contoh: "Ayam Bakar 2, Es Teh 1"'
                  className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleProcessVoiceText();
                  }}
                />
                <button
                  onClick={toggleSpeechRecognition}
                  id="micBtn"
                  className={`text-white px-4 py-2 rounded-xl transition shadow flex items-center justify-center ${
                    isListening
                      ? 'bg-rose-600 animate-pulse'
                      : 'bg-emerald-600 hover:bg-emerald-500'
                  }`}
                  title={isListening ? 'Matikan Mikrofon' : 'Mulai Pesan Suara'}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex justify-between items-center text-xs text-gray-400">
                <span id="speechStatus">{speechStatusText}</span>
                <button
                  onClick={handleProcessVoiceText}
                  className="bg-gray-700 hover:bg-gray-600 text-emerald-300 px-3 py-1 rounded-lg transition"
                >
                  Proses Teks
                </button>
              </div>
            </div>

            {/* Grid Produk & Keranjang (2 Kolom di Desktop, Stack di Mobile) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Katalog Produk */}
              <div className="bg-gray-800 p-4 rounded-2xl shadow border border-emerald-900/40 flex flex-col">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-sm text-gray-200">Katalog Produk</h3>
                  <div className="relative">
                    <input
                      type="text"
                      id="searchCatalog"
                      value={searchCatalogQuery}
                      onChange={(e) => setSearchCatalogQuery(e.target.value)}
                      placeholder="Cari produk..."
                      className="bg-gray-900 border border-gray-700 text-xs px-2.5 py-1.5 rounded-lg w-36 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div id="catalogGrid" className="grid grid-cols-2 gap-2 overflow-y-auto max-h-72 pr-1">
                  {filteredCatalog.length === 0 ? (
                    <p className="text-xs text-gray-500 col-span-2 text-center py-6">
                      Produk tidak ditemukan.
                    </p>
                  ) : (
                    filteredCatalog.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => handleAddToCart(p.id)}
                        className="bg-gray-900 border border-gray-700/60 hover:border-emerald-500 p-2.5 rounded-xl cursor-pointer transition flex flex-col justify-between"
                      >
                        <div>
                          <p className="font-bold text-xs text-white truncate">{p.name}</p>
                          <p className="text-[11px] text-emerald-400 font-semibold mt-0.5">
                            Rp {p.price.toLocaleString('id-ID')}
                          </p>
                        </div>
                        <div className="flex justify-between items-center mt-2 text-[10px] text-gray-400">
                          <span>Stok: {p.stock}</span>
                          <span className="bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded font-medium">
                            + Tambah
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Keranjang Belanja */}
              <div className="bg-gray-800 p-4 rounded-2xl shadow border border-emerald-900/40 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm text-gray-200 mb-3 flex justify-between items-center">
                    <span>Keranjang Pesanan ({appData.cart.length})</span>
                    {appData.cart.length > 0 && (
                      <button
                        onClick={handleClearCart}
                        className="text-xs text-rose-400 hover:underline"
                      >
                        Kosongkan
                      </button>
                    )}
                  </h3>

                  <div id="cartList" className="space-y-2 overflow-y-auto max-h-52 pr-1 mb-3">
                    {appData.cart.length === 0 ? (
                      <p className="text-xs text-gray-500 text-center py-6">
                        Keranjang masih kosong.
                      </p>
                    ) : (
                      appData.cart.map((item, index) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-center bg-gray-900 p-2 rounded-xl border border-gray-700/50 text-xs"
                        >
                          <div className="flex-1 pr-2">
                            <p className="font-bold text-white">{item.name}</p>
                            <p className="text-emerald-400 text-[11px]">
                              Rp {item.price.toLocaleString('id-ID')} x {item.qty}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleUpdateQty(index, -1)}
                              className="bg-gray-700 hover:bg-gray-600 w-6 h-6 rounded-lg text-white font-bold flex items-center justify-center transition active:scale-95"
                            >
                              -
                            </button>
                            <span className="w-5 text-center font-bold text-white">
                              {item.qty}
                            </span>
                            <button
                              onClick={() => handleUpdateQty(index, 1)}
                              className="bg-gray-700 hover:bg-gray-600 w-6 h-6 rounded-lg text-white font-bold flex items-center justify-center transition active:scale-95"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-700 pt-3 space-y-1.5 text-sm">
                  <div className="flex justify-between text-gray-400 text-xs">
                    <span>Subtotal</span>
                    <span id="subtotalDisplay">Rp {subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400 text-xs">
                    <span>Biaya Layanan Sistem (Auto 1%)</span>
                    <span id="serviceFeeDisplay">Rp {serviceFee.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base text-white pt-1 border-t border-gray-700">
                    <span>Total Akhir</span>
                    <span id="grandTotalDisplay" className="text-emerald-400">
                      Rp {grandTotal.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <button
                      onClick={() => handleCheckout('save')}
                      className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold py-2.5 rounded-xl transition shadow active:scale-95 text-center"
                    >
                      Simpan
                    </button>
                    <button
                      onClick={() => handleCheckout('wa')}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold py-2.5 rounded-xl transition shadow active:scale-95 text-center"
                    >
                      Kirim WA
                    </button>
                    <button
                      onClick={() => handleCheckout('print')}
                      className="bg-gray-700 hover:bg-gray-600 text-white text-xs font-semibold py-2.5 rounded-xl transition shadow active:scale-95 text-center"
                    >
                      Cetak
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ---------------------------------------------------------------------
            TAB 2: SMART STOK & KATALOG
            --------------------------------------------------------------------- */}
        {activeTab === 'stock' && (
          <section id="sectionStock" className="space-y-4">
            <div className="bg-gray-800 p-4 rounded-2xl shadow border border-emerald-900/40">
              <h2 className="font-bold text-sm text-emerald-400 mb-3 flex items-center gap-2">
                <Boxes className="w-4 h-4" /> Manajemen Stok & Produk Baru
              </h2>
              <form onSubmit={handleAddNewProduct} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <input
                    type="text"
                    id="newProdName"
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    placeholder="Nama Produk"
                    className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                  <input
                    type="number"
                    id="newProdPrice"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    placeholder="Harga (Rp)"
                    className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                  <input
                    type="number"
                    id="newProdStock"
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(e.target.value)}
                    placeholder="Stok Awal"
                    className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 rounded-xl transition shadow active:scale-98"
                >
                  Tambah Produk ke Katalog
                </button>
              </form>
            </div>

            <div className="bg-gray-800 p-4 rounded-2xl shadow border border-emerald-900/40">
              <h3 className="font-bold text-sm text-gray-200 mb-3">
                Daftar Stok Saat Ini ({appData.products.length} Produk)
              </h3>
              <div id="stockListContainer" className="space-y-2 overflow-y-auto max-h-96 pr-1">
                {appData.products.map((p) => (
                  <div
                    key={p.id}
                    className="flex justify-between items-center bg-gray-900 p-2.5 rounded-xl border border-gray-700/50 text-xs"
                  >
                    <div>
                      <p className="font-bold text-white">{p.name}</p>
                      <p className="text-emerald-400 mt-0.5">
                        Rp {p.price.toLocaleString('id-ID')} | Stok:{' '}
                        <span className={p.stock < 5 ? 'text-rose-400 font-bold' : 'text-slate-200 font-semibold'}>
                          {p.stock}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleAdjustStock(p.id, -1)}
                        className="bg-gray-700 hover:bg-gray-600 px-2.5 py-1 rounded text-white font-bold transition active:scale-95"
                      >
                        -
                      </button>
                      <button
                        onClick={() => handleAdjustStock(p.id, 5)}
                        className="bg-emerald-700 hover:bg-emerald-600 px-2.5 py-1 rounded text-white font-bold transition active:scale-95"
                      >
                        +5
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ---------------------------------------------------------------------
            TAB 3: CLOSING KASIR & AUTO BILLING
            --------------------------------------------------------------------- */}
        {activeTab === 'closing' && (
          <section id="sectionClosing" className="space-y-4">
            <div className="bg-gray-800 p-4 rounded-2xl shadow border border-emerald-900/40 space-y-4">
              <div>
                <h2 className="font-bold text-base text-emerald-400 flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-emerald-400" /> Rekap Closing Harian
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Laporan transaksi harian & akumulasi kontribusi biaya layanan sistem (1%).
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-900 p-3 rounded-xl border border-gray-700">
                  <span className="text-xs text-gray-400">Total Transaksi Hari Ini</span>
                  <p id="closingTotalTrx" className="text-lg font-bold text-white mt-1">
                    {totalTrxCount} Transaksi
                  </p>
                </div>
                <div className="bg-gray-900 p-3 rounded-xl border border-gray-700">
                  <span className="text-xs text-gray-400">Omset Penjualan</span>
                  <p id="closingTotalOmset" className="text-lg font-bold text-emerald-400 mt-1">
                    Rp {totalOmset.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>

              <div className="bg-emerald-950/40 p-4 rounded-xl border border-emerald-800/60 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-200">Akumulasi Biaya Layanan Sistem (1%):</span>
                  <span id="closingUnpaidFee" className="font-bold text-emerald-400">
                    Rp {appData.unpaidFee.toLocaleString('id-ID')}
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  Biaya layanan terakumulasi otomatis. Jika mencapai ≥ Rp 10.000, sistem akan meminta pembayaran kontribusi via QRIS saat closing.
                </p>
              </div>

              <button
                onClick={triggerClosingProcess}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition shadow flex items-center justify-center gap-2 active:scale-98"
              >
                <FileSpreadsheet className="w-4 h-4" /> Proses Closing & Kirim Rekap
              </button>
            </div>

            <div className="bg-gray-800 p-4 rounded-2xl shadow border border-emerald-900/40">
              <h3 className="font-bold text-sm text-gray-200 mb-3">
                Riwayat Transaksi Tersimpan ({appData.transactions.length})
              </h3>
              <div id="historyListContainer" className="space-y-2 overflow-y-auto max-h-64 pr-1 text-xs">
                {appData.transactions.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Belum ada riwayat transaksi.</p>
                ) : (
                  appData.transactions.map((trx) => (
                    <div
                      key={trx.id}
                      className="bg-gray-900 p-2.5 rounded-xl border border-gray-700/50 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-bold text-white">
                          {trx.id} ({trx.date})
                        </p>
                        <p className="text-gray-400 mt-0.5">
                          Item: {trx.items.length} | Layanan (1%): Rp{' '}
                          {trx.serviceFee.toLocaleString('id-ID')} | Ref: {trx.meta}
                        </p>
                      </div>
                      <p className="font-bold text-emerald-400">
                        Rp {trx.grandTotal.toLocaleString('id-ID')}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* =========================================================================
          MODAL SETUP WIZARD (ONBOARDING)
          ========================================================================= */}
      {isWizardOpen && (
        <div
          id="wizardModal"
          className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4"
        >
          <div className="bg-gray-800 border border-emerald-900/60 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold text-white">Konfigurasi UsahaQu</h2>
                <p className="text-xs text-gray-400">Suaikan aplikasi dengan kategori bisnismu</p>
              </div>
              <button
                onClick={() => setIsWizardOpen(false)}
                className="p-1 text-gray-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-gray-300">
                Pilih Jenis / Kategori Usaha:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setWizardCategory('FNB')}
                  id="catBtnFNB"
                  className={`p-3 text-left bg-gray-900 border rounded-xl transition category-btn ${
                    wizardCategory === 'FNB'
                      ? 'border-emerald-500 shadow-md shadow-emerald-950/40 ring-1 ring-emerald-500'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <p className="font-bold text-xs text-white">Kuliner / F&B</p>
                  <p className="text-[10px] text-gray-400">Resto, Cafe (No. Meja)</p>
                </button>

                <button
                  type="button"
                  onClick={() => setWizardCategory('RETAIL')}
                  id="catBtnRETAIL"
                  className={`p-3 text-left bg-gray-900 border rounded-xl transition category-btn ${
                    wizardCategory === 'RETAIL'
                      ? 'border-emerald-500 shadow-md shadow-emerald-950/40 ring-1 ring-emerald-500'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <p className="font-bold text-xs text-white">Ritel / Toko</p>
                  <p className="text-[10px] text-gray-400">Warung, Minimarket</p>
                </button>

                <button
                  type="button"
                  onClick={() => setWizardCategory('SERVICE')}
                  id="catBtnSERVICE"
                  className={`p-3 text-left bg-gray-900 border rounded-xl transition category-btn ${
                    wizardCategory === 'SERVICE'
                      ? 'border-emerald-500 shadow-md shadow-emerald-950/40 ring-1 ring-emerald-500'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <p className="font-bold text-xs text-white">Jasa / Servis</p>
                  <p className="text-[10px] text-gray-400">Bengkel, Laundry (Nopol)</p>
                </button>

                <button
                  type="button"
                  onClick={() => setWizardCategory('RENTAL')}
                  id="catBtnRENTAL"
                  className={`p-3 text-left bg-gray-900 border rounded-xl transition category-btn ${
                    wizardCategory === 'RENTAL'
                      ? 'border-emerald-500 shadow-md shadow-emerald-950/40 ring-1 ring-emerald-500'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <p className="font-bold text-xs text-white">Sewa / Rental</p>
                  <p className="text-[10px] text-gray-400">Kamera, Alat (Durasi)</p>
                </button>
              </div>

              <div className="space-y-2 pt-2">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Nama Usaha / Toko</label>
                  <input
                    type="text"
                    id="setupStoreName"
                    value={wizardStoreName}
                    onChange={(e) => setWizardStoreName(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Contoh: Kedai Bageur"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Satuan Produk Utama</label>
                  <input
                    type="text"
                    id="setupUnit"
                    value={wizardUnit}
                    onChange={(e) => setWizardUnit(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    placeholder="porsi / pcs / unit / jam"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">No. WhatsApp Toko / Pemilik</label>
                  <input
                    type="text"
                    id="setupWa"
                    value={wizardWa}
                    onChange={(e) => setWizardWa(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    placeholder="08123456789"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={handleSaveWizard}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-sm transition shadow active:scale-98"
              >
                Simpan & Mulai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL QRIS PEMBAYARAN BIAYA LAYANAN (AUTO-CLOSING)
          ========================================================================= */}
      {isQrisModalOpen && (
        <div
          id="qrisModal"
          className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4"
        >
          <div className="bg-gray-800 border border-emerald-900/60 rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4 animate-in zoom-in-95 duration-150">
            <div>
              <h3 className="text-base font-bold text-white">Pembayaran Biaya Layanan</h3>
              <p className="text-xs text-gray-400 mt-1">
                Akumulasi biaya layanan sistem mencapai ambang batas minimum. Selesaikan pembayaran via QRIS untuk melanjutkan.
              </p>
            </div>

            <div className="bg-white p-3 rounded-2xl inline-block shadow-inner mx-auto">
              {/* QRIS Graphic Container */}
              <div className="w-48 h-48 bg-gray-100 flex flex-col items-center justify-center text-gray-700 font-bold rounded-lg border border-dashed border-gray-400 p-2 text-center">
                <QrCode className="w-16 h-16 text-emerald-800 mb-2" />
                <span className="text-[11px] font-bold text-slate-800">QRIS KONTRIBUSI SISTEM</span>
                <span id="qrisNominalBadge" className="text-sm font-extrabold text-rose-600 mt-1">
                  Rp {appData.unpaidFee.toLocaleString('id-ID')}
                </span>
                <span className="text-[9px] text-gray-500 mt-1 font-mono">NMID: ID102026889988</span>
              </div>
            </div>

            <p className="text-[11px] text-gray-400">
              Scan QRIS di atas menggunakan m-Banking atau E-Wallet apa saja, lalu klik tombol konfirmasi setelah berhasil.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleConfirmQrisPayment}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs transition shadow active:scale-98"
              >
                Sudah Bayar via QRIS
              </button>
              <button
                onClick={() => setIsQrisModalOpen(false)}
                className="bg-gray-700 hover:bg-gray-600 text-gray-300 font-semibold py-2.5 px-4 rounded-xl text-xs transition active:scale-95"
              >
                Nanti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
