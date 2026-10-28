import React, { useState, useEffect } from 'react';
import { AndroidFrame } from './components/AndroidFrame';
import { HeaderBar } from './components/HeaderBar';
import { NavigationDrawer } from './components/NavigationDrawer';
import { TableGrid } from './components/kasir/TableGrid';
import { OrderBottomSheet } from './components/kasir/OrderBottomSheet';
import { TableActionModal } from './components/kasir/TableActionModal';
import { CheckoutModal } from './components/kasir/CheckoutModal';
import { ReceiptModal } from './components/kasir/ReceiptModal';
import { BahanView } from './components/bahan/BahanView';
import { OmsetDashboard } from './components/omset/OmsetDashboard';
import { LaporanView } from './components/laporan/LaporanView';
import { SettingView } from './components/setting/SettingView';
import { BluetoothModal } from './components/BluetoothModal';
import { SwitchModulModal, APP_MODULES } from './components/modul/SwitchModulModal';
import { EmptyModuleView } from './components/modul/EmptyModuleView';
import { PaguyubanQuView } from './components/paguyubanqu/PaguyubanQuView';
import { KitchenDisplayView } from './components/dapur/KitchenDisplayView';
import { WaiterView } from './components/waiter/WaiterView';
import { BottomNavBar, NavTabItem } from './components/BottomNavBar';
import {
  LayoutDashboard,
  Users,
  Wallet,
  Building,
  Megaphone,
  Settings,
  UtensilsCrossed,
  Boxes,
  TrendingUp,
  FileText,
  Home
} from 'lucide-react';

import {
  TableItem,
  MenuItem,
  Order,
  OrderItem,
  OrderType,
  Ingredient,
  RestaurantProfile,
  PrinterConfig
} from './types';
import { StorageService } from './services/storage';
import { PrinterService } from './services/printer';
import { RtStorageService } from './services/rtStorage';
import { GeneralSettingsService } from './services/generalSettingsService';

