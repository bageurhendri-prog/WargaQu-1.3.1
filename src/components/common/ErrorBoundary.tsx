import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('CRITICAL APP CRASH CAUGHT BY ERRORBOUNDARY:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleClearCacheAndReload = async () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.unregister();
        }
      }
    } catch (e) {
      console.warn('Gagal membersihkan cache sepenuhnya:', e);
    }
    // Return to root clean URL
    window.location.href = window.location.pathname;
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-stone-950 text-stone-100 flex items-center justify-center p-4 antialiased">
          <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4 shadow-inner">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <span className="text-[11px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-stone-800 text-stone-400 border border-stone-700/50 mb-2">
              WargaQu System Recovery
            </span>

            <h1 className="text-xl font-bold text-white mb-2">
              Aplikasi Mengalami Kendala
            </h1>
            <p className="text-xs text-stone-400 leading-relaxed mb-4">
              Terjadi kesalahan skrip saat memuat modul tampilan. Anda dapat memuat ulang aplikasi atau mereset cache lokal untuk memulihkan sesi.
            </p>

            {this.state.error && (
              <div className="w-full text-left bg-stone-950 border border-stone-800/80 rounded-xl p-3 mb-5 overflow-x-auto text-[11px] font-mono text-red-400 max-h-36">
                <div className="font-semibold text-red-300 mb-1">
                  {this.state.error.name}: {this.state.error.message}
                </div>
                {this.state.error.stack && (
                  <pre className="text-[10px] text-stone-500 whitespace-pre-wrap leading-tight">
                    {this.state.error.stack.split('\n').slice(0, 5).join('\n')}
                  </pre>
                )}
              </div>
            )}

            <div className="w-full space-y-2.5">
              <button
                onClick={this.handleReload}
                className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-900/30 active:scale-[0.98] transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Muat Ulang Halaman
              </button>

              <button
                onClick={this.handleClearCacheAndReload}
                className="w-full py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white font-medium text-xs flex items-center justify-center gap-2 border border-stone-700 active:scale-[0.98] transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-amber-400" />
                Bersihkan Cache & Reset Sesi
              </button>
            </div>

            <div className="mt-5 text-[10px] text-stone-500">
              WargaQu v1.3.0 • Offline Ready PWA
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
