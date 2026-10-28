import React from 'react';
import { Menu, ShoppingBag, Printer } from 'lucide-react';
import { PrinterConfig } from '../types';
import { ModuleIcon } from './modul/ModuleIcon';

interface HeaderBarProps {
  title: string;
  subtitle?: string;
  onOpenDrawer: () => void;
  onTakeawayClick: () => void;
  printerConfig: PrinterConfig;
  onOpenPrinterModal: () => void;
  showTakeawayBtn?: boolean;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  title,
  subtitle,
  onOpenDrawer,
  onTakeawayClick,
  printerConfig,
  onOpenPrinterModal,
  showTakeawayBtn = true,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900 text-slate-100 border-b border-slate-700 px-3 py-2 flex items-center justify-between shrink-0 select-none shadow-md">
      {/* Left: Navigation Drawer Toggle */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onOpenDrawer}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-slate-800 text-slate-100 hover:text-white hover:bg-slate-700 border border-slate-700 active:scale-95 transition-all shadow-sm"
          aria-label="Buka Menu Sidebar"
        >
          <Menu className="w-5 h-5 text-slate-200" />
        </button>

        <div className="flex items-center gap-2">
          <ModuleIcon
            moduleId="kasirqu"
            size="sm"
            variant="badge"
            className="ring-1 ring-emerald-500/40"
          />
          <div>
            <h1 className="text-sm font-extrabold text-white tracking-tight leading-tight flex items-center gap-1.5">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[11px] text-slate-300 font-medium leading-none mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1.5">
        {/* Bluetooth Printer Indicator Pill */}
        <button
          onClick={onOpenPrinterModal}
          title="Status Printer Thermal Bluetooth"
          className="h-9 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 text-xs font-semibold border border-slate-700 active:scale-95 transition-all shadow-sm"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <Printer className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden xs:inline text-[11px] font-mono font-bold text-slate-200">
            {printerConfig.paperSize}
          </span>
        </button>

        {/* Quick Bungkus / Takeaway Button */}
        {showTakeawayBtn && (
          <button
            onClick={onTakeawayClick}
            className="h-9 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white flex items-center gap-1.5 text-xs font-extrabold shadow-lg shadow-emerald-950/40 active:scale-95 transition-all"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-white" />
            <span>Bungkus</span>
          </button>
        )}
      </div>
    </header>
  );
};
