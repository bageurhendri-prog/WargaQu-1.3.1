import React from 'react';
import { LucideIcon } from 'lucide-react';
import { ModuleIcon } from './modul/ModuleIcon';

export interface NavTabItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: string | number | null;
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
  activeModuleLogo = './assets/aistudio/kasirqu_logo.png',
  activeModuleName = 'KasirQu',
  activeOrdersCount = 0,
}) => {
  return (
    <nav className="w-full bg-stone-900/98 border-t border-stone-800 text-stone-400 px-1 py-1 flex items-center justify-between shrink-0 z-30 shadow-lg select-none">
      {/* Sub-menu Tabs for the currently active module */}
      <div className="flex items-center justify-around flex-1 gap-0.5 overflow-hidden">
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
              className={`relative flex flex-col items-center justify-center flex-1 min-w-[42px] max-w-[62px] py-1 px-0.5 rounded-xl transition-all duration-150 active:scale-95 ${
                isActive
                  ? 'text-amber-400 font-semibold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              {/* Active Pill Accent on top */}
              {isActive && (
                <span className="absolute -top-1 w-5 h-0.5 bg-amber-500 rounded-full"></span>
              )}

              <div className="relative">
                <Icon className={`w-4.5 h-4.5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {tab.badge !== null && tab.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 bg-emerald-600 text-white text-[8px] font-black px-1 min-w-[14px] h-3.5 rounded-full flex items-center justify-center ring-1 ring-stone-900 animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[9px] mt-0.5 tracking-tight truncate max-w-full ${
                  isActive ? 'font-bold' : 'font-normal'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Divider Separator */}
      <div className="h-7 w-[1px] bg-stone-800 mx-1 shrink-0" />

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
          className="relative flex flex-col items-center justify-center min-w-[56px] py-1 px-1 rounded-xl transition-all duration-150 active:scale-95 border bg-stone-800/90 hover:bg-stone-750 border-amber-500/40 text-amber-300 hover:border-amber-400 shadow-sm"
        >
          {/* Dedicated Clean Vector Icon */}
          <div className="relative flex items-center justify-center">
            <ModuleIcon
              moduleId={activeModule}
              size="xs"
              variant="badge"
              className="ring-1 ring-amber-500/40"
            />

            {/* Notification Badge if active orders waiting in KasirQu */}
            {activeOrdersCount > 0 && activeModule === 'kasirqu' && (
              <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[8px] font-black px-1 rounded-full flex items-center justify-center ring-1 ring-stone-900 animate-pulse">
                {activeOrdersCount}
              </span>
            )}
          </div>

          <div className="flex flex-col items-center leading-none mt-0.5">
            <span className="text-[8px] font-black uppercase tracking-wider text-amber-400 truncate max-w-[52px]">
              {activeModuleName}
            </span>
            <span className="text-[7px] font-medium text-stone-400">
              Switch
            </span>
          </div>
        </button>
      </div>
    </nav>
  );
};
