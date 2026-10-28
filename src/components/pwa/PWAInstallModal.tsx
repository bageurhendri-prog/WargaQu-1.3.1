import React, { useState } from 'react';
import {
  X,
  Download,
  Smartphone,
  Apple,
  Share2,
  PlusSquare,
  CheckCircle2,
  Copy,
  ExternalLink,
  Wifi,
  WifiOff,
  Sparkles
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, isOnline, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://wargaqu.app';

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      setInstallSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-[440px] max-h-[90vh] bg-stone-900 border border-stone-800 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-stone-100 animate-in slide-in-from-bottom duration-250"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Pull Handle */}
        <div className="w-full flex items-center justify-center pt-3 pb-1 sm:hidden">
          <div className="w-12 h-1.5 bg-stone-700 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-800 flex items-center justify-between bg-stone-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-700 p-0.5 shadow-lg flex items-center justify-center text-white">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Instal WargaQu
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  PWA Ready
                </span>
              </h2>
              <p className="text-[11px] text-stone-400">
                Aplikasi langsung jalan di Android & iPhone
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Status banner */}
          <div className="p-3.5 rounded-2xl bg-stone-850 border border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-200">Aplikasi Web Progresif (PWA)</p>
                <p className="text-[10px] text-stone-400">
                  Bisa diakses online di GitHub Pages & offline via Service Worker
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full bg-stone-900 border border-stone-700">
              {isOnline ? (
                <>
                  <Wifi className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-amber-400" />
                  <span className="text-amber-400">Offline</span>
                </>
              )}
            </div>
          </div>

          {/* Already installed state */}
          {isInstalled && (
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-600/40 text-emerald-300 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <div className="text-xs">
                <p className="font-bold">Aplikasi Sudah Terpasang!</p>
                <p className="text-stone-300 text-[11px] mt-0.5">
                  WargaQu sedang berjalan dalam mode aplikasi mandiri (Standalone PWA).
                </p>
              </div>
            </div>
          )}

          {/* Android / Desktop One-Click Install */}
          {!isInstalled && isInstallable && (
            <div className="space-y-3">
              <div className="text-xs font-bold text-stone-300 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                Instalasi Android / Chrome
              </div>
              <button
                onClick={handleInstallClick}
                disabled={installSuccess}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2.5 transition active:scale-[0.98]"
              >
                {installSuccess ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-white" />
                    Berhasil Dipasang!
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 text-white" />
                    Instal Aplikasi WargaQu Sekarang
                  </>
                )}
              </button>
              <p className="text-[11px] text-stone-400 text-center">
                Ikon WargaQu akan langsung ditambahkan ke layar beranda HP Anda layaknya APK.
              </p>
            </div>
          )}

          {/* iOS Safari Instructions */}
          <div className="p-4 rounded-2xl bg-stone-850/80 border border-stone-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-200">
              <Apple className="w-4 h-4 text-white" />
              Panduan Instal di iPhone / iPad (Safari)
            </div>
            <div className="space-y-2 text-xs text-stone-300">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-stone-700 flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  Buka tautan ini di browser <strong>Safari</strong> iPhone, lalu tekan tombol <strong>Bagikan (Share)</strong>
                  <Share2 className="w-3.5 h-3.5 inline mx-1.5 text-blue-400" />
                  di bar bawah Safari.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-stone-700 flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  Gulir ke bawah dan ketuk <strong>"Tambahkan ke Layar Utama" (Add to Home Screen)</strong>
                  <PlusSquare className="w-3.5 h-3.5 inline mx-1.5 text-emerald-400" />.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-stone-700 flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  Tekan <strong>"Tambah"</strong> di pojok kanan atas. WargaQu siap digunakan tanpa browser frame!
                </div>
              </div>
            </div>
          </div>

          {/* Share & Copy Link for GitHub Pages / Devices */}
          <div className="p-4 rounded-2xl bg-stone-850/60 border border-stone-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-stone-300">
              <span>Tautan Online Web (GitHub Pages / Hosting)</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={currentUrl}
                className="flex-1 bg-stone-900 border border-stone-700 text-stone-300 text-xs rounded-xl px-3 py-2 outline-none truncate font-mono"
              />
              <button
                onClick={handleCopyLink}
                className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-stone-700 transition"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Disalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[10px] text-stone-400">
              Bagikan tautan ini ke WhatsApp atau browser smartphone Anda untuk langsung instal.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 flex items-center justify-between text-xs">
          <span className="text-[11px] text-stone-500">WargaQu v1.3.0 PWA</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold rounded-xl transition-colors"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
