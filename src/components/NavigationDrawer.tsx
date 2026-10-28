import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Settings,
  Mail,
  Lock,
  Phone,
  Sun,
  Moon,
  Smartphone,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  Sparkles,
  ArrowLeftRight,
  Database,
  Store,
  Users
} from 'lucide-react';
import { GeneralAccountSettings, AppTheme } from '../types/generalSettings';
import { GeneralSettingsService } from '../services/generalSettingsService';
import { RestaurantProfile, PrinterConfig } from '../types';
import { PWAInstallModal } from './pwa/PWAInstallModal';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenSwitchModul?: () => void;
  profile: RestaurantProfile;
  printerConfig: PrinterConfig;
  occupiedTablesCount: number;
  activeOrdersCount?: number;
  onDataRestored?: () => void;
  onShowNotification?: (msg: string) => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  onOpenSwitchModul,
  profile,
  printerConfig,
  occupiedTablesCount,
  activeOrdersCount = 0,
  onDataRestored,
  onShowNotification,
}) => {
  // General Settings State
  const [settings, setSettings] = useState<GeneralAccountSettings>(GeneralSettingsService.getSettings());

  // Form expansion states
  const [activeForm, setActiveForm] = useState<'none' | 'email' | 'password' | 'phone'>('none');

  // Input states
  const [newEmail, setNewEmail] = useState<string>('');
  const [newPhone, setNewPhone] = useState<string>('');
  const [oldPassword, setOldPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Auto-update checking state
  const [isCheckingUpdate, setIsCheckingUpdate] = useState<boolean>(false);
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);

  // Reset modal state
  const [resetModalOpen, setResetModalOpen] = useState<boolean>(false);
  const [resetType, setResetType] = useState<'transactions' | 'factory'>('transactions');

  // Hidden File input ref for restore
  const fileInputRef = useRef<HTMLInputElement>(null);

  // PWA Install Modal state
  const [showPWAInstall, setShowPWAInstall] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      const current = GeneralSettingsService.getSettings();
      setSettings(current);
      setNewEmail(current.email);
      setNewPhone(current.phone);
      setActiveForm('none');
      setUpdateStatus(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const notify = (msg: string) => {
    if (onShowNotification) {
      onShowNotification(msg);
    } else {
      alert(msg);
    }
  };

  // Handle Theme Change
  const handleThemeSelect = (theme: AppTheme) => {
    const updated = GeneralSettingsService.setTheme(theme);
    setSettings(updated);
    notify(`Tema diubah ke ${theme === 'dark' ? 'Mode Gelap' : theme === 'light' ? 'Mode Terang' : 'Sistem'}`);
  };

  // Handle Email Update
  const handleSaveEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes('@')) {
      notify('Format email tidak valid');
      return;
    }
    const updated = GeneralSettingsService.updateEmail(newEmail);
    setSettings(updated);
    setActiveForm('none');
    notify('Email login berhasil diperbarui');
  };

  // Handle Phone Update
  const handleSavePhone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhone || newPhone.trim().length < 8) {
      notify('Nomor HP minimal 8 digit');
      return;
    }
    const updated = GeneralSettingsService.updatePhone(newPhone);
    setSettings(updated);
    setActiveForm('none');
    notify('Nomor HP berhasil diperbarui');
  };

  // Handle Password Change
  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      notify('Password baru minimal 6 karakter');
      return;
    }
    if (newPassword !== confirmPassword) {
      notify('Konfirmasi password tidak cocok');
      return;
    }
    const updated = GeneralSettingsService.updatePassword();
    setSettings(updated);
    setActiveForm('none');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    notify('Password berhasil diubah');
  };

  // Handle Auto Update Toggle
  const handleToggleAutoUpdate = () => {
    const nextVal = !settings.autoUpdate;
    const updated = GeneralSettingsService.toggleAutoUpdate(nextVal);
    setSettings(updated);
    notify(nextVal ? 'Pembaruan otomatis diaktifkan' : 'Pembaruan otomatis dinonaktifkan');
  };

  // Check for updates simulation
  const handleCheckUpdate = () => {
    setIsCheckingUpdate(true);
    setUpdateStatus(null);
    setTimeout(() => {
      setIsCheckingUpdate(false);
      setUpdateStatus('Aplikasi menggunakan versi terbaru (v1.2.0)');
    }, 1200);
  };

  // Handle Backup
  const handleBackup = () => {
    try {
      GeneralSettingsService.generateFullBackup();
      const current = GeneralSettingsService.getSettings();
      setSettings(current);
      notify('Cadangan data berhasil di-download (.json)');
    } catch (e) {
      notify('Gagal membuat file backup.');
    }
  };

  // Handle Restore file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        const res = GeneralSettingsService.restoreFromBackup(parsed);
        if (res.success) {
          notify(res.message);
          setSettings(GeneralSettingsService.getSettings());
          if (onDataRestored) onDataRestored();
          onClose();
        } else {
          notify(res.message);
        }
      } catch (err) {
        notify('File JSON cadangan rusak atau tidak valid.');
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  // Handle Reset Execution
  const handleExecuteReset = () => {
    if (resetType === 'transactions') {
      GeneralSettingsService.resetTransactions();
      notify('Data transaksi dan meja kasir telah di-reset');
    } else {
      GeneralSettingsService.resetFactoryAll();
      notify('Aplikasi berhasil di-reset ke setelan awal pabrik');
    }
    setResetModalOpen(false);
    if (onDataRestored) onDataRestored();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer Container (Sidebar Hidden Kiri) */}
      <div className="relative w-[86%] max-w-[340px] h-full bg-stone-900 text-stone-100 flex flex-col z-10 shadow-2xl animate-in slide-in-from-left duration-250 ease-out border-r border-stone-800 overflow-hidden">
        
        {/* Header Setting Umum */}
        <div className="p-4 bg-gradient-to-r from-stone-950 via-stone-900 to-stone-900 border-b border-stone-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-xs">
              <Settings className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-1.5">
                Setting Umum
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {settings.appVersion}
                </span>
              </h2>
              <p className="text-[10px] text-stone-400">Pengaturan Akun & Sistem WargaQu</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-white bg-stone-800/80 hover:bg-stone-750 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">

          {/* 1. TEMA DARK / LIGHT */}
          <div className="bg-stone-850/80 rounded-2xl p-3 border border-stone-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-stone-200">
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Tema Tampilan</span>
              </div>
              <span className="text-[10px] text-stone-400 capitalize">{settings.theme} Mode</span>
            </div>

            {/* 3-Way Segment Switcher */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-900/90 rounded-xl border border-stone-800">
              <button
                type="button"
                onClick={() => handleThemeSelect('dark')}
                className={`py-1.5 px-2 rounded-lg flex flex-col items-center justify-center gap-1 text-[10px] font-bold transition-all ${
                  settings.theme === 'dark'
                    ? 'bg-amber-500 text-stone-950 shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Gelap</span>
              </button>

              <button
                type="button"
                onClick={() => handleThemeSelect('light')}
                className={`py-1.5 px-2 rounded-lg flex flex-col items-center justify-center gap-1 text-[10px] font-bold transition-all ${
                  settings.theme === 'light'
                    ? 'bg-amber-500 text-stone-950 shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Terang</span>
              </button>

              <button
                type="button"
                onClick={() => handleThemeSelect('system')}
                className={`py-1.5 px-2 rounded-lg flex flex-col items-center justify-center gap-1 text-[10px] font-bold transition-all ${
                  settings.theme === 'system'
                    ? 'bg-amber-500 text-stone-950 shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Sistem</span>
              </button>
            </div>
          </div>

          {/* 2. AKUN & LOGIN EMAIL */}
          <div className="bg-stone-850/80 rounded-2xl p-3 border border-stone-800/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-stone-200">
                <Mail className="w-4 h-4 text-emerald-400" />
                <span>Login Email</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/80 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5" />
                Terhubung
              </span>
            </div>

            <div className="bg-stone-900/90 rounded-xl p-2.5 border border-stone-800 flex items-center justify-between">
              <div className="overflow-hidden">
                <div className="text-[10px] text-stone-400">Email Akun Utama:</div>
                <div className="font-semibold text-stone-100 truncate text-[11px]">{settings.email}</div>
              </div>
              <button
                onClick={() => setActiveForm(activeForm === 'email' ? 'none' : 'email')}
                className="px-2 py-1 bg-stone-800 hover:bg-stone-750 text-amber-300 rounded-lg text-[10px] font-semibold transition-colors shrink-0 ml-2"
              >
                {activeForm === 'email' ? 'Tutup' : 'Ubah'}
              </button>
            </div>

            {/* Email Edit Form */}
            {activeForm === 'email' && (
              <form onSubmit={handleSaveEmail} className="p-2.5 bg-stone-900 rounded-xl border border-amber-500/30 space-y-2 animate-in fade-in duration-150">
                <label className="text-[10px] font-medium text-stone-300">Masukkan Email Baru:</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="contoh@gmail.com"
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-amber-400"
                  required
                />
                <div className="flex justify-end gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setActiveForm('none')}
                    className="px-2.5 py-1 text-[10px] bg-stone-800 text-stone-300 rounded-lg"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 text-[10px] font-bold bg-amber-500 text-stone-950 rounded-lg hover:bg-amber-400"
                  >
                    Simpan Email
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* 3. PASSWORD & KEAMANAN */}
          <div className="bg-stone-850/80 rounded-2xl p-3 border border-stone-800/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-stone-200">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Password Akun</span>
              </div>
              <span className="text-[10px] text-stone-400">Diubah: {settings.lastPasswordChange}</span>
            </div>

            <div className="bg-stone-900/90 rounded-xl p-2.5 border border-stone-800 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-stone-400">Kata Sandi:</div>
                <div className="font-mono text-stone-300 text-[11px]">••••••••••••</div>
              </div>
              <button
                onClick={() => setActiveForm(activeForm === 'password' ? 'none' : 'password')}
                className="px-2 py-1 bg-stone-800 hover:bg-stone-750 text-amber-300 rounded-lg text-[10px] font-semibold transition-colors"
              >
                {activeForm === 'password' ? 'Tutup' : 'Ubah Password'}
              </button>
            </div>

            {/* Password Edit Form */}
            {activeForm === 'password' && (
              <form onSubmit={handleSavePassword} className="p-2.5 bg-stone-900 rounded-xl border border-amber-500/30 space-y-2 animate-in fade-in duration-150">
                <div>
                  <label className="text-[10px] text-stone-300">Password Lama:</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Masukkan password saat ini"
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg px-2.5 py-1 text-white text-xs mt-0.5"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-stone-300">Password Baru (min 6 char):</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Password baru"
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg px-2.5 py-1 text-white text-xs mt-0.5"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-stone-300">Konfirmasi Password Baru:</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi password baru"
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg px-2.5 py-1 text-white text-xs mt-0.5"
                    required
                  />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[10px] text-stone-400 hover:text-stone-200 flex items-center gap-1"
                  >
                    {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showPassword ? 'Sembunyikan' : 'Lihat'}</span>
                  </button>

                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setActiveForm('none')}
                      className="px-2 py-1 text-[10px] bg-stone-800 text-stone-300 rounded-lg"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 text-[10px] font-bold bg-amber-500 text-stone-950 rounded-lg hover:bg-amber-400"
                    >
                      Simpan
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* 4. NO HP & GANTI HP */}
          <div className="bg-stone-850/80 rounded-2xl p-3 border border-stone-800/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-stone-200">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>Nomor Handphone</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/80 font-medium">
                Aktif / WA
              </span>
            </div>

            <div className="bg-stone-900/90 rounded-xl p-2.5 border border-stone-800 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-stone-400">No. Terdaftar:</div>
                <div className="font-semibold text-stone-100 text-[11px] font-mono">{settings.phone}</div>
              </div>
              <button
                onClick={() => setActiveForm(activeForm === 'phone' ? 'none' : 'phone')}
                className="px-2 py-1 bg-stone-800 hover:bg-stone-750 text-amber-300 rounded-lg text-[10px] font-semibold transition-colors"
              >
                {activeForm === 'phone' ? 'Tutup' : 'Ganti HP'}
              </button>
            </div>

            {/* Phone Edit Form */}
            {activeForm === 'phone' && (
              <form onSubmit={handleSavePhone} className="p-2.5 bg-stone-900 rounded-xl border border-amber-500/30 space-y-2 animate-in fade-in duration-150">
                <label className="text-[10px] font-medium text-stone-300">Masukkan No HP Baru (WhatsApp):</label>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="0812xxxxxxxx / +62..."
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg px-2.5 py-1.5 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
                  required
                />
                <div className="flex justify-end gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setActiveForm('none')}
                    className="px-2.5 py-1 text-[10px] bg-stone-800 text-stone-300 rounded-lg"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 text-[10px] font-bold bg-amber-500 text-stone-950 rounded-lg hover:bg-amber-400"
                  >
                    Simpan No HP
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* 5. PEMBARUAN OTOMATIS (UPDATE AUTO) */}
          <div className="bg-stone-850/80 rounded-2xl p-3 border border-stone-800/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-stone-200">
                <RefreshCw className="w-4 h-4 text-cyan-400" />
                <span>Pembaruan Otomatis</span>
              </div>
              <button
                type="button"
                onClick={handleToggleAutoUpdate}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.autoUpdate ? 'bg-emerald-500' : 'bg-stone-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    settings.autoUpdate ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="bg-stone-900/90 rounded-xl p-2.5 border border-stone-800 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-stone-400">Status Update:</span>
                <span className="font-semibold text-emerald-400">
                  {settings.autoUpdate ? 'Aktif (Wi-Fi & Data)' : 'Manual'}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-stone-400">
                <span>Versi Terpasang:</span>
                <span className="font-mono text-stone-200">{settings.appVersion} ({settings.buildNumber})</span>
              </div>

              {updateStatus && (
                <div className="text-[10px] p-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 rounded-lg flex items-center gap-1.5 animate-in fade-in">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{updateStatus}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleCheckUpdate}
                disabled={isCheckingUpdate}
                className="w-full py-1.5 px-2 bg-stone-800 hover:bg-stone-750 text-stone-200 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isCheckingUpdate ? 'animate-spin' : ''}`} />
                <span>{isCheckingUpdate ? 'Memeriksa Server...' : 'Cek Pembaruan Versi'}</span>
              </button>
            </div>
          </div>

          {/* 6. CADANGKAN, PULIHKAN & RESET (BACKUP, RESTORE, RESET) */}
          <div className="bg-stone-850/80 rounded-2xl p-3 border border-stone-800/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-stone-200">
                <Database className="w-4 h-4 text-purple-400" />
                <span>Manajemen Data</span>
              </div>
              <span className="text-[10px] text-stone-400">JSON Offline</span>
            </div>

            <p className="text-[10px] text-stone-400 leading-relaxed">
              Amankan seluruh data kasir, menu, omset, dan kependudukan RTQu Anda secara lokal.
            </p>

            <div className="space-y-2">
              {/* Backup Button */}
              <button
                onClick={handleBackup}
                className="w-full py-2 px-3 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-800/60 text-purple-200 flex items-center justify-between text-xs font-semibold transition-all active:scale-95"
              >
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-purple-400" />
                  <div className="text-left">
                    <div className="text-[11px] font-bold">Backup Data (Download JSON)</div>
                    <div className="text-[9px] text-stone-400">
                      {settings.lastBackupAt ? `Terakhir: ${settings.lastBackupAt}` : 'Belum pernah dicadangkan'}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-purple-400" />
              </button>

              {/* Restore Button */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 px-3 rounded-xl bg-blue-950/40 hover:bg-blue-900/50 border border-blue-800/60 text-blue-200 flex items-center justify-between text-xs font-semibold transition-all active:scale-95"
              >
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-blue-400" />
                  <div className="text-left">
                    <div className="text-[11px] font-bold">Restore Data (Upload JSON)</div>
                    <div className="text-[9px] text-stone-400">Pulihkan dari file cadangan</div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-blue-400" />
              </button>

              {/* Reset Button */}
              <button
                onClick={() => setResetModalOpen(true)}
                className="w-full py-2 px-3 rounded-xl bg-red-950/40 hover:bg-red-900/50 border border-red-800/50 text-red-300 flex items-center justify-between text-xs font-semibold transition-all active:scale-95"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <div className="text-left">
                    <div className="text-[11px] font-bold">Reset Data Aplikasi</div>
                    <div className="text-[9px] text-red-400/80">Bersihkan transaksi atau reset pabrik</div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-red-400" />
              </button>
            </div>
          </div>

          {/* PWA INSTALL DI HP (ANDROID & IPHONE) */}
          <div className="bg-gradient-to-r from-emerald-950/60 to-teal-950/60 rounded-2xl p-3 border border-emerald-600/40 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-emerald-300">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Instal di Smartphone</span>
              </div>
              <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-emerald-500 text-stone-950">
                PWA / Offline
              </span>
            </div>
            <p className="text-[10px] text-stone-300 leading-relaxed">
              Pasang WargaQu langsung di layar utama Android atau iPhone tanpa perlu download dari PlayStore/AppStore.
            </p>
            <button
              type="button"
              onClick={() => setShowPWAInstall(true)}
              className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 text-xs shadow-md shadow-emerald-950/50 active:scale-95 transition"
            >
              <Download className="w-4 h-4" />
              <span>Instal WargaQu di HP</span>
            </button>
          </div>

          {/* 7. QUICK ACCESS SWITCH MODUL */}
          {onOpenSwitchModul && (
            <div className="pt-1">
              <button
                onClick={() => {
                  onClose();
                  onOpenSwitchModul();
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-red-600/20 border border-amber-500/40 text-amber-300 hover:text-white hover:bg-amber-500/30 flex items-center justify-between text-xs font-bold transition-all active:scale-95 shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <ArrowLeftRight className="w-4 h-4 text-amber-400" />
                  <span>Buka Switch Modul</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500 text-stone-950 font-black">
                  Ganti
                </span>
              </button>
            </div>
          )}

        </div>

        {/* Footer info */}
        <div className="p-3 text-center border-t border-stone-800 text-[10px] text-stone-400 bg-stone-950/80 shrink-0">
          Ekosistem WargaQu · PWA & Android Ready
        </div>
      </div>

      {/* PWA Install Modal */}
      <PWAInstallModal
        isOpen={showPWAInstall}
        onClose={() => setShowPWAInstall(false)}
      />

      {/* Confirmation Modal for Reset Data */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-red-800/60 rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-950 text-red-400 flex items-center justify-center border border-red-800">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-sm">Pilih Jenis Reset</h3>
                <p className="text-[11px] text-stone-400">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>

            <div className="space-y-2">
              <label
                onClick={() => setResetType('transactions')}
                className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                  resetType === 'transactions'
                    ? 'bg-amber-950/40 border-amber-500/60 text-amber-200'
                    : 'bg-stone-800 border-stone-700 text-stone-300'
                }`}
              >
                <input
                  type="radio"
                  name="resetType"
                  checked={resetType === 'transactions'}
                  onChange={() => setResetType('transactions')}
                  className="mt-0.5"
                />
                <div>
                  <div className="font-bold text-xs">1. Bersihkan Transaksi Kasir Saja</div>
                  <div className="text-[10px] text-stone-400 mt-0.5">
                    Hanya mereset pesanan meja & riwayat omset. Daftar menu & data warga RTQu tetap aman tersimpan.
                  </div>
                </div>
              </label>

              <label
                onClick={() => setResetType('factory')}
                className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                  resetType === 'factory'
                    ? 'bg-red-950/50 border-red-500 text-red-200'
                    : 'bg-stone-800 border-stone-700 text-stone-300'
                }`}
              >
                <input
                  type="radio"
                  name="resetType"
                  checked={resetType === 'factory'}
                  onChange={() => setResetType('factory')}
                  className="mt-0.5"
                />
                <div>
                  <div className="font-bold text-xs">2. Reset Total Pabrik (Factory Reset)</div>
                  <div className="text-[10px] text-stone-400 mt-0.5">
                    Menghapus seluruh modifikasi dan mengembalikan data KasirQu & RTQu ke sampel awal bawaan.
                  </div>
                </div>
              </label>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setResetModalOpen(false)}
                className="flex-1 py-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-300 text-xs font-semibold"
              >
                Batalkan
              </button>
              <button
                type="button"
                onClick={handleExecuteReset}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold shadow-lg shadow-red-900/40"
              >
                Lanjutkan Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
