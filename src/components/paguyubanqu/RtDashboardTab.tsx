import React from 'react';
import {
  Users,
  Wallet,
  Megaphone,
  Boxes,
  Receipt,
  UserPlus,
  ArrowRight
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
      <div className="p-4.5 rounded-3xl bg-slate-800 text-slate-100 shadow-xl border border-slate-700 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              {settings.rtName} / {settings.rwName}
            </span>
            <span className="text-[11px] text-slate-300 font-semibold">
              {settings.kelurahan}
            </span>
          </div>

          <h2 className="text-lg font-black text-white tracking-tight mt-2 flex items-center gap-2">
            Paguyuban & Administrasi RTQu
          </h2>
          <p className="text-xs text-slate-300 font-medium mt-0.5 line-clamp-1">
            Ketua RT: <strong className="text-white font-bold">{settings.ketuaRtName}</strong>
          </p>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-3 gap-2.5 mt-4 pt-3.5 border-t border-slate-700 text-center">
            <div className="bg-slate-900 p-2.5 rounded-2xl border border-slate-700 shadow-inner">
              <span className="text-[10px] text-slate-300 font-bold block uppercase tracking-wider">Total Warga</span>
              <span className="text-lg font-black text-emerald-400">{totalCitizens}</span>
              <span className="text-[9px] text-slate-400 font-semibold block">Jiwa</span>
            </div>

            <div className="bg-slate-900 p-2.5 rounded-2xl border border-slate-700 shadow-inner">
              <span className="text-[10px] text-slate-300 font-bold block uppercase tracking-wider">Total KK</span>
              <span className="text-lg font-black text-emerald-400">{totalKk}</span>
              <span className="text-[9px] text-slate-400 font-semibold block">Keluarga</span>
            </div>

            <div className="bg-slate-900 p-2.5 rounded-2xl border border-slate-700 shadow-inner">
              <span className="text-[10px] text-slate-300 font-bold block uppercase tracking-wider">Kas RT</span>
              <span className="text-xs font-black text-emerald-400 truncate block mt-1">
                {formatRupiah(currentCashBalance)}
              </span>
              <span className="text-[9px] text-slate-400 font-semibold block">Saldo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-3 gap-2.5">
        <button
          onClick={onOpenQuickIuran}
          className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-100 flex flex-col items-center text-center shadow-md active:scale-95 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-1.5 border border-emerald-500/40 group-hover:scale-105 transition-transform">
            <Receipt className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="text-xs font-bold text-slate-100">Catat Iuran</span>
          <span className="text-[10px] text-slate-300 font-medium">Pembayaran KK</span>
        </button>

        <button
          onClick={onOpenQuickCitizen}
          className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-100 flex flex-col items-center text-center shadow-md active:scale-95 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center mb-1.5 border border-teal-500/40 group-hover:scale-105 transition-transform">
            <UserPlus className="w-5 h-5 text-teal-400" />
          </div>
          <span className="text-xs font-bold text-slate-100">+ Warga / KK</span>
          <span className="text-[10px] text-slate-300 font-medium">Data Penduduk</span>
        </button>

        <button
          onClick={onOpenQuickAnnouncement}
          className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-100 flex flex-col items-center text-center shadow-md active:scale-95 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-1.5 border border-blue-500/40 group-hover:scale-105 transition-transform">
            <Megaphone className="w-5 h-5 text-blue-400" />
          </div>
          <span className="text-xs font-bold text-slate-100">Pengumuman</span>
          <span className="text-[10px] text-slate-300 font-medium">Warta Warga</span>
        </button>
      </div>

      {/* Iuran & Compliance Widget */}
      <div className="p-4 rounded-3xl bg-slate-800 border border-slate-700 space-y-3.5 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
              <Receipt className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">Status Iuran RT Bulan Ini</h3>
              <span className="text-[10px] text-slate-300 font-medium">
                Tarif: {formatRupiah(settings.monthlyFeePerKk)} / KK (Jatuh tempo tgl {settings.feeDueDateDay})
              </span>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('iuran')}
            className="text-[11px] text-emerald-400 font-bold hover:underline flex items-center gap-0.5"
          >
            <span>Detail</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-200">
              {paidKkThisMonth} dari {totalKk} KK Sudah Membayar
            </span>
            <span className="font-black text-emerald-400">{iuranCompliancePercent}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${iuranCompliancePercent}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2.5 border-t border-slate-700 text-xs">
          <span className="text-slate-300 font-medium">Terkumpul Bulan Ini:</span>
          <span className="font-black text-emerald-400 text-sm">
            {formatRupiah(iuranCollectedThisMonth)}
          </span>
        </div>
      </div>

      {/* Domisili Breakdown & Aset Status */}
      <div className="grid grid-cols-2 gap-3">
        {/* Domisili Warga */}
        <div
          onClick={() => onNavigateTab('kependudukan')}
          className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-750 border border-slate-700 cursor-pointer transition-all shadow-md"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-100">Domisili Warga</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Warga Tetap:</span>
              <span className="font-bold text-emerald-400">{totalTetap}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Kontrak / Kost:</span>
              <span className="font-bold text-blue-400">{totalKontrak}</span>
            </div>
          </div>
        </div>

        {/* Inventaris Aset RT */}
        <div
          onClick={() => onNavigateTab('organisasi')}
          className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-750 border border-slate-700 cursor-pointer transition-all shadow-md"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-100">Inventaris Aset</span>
            <Boxes className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Total Item:</span>
              <span className="font-bold text-slate-100">{assets.length} Jenis</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Dipinjam:</span>
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
      <div className="p-4 rounded-3xl bg-slate-800 border border-slate-700 space-y-3 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-white">Pengumuman & Broadcast Warga</h3>
          </div>
          <button
            onClick={() => onNavigateTab('pengumuman')}
            className="text-[11px] text-emerald-400 font-bold hover:underline flex items-center gap-0.5"
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
              className="p-3 rounded-2xl bg-slate-900 border border-slate-700 hover:border-slate-600 cursor-pointer transition-all shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-white line-clamp-1">{anc.title}</span>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0 uppercase font-bold">
                  {anc.category}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium line-clamp-2 mt-1 leading-relaxed">
                {anc.content}
              </p>
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold mt-2 pt-2 border-t border-slate-800">
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
