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
    <div className="flex-1 flex flex-col h-full bg-slate-900 text-slate-100 overflow-hidden">
      {/* Header */}
      <div className="p-3 bg-slate-950 border-b border-slate-700 flex items-center justify-between shrink-0 select-none shadow-sm">
        <button
          onClick={onBackToKasir}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold active:scale-95 transition-all shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-200" />
          <span>KasirQu</span>
        </button>

        <div className="flex items-center gap-2">
          <ModuleIcon
            moduleId={moduleId}
            size="sm"
            variant="badge"
            className="ring-1 ring-emerald-500/40"
          />
          <h1 className="text-sm font-extrabold text-white tracking-tight">{moduleName}</h1>
        </div>

        <div className="flex items-center gap-1.5">
          {onOpenDrawer && (
            <button
              onClick={onOpenDrawer}
              title="Setting Umum"
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 text-xs font-bold active:scale-95 transition-all shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </button>
          )}
          <button
            onClick={onOpenSwitchModul}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-emerald-500/50 text-emerald-300 text-xs font-bold active:scale-95 transition-all shadow-sm"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-400" />
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
            className="ring-2 ring-emerald-500/40 shadow-2xl transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-slate-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold whitespace-nowrap shadow-md">
            Modul Baru
          </div>
        </div>

        <h2 className="text-xl font-black text-white tracking-tight mt-2">
          {moduleName}
        </h2>
        <p className="text-xs text-emerald-300 font-semibold mt-0.5">
          {moduleTagline}
        </p>

        {/* Empty placeholder card */}
        <div className="mt-5 p-4 rounded-3xl bg-slate-800 border border-slate-700 max-w-[280px] w-full text-center space-y-2 shadow-md">
          <span className="inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-700">
            Halaman Kosong
          </span>
          <p className="text-xs text-slate-300 font-medium leading-relaxed">
            Modul ini saat ini masih kosong sesuai permintaan dan belum diisi kode fitur.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col gap-2.5 w-full max-w-[260px]">
          <button
            onClick={onOpenSwitchModul}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 active:scale-95 transition-all"
          >
            <ArrowLeftRight className="w-4 h-4 text-white" />
            <span>Pilih Modul Lain</span>
          </button>

          <button
            onClick={onBackToKasir}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm"
          >
            <span>Kembali ke KasirQu (POS)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