export default function App() {
  // Navigation State
  const [activeModule, setActiveModule] = useState<string>('paguyubanqu');
  const [activeRtTab, setActiveRtTab] = useState<
    'dashboard' | 'kependudukan' | 'iuran' | 'organisasi' | 'pengumuman' | 'setting'
  >('dashboard');
  const [activeTab, setActiveTab] = useState<string>('kasir');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isBluetoothModalOpen, setIsBluetoothModalOpen] = useState<boolean>(false);
  const [isSwitchModulOpen, setIsSwitchModulOpen] = useState<boolean>(false);

  // Core Data States
  const [tables, setTables] = useState<TableItem[]>([]);
  const [menuList, setMenuList] = useState<MenuItem[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [history, setHistory] = useState<Order[]>([]);
  const [activeOrders, setActiveOrders] = useState<Record<string, Order>>({});
  const [profile, setProfile] = useState<RestaurantProfile>(StorageService.getProfile());
  const [printerConfig, setPrinterConfig] = useState<PrinterConfig>(StorageService.getPrinterConfig());

  // Interactive Flow States
  const [selectedTableForAction, setSelectedTableForAction] = useState<TableItem | null>(null);
  const [orderSheetState, setOrderSheetState] = useState<{
    isOpen: boolean;
    orderType: OrderType;
    tableId?: string;
    tableName?: string;
    existingOrder?: Order | null;
  }>({
    isOpen: false,
    orderType: 'meja',
  });

  const [checkoutOrder, setCheckoutOrder] = useState<Order | null>(null);
  const [receiptModalState, setReceiptModalState] = useState<{
    isOpen: boolean;
    order: Order | null;
    isKitchenSlip?: boolean;
  }>({
    isOpen: false,
    order: null,
    isKitchenSlip: false,
  });

  const [notification, setNotification] = useState<string | null>(null);

  // Refresh and load all data across modules & settings
  const refreshAllData = () => {
    setTables(StorageService.getTables());
    setMenuList(StorageService.getMenu());
    setIngredients(StorageService.getIngredients());
    setHistory(StorageService.getHistory());
    setActiveOrders(StorageService.getActiveOrders());
    setProfile(StorageService.getProfile());
    setPrinterConfig(StorageService.getPrinterConfig());
    const gen = GeneralSettingsService.getSettings();
    GeneralSettingsService.applyThemeToDOM(gen.theme);
  };

  // Initial Data Load
  useEffect(() => {
    refreshAllData();
  }, []);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // ----------------------------------------------------
  // TABLE MANAGEMENT
  // ----------------------------------------------------
  const handleAddTable = () => {
    const nextNumber = tables.length > 0 ? Math.max(...tables.map((t) => t.number)) + 1 : 1;
    const newTable: TableItem = {
      id: `tbl-${Date.now()}`,
      name: `Meja ${nextNumber}`,
      number: nextNumber,
      status: 'kosong',
      positionIndex: tables.length,
    };
    const updated = [...tables, newTable];
    setTables(updated);
    StorageService.saveTables(updated);
    showNotification(`Meja ${nextNumber} berhasil ditambahkan ke denah.`);
  };

  const handleReorderTables = (newTables: TableItem[]) => {
    setTables(newTables);
    StorageService.saveTables(newTables);
  };

  const handleDeleteTable = (tableId: string) => {
    const updated = tables.filter((t) => t.id !== tableId);
    setTables(updated);
    StorageService.saveTables(updated);
    showNotification('Meja dihapus dari denah.');
  };

  const handleSelectTable = (table: TableItem) => {
    if (table.status === 'kosong') {
      // Direct open order bottom sheet for this table
      setOrderSheetState({
        isOpen: true,
        orderType: 'meja',
        tableId: table.id,
        tableName: table.name,
        existingOrder: null,
      });
    } else {
      // Occupied or waiting payment -> show table action sheet
      setSelectedTableForAction(table);
    }
  };

  // Bungkus / Takeaway Quick Action
  const handleOpenBungkus = () => {
    setOrderSheetState({
      isOpen: true,
      orderType: 'bungkus',
      existingOrder: null,
    });
  };

  // ----------------------------------------------------
  // ORDER FLOW
  // ----------------------------------------------------
  const handleSaveAndPrintOrder = async (
    items: OrderItem[],
    type: OrderType,
    tableId?: string,
    tableName?: string,
    customerName?: string,
    printOption?: 'bluetooth' | 'pdf' | 'none'
  ) => {
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const date = new Date();
    const dateKey = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;

    let orderToSave: Order;

    if (orderSheetState.existingOrder) {
      // Append / Update existing order
      orderToSave = {
        ...orderSheetState.existingOrder,
        items,
        subtotal,
        total: subtotal,
        customerName: customerName || orderSheetState.existingOrder.customerName,
      };
    } else {
      // New Order
      const newReceiptNumber = `BQ-${dateKey}-${String(Math.floor(100 + Math.random() * 900))}`;
      orderToSave = {
        id: `ord-${Date.now()}`,
        receiptNumber: newReceiptNumber,
        type,
        tableId,
        tableName,
        customerName: customerName || (type === 'meja' ? tableName || 'Meja' : 'Bungkus'),
        items,
        subtotal,
        discount: 0,
        tax: 0,
        total: subtotal,
        status: 'saved',
        createdAt: date.toISOString(),
      };
    }

    // If Takeaway and user saved, open Checkout immediately or save to active
    if (type === 'bungkus') {
      setOrderSheetState({ isOpen: false, orderType: 'bungkus' });
      setCheckoutOrder(orderToSave);
      showNotification('Pesanan bungkus tersimpan. Lanjutkan pembayaran.');
      return;
    }

    // Dine-in table order
    const updatedActiveOrders = { ...activeOrders, [orderToSave.id]: orderToSave };
    setActiveOrders(updatedActiveOrders);
    StorageService.saveActiveOrders(updatedActiveOrders);

    // Update table status to "terisi"
    if (tableId) {
      const updatedTables = tables.map((t) =>
        t.id === tableId
          ? {
              ...t,
              status: 'terisi' as const,
              orderId: orderToSave.id,
              totalAmount: orderToSave.total,
              itemsCount: orderToSave.items.reduce((s, i) => s + i.quantity, 0),
              openedAt: date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            }
          : t
      );
      setTables(updatedTables);
      StorageService.saveTables(updatedTables);
    }

    setOrderSheetState({ isOpen: false, orderType: 'meja' });

    // Print slip if requested
    if (printOption === 'bluetooth') {
      await PrinterService.printOrder(orderToSave, profile, printerConfig, true);
      setReceiptModalState({
        isOpen: true,
        order: orderToSave,
        isKitchenSlip: true,
      });
      showNotification(`Pesanan ${tableName} tersimpan & Struk Dapur dicetak.`);
    } else {
      showNotification(`Pesanan ${tableName} berhasil disimpan.`);
    }
  };

  // ----------------------------------------------------
  // CHECKOUT & PAYMENT FLOW
  // ----------------------------------------------------
  const handleProceedToPay = (table: TableItem) => {
    if (!table.orderId || !activeOrders[table.orderId]) {
      alert('Data pesanan meja tidak ditemukan.');
      return;
    }
    const currentOrder = activeOrders[table.orderId];
    setCheckoutOrder(currentOrder);
  };

  const handleCompletePayment = async (
    completedOrder: Order,
    printOption: 'bluetooth' | 'pdf' | 'both' | 'none'
  ) => {
    // 1. Add to permanent transaction history (Local Storage)
    StorageService.addTransaction(completedOrder);
    setHistory([completedOrder, ...history]);

    // 2. Remove from active orders
    const copyActive = { ...activeOrders };
    delete copyActive[completedOrder.id];
    setActiveOrders(copyActive);
    StorageService.saveActiveOrders(copyActive);

    // 3. Reset table status to "kosong" if dine-in
    if (completedOrder.tableId) {
      const updatedTables = tables.map((t) =>
        t.id === completedOrder.tableId
          ? {
              ...t,
              status: 'kosong' as const,
              orderId: undefined,
              totalAmount: undefined,
              itemsCount: undefined,
              openedAt: undefined,
            }
          : t
      );
      setTables(updatedTables);
      StorageService.saveTables(updatedTables);
    }

    setCheckoutOrder(null);

    // 4. Handle Printing
    if (printOption === 'bluetooth' || printOption === 'both') {
      await PrinterService.printOrder(completedOrder, profile, printerConfig, false);
      setReceiptModalState({
        isOpen: true,
        order: completedOrder,
        isKitchenSlip: false,
      });
      showNotification('Pembayaran LUNAS! Struk nota dicetak ke printer.');
    } else if (printOption === 'pdf') {
      setReceiptModalState({
        isOpen: true,
        order: completedOrder,
        isKitchenSlip: false,
      });
      showNotification('Pembayaran LUNAS! Pratinjau struk PDF siap disimpan.');
    } else {
      showNotification('Pembayaran LUNAS! Transaksi tersimpan rapi.');
    }
  };

  const handleClearTable = (table: TableItem) => {
    if (table.orderId) {
      const copy = { ...activeOrders };
      delete copy[table.orderId];
      setActiveOrders(copy);
      StorageService.saveActiveOrders(copy);
    }
    const updated = tables.map((t) =>
      t.id === table.id
        ? {
            ...t,
            status: 'kosong' as const,
            orderId: undefined,
            totalAmount: undefined,
            itemsCount: undefined,
            openedAt: undefined,
          }
        : t
    );
    setTables(updated);
    StorageService.saveTables(updated);
    showNotification(`${table.name} berhasil dikosongkan.`);
  };

  const handleUpdateKitchenStatus = (
    orderId: string,
    status: 'menunggu' | 'dimasak' | 'siap'
  ) => {
    if (!activeOrders[orderId]) return;
    const updatedOrder: Order = {
      ...activeOrders[orderId],
      kitchenStatus: status,
    };
    const updatedActive = {
      ...activeOrders,
      [orderId]: updatedOrder,
    };
    setActiveOrders(updatedActive);
    StorageService.saveActiveOrders(updatedActive);
    const label =
      status === 'dimasak'
        ? 'Sedang Dimasak'
        : status === 'siap'
        ? 'Siap Saji'
        : 'Antrian';
    showNotification(`Status pesanan ${updatedOrder.tableName || 'Bungkus'}: ${label}`);
  };

  // Helper counts
  const occupiedTablesCount = tables.filter((t) => t.status !== 'kosong').length;

  const currentModule =
    APP_MODULES.find((m) => m.id === activeModule) || APP_MODULES[0];

  const getPageTitle = () => {
    if (activeModule !== 'kasirqu') {
      return { title: currentModule.name, subtitle: currentModule.tagline };
    }
    switch (activeTab) {
      case 'kasir':
        return { title: 'Bakso Qu 1.0', subtitle: 'Kasir & Denah Meja' };
      case 'dapur':
        return { title: 'Layar Dapur (KDS)', subtitle: 'Antrian & Status Memasak' };
      case 'waiter':
        return { title: 'Order Pelayan', subtitle: 'Pencatatan Pesanan Cepat Meja' };
      case 'bahan':
        return { title: 'Modal & Bahan', subtitle: 'Manajemen Stok Gudang' };
      case 'omset':
        return { title: 'Omset & Pendapatan', subtitle: 'Ringkasan Keuangan' };
      case 'laporan':
        return { title: 'Laporan Transaksi', subtitle: 'Riwayat Penjualan & Ekspor' };
      case 'setting':
        return { title: 'Pengaturan Aplikasi', subtitle: 'Profil Usaha & Bluetooth' };
      default:
        return { title: 'Bakso Qu 1.0', subtitle: 'POS Restoran' };
    }
  };

  const pageInfo = getPageTitle();

  // Dynamic Bottom Navbar Sub-Menus based on Selected Module
  const getModuleTabs = (): NavTabItem[] => {
    if (activeModule === 'paguyubanqu') {
      const citizenCount = RtStorageService.getCitizens().length;
      const ancCount = RtStorageService.getAnnouncements().length;
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'kependudukan', label: 'Warga', icon: Users, badge: citizenCount > 0 ? citizenCount : null },
        { id: 'iuran', label: 'Iuran', icon: Wallet },
        { id: 'organisasi', label: 'Organisasi', icon: Building },
        { id: 'pengumuman', label: 'Warta', icon: Megaphone, badge: ancCount > 0 ? ancCount : null },
        { id: 'setting', label: 'Setting', icon: Settings },
      ];
    }
    if (activeModule === 'kasirqu') {
      return [
        { id: 'kasir', label: 'Kasir', icon: UtensilsCrossed, badge: occupiedTablesCount > 0 ? occupiedTablesCount : null },
        { id: 'bahan', label: 'Modal', icon: Boxes },
        { id: 'omset', label: 'Omset', icon: TrendingUp },
        { id: 'laporan', label: 'Laporan', icon: FileText },
        { id: 'setting', label: 'Setting', icon: Settings },
      ];
    }
    return [{ id: 'beranda', label: 'Beranda', icon: Home }];
  };

  return (
    <AndroidFrame>
      {/* Top Header App Bar (for KasirQu POS) */}
      {activeModule === 'kasirqu' && (
        <HeaderBar
          title={pageInfo.title}
          subtitle={pageInfo.subtitle}
          onOpenDrawer={() => setIsDrawerOpen(true)}
          onTakeawayClick={handleOpenBungkus}
          printerConfig={printerConfig}
          onOpenPrinterModal={() => setIsBluetoothModalOpen(true)}
          showTakeawayBtn={activeTab === 'kasir'}
        />
      )}

      {/* Pop-up Notification Toast */}
      {notification && (
        <div className="absolute top-14 left-4 right-4 z-40 bg-stone-900 text-amber-300 px-3.5 py-2 rounded-2xl shadow-xl border border-amber-500/40 text-xs font-semibold flex items-center justify-between animate-in fade-in slide-in-from-top duration-200">
          <span>{notification}</span>
        </div>
      )}

      {/* Main Content Area Based on Active Module and Tab */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-stone-900">
        {activeModule === 'paguyubanqu' ? (
          <PaguyubanQuView
            activeRtTab={activeRtTab}
            onSelectRtTab={setActiveRtTab}
            onOpenSwitchModul={() => setIsSwitchModulOpen(true)}
            onBackToKasir={() => {
              setActiveModule('kasirqu');
              setActiveTab('kasir');
            }}
            onShowNotification={showNotification}
            onOpenDrawer={() => setIsDrawerOpen(true)}
          />
        ) : activeModule !== 'kasirqu' ? (
          <EmptyModuleView
            moduleId={currentModule.id}
            moduleName={currentModule.name}
            moduleTagline={currentModule.tagline}
            moduleLogo={currentModule.logo}
            onOpenSwitchModul={() => setIsSwitchModulOpen(true)}
            onBackToKasir={() => {
              setActiveModule('kasirqu');
              setActiveTab('kasir');
            }}
            onOpenDrawer={() => setIsDrawerOpen(true)}
          />
        ) : (
          <>
            {activeTab === 'kasir' && (
              <TableGrid
                tables={tables}
                activeOrders={activeOrders}
                onSelectTable={handleSelectTable}
                onAddTable={handleAddTable}
                onReorderTables={handleReorderTables}
                onDeleteTable={handleDeleteTable}
              />
            )}

            {activeTab === 'dapur' && (
              <KitchenDisplayView
                activeOrders={activeOrders}
                onUpdateKitchenStatus={handleUpdateKitchenStatus}
                profile={profile}
                printerConfig={printerConfig}
                onOpenReceipt={(ord) =>
                  setReceiptModalState({ isOpen: true, order: ord, isKitchenSlip: true })
                }
              />
            )}

            {activeTab === 'waiter' && (
              <WaiterView
                tables={tables}
                activeOrders={activeOrders}
                onSelectTable={handleSelectTable}
                onOpenTakeaway={handleOpenBungkus}
              />
            )}

            {activeTab === 'bahan' && (
              <BahanView
                ingredients={ingredients}
                onSaveIngredients={(newItems) => {
                  setIngredients(newItems);
                  StorageService.saveIngredients(newItems);
                  showNotification('Data bahan baku diperbarui.');
                }}
              />
            )}

            {activeTab === 'omset' && (
              <OmsetDashboard history={history} />
            )}

            {activeTab === 'laporan' && (
              <LaporanView
                history={history}
                profile={profile}
                onOpenReceipt={(ord) =>
                  setReceiptModalState({ isOpen: true, order: ord, isKitchenSlip: false })
                }
              />
            )}

            {activeTab === 'setting' && (
              <SettingView
                profile={profile}
                onSaveProfile={(newProf) => {
                  setProfile(newProf);
                  StorageService.saveProfile(newProf);
                }}
                printerConfig={printerConfig}
                onSavePrinterConfig={(newCfg) => {
                  setPrinterConfig(newCfg);
                  StorageService.savePrinterConfig(newCfg);
                }}
                menuList={menuList}
                onSaveMenu={(newMenu) => {
                  setMenuList(newMenu);
                  StorageService.saveMenu(newMenu);
                  showNotification('Daftar menu berhasil diperbarui.');
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Fixed Bottom Navigation Bar with Sub-menus for currently active module */}
      <BottomNavBar
        activeTab={activeModule === 'paguyubanqu' ? activeRtTab : activeTab}
        onSelectTab={(tabId) => {
          if (activeModule === 'paguyubanqu') {
            setActiveRtTab(tabId as any);
          } else {
            setActiveTab(tabId);
          }
        }}
        onOpenSwitchModul={() => setIsSwitchModulOpen(true)}
        tabs={getModuleTabs()}
        activeOrdersCount={Object.keys(activeOrders).length}
        activeModule={activeModule}
        activeModuleLogo={currentModule.logo}
        activeModuleName={currentModule.name}
      />

      {/* Navigation Drawer (Sidebar Setting Umum) */}
      <NavigationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenSwitchModul={() => setIsSwitchModulOpen(true)}
        profile={profile}
        printerConfig={printerConfig}
        occupiedTablesCount={occupiedTablesCount}
        activeOrdersCount={Object.keys(activeOrders).length}
        onDataRestored={refreshAllData}
        onShowNotification={showNotification}
      />

      {/* Quick Bluetooth Status Modal */}
      <BluetoothModal
        isOpen={isBluetoothModalOpen}
        onClose={() => setIsBluetoothModalOpen(false)}
        printerConfig={printerConfig}
        onSavePrinterConfig={(cfg) => {
          setPrinterConfig(cfg);
          StorageService.savePrinterConfig(cfg);
        }}
        profile={profile}
      />

      {/* Order Bottom Sheet (Menu selection & porsi counter) */}
      <OrderBottomSheet
        isOpen={orderSheetState.isOpen}
        onClose={() => setOrderSheetState({ isOpen: false, orderType: 'meja' })}
        orderType={orderSheetState.orderType}
        tableName={orderSheetState.tableName}
        tableId={orderSheetState.tableId}
        existingOrder={orderSheetState.existingOrder}
        menuList={menuList}
        onSaveAndPrint={handleSaveAndPrintOrder}
      />

      {/* Table Action Sheet (When tapping occupied table) */}
      <TableActionModal
        isOpen={selectedTableForAction !== null}
        onClose={() => setSelectedTableForAction(null)}
        table={selectedTableForAction}
        activeOrder={
          selectedTableForAction?.orderId
            ? activeOrders[selectedTableForAction.orderId] || null
            : null
        }
        onPay={() => {
          if (selectedTableForAction) handleProceedToPay(selectedTableForAction);
        }}
        onAddMoreMenu={() => {
          if (selectedTableForAction) {
            const existing = selectedTableForAction.orderId
              ? activeOrders[selectedTableForAction.orderId]
              : null;
            setOrderSheetState({
              isOpen: true,
              orderType: 'meja',
              tableId: selectedTableForAction.id,
              tableName: selectedTableForAction.name,
              existingOrder: existing,
            });
          }
        }}
        onViewReceipt={() => {
          if (selectedTableForAction?.orderId && activeOrders[selectedTableForAction.orderId]) {
            setReceiptModalState({
              isOpen: true,
              order: activeOrders[selectedTableForAction.orderId],
              isKitchenSlip: true,
            });
          }
        }}
        onClearTable={() => {
          if (selectedTableForAction) handleClearTable(selectedTableForAction);
        }}
      />

      {/* Checkout Screen Sheet */}
      <CheckoutModal
        isOpen={checkoutOrder !== null}
        onClose={() => setCheckoutOrder(null)}
        order={checkoutOrder}
        printerConfig={printerConfig}
        onCompletePayment={handleCompletePayment}
      />

      {/* Thermal Receipt Preview Modal */}
      <ReceiptModal
        isOpen={receiptModalState.isOpen}
        onClose={() => setReceiptModalState({ isOpen: false, order: null })}
        order={receiptModalState.order}
        profile={profile}
        printerConfig={printerConfig}
        isKitchenSlip={receiptModalState.isKitchenSlip}
      />

      {/* Switch Modul Drawer / Modal */}
      <SwitchModulModal
        isOpen={isSwitchModulOpen}
        onClose={() => setIsSwitchModulOpen(false)}
        activeModule={activeModule}
        onSelectModule={(modId) => {
          setActiveModule(modId);
          if (modId === 'kasirqu') {
            setActiveTab('kasir');
          }
          const selected = APP_MODULES.find((m) => m.id === modId);
          showNotification(`Beralih ke modul ${selected?.name || modId}`);
        }}
      />
    </AndroidFrame>
  );
}
