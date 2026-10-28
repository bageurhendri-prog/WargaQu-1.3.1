import React from 'react';
import { LucideIcon } from 'lucide-react';
import { ModuleIcon } from './modul/ModuleIcon';

export interface NavTabItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: number | string | null;
}

interface BottomNavBarProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  onOpenSwitchModul: () => void;
  tabs: NavTabItem[];
  activeModule?: string;
  activeModuleLogo?: string;
  activeModuleName?: string;
  activeOrdersCount?: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onSelectTab,
  onOpenSwitchModul,
  tabs,
  activeModule = 'kasirqu',
  activeModuleName = 'KasirQu',
  activeOrdersCount = 0,
}) => {
  return (
    <nav className="w-full bg-slate-900/98 border-t border-slate-700 text-slate-300 px-1.5 py-1.5 flex items-center justify-between shrink-0 z-30 shadow-xl select-none">
      {/* Sub-menu Tabs for the currently active module */}
      <div className="flex items-center justify-around flex-1 gap-1 overflow-hidden">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                if (navigator.vibrate) {
                  try {
                    navigator.vibrate(20);
                  } catch {}
                }
                onSelectTab(tab.id);
              }}
              className={`relative flex flex-col items-center justify-center flex-1 min-w-[42px] max-w-[64px] py-1 px-1 rounded-xl transition-all duration-150 active:scale-95 ${
                isActive
                  ? 'text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              {/* Active Pill Accent on top */}
              {isActive && (
                <span className="absolute -top-1.5 w-6 h-0.5 bg-emerald-500 rounded-full shadow-sm shadow-emerald-400/50"></span>
              )}

              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-emerald-400' : 'text-slate-300'}`} />
                {tab.badge !== null && tab.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 bg-emerald-500 text-white text-[8px] font-black px-1.5 min-w-[14px] h-3.5 rounded-full flex items-center justify-center ring-1 ring-slate-900 shadow-sm animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[9px] mt-1 tracking-tight truncate max-w-full ${
                  isActive ? 'font-bold text-emerald-300' : 'font-medium text-slate-300'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Divider Separator */}
      <div className="h-7 w-[1px] bg-slate-700 mx-1.5 shrink-0" />

      {/* Dedicated Switch Modul Button with Logo as Icon (Navbar Bawah Kanan) */}
      <div className="shrink-0 pl-0.5">
        <button
          onClick={() => {
            if (navigator.vibrate) {
              try {
                navigator.vibrate(25);
              } catch {}
            }
            onOpenSwitchModul();
          }}
          title="Switch Modul Aplikasi (Pilih Ekosistem Qu)"
          className="relative flex flex-col items-center justify-center min-w-[58px] py-1 px-1.5 rounded-xl transition-all duration-150 active:scale-95 border bg-slate-800 hover:bg-slate-750 border-emerald-500/50 text-emerald-300 hover:border-emerald-400 shadow-md shadow-emerald-950/30"
        >
          {/* Dedicated Clean Vector Icon */}
          <div className="relative flex items-center justify-center">
            <ModuleIcon
              moduleId={activeModule}
              size="xs"
              variant="badge"
              className="ring-1 ring-emerald-500/50 shadow-xs"
            />

            {/* Notification Badge if active orders waiting in KasirQu */}
            {activeOrdersCount > 0 && activeModule === 'kasirqu' && (
              <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[8px] font-black px-1 rounded-full flex items-center justify-center ring-1 ring-slate-900 animate-pulse">
                {activeOrdersCount}
              </span>
            )}
          </div>

          <div className="flex flex-col items-center leading-none mt-1">
            <span className="text-[8px] font-black uppercase tracking-wider text-emerald-300 truncate max-w-[54px]">
              {activeModuleName}
            </span>
            <span className="text-[7px] font-semibold text-slate-300">
              Switch
            </span>
          </div>
        </button>
      </div>
    </nav>
  );
};
