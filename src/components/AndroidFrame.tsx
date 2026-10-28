import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Smartphone, Maximize2 } from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({ children }) => {
  const [isFramed, setIsFramed] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<string>('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center p-0 sm:p-4 text-slate-100 antialiased selection:bg-emerald-500 selection:text-white">
      {/* Top Floating Viewport Mode Switcher for Desktop Testing */}
      <div className="hidden sm:flex items-center gap-3 mb-2 px-3.5 py-1.5 rounded-full bg-slate-900/95 border border-slate-700 text-xs text-slate-300 backdrop-blur z-50 shadow-md">
        <div className="flex items-center gap-1.5 font-semibold text-slate-200">
          <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
          <span>Android Mobile Mode:</span>
        </div>
        <button
          onClick={() => setIsFramed(true)}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
            isFramed
              ? 'bg-emerald-500 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          HP Portrait Frame
        </button>
        <button
          onClick={() => setIsFramed(false)}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
            !isFramed
              ? 'bg-emerald-500 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Maximize2 className="w-3 h-3" />
          Full Screen
        </button>
      </div>

      {/* Main Container - Framed or Full-bleed */}
      <div
        className={`w-full transition-all duration-300 flex flex-col bg-slate-900 text-slate-100 overflow-hidden relative ${
          isFramed
            ? 'max-w-[420px] h-[100dvh] sm:h-[860px] sm:max-h-[92vh] sm:rounded-[44px] sm:border-[9px] sm:border-slate-800 shadow-2xl sm:ring-1 sm:ring-white/10'
            : 'max-w-md mx-auto min-h-[100dvh] h-[100dvh]'
        }`}
      >
        {/* Android Native Status Bar */}
        <div className="bg-slate-950 text-slate-200 px-6 pt-2 pb-1.5 flex items-center justify-between text-xs select-none shrink-0 z-40 border-b border-slate-800">
          <div className="font-semibold tracking-tight text-[11px] text-slate-100 flex items-center gap-1.5">
            <span>{currentTime}</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/80 font-mono font-bold">
              WargaQu
            </span>
          </div>

          {/* Android Punch-hole Camera Notch */}
          <div className="w-4 h-4 rounded-full bg-black border border-slate-800 shrink-0"></div>

          <div className="flex items-center gap-2 text-slate-300">
            <Wifi className="w-3.5 h-3.5 text-slate-300" />
            <div className="flex items-center gap-0.5">
              <span className="text-[10px] font-mono font-semibold text-slate-200">98%</span>
              <BatteryMedium className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Application Content Canvas */}
        <div className="flex-1 flex flex-col relative overflow-hidden bg-slate-900">
          {children}
        </div>

        {/* Android Gesture Navigation Pill at Bottom */}
        <div className="bg-slate-950 py-1.5 flex items-center justify-center shrink-0 z-40 select-none">
          <div className="w-32 h-1 bg-slate-600 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};
