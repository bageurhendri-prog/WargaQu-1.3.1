import React, { useState } from 'react';
import {
  UserCheck,
  Plus,
  UtensilsCrossed,
  ShoppingBag,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  Search
} from 'lucide-react';
import { TableItem, Order } from '../../types';

interface WaiterViewProps {
  tables: TableItem[];
  activeOrders: Record<string, Order>;
  onSelectTable: (table: TableItem) => void;
  onOpenTakeaway: () => void;
}

export const WaiterView: React.FC<WaiterViewProps> = ({
  tables,
  activeOrders,
  onSelectTable,
  onOpenTakeaway,
}) => {
  const [filter, setFilter] = useState<'semua' | 'kosong' | 'terisi'>('semua');
  const [search, setSearch] = useState<string>('');

  const filteredTables = tables.filter((t) => {
    if (filter === 'kosong' && t.status !== 'kosong') return false;
    if (filter === 'terisi' && t.status === 'kosong') return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const emptyCount = tables.filter((t) => t.status === 'kosong').length;
  const occupiedCount = tables.filter((t) => t.status !== 'kosong').length;

  return (
    <div className="flex-1 flex flex-col h-full bg-stone-900 text-stone-100 overflow-hidden">
      {/* Top Banner */}
      <div className="p-3 bg-stone-950 border-b border-stone-800 shrink-0 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                Mode Pelayan (Waiter Handheld)
              </h2>
              <p className="text-[11px] text-stone-400">
                Catat pesanan cepat langsung dari meja pelanggan
              </p>
            </div>
          </div>

          <button
            onClick={onOpenTakeaway}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-700 to-amber-600 hover:from-red-600 hover:to-amber-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Bungkus</span>
          </button>
        </div>

        {/* Filter & Counter Chips */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilter('semua')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                filter === 'semua'
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'bg-stone-800 text-stone-400 hover:text-white'
              }`}
            >
              Semua ({tables.length})
            </button>
            <button
              onClick={() => setFilter('kosong')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                filter === 'kosong'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-stone-800 text-emerald-400 hover:text-white'
              }`}
            >
              Kosong ({emptyCount})
            </button>
            <button
              onClick={() => setFilter('terisi')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                filter === 'terisi'
                  ? 'bg-red-700 text-white font-bold'
                  : 'bg-stone-800 text-red-400 hover:text-white'
              }`}
            >
              Terisi ({occupiedCount})
            </button>
          </div>

          <div className="relative w-28">
            <input
              type="text"
              placeholder="Cari meja..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-stone-800 border border-stone-700 rounded-lg px-2 py-1 text-xs text-stone-200 placeholder-stone-500 focus:outline-hidden focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="flex-1 overflow-y-auto p-3.5">
        <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">
          Pilih Meja untuk Memulai / Menambah Pesanan
        </div>

        <div className="grid grid-cols-2 gap-3">
          {filteredTables.map((table) => {
            const isOccupied = table.status !== 'kosong';
            const order = table.orderId ? activeOrders[table.orderId] : null;
            const itemsCount = order
              ? order.items.reduce((s, it) => s + it.quantity, 0)
              : 0;

            return (
              <button
                key={table.id}
                onClick={() => onSelectTable(table)}
                className={`p-3.5 rounded-2xl border text-left transition-all active:scale-98 flex flex-col justify-between min-h-[110px] ${
                  isOccupied
                    ? 'bg-gradient-to-b from-stone-800/95 to-red-950/40 border-red-800/80 shadow-md ring-1 ring-red-700/30'
                    : 'bg-stone-800/70 hover:bg-stone-800 border-stone-700/60 hover:border-emerald-500/60 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm ${
                        isOccupied
                          ? 'bg-red-600 text-white shadow-sm'
                          : 'bg-emerald-600 text-white shadow-sm'
                      }`}
                    >
                      {table.number}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">{table.name}</h3>
                      <span className="text-[10px] text-stone-400">
                        {isOccupied ? table.customerName || 'Tamu' : 'Siap Dipakai'}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isOccupied ? 'bg-red-500 animate-pulse' : 'bg-emerald-400'
                    }`}
                  />
                </div>

                <div className="mt-3 pt-2 border-t border-stone-700/50 flex items-center justify-between text-xs">
                  {isOccupied ? (
                    <>
                      <span className="text-amber-400 font-bold text-[11px]">
                        {itemsCount} Porsi
                      </span>
                      <span className="text-[10px] bg-red-950 text-red-300 px-1.5 py-0.5 rounded border border-red-800 font-semibold">
                        + Tambah Menu
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-stone-400 text-[11px]">Kosong</span>
                      <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800 font-bold flex items-center gap-0.5">
                        <Plus className="w-2.5 h-2.5" /> Catat Order
                      </span>
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
