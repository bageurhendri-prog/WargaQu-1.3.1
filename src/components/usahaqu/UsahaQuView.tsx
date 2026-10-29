import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  RotateCcw,
  Wallet,
  Tag,
  Copy,
  Sparkles,
  Send,
  DollarSign,
  Calculator,
  ChevronRight,
  Store,
  Edit3,
  Trash2,
  Clock,
  Check,
  TrendingUp,
  PackageCheck
} from 'lucide-react';
import {
  UsahaAppData,
  UsahaProduct,
  UsahaCartItem,
  UsahaTransaction,
  UsahaExpenseModal,
  ReceiptSettings,
  BusinessCategory
} from '../../types/usahaqu';
import {
  UsahaStorageService,
  INITIAL_USAHA_DATA,
  INITIAL_RECEIPT_SETTINGS,
  parseSmartStockText,
  parseSmartOrderSegments
} from '../../services/usahaStorage';
import { QrisSettingsService } from '../../services/qrisService';

interface UsahaQuViewProps {
  onBackToKasir?: () => void;
  onOpenSwitchModul?: () => void;
  onShowNotification?: (msg: string) => void;
  activeSubTab?: 'pos' | 'stock' | 'critical' | 'modal' | 'closing' | 'receipt';
  onSelectSubTab?: (tab: 'pos' | 'stock' | 'critical' | 'modal' | 'closing' | 'receipt') => void;
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
  const [internalTab, setInternalTab] = useState<'pos' | 'stock' | 'critical' | 'modal' | 'closing' | 'receipt'>('pos');

  const activeTab = activeSubTab || internalTab;
  const setActiveTab = (tab: 'pos' | 'stock' | 'critical' | 'modal' | 'closing' | 'receipt') => {
    setInternalTab(tab);
    if (onSelectSubTab) onSelectSubTab(tab);
  };

  // --------------------------------------------------------------------------
  // POS & SMART ORDER STATES
  // --------------------------------------------------------------------------
  const [dynamicFieldInput, setDynamicFieldInput] = useState<string>('');
  const [voiceCommandInput, setVoiceCommandInput] = useState<string>('');
  const [searchCatalogQuery, setSearchCatalogQuery] = useState<string>('');
  const [activeCatalogCategory, setActiveCatalogCategory] = useState<string>('Semua');
  const [isOrderListening, setIsOrderListening] = useState<boolean>(false);
  const [orderSpeechStatus, setOrderSpeechStatus] = useState<string>(
    'Mikrofon siap. Ucapkan contoh: "Ayam Bakar 2, Es Teh 1"'
  );

  // --------------------------------------------------------------------------
  // SMART STOK & TEXT PARSER STATES
  // --------------------------------------------------------------------------
  const [stockSpeechInput, setStockSpeechInput] = useState<string>('');
  const [isStockListening, setIsStockListening] = useState<boolean>(false);
  const [stockSpeechStatus, setStockSpeechStatus] = useState<string>(
    'Contoh bicara: "Beras 50kg 900rb" atau "Minyak 20 liter 320000"'
  );

  // Parsed Smart Stock Staging Form
  const [parsedStockStaging, setParsedStockStaging] = useState<{
    name: string;
    qty: number;
    unit: string;
    totalCost: number;
    unitCost: number;
    category: string;
    sellingPrice: string; // Left blank initially as requested
  } | null>(null);

  // Manual Add Product Form
  const [newProdName, setNewProdName] = useState<string>('');
  const [newProdCategory, setNewProdCategory] = useState<string>('Makanan');
  const [newProdPrice, setNewProdPrice] = useState<string>('');
  const [newProdCostPrice, setNewProdCostPrice] = useState<string>('');
  const [newProdStock, setNewProdStock] = useState<string>('');
  const [newProdUnit, setNewProdUnit] = useState<string>('porsi');

  // Category Management Form
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [isAddingCategoryModalOpen, setIsAddingCategoryModalOpen] = useState<boolean>(false);

  // --------------------------------------------------------------------------
  // POPUP STRUK & METODE PEMBAYARAN STATES
  // --------------------------------------------------------------------------
  const [isPaymentReceiptModalOpen, setIsPaymentReceiptModalOpen] = useState<boolean>(false);
  const [activePaymentMethod, setActivePaymentMethod] = useState<'tunai' | 'qris' | 'transfer' | 'bon'>('tunai');
  const [cashGivenInput, setCashGivenInput] = useState<string>('');

  // --------------------------------------------------------------------------
  // MODAL EXPENSES (CATATAN MODAL) FORM
  // --------------------------------------------------------------------------
  const [newExpenseDesc, setNewExpenseDesc] = useState<string>('');
  const [newExpenseAmount, setNewExpenseAmount] = useState<string>('');
  const [newExpenseCategory, setNewExpenseCategory] = useState<string>('Bahan Baku');

