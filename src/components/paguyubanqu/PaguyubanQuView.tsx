import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Wallet,
  Building,
  Megaphone,
  Settings,
  ArrowLeftRight,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { ModuleIcon } from '../modul/ModuleIcon';
import {
  Citizen,
  IuranPayment,
  CashBookEntry,
  RtBoardMember,
  RtAsset,
  RtAnnouncement,
  RtSettings
} from '../../types/rtqu';
import { RtStorageService } from '../../services/rtStorage';
import { RtDashboardTab } from './RtDashboardTab';
import { RtKependudukanTab } from './RtKependudukanTab';
import { RtIuranTab } from './RtIuranTab';
import { RtOrganisasiAsetTab } from './RtOrganisasiAsetTab';
import { RtPengumumanTab } from './RtPengumumanTab';
import { RtSettingTab } from './RtSettingTab';

interface PaguyubanQuViewProps {
  activeRtTab: 'dashboard' | 'kependudukan' | 'iuran' | 'organisasi' | 'pengumuman' | 'setting';
  onSelectRtTab: (
    tab: 'dashboard' | 'kependudukan' | 'iuran' | 'organisasi' | 'pengumuman' | 'setting'
  ) => void;
  onOpenSwitchModul: () => void;
  onBackToKasir: () => void;
  onShowNotification: (msg: string) => void;
  onOpenDrawer?: () => void;
}

export const PaguyubanQuView: React.FC<PaguyubanQuViewProps> = ({
  activeRtTab,
  onSelectRtTab,
  onOpenSwitchModul,
  onBackToKasir,
  onShowNotification,
  onOpenDrawer,
}) => {
  // Core Data States
  const [settings, setSettings] = useState<RtSettings>(RtStorageService.getSettings());
  const [citizens, setCitizens] = useState<Citizen[]>([]);
  const [iuranList, setIuranList] = useState<IuranPayment[]>([]);
  const [cashBook, setCashBook] = useState<CashBookEntry[]>([]);
  const [board, setBoard] = useState<RtBoardMember[]>([]);
  const [assets, setAssets] = useState<RtAsset[]>([]);
  const [announcements, setAnnouncements] = useState<RtAnnouncement[]>([]);

  // Load from Storage
  useEffect(() => {
    setSettings(RtStorageService.getSettings());
    setCitizens(RtStorageService.getCitizens());
    setIuranList(RtStorageService.getIuran());
    setCashBook(RtStorageService.getCashBook());
    setBoard(RtStorageService.getBoard());
    setAssets(RtStorageService.getAssets());
    setAnnouncements(RtStorageService.getAnnouncements());
  }, []);

  // Save Handlers
  const handleSaveCitizens = (updated: Citizen[]) => {
    setCitizens(updated);
    RtStorageService.saveCitizens(updated);
  };

  const handleSaveIuran = (updated: IuranPayment[]) => {
    setIuranList(updated);
    RtStorageService.saveIuran(updated);
  };

  const handleSaveCashBook = (updated: CashBookEntry[]) => {
    setCashBook(updated);
    RtStorageService.saveCashBook(updated);
  };

  const handleSaveBoard = (updated: RtBoardMember[]) => {
    setBoard(updated);
    RtStorageService.saveBoard(updated);
  };

  const handleSaveAssets = (updated: RtAsset[]) => {
    setAssets(updated);
    RtStorageService.saveAssets(updated);
  };

  const handleSaveAnnouncements = (updated: RtAnnouncement[]) => {
    setAnnouncements(updated);
    RtStorageService.saveAnnouncements(updated);
  };

  const handleSaveSettings = (updated: RtSettings) => {
    setSettings(updated);
    RtStorageService.saveSettings(updated);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-stone-900 text-stone-100 overflow-hidden">
      {/* PaguyubanQu Header */}
      <header className="sticky top-0 z-30 bg-stone-950 text-white border-b border-stone-800 px-3.5 py-2 flex items-center justify-between shrink-0 select-none shadow-sm">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onBackToKasir}
            title="Kembali ke KasirQu"
            className="w-8 h-8 rounded-xl bg-stone-850 hover:bg-stone-800 border border-stone-700/60 flex items-center justify-center text-stone-300 hover:text-white transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <ModuleIcon
              moduleId="paguyubanqu"
              size="sm"
              variant="badge"
              className="ring-1 ring-emerald-400/40"
            />

            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-extrabold text-white tracking-tight leading-none">
                  PaguyubanQu / RTQu
                </h1>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {settings.rtName}
                </span>
              </div>
              <p className="text-[10px] text-stone-400 leading-none mt-1">
                {settings.rwName} · {settings.kelurahan}
              </p>
            </div>
          </div>
        </div>

        {/* Right Header Buttons: Setting Umum & Switch Modul */}
        <div className="flex items-center gap-1.5">
          {onOpenDrawer && (
            <button
              onClick={onOpenDrawer}
              title="Buka Setting Umum (Sidebar)"
              className="w-8 h-8 rounded-xl bg-stone-850 hover:bg-stone-800 border border-stone-700/60 flex items-center justify-center text-stone-300 hover:text-white transition-all active:scale-95"
            >
              <Settings className="w-4 h-4 text-amber-400" />
            </button>
          )}

          <button
            onClick={onOpenSwitchModul}
            className="h-8 px-2.5 rounded-xl bg-stone-800 hover:bg-stone-750 border border-amber-500/40 text-amber-300 flex items-center gap-1.5 text-xs font-bold active:scale-95 transition-all shadow-sm"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px]">Switch Modul</span>
          </button>
        </div>
      </header>

      {/* Active Tab Screen */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-stone-900">
        {activeRtTab === 'dashboard' && (
          <RtDashboardTab
            citizens={citizens}
            iuranList={iuranList}
            cashBook={cashBook}
            assets={assets}
            announcements={announcements}
            settings={settings}
            onNavigateTab={(tab) => onSelectRtTab(tab as any)}
            onOpenQuickIuran={() => onSelectRtTab('iuran')}
            onOpenQuickCitizen={() => onSelectRtTab('kependudukan')}
            onOpenQuickAnnouncement={() => onSelectRtTab('pengumuman')}
          />
        )}

        {activeRtTab === 'kependudukan' && (
          <RtKependudukanTab
            citizens={citizens}
            onSaveCitizens={handleSaveCitizens}
            onShowNotification={onShowNotification}
          />
        )}

        {activeRtTab === 'iuran' && (
          <RtIuranTab
            citizens={citizens}
            iuranList={iuranList}
            cashBook={cashBook}
            settings={settings}
            onSaveIuran={handleSaveIuran}
            onSaveCashBook={handleSaveCashBook}
            onShowNotification={onShowNotification}
          />
        )}

        {activeRtTab === 'organisasi' && (
          <RtOrganisasiAsetTab
            board={board}
            assets={assets}
            onSaveBoard={handleSaveBoard}
            onSaveAssets={handleSaveAssets}
            onShowNotification={onShowNotification}
          />
        )}

        {activeRtTab === 'pengumuman' && (
          <RtPengumumanTab
            announcements={announcements}
            settings={settings}
            onSaveAnnouncements={handleSaveAnnouncements}
            onShowNotification={onShowNotification}
          />
        )}

        {activeRtTab === 'setting' && (
          <RtSettingTab
            settings={settings}
            onSaveSettings={handleSaveSettings}
            onShowNotification={onShowNotification}
          />
        )}
      </main>
    </div>
  );
};
