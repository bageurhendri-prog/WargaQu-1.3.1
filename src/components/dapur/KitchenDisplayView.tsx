import React, { useState, useEffect } from 'react';
import {
  ChefHat,
  Clock,
  CheckCircle2,
  Flame,
  Printer,
  AlertCircle,
  Bell,
  Search,
  Check,
  ShoppingBag,
  Sparkles,
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';
import { Order, RestaurantProfile, PrinterConfig } from '../../types';
import { PrinterService } from '../../services/printer';

interface KitchenDisplayViewProps {
  activeOrders: Record<string, Order>;
  onUpdateKitchenStatus: (orderId: string, status: 'menunggu' | 'dimasak' | 'siap') => void;
  profile: RestaurantProfile;
  printerConfig: PrinterConfig;
  onOpenReceipt: (order: Order) => void;
}

export const KitchenDisplayView: React.FC<KitchenDisplayViewProps> = ({
  activeOrders,
  onUpdateKitchenStatus,
  profile,
  printerConfig,
  onOpenReceipt,
}) => {
  const [filter, setFilter] = useState<'semua' | 'menunggu' | 'dimasak' | 'siap'>('semua');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [now, setNow] = useState<Date>(new Date());

  // Update timer every 15s to keep elapsed time fresh
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(timer);
  }, []);

  const ordersList = Object.values(activeOrders).sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const getKitchenStatus = (order: Order): 'menunggu' | 'dimasak' | 'siap' => {
    return order.kitchenStatus || 'menunggu';
  };

  const filteredOrders = ordersList.filter((ord) => {
    const status = getKitchenStatus(ord);
    if (filter === 'semua') return true;
    return status === filter;
  });

  const countMenunggu = ordersList.filter((o) => getKitchenStatus(o) === 'menunggu').length;
  const countDimasak = ordersList.filter((o) => getKitchenStatus(o) === 'dimasak').length;
  const countSiap = ordersList.filter((o) => getKitchenStatus(o) === 'siap').length;

  const getElapsedTimeText = (createdAt: string) => {
    const created = new Date(createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Baru Saja';
    if (diffMins < 60) return `${diffMins} mnt lalu`;
    const hours = Math.floor(diffMins / 60);
    return `${hours} jam lalu`;
  };

  const getElapsedTimeBadge = (createdAt: string) => {
    const created = new Date(createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins > 20) {
      return 'bg-red-950 text-red-300 border-red-800 animate-pulse';
    }
    if (diffMins > 10) {
      return 'bg-amber-950 text-amber-300 border-amber-800';
    }
    return 'bg-stone-800 text-stone-300 border-stone-700';
  };

  const toggleItemCheck = (orderId: string, itemIdx: number) => {
    const key = `${orderId}-${itemIdx}`;
    setCheckedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handlePrintKitchenSlip = async (order: Order) => {
    await PrinterService.printOrder(order, profile, printerConfig, true);
    onOpenReceipt(order);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-stone-950 text-stone-100 overflow-hidden">
      {/* KDS Header Banner */}
      <div className="p-3 bg-stone-900 border-b border-stone-800 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-orange-600/20 text-orange-400 border border-orange-500/30 flex items-center justify-center font-bold shadow-md">
              <ChefHat className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-tight">
                  Kitchen Display System (KDS)
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-orange-950 text-orange-300 border border-orange-800">
                  {ordersList.length} Tiket
                </span>
              </div>
              <p className="text-[11px] text-stone-400">
                Layar kontrol antrian memasak & racikan bakso
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold text-amber-400 bg-stone-800 px-2 py-1 rounded-lg border border-stone-700/60 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              {now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {/* Status Filter Chips */}
        <div className="grid grid-cols-4 gap-1.5 mt-3">
          <button
            onClick={() => setFilter('semua')}
            className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold transition-all flex items-center justify-center gap-1 border ${
              filter === 'semua'
                ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-sm font-bold'
                : 'bg-stone-800/80 text-stone-400 hover:text-stone-200 border-stone-700/60'
            }`}
          >
            <span>Semua</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20">
              {ordersList.length}
            </span>
          </button>

          <button
            onClick={() => setFilter('menunggu')}
            className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold transition-all flex items-center justify-center gap-1 border ${
              filter === 'menunggu'
                ? 'bg-red-700 text-white border-red-500 shadow-sm font-bold'
                : 'bg-stone-800/80 text-stone-400 hover:text-stone-200 border-stone-700/60'
            }`}
          >
            <span>Antri</span>
            {countMenunggu > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-red-950 text-red-200 font-bold border border-red-800">
                {countMenunggu}
              </span>
            )}
          </button>

          <button
            onClick={() => setFilter('dimasak')}
            className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold transition-all flex items-center justify-center gap-1 border ${
              filter === 'dimasak'
                ? 'bg-orange-600 text-white border-orange-500 shadow-sm font-bold'
                : 'bg-stone-800/80 text-stone-400 hover:text-stone-200 border-stone-700/60'
            }`}
          >
            <span>Masak</span>
            {countDimasak > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-orange-950 text-orange-200 font-bold border border-orange-800">
                {countDimasak}
              </span>
            )}
          </button>

          <button
            onClick={() => setFilter('siap')}
            className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold transition-all flex items-center justify-center gap-1 border ${
              filter === 'siap'
                ? 'bg-emerald-600 text-white border-emerald-400 shadow-sm font-bold'
                : 'bg-stone-800/80 text-stone-400 hover:text-stone-200 border-stone-700/60'
            }`}
          >
            <span>Siap</span>
            {countSiap > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-200 font-bold border border-emerald-800">
                {countSiap}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Order Cards Grid / List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6 text-stone-400 space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-500">
              <ChefHat className="w-8 h-8 text-amber-500/50" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-200">
                {filter === 'semua'
                  ? 'Dapur Kosong, Tidak Ada Pesanan'
                  : `Tidak ada pesanan berstatus "${filter}"`}
              </h3>
              <p className="text-xs text-stone-400 mt-1 max-w-[260px] mx-auto">
                Pesanan yang dibuat di Modul Kasir atau Meja akan otomatis muncul di sini secara real-time.
              </p>
            </div>
          </div>
        ) : (
          filteredOrders.map((order, orderIndex) => {
            const status = getKitchenStatus(order);
            const totalQty = order.items.reduce((s, it) => s + it.quantity, 0);

            return (
              <div
                key={order.id}
                className={`rounded-2xl border transition-all overflow-hidden shadow-lg ${
                  status === 'siap'
                    ? 'bg-emerald-950/20 border-emerald-800/80'
                    : status === 'dimasak'
                    ? 'bg-orange-950/20 border-orange-700/80'
                    : 'bg-stone-900/90 border-stone-800'
                }`}
              >
                {/* Ticket Top Bar */}
                <div className="p-3 bg-stone-900 border-b border-stone-800/90 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 font-mono text-xs font-black flex items-center justify-center border border-amber-500/30">
                      #{orderIndex + 1}
                    </span>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-black text-white">
                          {order.type === 'meja' ? order.tableName || 'Meja' : 'Bungkus / Takeaway'}
                        </span>
                        {order.type === 'bungkus' && (
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-red-950 text-red-300 border border-red-800 flex items-center gap-0.5">
                            <ShoppingBag className="w-2.5 h-2.5" />
                            Takeaway
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-stone-400">
                        {order.customerName} · {order.receiptNumber}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full border flex items-center gap-1 ${getElapsedTimeBadge(
                        order.createdAt
                      )}`}
                    >
                      <Clock className="w-2.5 h-2.5" />
                      {getElapsedTimeText(order.createdAt)}
                    </span>
                    <span className="text-[10px] font-bold text-amber-400">
                      {totalQty} Porsi
                    </span>
                  </div>
                </div>

                {/* Items Checklist for Kitchen Staff */}
                <div className="p-3 space-y-2 bg-stone-950/50">
                  <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Menu Pesanan (Centang Bila Sudah Siap)</span>
                    <span className="text-[10px] text-stone-400 font-normal">
                      Klik item untuk checklist
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {order.items.map((item, itemIdx) => {
                      const isChecked = !!checkedItems[`${order.id}-${itemIdx}`];

                      return (
                        <div
                          key={itemIdx}
                          onClick={() => toggleItemCheck(order.id, itemIdx)}
                          className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition-all select-none ${
                            isChecked
                              ? 'bg-emerald-950/30 border-emerald-800/60 text-stone-400 opacity-60'
                              : 'bg-stone-900 border-stone-800 text-stone-100 hover:border-stone-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                                isChecked
                                  ? 'bg-emerald-600 border-emerald-500 text-white'
                                  : 'border-stone-700 bg-stone-800'
                              }`}
                            >
                              {isChecked && <Check className="w-3.5 h-3.5 stroke-3" />}
                            </div>

                            <span
                              className={`text-xs font-semibold ${
                                isChecked ? 'line-through text-stone-400' : 'text-white'
                              }`}
                            >
                              <strong className="text-amber-400 font-black mr-1 text-sm">
                                {item.quantity}x
                              </strong>
                              {item.name}
                            </span>
                          </div>

                          {item.notes && (
                            <span className="text-[10px] bg-red-950/60 text-red-300 border border-red-800/60 px-1.5 py-0.5 rounded font-medium max-w-[130px] truncate">
                              Catatan: {item.notes}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Kitchen Action Strip */}
                <div className="p-3 bg-stone-900 border-t border-stone-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handlePrintKitchenSlip(order)}
                    title="Cetak Struk Tiket Dapur ke Printer Bluetooth"
                    className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700/60 flex items-center gap-1.5 text-xs font-semibold transition-all active:scale-95"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden xs:inline">Cetak</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {status === 'menunggu' && (
                      <button
                        onClick={() => onUpdateKitchenStatus(order.id, 'dimasak')}
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                      >
                        <Flame className="w-3.5 h-3.5" />
                        <span>Mulai Masak</span>
                      </button>
                    )}

                    {status === 'dimasak' && (
                      <button
                        onClick={() => onUpdateKitchenStatus(order.id, 'siap')}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Tandai Siap Saji</span>
                      </button>
                    )}

                    {status === 'siap' && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950 px-2 py-1 rounded-lg border border-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Siap Diantar
                        </span>
                        <button
                          onClick={() => onUpdateKitchenStatus(order.id, 'menunggu')}
                          className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200 text-[10px] transition-colors"
                          title="Kembalikan status ke antrian"
                        >
                          <RefreshCw className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
