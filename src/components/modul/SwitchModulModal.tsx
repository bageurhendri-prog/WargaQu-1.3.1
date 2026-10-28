import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Sparkles,
  Download,
  Smartphone,
  ChevronRight,
  Layers
} from 'lucide-react';
import { ModuleIcon } from './ModuleIcon';
import { PWAInstallModal } from '../pwa/PWAInstallModal';

export interface ModuleDefinition {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  category: string;
  logo?: string;
  isReady: boolean;
}

export const APP_MODULES: ModuleDefinition[] = [
  {
    id: 'kasirqu',
    name: 'KasirQu',
    shortName: 'KasirQu',
    tagline: 'POS Kasir & Restoran',
    category: 'Bisnis & Kasir',
    logo: './assets/aistudio/kasirqu_logo.png',
    isReady: true,
  },
  {
    id: 'paguyubanqu',
    name: 'PaguyubanQu / RTQu',
    shortName: 'PaguyubanQu',
    tagline: 'Administrasi RT/RW & Warga',
    category: 'Organisasi & Warga',
    logo: './assets/aistudio/paguyubanqu_logo.png',
    isReady: true,
  },
  {
    id: 'chatqu',
    name: 'ChatQu',
    shortName: 'ChatQu',
    tagline: 'Pesan & Komunikasi Warga',
    category: 'Sosial & Komunikasi',
    logo: './assets/aistudio/chatqu_logo.png',
    isReady: true,
  },
  {
    id: 'muamalahqu',
    name: 'MuamalahQu',
    shortName: 'MuamalahQu',
    tagline: 'Toko & Jual Beli Warga',
    category: 'Ekonomi Warga',
    logo: './assets/aistudio/muamalahqu_logo.png',
    isReady: true,
  },
  {
    id: 'areaqu',
    name: 'AreaQu',
    shortName: 'AreaQu',
    tagline: 'Peta Wilayah Lingkungan',
    category: 'Peta & Wilayah',
    logo: './assets/aistudio/areaqu_logo.png',
    isReady: true,
  },
  {
    id: 'siagaqu',
    name: 'SiagaQu',
    shortName: 'SiagaQu',
    tagline: 'Pusat Siaga Darurat',
    category: 'Keamanan & Darurat',
    logo: './assets/aistudio/siagaqu_logo.png',
    isReady: false,
  },
];

interface SwitchModulModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeModule: string;
  onSelectModule: (moduleId: string) => void;
}

export const SwitchModulModal: React.FC<SwitchModulModalProps> = ({
  isOpen,
  onClose,
  activeModule,
  onSelectModule,
}) => {
  const [showPWAInstall, setShowPWAInstall] = useState(false);

  if (!isOpen) return null;

  const handleSelect = (id: string) => {
    if (navigator.vibrate) {
      try {
        navigator.vibrate(25);
      } catch {}
    }
    onSelectModule(id);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
        <div
          className="w-full max-w-[440px] max-h-[92vh] bg-slate-900 border-t sm:border border-slate-700 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100 animate-in slide-in-from-bottom duration-250"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Pull Handle for Mobile */}
          <div className="w-full flex items-center justify-center pt-3 pb-1 sm:hidden">
            <div className="w-12 h-1.5 bg-slate-600 rounded-full" />
          </div>

          {/* Modal Header */}
          <div className="px-5 py-3.5 border-b border-slate-700 flex items-center justify-between bg-slate-950">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black shadow-md">
                <Layers className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                  Pilih Modul
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    {APP_MODULES.length} Modul
                  </span>
                </h2>
                <p className="text-[11px] text-slate-300 font-medium">
                  Sentuh modul untuk berpindah tampilan
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* PWA Quick Install Banner inside Switch Modul */}
          <div className="px-4 pt-3">
            <button
              onClick={() => setShowPWAInstall(true)}
              className="w-full p-3 rounded-2xl bg-slate-800 border border-emerald-500/40 hover:border-emerald-500 flex items-center justify-between gap-2.5 transition active:scale-[0.99] text-left group shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                  <Smartphone className="w-4.5 h-4.5 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-extrabold text-emerald-300">
                      Instal Aplikasi di HP
                    </span>
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-emerald-500 text-white">
                      PWA
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-300 font-medium">
                    Bisa dipasang di Android & iPhone tanpa app store
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition" />
            </button>
          </div>

          {/* Modules Grid (2 Columns, Clean Modern App-Drawer Cards) */}
          <div className="flex-1 overflow-y-auto px-4 py-3">
            <div className="grid grid-cols-2 gap-2.5">
              {APP_MODULES.map((mod) => {
                const isActive = activeModule === mod.id;

                return (
                  <button
                    key={mod.id}
                    onClick={() => handleSelect(mod.id)}
                    className={`relative p-3 rounded-2xl border text-left flex flex-col justify-between transition-all active:scale-[0.98] shadow-sm ${
                      isActive
                        ? 'bg-slate-800 border-emerald-500 shadow-xl ring-2 ring-emerald-500/40'
                        : 'bg-slate-800 hover:bg-slate-750 border-slate-700'
                    }`}
                  >
                    {/* Top Row: Icon + Active Status */}
                    <div className="flex items-start justify-between w-full mb-2.5">
                      <div
                        className={`w-12 h-12 rounded-2xl p-2 flex items-center justify-center shrink-0 shadow-sm aspect-square transition-all ${
                          isActive
                            ? 'bg-white border-2 border-emerald-500 ring-2 ring-emerald-500/30'
                            : 'bg-white border border-slate-200'
                        }`}
                      >
                        <ModuleIcon
                          moduleId={mod.id}
                          size="md"
                          className="w-full h-full aspect-square"
                        />
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-white shadow-sm">
                            <CheckCircle2 className="w-3 h-3 text-white" />
                            Aktif
                          </span>
                        ) : mod.isReady ? (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            Siap
                          </span>
                        ) : (
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-700">
                            Segera
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Info */}
                    <div className="w-full">
                      <div className="flex items-baseline justify-between">
                        <h3
                          className={`text-sm font-extrabold tracking-tight truncate ${
                            isActive ? 'text-emerald-400' : 'text-slate-100'
                          }`}
                        >
                          {mod.name}
                        </h3>
                      </div>
                      <p className="text-[10px] text-slate-300 font-medium line-clamp-1 mt-0.5">
                        {mod.tagline}
                      </p>
                      <span className="text-[9px] font-mono font-semibold text-slate-400 block mt-1">
                        {mod.category}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer info & Actions */}
          <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>WargaQu Modular v1.3.0</span>
            </div>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>

      {/* PWA Install Modal */}
      <PWAInstallModal
        isOpen={showPWAInstall}
        onClose={() => setShowPWAInstall(false)}
      />
    </>
  );
};