  // --------------------------------------------------------------------------
  // MODALS
  // --------------------------------------------------------------------------
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);
  const [isQrisModalOpen, setIsQrisModalOpen] = useState<boolean>(false);

  // Wizard Temporary Form State
  const [wizardCategory, setWizardCategory] = useState<BusinessCategory>(appData.category);
  const [wizardStoreName, setWizardStoreName] = useState<string>(appData.storeName);
  const [wizardUnit, setWizardUnit] = useState<string>(appData.unit);
  const [wizardWa, setWizardWa] = useState<string>(appData.wa);

  // Editable Receipt Settings Temporary State (in Tab Receipt Settings)
  const [receiptDraft, setReceiptDraft] = useState<ReceiptSettings>(appData.receiptSettings || INITIAL_RECEIPT_SETTINGS);

  // Web Speech Recognition Refs
  const orderRecognitionRef = useRef<any>(null);
  const stockRecognitionRef = useRef<any>(null);

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

  // Sync draft when appData receiptSettings changes
  useEffect(() => {
    if (appData.receiptSettings) {
      setReceiptDraft(appData.receiptSettings);
    }
  }, [appData.receiptSettings]);

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
  const subtotal = useMemo(() => {
    return appData.cart.reduce((sum, item) => sum + item.subtotal, 0);
  }, [appData.cart]);

  const serviceFee = useMemo(() => {
    return appData.receiptSettings.showServiceFee ? Math.round(subtotal * 0.01) : 0;
  }, [subtotal, appData.receiptSettings.showServiceFee]);

  const grandTotal = subtotal + serviceFee;

  // Change amount calculation for Cash payment
  const cashGivenNumber = parseFloat(cashGivenInput) || 0;
  const changeAmount = Math.max(0, cashGivenNumber - grandTotal);

  // Critical Stock Products (Stock <= 0 or Stock <= minStock)
  const criticalProducts = useMemo(() => {
    return appData.products.filter((p) => p.stock <= (p.minStock || 5));
  }, [appData.products]);

  // Modal / Capital Calculation
  const totalModalExpenses = useMemo(() => {
    return appData.expensesModal.reduce((sum, exp) => sum + exp.amount, 0);
  }, [appData.expensesModal]);

  const totalAssetStockValue = useMemo(() => {
    return appData.products.reduce((sum, p) => sum + (p.stock * (p.costPrice || 0)), 0);
  }, [appData.products]);

  // Closing / Rekap Stats
  const totalTrxCount = appData.transactions.length;
  const totalOmset = useMemo(() => {
    return appData.transactions.reduce((sum, t) => sum + t.grandTotal, 0);
  }, [appData.transactions]);

  // --------------------------------------------------------------------------
  // 1. SMART ORDER (VOICE & TEXT PARSER) - AUTO ADD TO CATALOG WITH STOCK 0
  // --------------------------------------------------------------------------
  const toggleOrderSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      notify('Browser Anda tidak mendukung Web Speech Recognition.');
      return;
    }

    if (isOrderListening) {
      if (orderRecognitionRef.current) orderRecognitionRef.current.stop();
      setIsOrderListening(false);
      setOrderSpeechStatus('Mikrofon dimatikan.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'id-ID';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsOrderListening(true);
        setOrderSpeechStatus('Mendengarkan pesanan...');
      };

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setVoiceCommandInput(text);
        setOrderSpeechStatus(`Terdeteksi: "${text}"`);
        setIsOrderListening(false);
        processSmartOrderText(text);
      };

      recognition.onerror = () => {
        setOrderSpeechStatus('Gagal mendengarkan. Coba ketik manual.');
        setIsOrderListening(false);
      };

      recognition.onend = () => {
        setIsOrderListening(false);
      };

      orderRecognitionRef.current = recognition;
      recognition.start();
    } catch {
      notify('Gagal memulai mikrofon.');
      setIsOrderListening(false);
    }
  };

  const handleProcessOrderInput = () => {
    if (!voiceCommandInput.trim()) {
      notify('Ketik atau ucapkan pesanan terlebih dahulu.');
      return;
    }
    processSmartOrderText(voiceCommandInput);
  };

  /**
   * Process Smart Order Text:
   * Supports complex text: "Ayam Bakar 2, Es Teh 1, Es Cincau 3"
   * If item doesn't exist in catalog:
   *   - Auto-adds to catalog with stock = 0 (TIDAK BOLEH MINUS)!
   *   - Auto-marked as critical stock item!
   *   - Added to cart with requested qty!
   */
  const processSmartOrderText = (text: string) => {
    const parsedSegments = parseSmartOrderSegments(text);

    if (parsedSegments.length === 0) {
      notify('Format pesanan tidak terdeteksi. Contoh: "Ayam Bakar 2, Es Teh 1"');
      return;
    }

    let newlyAddedCount = 0;
    let matchedCount = 0;

    setAppData((prev) => {
      let currentProducts = [...prev.products];
      let currentCart = [...prev.cart];

      parsedSegments.forEach((seg) => {
        const lowerSegName = seg.name.toLowerCase().trim();

        // 1. Check existing match in products
        let matchedProduct = currentProducts.find(
          (p) => p.name.toLowerCase() === lowerSegName || lowerSegName.includes(p.name.toLowerCase())
        );

        // 2. If NOT found in catalog, auto-add to catalog with stock = 0
        if (!matchedProduct) {
          const capitalizedName = seg.name
            .split(' ')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(' ');

          const newProd: UsahaProduct = {
            id: 'AUTO-' + Date.now().toString().slice(-5) + Math.floor(Math.random() * 100),
            name: capitalizedName,
            category: 'Lainnya',
            price: 10000, // Default editable price
            costPrice: 5000,
            stock: 0, // STRICT: qty tetap 0, tidak boleh minus!
            unit: 'porsi',
            minStock: 5,
            isAutoAdded: true, // Marked as auto-added from order
          };

          currentProducts.unshift(newProd);
          matchedProduct = newProd;
          newlyAddedCount++;
        } else {
          matchedCount++;
        }

        // 3. Add to cart with requested quantity
        const existingCartIdx = currentCart.findIndex((ci) => ci.id === matchedProduct!.id);
        const isCritical = (matchedProduct.stock ?? 0) <= 0;

        if (existingCartIdx >= 0) {
          const existingItem = currentCart[existingCartIdx];
          const newQty = existingItem.qty + seg.qty;
          currentCart[existingCartIdx] = {
            ...existingItem,
            qty: newQty,
            subtotal: newQty * existingItem.price,
            isCriticalStock: isCritical,
          };
        } else {
          currentCart.push({
            id: matchedProduct.id,
            name: matchedProduct.name,
            category: matchedProduct.category,
            price: matchedProduct.price,
            costPrice: matchedProduct.costPrice,
            qty: seg.qty,
            subtotal: seg.qty * matchedProduct.price,
            isCriticalStock: isCritical,
          });
        }
      });

      return {
        ...prev,
        products: currentProducts,
        cart: currentCart,
      };
    });

    if (newlyAddedCount > 0) {
      notify(
        `${newlyAddedCount} produk baru otomatis masuk ke Katalog & Daftar Stok Kritis (Stok 0)!`
      );
    } else {
      notify(`${matchedCount} item pesanan dimasukkan ke keranjang.`);
    }

    setVoiceCommandInput('');
  };

  // Add individual product directly to cart
  const handleAddToCart = (product: UsahaProduct) => {
    setAppData((prev) => {
      const existing = prev.cart.find((ci) => ci.id === product.id);
      const isCritical = product.stock <= 0;

      let updatedCart: UsahaCartItem[];
      if (existing) {
        updatedCart = prev.cart.map((ci) =>
          ci.id === product.id
            ? { ...ci, qty: ci.qty + 1, subtotal: (ci.qty + 1) * ci.price }
            : ci
        );
      } else {
        updatedCart = [
          ...prev.cart,
          {
            id: product.id,
            name: product.name,
            category: product.category,
            price: product.price,
            costPrice: product.costPrice,
            qty: 1,
            subtotal: product.price,
            isCriticalStock: isCritical,
          },
        ];
      }

      return { ...prev, cart: updatedCart };
    });
  };

  const handleUpdateCartQty = (index: number, delta: number) => {
    setAppData((prev) => {
      const item = prev.cart[index];
      if (!item) return prev;

      const newQty = item.qty + delta;
      let updatedCart = [...prev.cart];

      if (newQty <= 0) {
        updatedCart.splice(index, 1);
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

  const handleUpdateCartItemPrice = (index: number, newPrice: number) => {
    setAppData((prev) => {
      const item = prev.cart[index];
      if (!item) return prev;
      const updatedCart = [...prev.cart];
      updatedCart[index] = {
        ...item,
        price: newPrice,
        subtotal: item.qty * newPrice,
      };
      return { ...prev, cart: updatedCart };
    });
  };

  const handleClearCart = () => {
    setAppData((prev) => ({ ...prev, cart: [] }));
    notify('Keranjang pesanan dikosongkan.');
  };

  // --------------------------------------------------------------------------
  // 2. CHECKOUT & POPUP STRUK METODE PEMBAYARAN
  // --------------------------------------------------------------------------
  const handleOpenPaymentPopup = () => {
    if (appData.cart.length === 0) {
      notify('Keranjang masih kosong!');
      return;
    }
    setCashGivenInput(grandTotal.toString());
    setIsPaymentReceiptModalOpen(true);
  };

  const handleCompleteTransaction = (action: 'save' | 'wa' | 'print') => {
    if (appData.cart.length === 0) return;

    const trxId = 'TRX-' + Date.now().toString().slice(-6);
    const metaVal = dynamicFieldInput.trim() || '-';

    const newTrx: UsahaTransaction = {
      id: trxId,
      date: new Date().toLocaleString('id-ID'),
      meta: metaVal,
      items: [...appData.cart],
      subtotal,
      serviceFee,
      grandTotal,
      paymentMethod: activePaymentMethod,
      cashAmount: activePaymentMethod === 'tunai' ? (parseFloat(cashGivenInput) || grandTotal) : undefined,
      changeAmount: activePaymentMethod === 'tunai' ? changeAmount : undefined,
    };

    // Update stock & transactions & unpaid fee
    setAppData((prev) => {
      const updatedProducts = prev.products.map((p) => {
        const cartItem = prev.cart.find((ci) => ci.id === p.id);
        if (cartItem) {
          // Stok tidak boleh minus (minimum 0)
          return { ...p, stock: Math.max(0, p.stock - cartItem.qty) };
        }
        return p;
      });

      return {
        ...prev,
        products: updatedProducts,
        transactions: [newTrx, ...prev.transactions],
        unpaidFee: prev.unpaidFee + serviceFee,
        cart: [],
      };
    });

    setIsPaymentReceiptModalOpen(false);
    setDynamicFieldInput('');

    if (action === 'wa') {
      sendReceiptToWhatsApp(newTrx);
    } else if (action === 'print') {
      triggerThermalPrintReceipt(newTrx);
    } else {
      notify(`Transaksi ${newTrx.id} berhasil disimpan!`);
    }
  };

  const sendReceiptToWhatsApp = (trx: UsahaTransaction) => {
    const settings = appData.receiptSettings;
    let text = `*${settings.storeName.toUpperCase()}*\n`;
    if (settings.storeAddress) text += `${settings.storeAddress}\n`;
    if (settings.storePhone) text += `Telp/WA: ${settings.storePhone}\n`;
    text += `================================\n`;
    text += `Nota : ${trx.id}\n`;
    text += `Waktu: ${trx.date}\n`;
    text += `Ref  : ${trx.meta}\n`;
    text += `Metode Bayar: ${trx.paymentMethod?.toUpperCase() || 'TUNAI'}\n`;
    text += `--------------------------------\n`;

    trx.items.forEach((item) => {
      text += `${item.name}\n`;
      text += `  ${item.qty} x Rp ${item.price.toLocaleString('id-ID')} = Rp ${item.subtotal.toLocaleString('id-ID')}\n`;
    });

    text += `--------------------------------\n`;
    text += `Subtotal   : Rp ${trx.subtotal.toLocaleString('id-ID')}\n`;
    if (trx.serviceFee > 0) {
      text += `Layanan 1% : Rp ${trx.serviceFee.toLocaleString('id-ID')}\n`;
    }
    text += `*TOTAL     : Rp ${trx.grandTotal.toLocaleString('id-ID')}*\n`;

    if (trx.cashAmount && trx.cashAmount > 0) {
      text += `Tunai Diterima: Rp ${trx.cashAmount.toLocaleString('id-ID')}\n`;
      text += `Kembalian     : Rp ${(trx.changeAmount || 0).toLocaleString('id-ID')}\n`;
    }

    text += `================================\n`;
    text += `${settings.footerNote}\n`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const triggerThermalPrintReceipt = (trx: UsahaTransaction) => {
    window.print();
    notify(`Struk nota ${trx.id} berhasil dicetak.`);
  };

  // --------------------------------------------------------------------------
  // 3. SMART STOK SPEECH-TO-TEXT (misal: "Beras 50kg 900rb")
  // --------------------------------------------------------------------------
  const toggleStockSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      notify('Browser Anda tidak mendukung Web Speech Recognition.');
      return;
    }

    if (isStockListening) {
      if (stockRecognitionRef.current) stockRecognitionRef.current.stop();
      setIsStockListening(false);
      setStockSpeechStatus('Mikrofon dimatikan.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'id-ID';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsStockListening(true);
        setStockSpeechStatus('Mendengarkan data stok/kulakan...');
      };

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setStockSpeechInput(text);
        setStockSpeechStatus(`Terdeteksi: "${text}"`);
        setIsStockListening(false);
        handleProcessSmartStockInput(text);
      };

      recognition.onerror = () => {
        setStockSpeechStatus('Gagal mendengarkan. Silakan coba lagi.');
        setIsStockListening(false);
      };

      recognition.onend = () => {
        setIsStockListening(false);
      };

      stockRecognitionRef.current = recognition;
      recognition.start();
    } catch {
      notify('Gagal memulai mikrofon.');
      setIsStockListening(false);
    }
  };

  const handleProcessSmartStockInput = (textToProcess?: string) => {
    const raw = textToProcess || stockSpeechInput;
    if (!raw.trim()) {
      notify('Ucapkan atau ketik data stok kulakan. Contoh: "Beras 50kg 900rb"');
      return;
    }

    const parsed = parseSmartStockText(raw);
    if (!parsed) {
      notify('Format stok tidak terbaca. Contoh: "Beras 50kg 900rb"');
      return;
    }

    // Auto calculate unit cost = totalCost / qty
    // Harga jual sengaja dikosongkan agar user isi sendiri manual / speech to text
    setParsedStockStaging({
      name: parsed.name,
      qty: parsed.qty,
      unit: parsed.unit,
      totalCost: parsed.totalCost,
      unitCost: parsed.unitCost,
      category: 'Sembako',
      sellingPrice: '', // KOSONGKAN HARGA JUAL
    });

    notify(
      `Berhasil dideteksi: ${parsed.name} (${parsed.qty} ${parsed.unit}). Harga modal otomatis Rp ${parsed.unitCost.toLocaleString('id-ID')}/${parsed.unit}. Silakan isi harga jual!`
    );
  };

  const handleSaveParsedStock = () => {
    if (!parsedStockStaging) return;
    const { name, qty, unit, totalCost, unitCost, category, sellingPrice } = parsedStockStaging;

    const sellPriceNum = parseFloat(sellingPrice) || 0;

    // 1. Check if product exists, then update stock & costPrice
    let isExisting = false;
    let targetProductId = '';

    setAppData((prev) => {
      const existingIdx = prev.products.findIndex(
        (p) => p.name.toLowerCase() === name.toLowerCase()
      );

      let updatedProducts = [...prev.products];

      if (existingIdx >= 0) {
        isExisting = true;
        const currentProd = updatedProducts[existingIdx];
        targetProductId = currentProd.id;
        updatedProducts[existingIdx] = {
          ...currentProd,
          stock: currentProd.stock + qty,
          costPrice: unitCost > 0 ? unitCost : currentProd.costPrice,
          price: sellPriceNum > 0 ? sellPriceNum : currentProd.price,
          unit: unit || currentProd.unit,
        };
      } else {
        const newProduct: UsahaProduct = {
          id: 'P' + Date.now().toString().slice(-4),
          name,
          category,
          price: sellPriceNum > 0 ? sellPriceNum : Math.round(unitCost * 1.25), // Fallback if 0
          costPrice: unitCost,
          stock: qty,
          unit,
          minStock: 5,
        };
        targetProductId = newProduct.id;
        updatedProducts.unshift(newProduct);
      }

      // 2. Also record in Catatan Modal Usaha (Expenses Modal)
      const newExpense: UsahaExpenseModal = {
        id: 'EXP-' + Date.now().toString().slice(-4),
        date: new Date().toLocaleDateString('id-ID'),
        description: `Kulakan ${name} (${qty} ${unit})`,
        amount: totalCost,
        category: 'Kulakan Stok',
        qty,
        unit,
        unitCost,
      };

      return {
        ...prev,
        products: updatedProducts,
        expensesModal: [newExpense, ...prev.expensesModal],
      };
    });

    setParsedStockStaging(null);
    setStockSpeechInput('');
    notify(
      `Stok "${name}" berhasil ditambahkan (+${qty} ${unit}) & dicatat ke Modal Usaha!`
    );
  };

  // Quick adjust stock (-1, +5, +10)
  const handleAdjustStock = (id: string, amount: number) => {
    setAppData((prev) => {
      const updated = prev.products.map((p) => {
        if (p.id === id) {
          // Strictly no negative stock!
          const nextStock = Math.max(0, p.stock + amount);
          return { ...p, stock: nextStock };
        }
        return p;
      });
      return { ...prev, products: updated };
    });
  };

  // Manual Add Product to Catalog
  const handleAddManualProduct = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const name = newProdName.trim();
    const price = parseInt(newProdPrice);
    const costPrice = parseInt(newProdCostPrice) || 0;
    const stock = Math.max(0, parseInt(newProdStock) || 0);

    if (!name || isNaN(price) || price <= 0) {
      notify('Lengkapi data produk (Nama dan Harga Jual harus valid)!');
      return;
    }

    const newProd: UsahaProduct = {
      id: 'P' + Date.now().toString().slice(-4),
      name,
      category: newProdCategory,
      price,
      costPrice,
      stock,
      unit: newProdUnit,
      minStock: 5,
    };

    setAppData((prev) => ({
      ...prev,
      products: [newProd, ...prev.products],
    }));

    setNewProdName('');
    setNewProdPrice('');
    setNewProdCostPrice('');
    setNewProdStock('');
    notify(`Produk "${name}" berhasil ditambahkan ke kategori ${newProdCategory}!`);
  };

  // --------------------------------------------------------------------------
  // 4. KATEGORI KATALOG
  // --------------------------------------------------------------------------
  const handleAddNewCategory = () => {
    const cat = newCategoryName.trim();
    if (!cat) return;

    if (appData.productCategories.includes(cat)) {
      notify('Kategori sudah ada.');
      return;
    }

    setAppData((prev) => ({
      ...prev,
      productCategories: [...prev.productCategories, cat],
    }));

    setNewCategoryName('');
    setIsAddingCategoryModalOpen(false);
    notify(`Kategori "${cat}" berhasil ditambahkan!`);
  };

  // --------------------------------------------------------------------------
  // 5. STOK KRITIS / REORDER LIST
  // --------------------------------------------------------------------------
  const sendReorderListToSupplierWA = () => {
    if (criticalProducts.length === 0) {
      notify('Tidak ada barang dalam daftar stok kritis.');
      return;
    }

    let text = `*📋 DAFTAR KULAKAN / PESANAN STOK TOKO*\n`;
    text += `Toko   : ${appData.storeName}\n`;
    text += `Tanggal: ${new Date().toLocaleDateString('id-ID')}\n`;
    text += `----------------------------------------\n`;

    criticalProducts.forEach((p, idx) => {
      const sisa = p.stock <= 0 ? 'HABIS (0)' : `${p.stock} ${p.unit || ''}`;
      text += `${idx + 1}. *${p.name}* (Sisa: ${sisa})\n`;
      text += `   Estimasi Order: ${(p.minStock || 5) * 2} ${p.unit || 'pcs'}\n`;
    });

    text += `----------------------------------------\n`;
    text += `Mohon info harga dan ketersediaan stoknya ya. Terima kasih!`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // --------------------------------------------------------------------------
  // 6. MODAL USAHA (PENGELUARAN MODAL / KULAKAN)
  // --------------------------------------------------------------------------
  const handleAddNewExpenseModal = (e: React.FormEvent) => {
    e.preventDefault();
    const desc = newExpenseDesc.trim();
    const amount = parseFloat(newExpenseAmount);

    if (!desc || isNaN(amount) || amount <= 0) {
      notify('Isi keterangan dan nominal modal dengan benar!');
      return;
    }

    const newExp: UsahaExpenseModal = {
      id: 'EXP-' + Date.now().toString().slice(-4),
      date: new Date().toLocaleDateString('id-ID'),
      description: desc,
      amount,
      category: newExpenseCategory,
    };

    setAppData((prev) => ({
      ...prev,
      expensesModal: [newExp, ...prev.expensesModal],
    }));

    setNewExpenseDesc('');
    setNewExpenseAmount('');
    notify(`Pengeluaran modal "Rp ${amount.toLocaleString('id-ID')}" berhasil dicatat!`);
  };

  // --------------------------------------------------------------------------
  // 7. PENGATURAN STRUK & LIVE EDIT PREVIEW
  // --------------------------------------------------------------------------
  const handleSaveReceiptSettings = () => {
    setAppData((prev) => ({
      ...prev,
      receiptSettings: { ...receiptDraft },
      storeName: receiptDraft.storeName || prev.storeName,
    }));
    notify('Pengaturan struk berhasil disimpan & langsung aktif!');
  };

  // --------------------------------------------------------------------------
  // CLOSING & AUTO BILLING QRIS
  // --------------------------------------------------------------------------
  const triggerClosingProcess = () => {
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
    const reportText = `📊 REKAP CLOSING USAHAQU\n----------------------------------\nToko: ${appData.storeName}\nTotal Transaksi: ${appData.transactions.length}\nTotal Omset: Rp ${totalOmset.toLocaleString('id-ID')}\nKontribusi Layanan (1%): Rp ${appData.unpaidFee.toLocaleString('id-ID')}\nStatus: [ LUNAS / TERCATAT ]\n----------------------------------`;

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
      receiptSettings: {
        ...prev.receiptSettings,
        storeName: wizardStoreName.trim() || prev.receiptSettings.storeName,
      },
    }));
    setIsWizardOpen(false);
    notify('Konfigurasi UsahaQu berhasil disimpan!');
  };

  const notify = (msg: string) => {
    if (onShowNotification) onShowNotification(msg);
  };

  // Filtered Catalog
  const filteredCatalog = useMemo(() => {
    return appData.products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(searchCatalogQuery.toLowerCase());
      const matchCategory =
        activeCatalogCategory === 'Semua' || p.category === activeCatalogCategory;
      return matchSearch && matchCategory;
    });
  }, [appData.products, searchCatalogQuery, activeCatalogCategory]);

  return (
    <div
      id="modul-usahaqu"
      className="flex-1 min-h-0 bg-gray-900 text-gray-100 flex flex-col w-full max-w-4xl mx-auto shadow-2xl overflow-y-auto select-none"
    >
      {/* =========================================================================
          HEADER USAHAQU
          ========================================================================= */}
      <header className="bg-emerald-800 text-white shadow-md sticky top-0 z-40 shrink-0">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2.5">
            {onBackToKasir && (
              <button
                onClick={onBackToKasir}
                title="Kembali ke KasirQu"
                className="p-1.5 bg-emerald-900/60 hover:bg-emerald-700 text-emerald-200 hover:text-white rounded-xl transition active:scale-95"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            {onOpenSwitchModul && (
              <button
                onClick={onOpenSwitchModul}
                title="Ganti Modul Aplikasi"
                className="p-1.5 bg-emerald-900/60 hover:bg-emerald-700 text-emerald-200 hover:text-white rounded-xl transition active:scale-95"
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
              className="bg-emerald-700 hover:bg-emerald-600 text-xs px-3 py-1.5 rounded-lg border border-emerald-600 transition flex items-center gap-1 shadow-inner font-medium text-white active:scale-95"
            >
              <Settings className="w-3.5 h-3.5" /> Ganti Kategori
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          MAIN CONTAINER & COMPREHENSIVE TABS
          ========================================================================= */}
      <main className="flex-1 w-full p-3 md:p-4 pb-24 space-y-4">
        {/* Navigation Tabs Bar */}
        <div className="flex bg-gray-800 p-1 rounded-xl shadow border border-emerald-900/50 overflow-x-auto no-scrollbar gap-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('pos')}
            className={`px-3 py-2 rounded-lg whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'pos'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" /> Kasir / Order
          </button>
          <button
            onClick={() => setActiveTab('stock')}
            className={`px-3 py-2 rounded-lg whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'stock'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" /> Smart Stok
          </button>
          <button
            onClick={() => setActiveTab('critical')}
            className={`px-3 py-2 rounded-lg whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'critical'
                ? 'bg-amber-600 text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Stok Kritis
            {criticalProducts.length > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {criticalProducts.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('modal')}
            className={`px-3 py-2 rounded-lg whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'modal'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" /> Modal Usaha
          </button>
          <button
            onClick={() => setActiveTab('closing')}
            className={`px-3 py-2 rounded-lg whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'closing'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> Closing / Rekap
          </button>
          <button
            onClick={() => setActiveTab('receipt')}
            className={`px-3 py-2 rounded-lg whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'receipt'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" /> Setting Struk
          </button>
        </div>

        {/* ---------------------------------------------------------------------
            TAB 1: KASIR / SMART ORDER (CARD MODULAR & MENCAPAI SEMUA TEXT)
            --------------------------------------------------------------------- */}
        {activeTab === 'pos' && (
          <section id="sectionPos" className="space-y-4">
            {/* Modular Voice & Text Order Card */}
            <div className="bg-gray-800 p-4 rounded-2xl shadow-lg border border-emerald-900/40">
              <div className="flex justify-between items-center mb-3">
                <h2 className="font-bold text-sm text-emerald-400 flex items-center gap-2">
                  <Mic className="w-4 h-4 text-emerald-400" /> Smart Order Modular (Suara / Ketik Lengkap)
                </h2>
                <span className="text-xs text-gray-400 bg-gray-900 px-2.5 py-1 rounded-lg border border-gray-700">
                  {dynamicFieldLabel}
                </span>
              </div>

              <div className="flex flex-col md:flex-row gap-2 mb-3">
                <input
                  type="text"
                  value={dynamicFieldInput}
                  onChange={(e) => setDynamicFieldInput(e.target.value)}
                  placeholder={`${dynamicFieldLabel} (misal: Meja 05)`}
                  className="w-full md:w-1/3 bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={voiceCommandInput}
                    onChange={(e) => setVoiceCommandInput(e.target.value)}
                    placeholder='Contoh: "Ayam Bakar 2, Es Teh 1, Es Jeruk 3"'
                    className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleProcessOrderInput();
                    }}
                  />
                  <button
                    onClick={toggleOrderSpeechRecognition}
                    className={`text-white px-4 py-2 rounded-xl transition shadow flex items-center justify-center ${
                      isOrderListening ? 'bg-rose-600 animate-pulse' : 'bg-emerald-600 hover:bg-emerald-500'
                    }`}
                    title={isOrderListening ? 'Matikan Mikrofon' : 'Mulai Rekam Suara'}
                  >
                    {isOrderListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-gray-400 gap-2">
                <span className="text-[11px] text-gray-300 bg-gray-900/60 p-1.5 rounded-lg border border-gray-700/50">
                  💡 {orderSpeechStatus}
                </span>
                <button
                  onClick={handleProcessOrderInput}
                  className="bg-emerald-700 hover:bg-emerald-600 text-white font-semibold px-4 py-1.5 rounded-xl transition shadow active:scale-95"
                >
                  Proses Pesanan Otomatis
                </button>
              </div>

              {/* Information Note regarding auto-catalog & critical stock */}
              <div className="mt-3 pt-2 border-t border-gray-700/60 flex items-center gap-1.5 text-[11px] text-amber-300/90">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>
                  Barang yang tidak ada di katalog akan <strong>otomatis terdaftar</strong> dengan stok 0 & masuk daftar <strong>Stok Kritis</strong>!
                </span>
              </div>
            </div>

            {/* Grid Katalog Produk & Keranjang Belanja */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Katalog Produk dengan Filter Kategori */}
              <div className="bg-gray-800 p-4 rounded-2xl shadow border border-emerald-900/40 flex flex-col">
                <div className="flex flex-col gap-2 mb-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-sm text-gray-200">Katalog Produk</h3>
                    <button
                      onClick={() => setIsAddingCategoryModalOpen(true)}
                      className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Tambah Kategori
                    </button>
                  </div>

                  {/* Search bar */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={searchCatalogQuery}
                      onChange={(e) => setSearchCatalogQuery(e.target.value)}
                      placeholder="Cari produk di katalog..."
                      className="w-full bg-gray-900 border border-gray-700 text-xs pl-8 pr-2.5 py-1.5 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Kategori Filter Chips */}
                  <div className="flex gap-1 overflow-x-auto no-scrollbar py-1 text-xs">
                    <button
                      onClick={() => setActiveCatalogCategory('Semua')}
                      className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition ${
                        activeCatalogCategory === 'Semua'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-900 text-gray-400 hover:text-gray-200 border border-gray-700'
                      }`}
                    >
                      Semua
                    </button>
                    {appData.productCategories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setActiveCatalogCategory(cat)}
                        className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition ${
                          activeCatalogCategory === cat
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-900 text-gray-400 hover:text-gray-200 border border-gray-700'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Catalog Grid */}
                <div id="catalogGrid" className="grid grid-cols-2 gap-2 overflow-y-auto max-h-80 pr-1">
                  {filteredCatalog.length === 0 ? (
                    <p className="text-xs text-gray-500 col-span-2 text-center py-8">
                      Produk tidak ditemukan dalam kategori ini.
                    </p>
                  ) : (
                    filteredCatalog.map((p) => {
                      const isCritical = p.stock <= (p.minStock || 5);
                      return (
                        <div
                          key={p.id}
                          onClick={() => handleAddToCart(p)}
                          className="bg-gray-900 border border-gray-700/60 hover:border-emerald-500 p-2.5 rounded-xl cursor-pointer transition flex flex-col justify-between active:scale-98"
                        >
                          <div>
                            <div className="flex justify-between items-start gap-1">
                              <p className="font-bold text-xs text-white truncate">{p.name}</p>
                              {p.isAutoAdded && (
                                <span className="bg-amber-500/20 text-amber-300 text-[9px] px-1 rounded font-mono">
                                  Auto
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-gray-400">{p.category}</span>
                            <p className="text-[11px] text-emerald-400 font-semibold mt-1">
                              Rp {p.price.toLocaleString('id-ID')}
                            </p>
                          </div>
                          <div className="flex justify-between items-center mt-2 text-[10px]">
                            <span className={isCritical ? 'text-rose-400 font-bold' : 'text-gray-400'}>
                              Stok: {p.stock}
                            </span>
                            <span className="bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded font-bold border border-emerald-800/50">
                              + Tambah
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Keranjang Belanja */}
              <div className="bg-gray-800 p-4 rounded-2xl shadow border border-emerald-900/40 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm text-gray-200 mb-3 flex justify-between items-center">
                    <span className="flex items-center gap-1.5">
                      <ShoppingCart className="w-4 h-4 text-emerald-400" /> Keranjang Pesanan ({appData.cart.length})
                    </span>
                    {appData.cart.length > 0 && (
                      <button
                        onClick={handleClearCart}
                        className="text-xs text-rose-400 hover:underline"
                      >
                        Kosongkan
                      </button>
                    )}
                  </h3>

                  <div id="cartList" className="space-y-2 overflow-y-auto max-h-56 pr-1 mb-3">
                    {appData.cart.length === 0 ? (
                      <div className="text-center py-10 space-y-2">
                        <ShoppingCart className="w-8 h-8 text-gray-600 mx-auto" />
                        <p className="text-xs text-gray-500">Keranjang masih kosong.</p>
                        <p className="text-[11px] text-gray-600">
                          Gunakan suara atau klik katalog untuk menambah pesanan.
                        </p>
                      </div>
                    ) : (
                      appData.cart.map((item, index) => (
                        <div
                          key={item.id + index}
                          className="flex justify-between items-center bg-gray-900 p-2.5 rounded-xl border border-gray-700/50 text-xs gap-2"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-white truncate">{item.name}</p>
                              {item.isCriticalStock && (
                                <span className="bg-rose-950 text-rose-300 text-[9px] px-1 rounded font-bold border border-rose-800/60 shrink-0">
                                  Stok 0
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-emerald-400 text-[11px] mt-0.5">
                              <span>Rp</span>
                              <input
                                type="number"
                                value={item.price}
                                onChange={(e) =>
                                  handleUpdateCartItemPrice(index, parseFloat(e.target.value) || 0)
                                }
                                className="w-16 bg-gray-950 border border-gray-700 px-1 py-0.5 rounded text-white text-[11px] font-bold"
                              />
                              <span>x {item.qty} = Rp {item.subtotal.toLocaleString('id-ID')}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => handleUpdateCartQty(index, -1)}
                              className="bg-gray-700 hover:bg-gray-600 w-6 h-6 rounded-lg text-white font-bold flex items-center justify-center transition active:scale-95"
                            >
                              -
                            </button>
                            <span className="w-5 text-center font-bold text-white">{item.qty}</span>
                            <button
                              onClick={() => handleUpdateCartQty(index, 1)}
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

                {/* Subtotal & Bayar */}
                <div className="border-t border-gray-700 pt-3 space-y-1.5 text-sm">
                  <div className="flex justify-between text-gray-400 text-xs">
                    <span>Subtotal</span>
                    <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  {appData.receiptSettings.showServiceFee && (
                    <div className="flex justify-between text-emerald-400 text-xs">
                      <span>Biaya Layanan Sistem (Auto 1%)</span>
                      <span>Rp {serviceFee.toLocaleString('id-ID')}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-base text-white pt-1 border-t border-gray-700">
                    <span>Total Akhir</span>
                    <span className="text-emerald-400">Rp {grandTotal.toLocaleString('id-ID')}</span>
                  </div>

                  {/* Button Pembayaran & Struk */}
                  <div className="pt-2">
                    <button
                      onClick={handleOpenPaymentPopup}
                      disabled={appData.cart.length === 0}
                      className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg ${
                        appData.cart.length > 0
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/60 active:scale-98'
                          : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Receipt className="w-4 h-4" /> Buka Popup Struk & Bayar (Rp {grandTotal.toLocaleString('id-ID')})
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ---------------------------------------------------------------------
            TAB 2: SMART STOK (SPEECH-TO-TEXT MENCAPAI SEMUA TEXT MISAL: Beras 50kg 900rb)
            --------------------------------------------------------------------- */}
        {activeTab === 'stock' && (
          <section id="sectionStock" className="space-y-4">
            {/* Smart Voice / Text Stock Input */}
            <div className="bg-gray-800 p-4 rounded-2xl shadow border border-emerald-900/40 space-y-3">
              <div className="flex justify-between items-center">
                <h2 className="font-bold text-sm text-emerald-400 flex items-center gap-2">
                  <Mic className="w-4 h-4 text-emerald-400" /> Smart Stok (Speech-to-Text Cerdas)
                </h2>
                <span className="text-[11px] text-gray-400">Otomatis Hitung Modal per Unit</span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={stockSpeechInput}
                  onChange={(e) => setStockSpeechInput(e.target.value)}
                  placeholder='Contoh: "Beras 50kg 900rb" atau "Minyak 20 liter 320rb"'
                  className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleProcessSmartStockInput();
                  }}
                />
                <button
                  onClick={toggleStockSpeechRecognition}
                  className={`text-white px-4 py-2 rounded-xl transition shadow flex items-center justify-center ${
                    isStockListening ? 'bg-rose-600 animate-pulse' : 'bg-emerald-600 hover:bg-emerald-500'
                  }`}
                  title={isStockListening ? 'Matikan Mikrofon' : 'Mulai Rekam Suara'}
                >
                  {isStockListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleProcessSmartStockInput()}
                  className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl text-xs transition active:scale-95 whitespace-nowrap"
                >
                  Proses
                </button>
              </div>

              <p className="text-[11px] text-gray-400">{stockSpeechStatus}</p>

              {/* Parsed Staging Card (Hasil Deteksi Otomatis) */}
              {parsedStockStaging && (
                <div className="bg-emerald-950/40 border border-emerald-600/50 p-4 rounded-2xl space-y-3 mt-3 animate-in zoom-in-95 duration-150">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Hasil Deteksi Smart Stok:
                    </span>
                    <button
                      onClick={() => setParsedStockStaging(null)}
                      className="text-xs text-rose-400 hover:text-rose-300"
                    >
                      Batal
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="bg-gray-900 p-2.5 rounded-xl border border-gray-700">
                      <span className="text-gray-400 text-[10px] block">Nama Barang</span>
                      <strong className="text-white text-xs">{parsedStockStaging.name}</strong>
                    </div>
                    <div className="bg-gray-900 p-2.5 rounded-xl border border-gray-700">
                      <span className="text-gray-400 text-[10px] block">Jumlah Stok Masuk</span>
                      <strong className="text-white text-xs">
                        {parsedStockStaging.qty} {parsedStockStaging.unit}
                      </strong>
                    </div>
                    <div className="bg-gray-900 p-2.5 rounded-xl border border-gray-700">
                      <span className="text-gray-400 text-[10px] block">Total Biaya Kulakan</span>
                      <strong className="text-emerald-400 text-xs">
                        Rp {parsedStockStaging.totalCost.toLocaleString('id-ID')}
                      </strong>
                    </div>
                    <div className="bg-gray-900 p-2.5 rounded-xl border border-gray-700">
                      <span className="text-gray-400 text-[10px] block">
                        Harga Modal / {parsedStockStaging.unit}
                      </span>
                      <strong className="text-cyan-400 text-xs">
                        Rp {parsedStockStaging.unitCost.toLocaleString('id-ID')}
                      </strong>
                    </div>
                  </div>

                  {/* Kolom Harga Jual (Dikosongkan sesuai permintaan user agar diisi manual/suara) */}
                  <div className="bg-gray-900/90 p-3 rounded-xl border border-emerald-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                      <label className="text-xs font-bold text-emerald-300 block">
                        Tentukan Harga Jual (Rp / {parsedStockStaging.unit})
                      </label>
                      <span className="text-[10px] text-gray-400">
                        Harga modal: Rp {parsedStockStaging.unitCost.toLocaleString('id-ID')}. Isi harga jual ke pelanggan:
                      </span>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <input
                        type="number"
                        value={parsedStockStaging.sellingPrice}
                        onChange={(e) =>
                          setParsedStockStaging({
                            ...parsedStockStaging,
                            sellingPrice: e.target.value,
                          })
                        }
                        placeholder="Harga jual..."
                        className="bg-gray-950 border border-emerald-500 text-sm font-bold text-white px-3 py-1.5 rounded-xl w-36 focus:outline-none"
                      />
                      <button
                        onClick={handleSaveParsedStock}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow active:scale-95 whitespace-nowrap"
                      >
                        Simpan ke Stok & Modal
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Manual Form Tambah Produk */}
            <div className="bg-gray-800 p-4 rounded-2xl shadow border border-emerald-900/40">
              <h2 className="font-bold text-sm text-emerald-400 mb-3 flex items-center gap-2">
                <Plus className="w-4 h-4" /> Tambah Produk Manual ke Katalog
              </h2>
              <form onSubmit={handleAddManualProduct} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    placeholder="Nama Produk"
                    className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {appData.productCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    placeholder="Harga Jual (Rp)"
                    className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="number"
                    value={newProdCostPrice}
                    onChange={(e) => setNewProdCostPrice(e.target.value)}
                    placeholder="Harga Modal / HPP (Rp)"
                    className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  <input
                    type="number"
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(e.target.value)}
                    placeholder="Stok Awal"
                    className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  <input
                    type="text"
                    value={newProdUnit}
                    onChange={(e) => setNewProdUnit(e.target.value)}
                    placeholder="Satuan (kg, porsi, pcs)"
                    className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
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

            {/* Daftar Stok Saat Ini */}
            <div className="bg-gray-800 p-4 rounded-2xl shadow border border-emerald-900/40">
              <h3 className="font-bold text-sm text-gray-200 mb-3 flex justify-between items-center">
                <span>Daftar Stok Saat Ini ({appData.products.length} Produk)</span>
                <span className="text-xs text-gray-400">
                  Total Nilai Stok: <strong className="text-emerald-400">Rp {totalAssetStockValue.toLocaleString('id-ID')}</strong>
                </span>
              </h3>
              <div id="stockListContainer" className="space-y-2 overflow-y-auto max-h-96 pr-1">
                {appData.products.map((p) => {
                  const isLow = p.stock <= (p.minStock || 5);
                  return (
                    <div
                      key={p.id}
                      className="flex justify-between items-center bg-gray-900 p-2.5 rounded-xl border border-gray-700/50 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-white">{p.name}</p>
                          <span className="bg-gray-800 text-gray-400 text-[10px] px-1.5 py-0.5 rounded">
                            {p.category}
                          </span>
                        </div>
                        <p className="text-emerald-400 mt-0.5 text-[11px]">
                          Jual: Rp {p.price.toLocaleString('id-ID')} | Modal: Rp {(p.costPrice || 0).toLocaleString('id-ID')} | Stok:{' '}
                          <span className={isLow ? 'text-rose-400 font-bold bg-rose-950/60 px-1 rounded' : 'text-slate-200 font-semibold'}>
                            {p.stock} {p.unit || ''}
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleAdjustStock(p.id, -1)}
                          className="bg-gray-700 hover:bg-gray-600 px-2.5 py-1 rounded text-white font-bold transition active:scale-95"
                          title="Kurang 1"
                        >
                          -1
                        </button>
                        <button
                          onClick={() => handleAdjustStock(p.id, 5)}
                          className="bg-emerald-700 hover:bg-emerald-600 px-2.5 py-1 rounded text-white font-bold transition active:scale-95"
                          title="Tambah 5"
                        >
                          +5
                        </button>
                        <button
                          onClick={() => handleAdjustStock(p.id, 10)}
                          className="bg-emerald-600 hover:bg-emerald-500 px-2.5 py-1 rounded text-white font-bold transition active:scale-95"
                          title="Tambah 10"
                        >
                          +10
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ---------------------------------------------------------------------
            TAB 3: STOK KRITIS / REORDER LIST (KULAKAN WA SUPPLIER)
            --------------------------------------------------------------------- */}
        {activeTab === 'critical' && (
          <section id="sectionCritical" className="space-y-4">
            <div className="bg-gray-800 p-4 rounded-2xl shadow border border-amber-900/50 space-y-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h2 className="font-bold text-base text-amber-400 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-400" /> Katalog Kritis & Perlu Kulakan ({criticalProducts.length})
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Daftar barang dengan stok menipis (&lt; 5) atau habis (0). Kirim langsung ke WA Supplier/Pasar!
                  </p>
                </div>
                <button
                  onClick={sendReorderListToSupplierWA}
                  disabled={criticalProducts.length === 0}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition shadow active:scale-95 ${
                    criticalProducts.length > 0
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50'
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" /> Kirim Daftar Belanja ke WA Supplier
                </button>
              </div>

              {criticalProducts.length === 0 ? (
                <div className="bg-gray-900/60 p-8 rounded-2xl text-center space-y-2 border border-gray-700">
                  <PackageCheck className="w-10 h-10 text-emerald-400 mx-auto" />
                  <p className="font-bold text-sm text-emerald-300">Stok Aman!</p>
                  <p className="text-xs text-gray-400">
                    Semua persediaan produk di atas batas kritis minimum.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {criticalProducts.map((p) => {
                    const isZero = p.stock <= 0;
                    return (
                      <div
                        key={p.id}
                        className={`p-3 rounded-xl border flex justify-between items-center text-xs ${
                          isZero
                            ? 'bg-rose-950/40 border-rose-800/80'
                            : 'bg-amber-950/30 border-amber-800/60'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{p.name}</span>
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                isZero ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
                              }`}
                            >
                              {isZero ? 'HABIS (0)' : `KRITIS (${p.stock} ${p.unit || ''})`}
                            </span>
                          </div>
                          <p className="text-gray-400 mt-1">
                            Kategori: {p.category} | Modal/Kulakan: Rp {(p.costPrice || 0).toLocaleString('id-ID')} | Harga Jual: Rp {p.price.toLocaleString('id-ID')}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleAdjustStock(p.id, 10)}
                            className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition active:scale-95"
                          >
                            + Restock 10
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ---------------------------------------------------------------------
            TAB 4: MODAL USAHA (HPP, PENGELUARAN KULAKAN & NILAI ASET)
            --------------------------------------------------------------------- */}
        {activeTab === 'modal' && (
          <section id="sectionModal" className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-gray-800 p-4 rounded-2xl border border-emerald-900/40 shadow">
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Wallet className="w-3.5 h-3.5 text-emerald-400" /> Total Pengeluaran Modal
                </span>
                <p className="text-lg font-bold text-emerald-400 mt-1">
                  Rp {totalModalExpenses.toLocaleString('id-ID')}
                </p>
                <span className="text-[10px] text-gray-500">Akumulasi kulakan & belanja usaha</span>
              </div>

              <div className="bg-gray-800 p-4 rounded-2xl border border-emerald-900/40 shadow">
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Boxes className="w-3.5 h-3.5 text-cyan-400" /> Nilai Aset Stok Fisik
                </span>
                <p className="text-lg font-bold text-cyan-400 mt-1">
                  Rp {totalAssetStockValue.toLocaleString('id-ID')}
                </p>
                <span className="text-[10px] text-gray-500">Stok barang x Harga modal HPP</span>
              </div>

              <div className="bg-gray-800 p-4 rounded-2xl border border-emerald-900/40 shadow">
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-400" /> Estimasi Omset Terjual
                </span>
                <p className="text-lg font-bold text-amber-400 mt-1">
                  Rp {totalOmset.toLocaleString('id-ID')}
                </p>
                <span className="text-[10px] text-gray-500">Total pendapatan dari transaksi</span>
              </div>
            </div>

            {/* Form Catat Modal Baru */}
            <div className="bg-gray-800 p-4 rounded-2xl border border-emerald-900/40 shadow space-y-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" /> Catat Pengeluaran Modal / Kulakan Baru
              </h3>
              <form onSubmit={handleAddNewExpenseModal} className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <input
                  type="text"
                  value={newExpenseDesc}
                  onChange={(e) => setNewExpenseDesc(e.target.value)}
                  placeholder="Keterangan (misal: Beli Beras 1 Karung)"
                  className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 sm:col-span-2"
                />
                <input
                  type="number"
                  value={newExpenseAmount}
                  onChange={(e) => setNewExpenseAmount(e.target.value)}
                  placeholder="Nominal Biaya (Rp)"
                  className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded-xl text-xs transition shadow active:scale-95"
                >
                  + Catat Modal
                </button>
              </form>
            </div>

            {/* Riwayat Catatan Modal */}
            <div className="bg-gray-800 p-4 rounded-2xl border border-emerald-900/40 shadow space-y-3">
              <h3 className="font-bold text-sm text-gray-200">
                Riwayat Pengeluaran Modal ({appData.expensesModal.length})
              </h3>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1 text-xs">
                {appData.expensesModal.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Belum ada catatan modal pengeluaran.</p>
                ) : (
                  appData.expensesModal.map((exp) => (
                    <div
                      key={exp.id}
                      className="bg-gray-900 p-3 rounded-xl border border-gray-700/50 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-bold text-white">{exp.description}</p>
                        <p className="text-gray-400 text-[11px] mt-0.5">
                          {exp.date} • {exp.category || 'Modal Usaha'}
                          {exp.unitCost ? ` (Rp ${exp.unitCost.toLocaleString('id-ID')}/${exp.unit})` : ''}
                        </p>
                      </div>
                      <p className="font-bold text-emerald-400 text-sm">
                        Rp {exp.amount.toLocaleString('id-ID')}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        )}

        {/* ---------------------------------------------------------------------
            TAB 5: CLOSING KASIR & AUTO BILLING
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
                  <p className="text-lg font-bold text-white mt-1">{totalTrxCount} Transaksi</p>
                </div>
                <div className="bg-gray-900 p-3 rounded-xl border border-gray-700">
                  <span className="text-xs text-gray-400">Omset Penjualan</span>
                  <p className="text-lg font-bold text-emerald-400 mt-1">
                    Rp {totalOmset.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>

              <div className="bg-emerald-950/40 p-4 rounded-xl border border-emerald-800/60 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-200">Akumulasi Biaya Layanan Sistem (1%):</span>
                  <span className="font-bold text-emerald-400">
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
              <div className="space-y-2 overflow-y-auto max-h-64 pr-1 text-xs">
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
                          Item: {trx.items.length} | Ref: {trx.meta} | Bayar: {trx.paymentMethod?.toUpperCase()}
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

        {/* ---------------------------------------------------------------------
            TAB 6: PENGATURAN STRUK & CONTOH STRUK EDITABLE
            --------------------------------------------------------------------- */}
        {activeTab === 'receipt' && (
          <section id="sectionReceipt" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Form Edit Pengaturan Struk */}
              <div className="bg-gray-800 p-4 rounded-2xl shadow border border-emerald-900/40 space-y-3">
                <h3 className="font-bold text-sm text-emerald-400 flex items-center gap-2">
                  <Edit3 className="w-4 h-4" /> Edit Format & Teks Struk
                </h3>
                <p className="text-xs text-gray-400">
                  Kustomisasi informasi yang tercetak pada struk belanja pelanggan secara langsung.
                </p>

                <div className="space-y-2.5 pt-1 text-xs">
                  <div>
                    <label className="block text-gray-400 mb-1 font-semibold">Nama Usaha / Toko</label>
                    <input
                      type="text"
                      value={receiptDraft.storeName}
                      onChange={(e) => setReceiptDraft({ ...receiptDraft, storeName: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1 font-semibold">Alamat Usaha / Toko</label>
                    <input
                      type="text"
                      value={receiptDraft.storeAddress}
                      onChange={(e) => setReceiptDraft({ ...receiptDraft, storeAddress: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1 font-semibold">No. Telepon / WhatsApp</label>
                    <input
                      type="text"
                      value={receiptDraft.storePhone}
                      onChange={(e) => setReceiptDraft({ ...receiptDraft, storePhone: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1 font-semibold">Pesan Catatan Kaki (Footer)</label>
                    <textarea
                      rows={2}
                      value={receiptDraft.footerNote}
                      onChange={(e) => setReceiptDraft({ ...receiptDraft, footerNote: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Toggles */}
                  <div className="space-y-2 pt-2 border-t border-gray-700">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-gray-300">Tampilkan Biaya Layanan Sistem 1%</span>
                      <input
                        type="checkbox"
                        checked={receiptDraft.showServiceFee}
                        onChange={(e) =>
                          setReceiptDraft({ ...receiptDraft, showServiceFee: e.target.checked })
                        }
                        className="w-4 h-4 accent-emerald-500"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-gray-300">Tampilkan Info QRIS / Pembayaran</span>
                      <input
                        type="checkbox"
                        checked={receiptDraft.showQrisBadge}
                        onChange={(e) =>
                          setReceiptDraft({ ...receiptDraft, showQrisBadge: e.target.checked })
                        }
                        className="w-4 h-4 accent-emerald-500"
                      />
                    </label>
                  </div>

                  <div className="pt-3">
                    <button
                      onClick={handleSaveReceiptSettings}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl transition shadow active:scale-98"
                    >
                      Simpan Format Struk
                    </button>
                  </div>
                </div>
              </div>

              {/* Live Preview Contoh Struk */}
              <div className="bg-gray-800 p-4 rounded-2xl shadow border border-emerald-900/40 flex flex-col items-center">
                <div className="w-full flex justify-between items-center mb-3">
                  <h3 className="font-bold text-sm text-gray-200 flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-emerald-400" /> Contoh Struk (Live Preview)
                  </h3>
                  <button
                    onClick={() => window.print()}
                    className="bg-gray-700 hover:bg-gray-600 text-xs px-2.5 py-1 rounded-lg text-emerald-300 flex items-center gap-1 transition"
                  >
                    <Printer className="w-3.5 h-3.5" /> Uji Cetak
                  </button>
                </div>

                {/* Thermal Paper Look */}
                <div className="w-full max-w-xs bg-white text-gray-900 font-mono text-[11px] p-4 rounded-xl shadow-2xl border-t-8 border-emerald-600 space-y-2 select-text">
                  <div className="text-center space-y-0.5">
                    <h4 className="font-extrabold text-sm uppercase tracking-wider text-black">
                      {receiptDraft.storeName || 'USAHAQU STORE'}
                    </h4>
                    <p className="text-[10px] text-gray-600">{receiptDraft.storeAddress}</p>
                    <p className="text-[10px] text-gray-600">WA: {receiptDraft.storePhone}</p>
                  </div>

                  <div className="border-t border-dashed border-gray-400 my-1"></div>

                  <div className="flex justify-between text-[10px] text-gray-600">
                    <span>No: TRX-DEMO88</span>
                    <span>{new Date().toLocaleDateString('id-ID')}</span>
                  </div>
                  <div className="text-[10px] text-gray-600">Kasir: KasirQu / UsahaQu</div>

                  <div className="border-t border-dashed border-gray-400 my-1"></div>

                  {/* Sample Items */}
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Ayam Bakar Madu x2</span>
                      <span>50.000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Es Teh Manis x2</span>
                      <span>10.000</span>
                    </div>
                  </div>

                  <div className="border-t border-dashed border-gray-400 my-1"></div>

                  <div className="space-y-0.5">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>60.000</span>
                    </div>
                    {receiptDraft.showServiceFee && (
                      <div className="flex justify-between text-gray-700">
                        <span>Layanan (1%)</span>
                        <span>600</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-xs pt-1 border-t border-black">
                      <span>TOTAL</span>
                      <span>Rp {receiptDraft.showServiceFee ? '60.600' : '60.000'}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-600">
                      <span>Bayar (TUNAI)</span>
                      <span>70.000</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-600">
                      <span>Kembalian</span>
                      <span>{receiptDraft.showServiceFee ? '9.400' : '10.000'}</span>
                    </div>
                  </div>

                  <div className="border-t border-dashed border-gray-400 my-2"></div>

                  {receiptDraft.showQrisBadge && (
                    <div className="text-center py-1">
                      <QrCode className="w-12 h-12 mx-auto text-gray-800" />
                      <span className="text-[9px] text-gray-500">Scan QRIS untuk pembayaran digital</span>
                    </div>
                  )}

                  <div className="text-center text-[10px] text-gray-600 pt-1 leading-tight">
                    {receiptDraft.footerNote}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* =========================================================================
          POPUP STRUK & METODE PEMBAYARAN (SIMPAN / SEND WA / PRINT)
          ========================================================================= */}
      {isPaymentReceiptModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-3">
          <div className="bg-gray-800 border border-emerald-900/60 rounded-3xl max-w-md w-full p-4 sm:p-5 shadow-2xl flex flex-col max-h-[95vh] overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header Popup */}
            <div className="flex justify-between items-center pb-3 border-b border-gray-700 shrink-0">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base text-white">Pembayaran & Cetak Struk</h3>
              </div>
              <button
                onClick={() => setIsPaymentReceiptModalOpen(false)}
                className="p-1 text-gray-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body Scrollable */}
            <div className="overflow-y-auto flex-1 py-3 space-y-3.5 pr-1 text-xs">
              {/* Payment Method Selector */}
              <div>
                <label className="block text-gray-400 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                  Pilih Metode Pembayaran
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActivePaymentMethod('tunai')}
                    className={`py-2 px-1 rounded-xl font-bold transition text-center ${
                      activePaymentMethod === 'tunai'
                        ? 'bg-emerald-600 text-white shadow'
                        : 'bg-gray-900 text-gray-300 border border-gray-700'
                    }`}
                  >
                    💵 Tunai
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePaymentMethod('qris')}
                    className={`py-2 px-1 rounded-xl font-bold transition text-center ${
                      activePaymentMethod === 'qris'
                        ? 'bg-emerald-600 text-white shadow'
                        : 'bg-gray-900 text-gray-300 border border-gray-700'
                    }`}
                  >
                    📱 QRIS
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePaymentMethod('transfer')}
                    className={`py-2 px-1 rounded-xl font-bold transition text-center ${
                      activePaymentMethod === 'transfer'
                        ? 'bg-emerald-600 text-white shadow'
                        : 'bg-gray-900 text-gray-300 border border-gray-700'
                    }`}
                  >
                    🏦 Transfer
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePaymentMethod('bon')}
                    className={`py-2 px-1 rounded-xl font-bold transition text-center ${
                      activePaymentMethod === 'bon'
                        ? 'bg-rose-600 text-white shadow'
                        : 'bg-gray-900 text-gray-300 border border-gray-700'
                    }`}
                  >
                    📝 Bon
                  </button>
                </div>
              </div>

              {/* Cash Change Calculator (If Tunai) */}
              {activePaymentMethod === 'tunai' && (
                <div className="bg-gray-900 p-3 rounded-xl border border-gray-700 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Tagihan:</span>
                    <strong className="text-emerald-400 text-sm">Rp {grandTotal.toLocaleString('id-ID')}</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-xs">Uang Diterima:</span>
                    <input
                      type="number"
                      value={cashGivenInput}
                      onChange={(e) => setCashGivenInput(e.target.value)}
                      placeholder="0"
                      className="flex-1 bg-gray-950 border border-gray-700 rounded-lg px-2.5 py-1 text-white text-right font-bold text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  {/* Quick cash shortcut buttons */}
                  <div className="flex gap-1.5 justify-end text-[10px]">
                    <button
                      type="button"
                      onClick={() => setCashGivenInput(grandTotal.toString())}
                      className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-2 py-0.5 rounded border border-gray-700"
                    >
                      Uang Pas
                    </button>
                    <button
                      type="button"
                      onClick={() => setCashGivenInput('50000')}
                      className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-2 py-0.5 rounded border border-gray-700"
                    >
                      50rb
                    </button>
                    <button
                      type="button"
                      onClick={() => setCashGivenInput('100000')}
                      className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-2 py-0.5 rounded border border-gray-700"
                    >
                      100rb
                    </button>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-gray-800">
                    <span className="text-gray-400">Kembalian:</span>
                    <strong className="text-amber-400 text-sm">
                      Rp {changeAmount.toLocaleString('id-ID')}
                    </strong>
                  </div>
                </div>
              )}

              {/* If QRIS: Show Merchant's Real QRIS Image from Setting Umum */}
              {activePaymentMethod === 'qris' && (() => {
                const qris = QrisSettingsService.getQrisData();
                return (
                  <div className="bg-gray-900 p-3.5 rounded-2xl border border-emerald-500/40 text-center space-y-2">
                    <span className="text-[11px] font-bold text-emerald-400 block">
                      {qris?.provider ? `QRIS Pembayaran (${qris.provider})` : 'QRIS Pembayaran Usaha'}
                    </span>
                    <div className="bg-white p-2 rounded-xl inline-block mx-auto shadow-md">
                      {qris?.image ? (
                        <img
                          src={qris.image}
                          alt="QRIS Usaha"
                          className="max-h-48 max-w-[200px] object-contain mx-auto rounded"
                        />
                      ) : (
                        <div className="w-32 h-32 bg-slate-900 flex flex-col items-center justify-center p-2 rounded text-slate-100">
                          <QrCode className="w-14 h-14 text-emerald-400 mb-1" />
                          <span className="text-[9px] font-bold text-emerald-300">QRIS WargaQu</span>
                          <span className="text-[8px] text-slate-400">Scan via m-Banking/E-Wallet</span>
                        </div>
                      )}
                    </div>
                    {qris?.note ? (
                      <p className="text-[10px] text-amber-300 font-mono bg-slate-950 p-1.5 rounded border border-slate-700">
                        💡 {qris.note}
                      </p>
                    ) : (
                      <p className="text-[10px] text-gray-400">
                        Bisa di-scan dari BCA, Mandiri, BRI, GoPay, OVO, Dana, ShopeePay.
                      </p>
                    )}
                  </div>
                );
              })()}

              {/* If Transfer: Bank Information */}
              {activePaymentMethod === 'transfer' && (
                <div className="bg-gray-900 p-3 rounded-2xl border border-gray-700 space-y-1.5 text-xs">
                  <span className="text-gray-400 block font-bold">Transfer Bank / Rekening:</span>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1">
                    <p className="font-bold text-white text-xs">Bank BCA: 123-456-7890</p>
                    <p className="text-[10px] text-gray-400">a.n Usaha Warga Mandiri</p>
                    <p className="text-[10px] text-emerald-400 font-semibold mt-1">
                      Total: Rp {grandTotal.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              )}

              {/* If Bon: Catatan Bon Hutang */}
              {activePaymentMethod === 'bon' && (
                <div className="bg-rose-950/40 p-3 rounded-2xl border border-rose-800/60 space-y-1.5 text-xs">
                  <span className="text-rose-300 block font-bold">📝 Catatan Kas Bon / Piutang</span>
                  <p className="text-[11px] text-gray-300">
                    Transaksi akan dicatat sebagai piutang pelanggan untuk ditagih di kemudian hari.
                  </p>
                </div>
              )}

              {/* Preview Struk Ringkas */}
              <div className="bg-white text-gray-900 font-mono text-[10px] p-3 rounded-xl border border-gray-300 space-y-1">
                <div className="text-center font-bold text-xs uppercase">
                  {appData.receiptSettings.storeName}
                </div>
                <div className="text-center text-[9px] text-gray-500">
                  {appData.receiptSettings.storeAddress}
                </div>
                <div className="border-t border-dashed border-gray-400 my-1"></div>
                <div className="space-y-0.5">
                  {appData.cart.map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span className="truncate max-w-[170px]">{item.name} x{item.qty}</span>
                      <span>{item.subtotal.toLocaleString('id-ID')}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-dashed border-gray-400 my-1"></div>
                <div className="flex justify-between font-bold text-xs">
                  <span>TOTAL</span>
                  <span>Rp {grandTotal.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            {/* 3 Prominent Action Buttons: Simpan / Send WA / Print */}
            <div className="pt-3 border-t border-gray-700 shrink-0 space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleCompleteTransaction('save')}
                  className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2.5 rounded-xl text-xs transition shadow flex flex-col items-center justify-center gap-1 active:scale-95"
                >
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Simpan</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCompleteTransaction('wa')}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs transition shadow flex flex-col items-center justify-center gap-1 active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span>Send WA</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCompleteTransaction('print')}
                  className="bg-cyan-700 hover:bg-cyan-600 text-white font-bold py-2.5 rounded-xl text-xs transition shadow flex flex-col items-center justify-center gap-1 active:scale-95"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Struk</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL TAMBAH KATEGORI BARU
          ========================================================================= */}
      {isAddingCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 border border-emerald-900/60 rounded-3xl max-w-xs w-full p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm text-white">Tambah Kategori Baru</h3>
              <button
                onClick={() => setIsAddingCategoryModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Nama Kategori</label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Contoh: Frozen Food, Bumbu, dll."
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddNewCategory();
                }}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddNewCategory}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl text-xs transition active:scale-95"
              >
                Tambah
              </button>
              <button
                onClick={() => setIsAddingCategoryModalOpen(false)}
                className="bg-gray-700 hover:bg-gray-600 text-gray-300 font-semibold py-2 px-3 rounded-xl text-xs transition"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

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
