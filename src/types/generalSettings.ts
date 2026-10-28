export type AppTheme = 'dark' | 'light' | 'system';

export interface GeneralAccountSettings {
  email: string;
  isEmailVerified: boolean;
  phone: string;
  isPhoneVerified: boolean;
  name: string;
  avatarUrl?: string;
  lastPasswordChange: string;
  theme: AppTheme;
  autoUpdate: boolean;
  lastBackupAt: string | null;
  appVersion: string;
  buildNumber: string;
}

export interface BackupDataPayload {
  version: string;
  exportedAt: string;
  appName: string;
  modules: {
    kasirqu?: {
      tables: any[];
      menu: any[];
      activeOrders: Record<string, any>;
      history: any[];
      ingredients: any[];
      profile: any;
      printer: any;
    };
    rtqu?: {
      citizens: any[];
      iuran: any[];
      cashbook: any[];
      board: any[];
      assets: any[];
      announcements: any[];
      settings: any;
    };
    generalSettings?: GeneralAccountSettings;
  };
}
