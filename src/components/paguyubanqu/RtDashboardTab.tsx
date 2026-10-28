import React from 'react';
import {
  Users,
  Home,
  Wallet,
  TrendingUp,
  AlertCircle,
  Megaphone,
  Boxes,
  PlusCircle,
  Receipt,
  UserPlus,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Building
} from 'lucide-react';
import {
  Citizen,
  IuranPayment,
  CashBookEntry,
  RtAsset,
  RtAnnouncement,
  RtSettings
} from '../../types/rtqu';

interface RtDashboardTabProps {
  citizens: Citizen[];
  iuranList: IuranPayment[];
  cashBook: CashBookEntry[];
  assets: RtAsset[];
  announcements: RtAnnouncement[];
  settings: RtSettings;
  onNavigateTab: (tab: string) => void;
  onOpenQuickIuran: () => void;
  onOpenQuickCitizen: () => void;
  onOpenQuickAnnouncement: () => void;
}

export const RtDashboardTab: React.FC<RtDashboardTabProps> = ({
  citizens,
  iuranList,
  cashBook,
  assets,
  announcements,
  settings,
  onNavigateTab,
  onOpenQuickIuran,
  onOpenQuickCitizen,
  onOpenQuickAnnouncement,
}) => {
  // Calculations
  const totalCitizens = citizens.length;
  const uniqueKkSet = new Set(citizens.map((c) => c.noKk));
  const totalKk = uniqueKkSet.size;

  const totalTetap = citizens.filter((c) => c.domicileStatus === 'tetap').length;
  const totalKontrak = citizens.filter((c) => c.domicileStatus === 'kontrak').length;

  // Kas Balance calculation
  const totalPemasukan = cashBook
    .filter((c) => c.type === 'masuk')
    .reduce((sum, c) => sum + c.amount, 0);
  const totalPengeluaran = cashBook
    .filter((c) => c.type === 'keluar')
    .reduce((sum, c) => sum + c.amount, 0);
  const currentCashBalance = totalPemasukan - totalPengeluaran;

  // Current Month Iuran Stats (October 2026)
  const currentMonth = 10;
  const currentYear = 2026;
  const paidKkThisMonth = new Set(
    iuranList
      .filter((i) => i.month === currentMonth && i.year === currentYear)
      .map((i) => i.noKk)
  ).size;
  const iuranCollectedThisMonth = iuranList
    .filter((i) => i.month === currentMonth && i.year === currentYear)
    .reduce((sum, i) => sum + i.amount, 0);

  const iuranCompliancePercent = totalKk > 0 ? Math.round((paidKkThisMonth / totalKk) * 100) : 0;

  // Borrowed Assets
  const borrowedAssets = assets.filter((a) => a.status === 'dipinjam');

  // Pinned or latest announcements
  const latestAnnouncements = announcements.slice(0, 2);

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {/* Welcome Card & Community Identity */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-950 to-stone-900 text-white shadow-xl border border-emerald-700/40 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              {settings.rtName} / {settings.rwName}
            </span>
            <span className="text-[11px] text-emerald-200/80 font-medium">
              {settings.kelurahan}
            </span>
          </div>

          <h2 className="text-lg font-black tracking-tight mt-1.5 flex items-center gap-2">
            Paguyuban & Administrasi RTQu
          </h2>
          <p className="text-xs text-stone-300 mt-0.5 line-clamp-1">
            Ketua RT: <strong className="text-white">{settings.ketuaRtName}</strong>
          </p>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-3 gap-2 mt-3.5 pt-3 border-t border-emerald-800/60 text-center">
            <div className="bg-emerald-950/50 p-2 rounded-2xl border border-emerald-800/40">
              <span className="text-[10px] text-stone-300 font-medium block">Total Warga</span>
              <span className="text-base font-black text-amber-300">{totalCitizens}</span>
              <span className="text-[9px] text-stone-400 block">Jiwa</span>
            </div>

            <div className="bg-emerald-950/50 p-2 rounded-2xl border border-emerald-800/40">
              <span className="text-[10px] text-stone-300 font-medium block">Total KK</span>
              <span className="text-base font-black text-emerald-300">{totalKk}</span>
              <span className="text-[9px] text-stone-400 block">Keluarga</span>
            </div>

            <div className="bg-emerald-950/50 p-2 rounded-2xl border border-emerald-800/40">
              <span className="text-[10px] text-stone-300 font-medium block">Kas RT</span>
              <span className="text-xs font-black text-emerald-400 truncate block mt-0.5">
                {formatRupiah(currentCashBalance)}
              </span>
              <span className="text-[9px] text-stone-400 block">Saldo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={onOpenQuickIuran}
          className="p-3 rounded-2xl bg-stone-850 hover:bg-stone-800 border border-stone-700/80 text-stone-100 flex flex-col items-center text-center shadow-md active:scale-95 transition-all"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-1.5 border border-amber-500/30">
            <Receipt className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold">Catat Iuran</span>
          <span className="text-[9px] text-stone-400">Pembayaran KK</span>
        </button>

        <button
          onClick={onOpenQuickCitizen}
          className="p-3 rounded-2xl bg-stone-850 hover:bg-stone-800 border border-stone-700/80 text-stone-100 flex flex-col items-center text-center shadow-md active:scale-95 transition-all"
        >
          <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center mb-1.5 border border-teal-500/30">
            <UserPlus className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold">+ Warga / KK</span>
          <span className="text-[9px] text-stone-400">Data Penduduk</span>
        </button>

        <button
          onClick={onOpenQuickAnnouncement}
          className="p-3 rounded-2xl bg-stone-850 hover:bg-stone-800 border border-stone-700/80 text-stone-100 flex flex-col items-center text-center shadow-md active:scale-95 transition-all"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-1.5 border border-blue-500/30">
            <Megaphone className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold">Pengumuman</span>
          <span className="text-[9px] text-stone-400">Broadcast Info</span>
        </button>
      </div>

      {/* Iuran & Compliance Widget */}
      <div className="p-4 rounded-3xl bg-stone-850 border border-stone-700/80 space-y-3 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">Status Iuran RT Bulan Ini</h3>
              <span className="text-[10px] text-stone-400">
                Tarif: {formatRupiah(settings.monthlyFeePerKk)} / KK (Jatuh tempo tgl {settings.feeDueDateDay})
              </span>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('iuran')}
            className="text-[11px] text-amber-400 font-bold hover:underline flex items-center gap-0.5"
          >
            <span>Detail</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-stone-300">
              {paidKkThisMonth} dari {totalKk} KK Sudah Membayar
            </span>
            <span className="font-bold text-amber-400">{iuranCompliancePercent}%</span>
          </div>
          <div className="w-full h-2.5 bg-stone-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${iuranCompliancePercent}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-stone-700/60 text-xs">
          <span className="text-stone-400">Terkumpul Bulan Ini:</span>
          <span className="font-bold text-emerald-400 text-sm">
            {formatRupiah(iuranCollectedThisMonth)}
          </span>
        </div>
      </div>

      {/* Domisili Breakdown & Aset Status */}
      <div className="grid grid-cols-2 gap-3">
        {/* Domisili Warga */}
        <div
          onClick={() => onNavigateTab('kependudukan')}
          className="p-3.5 rounded-2xl bg-stone-850 hover:bg-stone-800 border border-stone-700/70 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-stone-200">Domisili Warga</span>
            <Users className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-400">Warga Tetap:</span>
              <span className="font-bold text-emerald-400">{totalTetap}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-400">Kontrak / Kost:</span>
              <span className="font-bold text-blue-400">{totalKontrak}</span>
            </div>
          </div>
        </div>

        {/* Inventaris Aset RT */}
        <div
          onClick={() => onNavigateTab('organisasi')}
          className="p-3.5 rounded-2xl bg-stone-850 hover:bg-stone-800 border border-stone-700/70 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-stone-200">Inventaris Aset</span>
            <Boxes className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-400">Total Item:</span>
              <span className="font-bold text-stone-200">{assets.length} Jenis</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-400">Dipinjam:</span>
              <span
                className={`font-bold ${
                  borrowedAssets.length > 0 ? 'text-amber-400 animate-pulse' : 'text-emerald-400'
                }`}
              >
                {borrowedAssets.length} Aset
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Latest Announcements */}
      <div className="p-4 rounded-3xl bg-stone-850 border border-stone-700/80 space-y-3 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-white">Pengumuman & Broadcast Warga</h3>
          </div>
          <button
            onClick={() => onNavigateTab('pengumuman')}
            className="text-[11px] text-amber-400 font-bold hover:underline flex items-center gap-0.5"
          >
            <span>Semua</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-2">
          {latestAnnouncements.map((anc) => (
            <div
              key={anc.id}
              onClick={() => onNavigateTab('pengumuman')}
              className="p-3 rounded-2xl bg-stone-900 border border-stone-800 hover:border-stone-700 cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-white line-clamp-1">{anc.title}</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0 uppercase font-semibold">
                  {anc.category}
                </span>
              </div>
              <p className="text-[11px] text-stone-400 line-clamp-2 mt-1 leading-relaxed">
                {anc.content}
              </p>
              <div className="flex items-center justify-between text-[10px] text-stone-500 mt-2">
                <span>{anc.author}</span>
                <span>{anc.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
