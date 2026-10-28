import React, { useState } from 'react';
import {
  Receipt,
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Banknote,
  Search,
  Filter,
  Share2,
  Printer,
  X
} from 'lucide-react';
import {
  Citizen,
  IuranPayment,
  CashBookEntry,
  RtSettings,
  PaymentMethodRt
} from '../../types/rtqu';

interface RtIuranTabProps {
  citizens: Citizen[];
  iuranList: IuranPayment[];
  cashBook: CashBookEntry[];
  settings: RtSettings;
  onSaveIuran: (payments: IuranPayment[]) => void;
  onSaveCashBook: (entries: CashBookEntry[]) => void;
  onShowNotification: (msg: string) => void;
}

export const RtIuranTab: React.FC<RtIuranTabProps> = ({
  citizens,
  iuranList,
  cashBook,
  settings,
  onSaveIuran,
  onSaveCashBook,
  onShowNotification,
}) => {
  const [subTab, setSubTab] = useState<'iuran' | 'buku_kas'>('iuran');

  // Month & Year Filter
  const [selectedMonth, setSelectedMonth] = useState<number>(10);
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [searchKk, setSearchKk] = useState<string>('');

  // Payment Modal State
  const [isPayModalOpen, setIsPayModalOpen] = useState<boolean>(false);
  const [selectedKkForPay, setSelectedKkForPay] = useState<{
    noKk: string;
    headName: string;
    address: string;
  } | null>(null);
  const [payMethod, setPayMethod] = useState<PaymentMethodRt>('transfer_wargaqu');
  const [payAmount, setPayAmount] = useState<number>(settings.monthlyFeePerKk);
  const [payNotes, setPayNotes] = useState<string>('');

  // Digital Receipt Modal
  const [receiptModal, setReceiptModal] = useState<IuranPayment | null>(null);

  // Cash Book Modal
  const [isCashModalOpen, setIsCashModalOpen] = useState<boolean>(false);
  const [cashType, setCashType] = useState<'masuk' | 'keluar'>('masuk');
  const [cashCategory, setCashCategory] = useState<string>('Iuran Warga');
  const [cashAmount, setCashAmount] = useState<number>(50000);
  const [cashDesc, setCashDesc] = useState<string>('');

  // List unique KK
  const kkMap = new Map<string, Citizen[]>();
  citizens.forEach((c) => {
    const list = kkMap.get(c.noKk) || [];
    list.push(c);
    kkMap.set(c.noKk, list);
  });

  const allKks = Array.from(kkMap.entries()).map(([noKk, members]) => {
    const head =
      members.find((m) => m.familyRole === 'kepala_keluarga') ||
      members[0];
    return {
      noKk,
      headName: head ? head.name : 'Kepala Keluarga',
      address: head ? `${head.addressBlock} No. ${head.addressNumber}` : '-',
      phone: head ? head.phone : '',
    };
  });

  // Check paid status for the selected month/year
  const paidMap = new Map<string, IuranPayment>();
  iuranList
    .filter((p) => p.month === selectedMonth && p.year === selectedYear)
    .forEach((p) => {
      paidMap.set(p.noKk, p);
    });

  const filteredKkList = allKks.filter((kk) => {
    if (searchKk.trim()) {
      const q = searchKk.toLowerCase();
      return (
        kk.headName.toLowerCase().includes(q) ||
        kk.noKk.includes(q) ||
        kk.address.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalKkCount = allKks.length;
  const paidKkCount = Array.from(paidMap.keys()).length;
  const unpaidKkCount = Math.max(0, totalKkCount - paidKkCount);
  const totalIuranCollected = Array.from(paidMap.values()).reduce(
    (sum, p) => sum + p.amount,
    0
  );

  // Cashbook calculations
  const totalMasuk = cashBook
    .filter((c) => c.type === 'masuk')
    .reduce((s, c) => s + c.amount, 0);
  const totalKeluar = cashBook
    .filter((c) => c.type === 'keluar')
    .reduce((s, c) => s + c.amount, 0);
  const saldoKas = totalMasuk - totalKeluar;

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const monthNames = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];

  const handleOpenPayModal = (kk: { noKk: string; headName: string; address: string }) => {
    setSelectedKkForPay(kk);
    setPayAmount(settings.monthlyFeePerKk);
    setPayMethod('transfer_wargaqu');
    setPayNotes(`Iuran ${monthNames[selectedMonth - 1]} ${selectedYear}`);
    setIsPayModalOpen(true);
  };

  const handleConfirmPayment = () => {
    if (!selectedKkForPay) return;

    const receiptNo = `IUR-${selectedYear}${String(selectedMonth).padStart(2, '0')}-${String(
      Math.floor(100 + Math.random() * 900)
    )}`;

    const newPayment: IuranPayment = {
      id: `iur-${Date.now()}`,
      noKk: selectedKkForPay.noKk,
      headName: selectedKkForPay.headName,
      month: selectedMonth,
      year: selectedYear,
      amount: payAmount,
      method: payMethod,
      paidAt: new Date().toISOString(),
      receiptNumber: receiptNo,
      notes: payNotes,
      recordedBy: payMethod === 'transfer_wargaqu' ? 'Sistem WargaQu' : 'Bendahara RT',
    };

    const updatedIuran = [newPayment, ...iuranList];
    onSaveIuran(updatedIuran);

    // Also auto-record into Cash Book
    const newCashEntry: CashBookEntry = {
      id: `cb-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: 'masuk',
      category: 'Iuran Warga',
      description: `Iuran ${monthNames[selectedMonth - 1]} ${selectedYear} - KK ${
        selectedKkForPay.headName
      } (${selectedKkForPay.address})`,
      amount: payAmount,
      recordedBy: 'Sistem WargaQu / Bendahara',
    };
    onSaveCashBook([newCashEntry, ...cashBook]);

    setIsPayModalOpen(false);
    setReceiptModal(newPayment);
    onShowNotification(`Iuran KK ${selectedKkForPay.headName} lunas dicatat!`);
  };

  const handleAddCashEntry = () => {
    if (!cashDesc.trim()) {
      alert('Keterangan transaksi harus diisi.');
      return;
    }
    if (cashAmount <= 0) {
      alert('Nominal harus lebih dari 0.');
      return;
    }

    const newEntry: CashBookEntry = {
      id: `cb-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: cashType,
      category: cashCategory,
      description: cashDesc,
      amount: cashAmount,
      recordedBy: 'Bendahara RT',
    };

    onSaveCashBook([newEntry, ...cashBook]);
    setIsCashModalOpen(false);
    setCashDesc('');
    onShowNotification(
      `Transaksi kas ${cashType === 'masuk' ? 'pemasukan' : 'pengeluaran'} berhasil disimpan.`
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-stone-900 text-stone-100 overflow-hidden">
      {/* Sub Tab Switcher */}
      <div className="p-3 bg-stone-950 border-b border-stone-800 flex items-center justify-between shrink-0">
        <div className="flex bg-stone-850 p-1 rounded-xl border border-stone-700/60 w-full max-w-xs">
          <button
            onClick={() => setSubTab('iuran')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              subTab === 'iuran'
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Iuran Bulanan KK</span>
          </button>
          <button
            onClick={() => setSubTab('buku_kas')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              subTab === 'buku_kas'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Buku Kas RT</span>
          </button>
        </div>
      </div>

      {subTab === 'iuran' ? (
        /* ================= IURAN BULANAN VIEW ================= */
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
          {/* Month Selector & Stats Header */}
          <div className="p-4 rounded-3xl bg-stone-850 border border-stone-700/80 shadow-md space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                  Periode Iuran RT
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="bg-stone-900 border border-stone-700 rounded-xl px-2.5 py-1 text-xs text-amber-300 font-bold focus:outline-hidden focus:border-amber-500"
                  >
                    {monthNames.map((name, idx) => (
                      <option key={idx} value={idx + 1}>
                        {name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="bg-stone-900 border border-stone-700 rounded-xl px-2.5 py-1 text-xs text-white font-bold focus:outline-hidden"
                  >
                    <option value={2026}>2026</option>
                    <option value={2025}>2025</option>
                  </select>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-stone-400 block">Tarif per KK:</span>
                <span className="text-sm font-black text-emerald-400">
                  {formatRupiah(settings.monthlyFeePerKk)}
                </span>
              </div>
            </div>

            {/* Quick Summary Chips */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-stone-700/60 text-center">
              <div className="bg-stone-900/80 p-2 rounded-2xl border border-stone-800">
                <span className="text-[10px] text-stone-400 block">Lunas</span>
                <span className="text-sm font-bold text-emerald-400">{paidKkCount} KK</span>
              </div>
              <div className="bg-stone-900/80 p-2 rounded-2xl border border-stone-800">
                <span className="text-[10px] text-stone-400 block">Belum</span>
                <span className="text-sm font-bold text-rose-400">{unpaidKkCount} KK</span>
              </div>
              <div className="bg-stone-900/80 p-2 rounded-2xl border border-stone-800">
                <span className="text-[10px] text-stone-400 block">Terkumpul</span>
                <span className="text-xs font-bold text-amber-400 truncate block mt-0.5">
                  {formatRupiah(totalIuranCollected)}
                </span>
              </div>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari Kepala Keluarga / Blok..."
              value={searchKk}
              onChange={(e) => setSearchKk(e.target.value)}
              className="w-full bg-stone-850 border border-stone-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-200 placeholder-stone-500 focus:outline-hidden focus:border-amber-500"
            />
          </div>

          {/* List of KK and Payment Status */}
          <div className="space-y-2">
            {filteredKkList.map((kk) => {
              const payment = paidMap.get(kk.noKk);
              const isPaid = !!payment;

              return (
                <div
                  key={kk.noKk}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isPaid
                      ? 'bg-emerald-950/20 border-emerald-800/60 text-stone-200'
                      : 'bg-stone-850 border-stone-700/80 text-stone-300'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white truncate">{kk.headName}</h4>
                      {isPaid ? (
                        <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 flex items-center gap-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Lunas
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-rose-950 text-rose-300 border border-rose-800">
                          Belum Bayar
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-stone-400 mt-0.5">
                      {kk.address} · KK: {kk.noKk.slice(-6)}
                    </div>

                    {payment && (
                      <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                        <span>
                          {payment.method === 'transfer_wargaqu' ? 'Transfer WargaQu' : 'Tunai'} ·{' '}
                          {new Date(payment.paidAt).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center gap-1.5">
                    {isPaid ? (
                      <button
                        onClick={() => setReceiptModal(payment)}
                        className="px-2.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 text-[11px] font-bold border border-stone-700 flex items-center gap-1 active:scale-95 transition-all"
                      >
                        <Receipt className="w-3 h-3 text-amber-400" />
                        <span>Kuitansi</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenPayModal(kk)}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 text-xs font-bold shadow-md active:scale-95 transition-all flex items-center gap-1"
                      >
                        <span>Bayar</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ================= BUKU KAS RT VIEW ================= */
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
          {/* Kas Summary Card */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-emerald-950 via-stone-900 to-stone-900 border border-emerald-800/60 shadow-lg space-y-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-300/80 tracking-wider">
                Saldo Akhir Kas RT
              </span>
              <h2 className="text-2xl font-black text-emerald-400 tracking-tight mt-0.5">
                {formatRupiah(saldoKas)}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-800/40 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <ArrowDownRight className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 block">Total Masuk</span>
                  <span className="font-bold text-white text-[11px]">
                    {formatRupiah(totalMasuk)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 block">Total Keluar</span>
                  <span className="font-bold text-rose-400 text-[11px]">
                    {formatRupiah(totalKeluar)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Add Cash Transaction Button */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Riwayat Transaksi Kas RT
            </span>
            <button
              onClick={() => setIsCashModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Catat Kas</span>
            </button>
          </div>

          {/* Transactions List */}
          <div className="space-y-2">
            {cashBook.map((entry) => (
              <div
                key={entry.id}
                className="p-3.5 rounded-2xl bg-stone-850 border border-stone-700/70 shadow-sm flex items-start justify-between gap-2.5"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      entry.type === 'masuk'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {entry.type === 'masuk' ? (
                      <ArrowDownRight className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-stone-800 text-stone-300 border border-stone-700">
                      {entry.category}
                    </span>
                    <h4 className="text-xs font-bold text-white mt-1 leading-snug">
                      {entry.description}
                    </h4>
                    <span className="text-[10px] text-stone-400 block mt-0.5">
                      {entry.date} · {entry.recordedBy}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`text-xs font-black block ${
                      entry.type === 'masuk' ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {entry.type === 'masuk' ? '+' : '-'} {formatRupiah(entry.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pay Iuran Modal */}
      {isPayModalOpen && selectedKkForPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl p-4 text-stone-100 space-y-3.5">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-amber-400" />
                <span>Konfirmasi Pembayaran Iuran</span>
              </h3>
              <button
                onClick={() => setIsPayModalOpen(false)}
                className="w-7 h-7 rounded-full bg-stone-800 flex items-center justify-center text-stone-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-stone-850 p-3 rounded-2xl border border-stone-700/60 space-y-1">
              <span className="text-[10px] text-stone-400 uppercase font-bold">Wajib Iuran:</span>
              <div className="text-sm font-bold text-white">{selectedKkForPay.headName}</div>
              <div className="text-xs text-emerald-400">{selectedKkForPay.address}</div>
              <div className="text-[11px] text-amber-300 font-medium pt-1 border-t border-stone-700 mt-1">
                Periode: {monthNames[selectedMonth - 1]} {selectedYear}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-300 block mb-1">
                Nominal Iuran (Rp)
              </label>
              <input
                type="number"
                value={payAmount}
                onChange={(e) => setPayAmount(Number(e.target.value))}
                className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-sm text-amber-400 font-bold focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-300 block mb-1">
                Metode Pembayaran
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPayMethod('transfer_wargaqu')}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    payMethod === 'transfer_wargaqu'
                      ? 'bg-emerald-600 text-white border-emerald-500 font-bold'
                      : 'bg-stone-800 text-stone-400 border-stone-700'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Transfer WargaQu</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPayMethod('tunai')}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    payMethod === 'tunai'
                      ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold'
                      : 'bg-stone-800 text-stone-400 border-stone-700'
                  }`}
                >
                  <Banknote className="w-3.5 h-3.5" />
                  <span>Tunai Kasir RT</span>
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-300 block mb-1">
                Catatan (Opsional)
              </label>
              <input
                type="text"
                value={payNotes}
                onChange={(e) => setPayNotes(e.target.value)}
                placeholder="Catatan tambahan..."
                className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-hidden"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsPayModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-stone-800 text-stone-300 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmPayment}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md"
              >
                Simpan & Lunas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Digital Receipt Modal */}
      {receiptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl p-5 text-stone-100 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                Kuitansi Iuran Resmi
              </span>
              <button
                onClick={() => setReceiptModal(null)}
                className="w-7 h-7 rounded-full bg-stone-800 flex items-center justify-center text-stone-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white text-stone-900 p-4 rounded-2xl font-mono text-xs space-y-2 shadow-inner">
              <div className="text-center border-b border-stone-300 pb-2">
                <h4 className="font-black text-sm uppercase">PAGUYUBAN {settings.rtName}</h4>
                <p className="text-[10px] text-stone-600">
                  {settings.kelurahan} · {settings.rwName}
                </p>
                <span className="text-[9px] text-stone-500">{receiptModal.receiptNumber}</span>
              </div>

              <div className="space-y-1 text-[11px] pt-1">
                <div className="flex justify-between">
                  <span className="text-stone-600">Warga / KK:</span>
                  <span className="font-bold">{receiptModal.headName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">Periode:</span>
                  <span className="font-bold">
                    {monthNames[receiptModal.month - 1]} {receiptModal.year}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">Metode:</span>
                  <span className="font-bold uppercase">
                    {receiptModal.method === 'transfer_wargaqu' ? 'Transfer WargaQu' : 'Tunai'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">Waktu Bayar:</span>
                  <span>{new Date(receiptModal.paidAt).toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div className="border-t border-dashed border-stone-300 pt-2 flex justify-between font-bold text-sm">
                <span>TOTAL LUNAS:</span>
                <span className="text-emerald-700">{formatRupiah(receiptModal.amount)}</span>
              </div>

              <div className="text-center text-[9px] text-stone-500 pt-1 border-t border-stone-200">
                Penerima: {receiptModal.recordedBy}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator
                      .share({
                        title: `Kuitansi Iuran RT - ${receiptModal.headName}`,
                        text: `Bukti Lunas Iuran ${monthNames[receiptModal.month - 1]} ${
                          receiptModal.year
                        } atas nama ${receiptModal.headName} sebesar ${formatRupiah(
                          receiptModal.amount
                        )}. No: ${receiptModal.receiptNumber}`,
                      })
                      .catch(() => {});
                  } else {
                    alert('Kuitansi tersimpan di arsip digital RT.');
                  }
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Bagikan ke WA</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Cash Transaction Modal */}
      {isCashModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl p-4 text-stone-100 space-y-3.5">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-emerald-400" />
                <span>Catat Transaksi Buku Kas RT</span>
              </h3>
              <button
                onClick={() => setIsCashModalOpen(false)}
                className="w-7 h-7 rounded-full bg-stone-800 flex items-center justify-center text-stone-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-300 block mb-1">
                Jenis Transaksi
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCashType('masuk');
                    setCashCategory('Iuran Warga');
                  }}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 ${
                    cashType === 'masuk'
                      ? 'bg-emerald-600 text-white border-emerald-500 font-bold'
                      : 'bg-stone-800 text-stone-400 border-stone-700'
                  }`}
                >
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  <span>Kas Masuk</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCashType('keluar');
                    setCashCategory('Kebersihan');
                  }}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 ${
                    cashType === 'keluar'
                      ? 'bg-rose-600 text-white border-rose-500 font-bold'
                      : 'bg-stone-800 text-stone-400 border-stone-700'
                  }`}
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Kas Keluar</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-bold text-stone-300 block mb-1">Kategori</label>
                <select
                  value={cashCategory}
                  onChange={(e) => setCashCategory(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-hidden"
                >
                  {cashType === 'masuk' ? (
                    <>
                      <option value="Iuran Warga">Iuran Warga</option>
                      <option value="Donasi / Bantuan">Donasi / Bantuan</option>
                      <option value="Sewa Aset RT">Sewa Aset RT</option>
                      <option value="Lain-Lain">Lain-Lain</option>
                    </>
                  ) : (
                    <>
                      <option value="Kebersihan">Kebersihan</option>
                      <option value="Keamanan">Keamanan</option>
                      <option value="Perbaikan Fasum">Perbaikan Fasum</option>
                      <option value="Pembelian Aset">Pembelian Aset</option>
                      <option value="Konsumsi Rapat">Konsumsi Rapat</option>
                      <option value="Santunan Warga">Santunan Warga</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-300 block mb-1">
                  Nominal (Rp)
                </label>
                <input
                  type="number"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(Number(e.target.value))}
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-300 block mb-1">
                Keterangan Transaksi *
              </label>
              <textarea
                rows={2}
                value={cashDesc}
                onChange={(e) => setCashDesc(e.target.value)}
                placeholder="Contoh: Honor satpam ronda malam 2 orang..."
                className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-hidden"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsCashModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-stone-800 text-stone-300 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleAddCashEntry}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md"
              >
                Simpan Transaksi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
