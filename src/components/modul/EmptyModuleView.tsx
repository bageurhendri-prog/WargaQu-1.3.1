import React from 'react';
import { ArrowLeftRight, ArrowLeft, Sparkles, Layers } from 'lucide-react';
import { ModuleIcon } from './ModuleIcon';

interface EmptyModuleViewProps {
  moduleId: string;
  moduleName: string;
  moduleTagline: string;
  moduleLogo?: string;
  onOpenSwitchModul: () => void;
  onBackToKasir: () => void;
  onOpenDrawer?: () => void;
}

export const EmptyModuleView: React.FC<EmptyModuleViewProps> = ({
  moduleId,
  moduleName,
  moduleTagline,
  moduleLogo,
  onOpenSwitchModul,
  onBackToKasir,
  onOpenDrawer,
}) => {
  return (
    <div className="flex-1 flex flex-col h-full bg-stone-900 text-stone-100 overflow-hidden">
      {/* Header */}
      <div className="p-3 bg-stone-950 border-b border-stone-800 flex items-center justify-between shrink-0 select-none">
        <button
          onClick={onBackToKasir}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold active:scale-95 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>KasirQu</span>
        </button>

        <div className="flex items-center gap-2">
          <ModuleIcon
            moduleId={moduleId}
            size="sm"
            variant="badge"
            className="ring-1 ring-stone-700/60"
          />
          <h1 className="text-sm font-bold text-white tracking-tight">{moduleName}</h1>
        </div>

        <div className="flex items-center gap-1.5">
          {onOpenDrawer && (
            <button
              onClick={onOpenDrawer}
              title="Setting Umum"
              className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-400 text-xs font-bold active:scale-95 transition-all"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onOpenSwitchModul}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold active:scale-95 transition-all shadow-sm"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Switch</span>
          </button>
        </div>
      </div>

      {/* Main Empty Canvas */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center overflow-y-auto">
        <div className="relative mb-4 group">
          <ModuleIcon
            moduleId={moduleId}
            size="xl"
            variant="badge"
            className="ring-2 ring-stone-700/80 shadow-2xl transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-stone-950 text-amber-400 border border-amber-500/30 text-[10px] font-mono font-bold whitespace-nowrap shadow-md">
            Modul Baru
          </div>
        </div>

        <h2 className="text-xl font-extrabold text-white tracking-tight mt-2">
          {moduleName}
        </h2>
        <p className="text-xs text-amber-300 font-medium mt-0.5">
          {moduleTagline}
        </p>

        {/* Empty placeholder card */}
        <div className="mt-5 p-4 rounded-2xl bg-stone-800/80 border border-stone-700/80 max-w-[280px] w-full text-center space-y-2">
          <span className="inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-stone-900 text-stone-400 border border-stone-700/50">
            Halaman Kosong
          </span>
          <p className="text-xs text-stone-300 leading-relaxed">
            Modul ini saat ini masih kosong sesuai permintaan dan belum diisi kode fitur.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col gap-2 w-full max-w-[260px]">
          <button
            onClick={onOpenSwitchModul}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40 active:scale-95 transition-all"
          >
            <ArrowLeftRight className="w-4 h-4 text-stone-950" />
            <span>Pilih Modul Lain</span>
          </button>

          <button
            onClick={onBackToKasir}
            className="w-full py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 border border-stone-700 font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <span>Kembali ke KasirQu (POS)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
