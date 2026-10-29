export interface WargaQuQrisData {
  provider: string;
  image: string; // Base64 data URI
  note: string;
  updatedAt: string;
}

const STORAGE_KEY = 'wargaqu_qris_data';

export const QrisSettingsService = {
  getQrisData(): WargaQuQrisData | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveQrisData(data: WargaQuQrisData): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save QRIS data to localStorage', e);
    }
  },

  removeQrisData(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to remove QRIS data', e);
    }
  }
};
