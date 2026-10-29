import React, { useState } from 'react';
import {
  Settings,
  Store,
  Printer,
  UtensilsCrossed,
  Plus,
  Edit2,
  Trash2,
  Bluetooth,
  CheckCircle2,
  RefreshCw,
  X,
  Check,
  Smartphone,
  Info,
  QrCode
} from 'lucide-react';
import { RestaurantProfile, PrinterConfig, MenuItem, MenuCategory } from '../../types';
import { PrinterService } from '../../services/printer';
import { QrisSettingsService, WargaQuQrisData } from '../../services/qrisService';

interface SettingViewProps {
  profile: RestaurantProfile;
  onSaveProfile: (profile: RestaurantProfile) => void;
  printerConfig: PrinterConfig;
  onSavePrinterConfig: (config: PrinterConfig) => void;
  menuList: MenuItem[];
  onSaveMenu: (menu: MenuItem[]) => void;
}

export const SettingView: React.FC<SettingViewProps> = ({
  profile,
  onSaveProfile,
  printerConfig,
  onSavePrinterConfig,
  menuList,
  onSaveMenu,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'toko' | 'menu' | 'printer' | 'qris'>('toko');

  // QRIS State
  const [qrisData, setQrisData] = useState<WargaQuQrisData | null>(() => QrisSettingsService.getQrisData());
  const [qrisProvider, setQrisProvider] = useState<string>(() => QrisSettingsService.getQrisData()?.provider || 'ShopeePay');
  const [qrisNote, setQrisNote] = useState<string>(() => QrisSettingsService.getQrisData()?.note || '');
  const [base64QrisImage, setBase64QrisImage] = useState<string>(() => QrisSettingsService.getQrisData()?.image || '');
  const [qrisSavedMsg, setQrisSavedMsg] = useState(false);

  const handleQrisImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setBase64QrisImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveQris = (e: React.FormEvent) => {
    e.preventDefault();
    if (!base64QrisImage) {
      alert('Silakan upload foto QRIS terlebih dahulu!');
      return;
    }
    const data: WargaQuQrisData = {
      provider: qrisProvider,
      image: base64QrisImage,
      note: qrisNote.trim(),
      updatedAt: new Date().toISOString(),
    };
    QrisSettingsService.saveQrisData(data);
    setQrisData(data);
    setQrisSavedMsg(true);
    setTimeout(() => setQrisSavedMsg(false), 3000);
  };

  const handleRemoveQris = () => {
    if (confirm('Hapus foto dan data QRIS ini?')) {
      QrisSettingsService.removeQrisData();
      setQrisData(null);
      setBase64QrisImage('');
      setQrisNote('');
    }
  };

  // Profile Form state
  const [name, setName] = useState(profile.name);
  const [slogan, setSlogan] = useState(profile.slogan);
  const [address, setAddress] = useState(profile.address);
  const [phone, setPhone] = useState(profile.phone);
  const [receiptHeader, setReceiptHeader] = useState(profile.receiptHeader);
  const [receiptFooter, setReceiptFooter] = useState(profile.receiptFooter);
  const [profileSavedMsg, setProfileSavedMsg] = useState(false);

  // Bluetooth scanning state
  const [isScanning, setIsScanning] = useState(false);
  const [printerStatusMsg, setPrinterStatusMsg] = useState<string | null>(null);

  // Menu modal state
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [menuName, setMenuName] = useState('');
  const [menuCat, setMenuCat] = useState<MenuCategory>('bakso_kuah');
  const [menuPrice, setMenuPrice] = useState<number>(20000);
  const [menuDesc, setMenuDesc] = useState('');

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  const handleSaveProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      ...profile,
      name: name.trim(),
      slogan: slogan.trim(),
      address: address.trim(),
      phone: phone.trim(),
      receiptHeader: receiptHeader.trim(),
      receiptFooter: receiptFooter.trim(),
    });
    setProfileSavedMsg(true);
    setTimeout(() => setProfileSavedMsg(false), 2500);
  };

  const handleScanBluetooth = async () => {
    setIsScanning(true);
    setPrinterStatusMsg('Mencari printer thermal bluetooth terdekat...');
    try {
      const res = await PrinterService.scanAndConnectBluetooth();
      setPrinterStatusMsg(res.message);
      if (res.success && res.deviceName) {
        onSavePrinterConfig({
          ...printerConfig,
          connectedDeviceName: res.deviceName,
        });
      }
    } catch (e: any) {
      setPrinterStatusMsg('Gagal menyambungkan printer: ' + e.message);
    } finally {
      setIsScanning(false);
    }
  };

  const handleTestPrint = async () => {
    setPrinterStatusMsg('Mengirim sinyal tes cetak ke printer...');
    const dummyOrder: any = {
      id: 'test-print',
      receiptNumber: 'TEST-PRINT-001',
      type: 'meja',
      tableName: 'Meja Tes',
      customerName: 'Uji Coba Printer',
      items: [
        { menuId: '1', name: 'Bakso Urat Jumbo (Tes)', price: 25000, quantity: 1 },
        { menuId: '2', name: 'Es Teh Manis (Tes)', price: 5000, quantity: 1 },
      ],
      subtotal: 30000,
      discount: 0,
      tax: 0,
      total: 30000,
      status: 'paid',
      createdAt: new Date().toISOString(),
      paymentMethod: 'tunai',
      cashAmount: 50000,
      changeAmount: 20000,
    };

    const res = await PrinterService.printOrder(dummyOrder, profile, printerConfig, false);
    setPrinterStatusMsg(res.message);
    setTimeout(() => setPrinterStatusMsg(null), 3500);
  };

  // Menu Handlers
  const handleOpenAddMenu = () => {
    setEditingMenuItem(null);
    setMenuName('');
    setMenuCat('bakso_kuah');
    setMenuPrice(20000);
    setMenuDesc('');
    setIsMenuModalOpen(true);
  };

  const handleOpenEditMenu = (item: MenuItem) => {
    setEditingMenuItem(item);
    setMenuName(item.name);
    setMenuCat(item.category);
    setMenuPrice(item.price);
    setMenuDesc(item.description);
    setIsMenuModalOpen(true);
  };

  const handleSaveMenuSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuName.trim()) return;

    if (editingMenuItem) {
      const updated = menuList.map((m) =>
        m.id === editingMenuItem.id
          ? {
              ...m,
              name: menuName.trim(),
              category: menuCat,
              price: menuPrice,
              description: menuDesc.trim(),
            }
          : m
      );
      onSaveMenu(updated);
    } else {
      const newItem: MenuItem = {
        id: `menu-${Date.now()}`,
        name: menuName.trim(),
        category: menuCat,
        price: menuPrice,
        description: menuDesc.trim(),
        imageUrl: menuList[0]?.imageUrl || '',
        isAvailable: true,
      };
      onSaveMenu([...menuList, newItem]);
    }
    setIsMenuModalOpen(false);
  };

  const handleDeleteMenu = (id: string, name: string) => {
    if (confirm(`Yakin hapus menu "${name}"?`)) {
      onSaveMenu(menuList.filter((m) => m.id !== id));
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto p-3.5 space-y-3 pb-24 text-stone-900">
      {/* Sub-Tabs Switcher */}
      <div className="grid grid-cols-4 gap-1 bg-stone-200/80 p-1 rounded-2xl shrink-0">
        <button
          onClick={() => setActiveSubTab('toko')}
          className={`py-2 px-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
            activeSubTab === 'toko'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Store className="w-3.5 h-3.5 text-amber-600" />
          <span className="truncate">Resto</span>
        </button>

        <button
          onClick={() => setActiveSubTab('menu')}
          className={`py-2 px-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
            activeSubTab === 'menu'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <UtensilsCrossed className="w-3.5 h-3.5 text-red-600" />
          <span className="truncate">Menu</span>
        </button>

        <button
          onClick={() => setActiveSubTab('printer')}
          className={`py-2 px-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
            activeSubTab === 'printer'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Printer className="w-3.5 h-3.5 text-emerald-600" />
          <span className="truncate">Printer</span>
        </button>

        <button
          onClick={() => setActiveSubTab('qris')}
          className={`py-2 px-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
            activeSubTab === 'qris'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <QrCode className="w-3.5 h-3.5 text-blue-600" />
          <span className="truncate">QRIS</span>
        </button>
      </div>

      {/* TAB 1: PROFIL RESTO */}
      {activeSubTab === 'toko' && (
        <form onSubmit={handleSaveProfileSubmit} className="space-y-3">
          <div className="p-4 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-3">
            <h3 className="text-xs font-extrabold text-stone-900 uppercase tracking-wider">
              Identitas Restoran & Struk
            </h3>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Nama Toko / Resto:
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Slogan / Deskripsi:
              </label>
              <input
                type="text"
                value={slogan}
                onChange={(e) => setSlogan(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nomor Telepon:
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Mata Uang:
                </label>
                <input
                  type="text"
                  disabled
                  value="Rp (IDR)"
                  className="w-full px-3 py-2 bg-stone-100 border border-stone-200 rounded-xl text-xs text-stone-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Alamat Lengkap:
              </label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Pesan Header Struk (Atas):
              </label>
              <input
                type="text"
                value={receiptHeader}
                onChange={(e) => setReceiptHeader(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Pesan Footer Struk (Bawah):
              </label>
              <input
                type="text"
                value={receiptFooter}
                onChange={(e) => setReceiptFooter(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-hidden focus:border-amber-500"
              />
            </div>
          </div>

          {profileSavedMsg && (
            <div className="p-3 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-2xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Profil berhasil disimpan dan diperbarui!</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-red-700 to-amber-600 text-white font-bold text-xs shadow-md active:scale-98 transition-all"
          >
            Simpan Perubahan Profil
          </button>
        </form>
      )}

      {/* TAB 2: KELOLA MENU */}
      {activeSubTab === 'menu' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-stone-800">
              Daftar Menu ({menuList.length} Item)
            </span>
            <button
              onClick={handleOpenAddMenu}
              className="px-3 py-1.5 rounded-xl bg-red-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Menu Baru</span>
            </button>
          </div>

          <div className="space-y-2">
            {menuList.map((m) => (
              <div
                key={m.id}
                className="p-3 rounded-2xl bg-white border border-stone-200 shadow-xs flex items-center gap-3"
              >
                <img
                  src={m.imageUrl}
                  alt={m.name}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-xl object-cover shrink-0 border border-stone-200"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-xs text-stone-900 truncate">{m.name}</h4>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-stone-100 text-stone-600 uppercase font-semibold">
                      {m.category.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="font-extrabold text-amber-700 text-xs mt-0.5">
                    {formatCurrency(m.price)}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleOpenEditMenu(m)}
                    className="p-2 rounded-xl bg-stone-100 text-stone-700 hover:bg-stone-200"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteMenu(m.id, m.name)}
                    className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: BLUETOOTH THERMAL PRINTER */}
      {activeSubTab === 'printer' && (
        <div className="space-y-3">
          {/* Status Box */}
          <div className="p-4 rounded-3xl bg-stone-900 text-stone-100 border border-stone-800 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Bluetooth className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white">Printer Thermal Bluetooth</h4>
                  <p className="text-[10px] text-stone-400">Koneksi printer mobile kasir</p>
                </div>
              </div>

              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                Terkoneksi
              </span>
            </div>

            <div className="p-3 bg-stone-950 rounded-2xl border border-stone-800 space-y-1">
              <div className="text-[11px] text-stone-400">Nama Perangkat:</div>
              <div className="font-bold text-sm text-amber-400 font-mono">
                {printerConfig.connectedDeviceName || 'POS-58-BT (Thermal)'}
              </div>
            </div>

            {/* Scan & Connect Button */}
            <button
              onClick={handleScanBluetooth}
              disabled={isScanning}
              className="w-full py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs flex items-center justify-center gap-2 border border-stone-700 active:scale-98 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Memindai Bluetooth...' : 'Pindai & Hubungkan Printer'}</span>
            </button>
          </div>

          {printerStatusMsg && (
            <div className="p-3 bg-stone-800 text-amber-300 border border-amber-500/30 rounded-2xl text-xs font-medium flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{printerStatusMsg}</span>
            </div>
          )}

          {/* Paper Size Setting */}
          <div className="p-4 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              Ukuran Kertas Thermal
            </h4>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onSavePrinterConfig({ ...printerConfig, paperSize: '58mm' })}
                className={`p-3 rounded-2xl border-2 text-center transition-all ${
                  printerConfig.paperSize === '58mm'
                    ? 'border-amber-500 bg-amber-50/50 text-stone-950 font-bold'
                    : 'border-stone-200 text-stone-500 hover:border-stone-300'
                }`}
              >
                <div className="text-sm font-extrabold">58 mm</div>
                <div className="text-[10px] text-stone-400 mt-0.5">Standar Mini POS (32 Kolom)</div>
              </button>

              <button
                type="button"
                onClick={() => onSavePrinterConfig({ ...printerConfig, paperSize: '80mm' })}
                className={`p-3 rounded-2xl border-2 text-center transition-all ${
                  printerConfig.paperSize === '80mm'
                    ? 'border-amber-500 bg-amber-50/50 text-stone-950 font-bold'
                    : 'border-stone-200 text-stone-500 hover:border-stone-300'
                }`}
              >
                <div className="text-sm font-extrabold">80 mm</div>
                <div className="text-[10px] text-stone-400 mt-0.5">Lebar Resto (48 Kolom)</div>
              </button>
            </div>

            {/* Test Print Button */}
            <div className="pt-2">
              <button
                onClick={handleTestPrint}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-red-700 to-amber-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all"
              >
                <Printer className="w-4 h-4 text-amber-300" />
                <span>Uji Coba Tes Cetak Struk (Test Print)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PENGATURAN QRIS USAHA WARGA */}
      {activeSubTab === 'qris' && (
        <div className="p-4 bg-slate-900 text-white rounded-3xl border border-emerald-500/30 max-w-md mx-auto shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-emerald-400 mb-1 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-emerald-400" /> ⚙️ Pengaturan QRIS Pembayaran
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload QRIS bebas dari provider mana saja (ShopeePay, BCA, GoPay, dll). QRIS Statis tetap bisa di-scan dari semua aplikasi!
            </p>
          </div>

          {qrisSavedMsg && (
            <div className="text-xs p-2.5 bg-emerald-950 border border-emerald-500/50 text-emerald-300 rounded-xl flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>✅ Data QRIS berhasil disimpan ke sistem!</span>
            </div>
          )}

          <form id="qrisForm" onSubmit={handleSaveQris} className="space-y-4">
            {/* Pilihan Penyedia */}
            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-300">
                Penyedia QRIS Utama
              </label>
              <select
                id="qrisProvider"
                value={qrisProvider}
                onChange={(e) => setQrisProvider(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="ShopeePay">ShopeePay / SeaBank (Banyak Promo/Hemat)</option>
                <option value="BCA Merchant">BCA Merchant / m-BCA</option>
                <option value="GoPay Merchant">GoPay / GoBiz</option>
                <option value="BRImo / Livin">Bank Himbara (BRI / Mandiri)</option>
                <option value="DANA / OVO">DANA Bisnis / OVO</option>
                <option value="Lainnya">Lainnya (Universal QRIS)</option>
              </select>
            </div>

            {/* Upload Gambar QRIS */}
            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-300">
                Upload Foto Kode QRIS
              </label>
              <input
                type="file"
                id="qrisImageInput"
                accept="image/*"
                onChange={handleQrisImageChange}
                className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer"
              />
            </div>

            {/* Preview QRIS */}
            {base64QrisImage ? (
              <div id="qrisPreviewContainer" className="text-center bg-slate-800 p-3 rounded-2xl border border-slate-700 space-y-2">
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span className="font-semibold text-emerald-400">Preview QRIS ({qrisProvider}):</span>
                  <button
                    type="button"
                    onClick={() => setBase64QrisImage('')}
                    className="text-rose-400 hover:text-rose-300 flex items-center gap-1 text-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Hapus Foto
                  </button>
                </div>
                <img
                  id="qrisImgPreview"
                  src={base64QrisImage}
                  alt="Preview QRIS"
                  className="max-h-56 mx-auto rounded-xl shadow-md border border-slate-600 bg-white p-2 object-contain"
                />
                {qrisNote && (
                  <p className="text-xs text-amber-300 font-mono bg-slate-950 p-2 rounded-xl border border-slate-700">
                    💡 {qrisNote}
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center p-4 border border-dashed border-slate-700 rounded-2xl bg-slate-950/40 text-slate-500 text-xs">
                Belum ada foto QRIS diunggah. Foto akan disimpan dalam format Base64 dan bekerja secara offline.
              </div>
            )}

            {/* Catatan Tambahan */}
            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-300">
                Catatan/Petunjuk Pembayaran (Opsional)
              </label>
              <input
                type="text"
                id="qrisNote"
                value={qrisNote}
                onChange={(e) => setQrisNote(e.target.value)}
                placeholder="Contoh: Kirim bukti transfer via WA ke 0812xxx"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg transition active:scale-95 flex items-center justify-center gap-2"
              >
                <span>💾 Simpan QRIS Usaha</span>
              </button>
              {qrisData && (
                <button
                  type="button"
                  onClick={handleRemoveQris}
                  className="p-3 bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded-xl text-xs transition active:scale-95"
                  title="Hapus data QRIS"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Menu Modal (Add / Edit) */}
      {isMenuModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsMenuModalOpen(false)} />
          <div className="relative w-full max-w-sm bg-stone-900 text-stone-100 rounded-3xl p-4 shadow-2xl border border-stone-800 z-10 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="text-sm font-bold text-white">
                {editingMenuItem ? 'Edit Menu' : 'Tambah Menu Baru'}
              </h3>
              <button onClick={() => setIsMenuModalOpen(false)} className="p-1 rounded-full text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMenuSubmit} className="space-y-3 pt-3 text-xs">
              <div>
                <label className="block text-stone-300 font-semibold mb-1">Nama Menu:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bakso Urat Keju"
                  value={menuName}
                  onChange={(e) => setMenuName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Kategori:</label>
                  <select
                    value={menuCat}
                    onChange={(e: any) => setMenuCat(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white focus:outline-hidden focus:border-amber-500"
                  >
                    <option value="bakso_kuah">Bakso Kuah</option>
                    <option value="pelengkap">Pelengkap</option>
                    <option value="minuman">Minuman Segar</option>
                    <option value="paket">Paket Hemat</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Harga (Rp):</label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={1000}
                    value={menuPrice}
                    onChange={(e) => setMenuPrice(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white font-mono focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">Deskripsi Porsi:</label>
                <textarea
                  rows={2}
                  placeholder="Isi dan kelengkapan mangkuk..."
                  value={menuDesc}
                  onChange={(e) => setMenuDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsMenuModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-700 to-amber-600 text-white font-bold shadow-md"
                >
                  Simpan Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
