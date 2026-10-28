import { GeneralAccountSettings, BackupDataPayload, AppTheme } from '../types/generalSettings';
import { StorageService, DEFAULT_PROFILE, DEFAULT_PRINTER, DEFAULT_TABLES, DEFAULT_MENU } from './storage';
import { RtStorageService, INITIAL_SETTINGS, INITIAL_CITIZENS } from './rtStorage';

const SETTINGS_KEY = 'qu_general_settings_v1';

export const DEFAULT_GENERAL_SETTINGS: GeneralAccountSettings = {
  email: 'hendri.bageur20@gmail.com',
  isEmailVerified: true,
  phone: '+62 812-3456-7890',
  isPhoneVerified: true,
  name: 'Hendri Bageur',
  lastPasswordChange: '27 Sep 2026',
  theme: 'dark',
  autoUpdate: true,
  lastBackupAt: null,
  appVersion: 'v1.2.0',
  buildNumber: 'Build 2026.10',
};

export const GeneralSettingsService = {
  getSettings(): GeneralAccountSettings {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        return { ...DEFAULT_GENERAL_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Failed reading general settings:', e);
    }
    return DEFAULT_GENERAL_SETTINGS;
  },

  saveSettings(settings: GeneralAccountSettings): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed saving general settings:', e);
    }
  },

  updateEmail(email: string): GeneralAccountSettings {
    const current = this.getSettings();
    const updated: GeneralAccountSettings = {
      ...current,
      email: email.trim(),
      isEmailVerified: true,
    };
    this.saveSettings(updated);
    return updated;
  },

  updatePhone(phone: string): GeneralAccountSettings {
    const current = this.getSettings();
    const updated: GeneralAccountSettings = {
      ...current,
      phone: phone.trim(),
      isPhoneVerified: true,
    };
    this.saveSettings(updated);
    return updated;
  },

  updatePassword(): GeneralAccountSettings {
    const current = this.getSettings();
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    const updated: GeneralAccountSettings = {
      ...current,
      lastPasswordChange: dateFormatted,
    };
    this.saveSettings(updated);
    return updated;
  },

  setTheme(theme: AppTheme): GeneralAccountSettings {
    const current = this.getSettings();
    const updated: GeneralAccountSettings = {
      ...current,
      theme,
    };
    this.saveSettings(updated);
    this.applyThemeToDOM(theme);
    return updated;
  },

  toggleAutoUpdate(enabled: boolean): GeneralAccountSettings {
    const current = this.getSettings();
    const updated: GeneralAccountSettings = {
      ...current,
      autoUpdate: enabled,
    };
    this.saveSettings(updated);
    return updated;
  },

  applyThemeToDOM(theme: AppTheme): void {
    const root = document.documentElement;
    const body = document.body;

    let effectiveTheme = theme;
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      effectiveTheme = prefersDark ? 'dark' : 'light';
    }

    if (effectiveTheme === 'light') {
      root.classList.add('theme-light');
      root.classList.remove('dark');
      body.classList.add('theme-light');
      body.classList.remove('bg-stone-900', 'text-stone-100');
      body.classList.add('bg-slate-100', 'text-slate-900');
    } else {
      root.classList.remove('theme-light');
      root.classList.add('dark');
      body.classList.remove('theme-light');
      body.classList.remove('bg-slate-100', 'text-slate-900');
      body.classList.add('bg-stone-900', 'text-stone-100');
    }
  },

  // Perform full Backup to JSON download
  generateFullBackup(): BackupDataPayload {
    const gen = this.getSettings();
    const payload: BackupDataPayload = {
      version: '1.2.0',
      exportedAt: new Date().toISOString(),
      appName: 'Ekosistem Qu (KasirQu & PaguyubanQu)',
      modules: {
        kasirqu: {
          tables: StorageService.getTables(),
          menu: StorageService.getMenu(),
          activeOrders: StorageService.getActiveOrders(),
          history: StorageService.getHistory(),
          ingredients: StorageService.getIngredients(),
          profile: StorageService.getProfile(),
          printer: StorageService.getPrinterConfig(),
        },
        rtqu: {
          citizens: RtStorageService.getCitizens(),
          iuran: RtStorageService.getIuran(),
          cashbook: RtStorageService.getCashBook(),
          board: RtStorageService.getBoard(),
          assets: RtStorageService.getAssets(),
          announcements: RtStorageService.getAnnouncements(),
          settings: RtStorageService.getSettings(),
        },
        generalSettings: gen,
      },
    };

    // Update last backup timestamp
    const nowStr = new Date().toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    this.saveSettings({ ...gen, lastBackupAt: nowStr });

    // Download JSON file to user device
    const jsonString = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    link.href = url;
    link.download = `backup_ekosistem_qu_${dateStamp}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return payload;
  },

  // Restore data from parsed JSON
  restoreFromBackup(payload: any): { success: boolean; message: string } {
    try {
      if (!payload || typeof payload !== 'object') {
        return { success: false, message: 'Format file cadangan tidak valid.' };
      }

      const modules = payload.modules || {};

      // Restore KasirQu
      if (modules.kasirqu) {
        if (Array.isArray(modules.kasirqu.tables)) StorageService.saveTables(modules.kasirqu.tables);
        if (Array.isArray(modules.kasirqu.menu)) StorageService.saveMenu(modules.kasirqu.menu);
        if (modules.kasirqu.activeOrders) StorageService.saveActiveOrders(modules.kasirqu.activeOrders);
        if (Array.isArray(modules.kasirqu.history)) {
          localStorage.setItem('baksoqu_history_v1', JSON.stringify(modules.kasirqu.history));
        }
        if (Array.isArray(modules.kasirqu.ingredients)) StorageService.saveIngredients(modules.kasirqu.ingredients);
        if (modules.kasirqu.profile) StorageService.saveProfile(modules.kasirqu.profile);
        if (modules.kasirqu.printer) StorageService.savePrinterConfig(modules.kasirqu.printer);
      }

      // Restore PaguyubanQu / RTQu
      if (modules.rtqu) {
        if (Array.isArray(modules.rtqu.citizens)) RtStorageService.saveCitizens(modules.rtqu.citizens);
        if (Array.isArray(modules.rtqu.iuran)) RtStorageService.saveIuran(modules.rtqu.iuran);
        if (Array.isArray(modules.rtqu.cashbook)) RtStorageService.saveCashBook(modules.rtqu.cashbook);
        if (Array.isArray(modules.rtqu.board)) RtStorageService.saveBoard(modules.rtqu.board);
        if (Array.isArray(modules.rtqu.assets)) RtStorageService.saveAssets(modules.rtqu.assets);
        if (Array.isArray(modules.rtqu.announcements)) RtStorageService.saveAnnouncements(modules.rtqu.announcements);
        if (modules.rtqu.settings) RtStorageService.saveSettings(modules.rtqu.settings);
      }

      // Restore General Settings
      if (modules.generalSettings) {
        this.saveSettings({
          ...DEFAULT_GENERAL_SETTINGS,
          ...modules.generalSettings,
          lastBackupAt: new Date().toLocaleString('id-ID'),
        });
        if (modules.generalSettings.theme) {
          this.applyThemeToDOM(modules.generalSettings.theme);
        }
      }

      return {
        success: true,
        message: 'Data seluruh modul aplikasi berhasil dipulihkan dari cadangan.',
      };
    } catch (e: any) {
      console.error('Error during restore:', e);
      return { success: false, message: `Gagal memulihkan: ${e.message || 'Data korup'}` };
    }
  },

  // Reset only transactions & active orders
  resetTransactions(): void {
    StorageService.saveActiveOrders({});
    localStorage.setItem('baksoqu_history_v1', JSON.stringify([]));
    const freshTables = DEFAULT_TABLES.map((t) => ({ ...t, status: 'kosong' as const }));
    StorageService.saveTables(freshTables);
  },

  // Full Factory Reset
  resetFactoryAll(): void {
    // Reset KasirQu
    StorageService.saveTables(DEFAULT_TABLES);
    StorageService.saveMenu(DEFAULT_MENU);
    StorageService.saveActiveOrders({});
    localStorage.setItem('baksoqu_history_v1', JSON.stringify([]));
    StorageService.saveProfile(DEFAULT_PROFILE);
    StorageService.savePrinterConfig(DEFAULT_PRINTER);

    // Reset RTQu
    RtStorageService.saveSettings(INITIAL_SETTINGS);
    RtStorageService.saveCitizens(INITIAL_CITIZENS);
    RtStorageService.saveIuran([]);
    RtStorageService.saveCashBook([]);

    // Reset General Settings
    this.saveSettings(DEFAULT_GENERAL_SETTINGS);
    this.applyThemeToDOM('dark');
  },
};
