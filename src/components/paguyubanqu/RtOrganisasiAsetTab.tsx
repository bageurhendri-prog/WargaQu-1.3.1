import React, { useState } from 'react';
import {
  Building,
  Boxes,
  Users,
  Plus,
  Phone,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  MessageCircle,
  Tag
} from 'lucide-react';
import {
  RtBoardMember,
  RtAsset,
  AssetCondition,
  AssetStatus
} from '../../types/rtqu';

interface RtOrganisasiAsetTabProps {
  board: RtBoardMember[];
  assets: RtAsset[];
  onSaveBoard: (board: RtBoardMember[]) => void;
  onSaveAssets: (assets: RtAsset[]) => void;
  onShowNotification: (msg: string) => void;
}

export const RtOrganisasiAsetTab: React.FC<RtOrganisasiAsetTabProps> = ({
  board,
  assets,
  onSaveBoard,
  onSaveAssets,
  onShowNotification,
}) => {
  const [subTab, setSubTab] = useState<'pengurus' | 'aset'>('pengurus');

  // Board Member Modal
  const [isBoardModalOpen, setIsBoardModalOpen] = useState<boolean>(false);
  const [editingMember, setEditingMember] = useState<RtBoardMember | null>(null);
  const [boardForm, setBoardForm] = useState<{
    position: string;
    name: string;
    period: string;
    phone: string;
    address: string;
    duties: string;
  }>({
    position: 'Ketua RT',
    name: '',
    period: '2025 - 2028',
    phone: '',
    address: '',
    duties: '',
  });

  // Asset Modal
  const [isAssetModalOpen, setIsAssetModalOpen] = useState<boolean>(false);
  const [editingAsset, setEditingAsset] = useState<RtAsset | null>(null);
  const [assetForm, setAssetForm] = useState<{
    name: string;
    category: string;
    quantity: number;
    condition: AssetCondition;
    notes: string;
  }>({
    name: '',
    category: 'Fasilitas Acara',
    quantity: 1,
    condition: 'baik',
    notes: '',
  });

  // Borrow Modal
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState<boolean>(false);
  const [selectedAssetForBorrow, setSelectedAssetForBorrow] = useState<RtAsset | null>(null);
  const [borrowForm, setBorrowForm] = useState<{
    borrowedBy: string;
    borrowDate: string;
    returnEstimate: string;
    notes: string;
  }>({
    borrowedBy: '',
    borrowDate: new Date().toISOString().split('T')[0],
    returnEstimate: '',
    notes: '',
  });

  // --- Handlers for Board ---
  const handleOpenAddBoard = () => {
    setEditingMember(null);
    setBoardForm({
      position: 'Seksi Keamanan & Ketertiban',
      name: '',
      period: '2025 - 2028',
      phone: '',
      address: '',
      duties: '',
    });
    setIsBoardModalOpen(true);
  };

  const handleOpenEditBoard = (mb: RtBoardMember) => {
    setEditingMember(mb);
    setBoardForm({
      position: mb.position,
      name: mb.name,
      period: mb.period,
      phone: mb.phone,
      address: mb.address,
      duties: mb.duties || '',
    });
    setIsBoardModalOpen(true);
  };

  const handleDeleteBoard = (id: string) => {
    if (confirm('Hapus data pengurus ini?')) {
      const updated = board.filter((b) => b.id !== id);
      onSaveBoard(updated);
      onShowNotification('Pengurus berhasil dihapus.');
    }
  };

  const handleSubmitBoard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!boardForm.name.trim()) return;

    if (editingMember) {
      const updated = board.map((b) =>
        b.id === editingMember.id ? { ...b, ...boardForm } : b
      );
      onSaveBoard(updated);
      onShowNotification('Data pengurus diperbarui.');
    } else {
      const newMb: RtBoardMember = {
        id: `bd-${Date.now()}`,
        ...boardForm,
      };
      onSaveBoard([...board, newMb]);
      onShowNotification('Pengurus baru ditambahkan.');
    }
    setIsBoardModalOpen(false);
  };

  // --- Handlers for Assets ---
  const handleOpenAddAsset = () => {
    setEditingAsset(null);
    setAssetForm({
      name: '',
      category: 'Fasilitas Acara',
      quantity: 1,
      condition: 'baik',
      notes: '',
    });
    setIsAssetModalOpen(true);
  };

  const handleSubmitAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetForm.name.trim()) return;

    if (editingAsset) {
      const updated = assets.map((a) =>
        a.id === editingAsset.id ? { ...a, ...assetForm } : a
      );
      onSaveAssets(updated);
      onShowNotification('Data aset berhasil diperbarui.');
    } else {
      const newAst: RtAsset = {
        id: `ast-${Date.now()}`,
        code: `AST-${Date.now().toString().slice(-4)}`,
        name: assetForm.name,
        category: assetForm.category,
        quantity: assetForm.quantity,
        condition: assetForm.condition,
        status: 'tersedia',
        notes: assetForm.notes,
      };
      onSaveAssets([...assets, newAst]);
      onShowNotification('Aset baru ditambahkan ke inventaris.');
    }
    setIsAssetModalOpen(false);
  };

  const handleOpenBorrowModal = (ast: RtAsset) => {
    setSelectedAssetForBorrow(ast);
    setBorrowForm({
      borrowedBy: '',
      borrowDate: new Date().toISOString().split('T')[0],
      returnEstimate: '',
      notes: '',
    });
    setIsBorrowModalOpen(true);
  };

  const handleConfirmBorrow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetForBorrow || !borrowForm.borrowedBy.trim()) return;

    const updated = assets.map((a) =>
      a.id === selectedAssetForBorrow.id
        ? {
            ...a,
            status: 'dipinjam' as AssetStatus,
            borrowedBy: borrowForm.borrowedBy,
            borrowDate: borrowForm.borrowDate,
            returnEstimate: borrowForm.returnEstimate,
            notes: borrowForm.notes || a.notes,
          }
        : a
    );
    onSaveAssets(updated);
    setIsBorrowModalOpen(false);
    onShowNotification(
      `Peminjaman ${selectedAssetForBorrow.name} oleh ${borrowForm.borrowedBy} dicatat.`
    );
  };

  const handleReturnAsset = (ast: RtAsset) => {
    if (confirm(`Konfirmasi pengembalian ${ast.name} ke inventaris RT?`)) {
      const updated = assets.map((a) =>
        a.id === ast.id
          ? {
              ...a,
              status: 'tersedia' as AssetStatus,
              borrowedBy: undefined,
              borrowDate: undefined,
              returnEstimate: undefined,
            }
          : a
      );
      onSaveAssets(updated);
      onShowNotification(`${ast.name} telah dikembalikan & berstatus tersedia.`);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-stone-900 text-stone-100 overflow-hidden">
      {/* Sub Tabs */}
      <div className="p-3 bg-stone-950 border-b border-stone-800 flex items-center justify-between shrink-0">
        <div className="flex bg-stone-850 p-1 rounded-xl border border-stone-700/60 w-full max-w-xs">
          <button
            onClick={() => setSubTab('pengurus')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              subTab === 'pengurus'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Pengurus RT/RW ({board.length})</span>
          </button>
          <button
            onClick={() => setSubTab('aset')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              subTab === 'aset'
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>Inventaris Aset ({assets.length})</span>
          </button>
        </div>

        {subTab === 'pengurus' ? (
          <button
            onClick={handleOpenAddBoard}
            className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Pengurus</span>
          </button>
        ) : (
          <button
            onClick={handleOpenAddAsset}
            className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold flex items-center gap-1 active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Aset</span>
          </button>
        )}
      </div>

      {subTab === 'pengurus' ? (
        /* ================= PENGURUS RT/RW VIEW ================= */
        <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
          <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
            Struktur Organisasi & Kepengurusan RT/RW
          </div>

          <div className="space-y-2">
            {board.map((mb, idx) => (
              <div
                key={mb.id}
                className="p-3.5 rounded-2xl bg-stone-850 border border-stone-700/70 shadow-sm space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center font-bold text-sm shrink-0">
                      #{idx + 1}
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                        {mb.position}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-0.5">{mb.name}</h4>
                      <div className="text-[11px] text-stone-400 mt-0.5">
                        Periode: {mb.period} · {mb.address}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditBoard(mb)}
                      className="p-1.5 rounded-lg bg-stone-800 text-stone-300 hover:text-white"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteBoard(mb.id)}
                      className="p-1.5 rounded-lg bg-stone-800 text-stone-400 hover:text-red-400"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {mb.duties && (
                  <div className="p-2 rounded-xl bg-stone-900 border border-stone-800 text-[11px] text-stone-300">
                    <strong className="text-stone-400 font-semibold block text-[10px] uppercase">
                      Tugas & Wewenang:
                    </strong>
                    {mb.duties}
                  </div>
                )}

                {mb.phone && (
                  <div className="pt-1 flex justify-end">
                    <a
                      href={`https://wa.me/${mb.phone.replace(/^0/, '62')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1 active:scale-95 transition-all"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Hubungi {mb.phone}</span>
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ================= INVENTARIS ASET RT VIEW ================= */
        <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
          <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
            Daftar Fasilitas & Peralatan Milik RT
          </div>

          <div className="space-y-2.5">
            {assets.map((ast) => {
              const isBorrowed = ast.status === 'dipinjam';

              return (
                <div
                  key={ast.id}
                  className={`p-3.5 rounded-2xl border transition-all space-y-2 ${
                    isBorrowed
                      ? 'bg-amber-950/20 border-amber-800/80'
                      : 'bg-stone-850 border-stone-700/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-stone-800 text-stone-400 border border-stone-700">
                          {ast.code}
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-400">
                          {ast.category}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white mt-1">{ast.name}</h4>

                      <div className="flex items-center gap-2 text-xs text-stone-300 mt-0.5">
                        <span>Jumlah: <strong className="text-white">{ast.quantity} Unit</strong></span>
                        <span>·</span>
                        <span className="capitalize text-stone-400">Kondisi: {ast.condition}</span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                        isBorrowed
                          ? 'bg-amber-950 text-amber-300 border-amber-800 animate-pulse'
                          : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      }`}
                    >
                      {isBorrowed ? 'Dipinjam' : 'Tersedia'}
                    </span>
                  </div>

                  {ast.notes && (
                    <p className="text-[11px] text-stone-400 italic">Catatan: {ast.notes}</p>
                  )}

                  {/* Borrowed Details Strip */}
                  {isBorrowed && (
                    <div className="p-2.5 rounded-xl bg-stone-900 border border-amber-800/60 text-xs space-y-1">
                      <div className="text-[11px] text-amber-300 font-bold">
                        Peminjam: {ast.borrowedBy}
                      </div>
                      <div className="text-[10px] text-stone-400">
                        Dipinjam tgl: {ast.borrowDate || '-'} · Estimasi kembali: {ast.returnEstimate || '-'}
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="pt-2 border-t border-stone-700/50 flex items-center justify-between">
                    <span className="text-[10px] text-stone-400">Kelola Status:</span>

                    {isBorrowed ? (
                      <button
                        onClick={() => handleReturnAsset(ast)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shadow-sm active:scale-95 transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Kembalikan Aset</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenBorrowModal(ast)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold flex items-center gap-1 shadow-sm active:scale-95 transition-all"
                      >
                        <Boxes className="w-3.5 h-3.5" />
                        <span>Pinjamkan ke Warga</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Board Member Modal */}
      {isBoardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl p-4 text-stone-100 space-y-3">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Building className="w-4 h-4 text-emerald-400" />
                <span>{editingMember ? 'Edit Pengurus RT' : 'Tambah Pengurus RT'}</span>
              </h3>
              <button
                onClick={() => setIsBoardModalOpen(false)}
                className="w-7 h-7 rounded-full bg-stone-800 flex items-center justify-center text-stone-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitBoard} className="space-y-2.5">
              <div>
                <label className="text-[11px] font-bold text-stone-300 block mb-1">Jabatan *</label>
                <input
                  type="text"
                  required
                  value={boardForm.position}
                  onChange={(e) => setBoardForm({ ...boardForm, position: e.target.value })}
                  placeholder="Contoh: Bendahara RT / Seksi Keamanan"
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-300 block mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  value={boardForm.name}
                  onChange={(e) => setBoardForm({ ...boardForm, name: e.target.value })}
                  placeholder="Nama pengurus..."
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-stone-300 block mb-1">Periode</label>
                  <input
                    type="text"
                    value={boardForm.period}
                    onChange={(e) => setBoardForm({ ...boardForm, period: e.target.value })}
                    placeholder="2025 - 2028"
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-stone-300 block mb-1">No HP/WA</label>
                  <input
                    type="text"
                    value={boardForm.phone}
                    onChange={(e) => setBoardForm({ ...boardForm, phone: e.target.value })}
                    placeholder="0812..."
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-300 block mb-1">
                  Alamat Rumah
                </label>
                <input
                  type="text"
                  value={boardForm.address}
                  onChange={(e) => setBoardForm({ ...boardForm, address: e.target.value })}
                  placeholder="Blok A2 No. 12"
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-300 block mb-1">
                  Tugas & Wewenang
                </label>
                <textarea
                  rows={2}
                  value={boardForm.duties}
                  onChange={(e) => setBoardForm({ ...boardForm, duties: e.target.value })}
                  placeholder="Tugas pokok kepengurusan..."
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-hidden"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsBoardModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-stone-800 text-stone-300 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md"
                >
                  Simpan Pengurus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Asset Form Modal */}
      {isAssetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl p-4 text-stone-100 space-y-3">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Boxes className="w-4 h-4 text-amber-400" />
                <span>Tambah Aset & Fasilitas RT</span>
              </h3>
              <button
                onClick={() => setIsAssetModalOpen(false)}
                className="w-7 h-7 rounded-full bg-stone-800 flex items-center justify-center text-stone-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitAsset} className="space-y-2.5">
              <div>
                <label className="text-[11px] font-bold text-stone-300 block mb-1">Nama Aset *</label>
                <input
                  type="text"
                  required
                  value={assetForm.name}
                  onChange={(e) => setAssetForm({ ...assetForm, name: e.target.value })}
                  placeholder="Contoh: Tenda Terop Besi / Kursi Plastik"
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-stone-300 block mb-1">Kategori</label>
                  <select
                    value={assetForm.category}
                    onChange={(e) => setAssetForm({ ...assetForm, category: e.target.value })}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-hidden"
                  >
                    <option value="Fasilitas Acara">Fasilitas Acara</option>
                    <option value="Elektronik">Elektronik</option>
                    <option value="Peralatan Lingkungan">Peralatan Lingkungan</option>
                    <option value="Alat Gotong Royong">Alat Gotong Royong</option>
                    <option value="Keamanan">Keamanan</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-300 block mb-1">Jumlah</label>
                  <input
                    type="number"
                    min={1}
                    value={assetForm.quantity}
                    onChange={(e) =>
                      setAssetForm({ ...assetForm, quantity: Number(e.target.value) })
                    }
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-300 block mb-1">Kondisi</label>
                <select
                  value={assetForm.condition}
                  onChange={(e) =>
                    setAssetForm({ ...assetForm, condition: e.target.value as AssetCondition })
                  }
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-hidden"
                >
                  <option value="baik">Kondisi Baik / Layak Pakai</option>
                  <option value="rusak_ringan">Rusak Ringan</option>
                  <option value="rusak_berat">Rusak Berat</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-300 block mb-1">
                  Catatan / Lokasi Penyimpanan
                </label>
                <input
                  type="text"
                  value={assetForm.notes}
                  onChange={(e) => setAssetForm({ ...assetForm, notes: e.target.value })}
                  placeholder="Gudang Balai Warga / Pos Ronda"
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-hidden"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAssetModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-stone-800 text-stone-300 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold shadow-md"
                >
                  Simpan Aset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Borrow Asset Modal */}
      {isBorrowModalOpen && selectedAssetForBorrow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl p-4 text-stone-100 space-y-3">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Boxes className="w-4 h-4 text-amber-400" />
                <span>Form Peminjaman Aset RT</span>
              </h3>
              <button
                onClick={() => setIsBorrowModalOpen(false)}
                className="w-7 h-7 rounded-full bg-stone-800 flex items-center justify-center text-stone-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-stone-850 rounded-2xl border border-stone-700/60">
              <span className="text-[10px] text-stone-400 uppercase font-bold">Barang Dipinjam:</span>
              <div className="text-sm font-bold text-amber-300">{selectedAssetForBorrow.name}</div>
              <div className="text-xs text-stone-400">
                Jumlah: {selectedAssetForBorrow.quantity} Unit · Kode: {selectedAssetForBorrow.code}
              </div>
            </div>

            <form onSubmit={handleConfirmBorrow} className="space-y-2.5">
              <div>
                <label className="text-[11px] font-bold text-stone-300 block mb-1">
                  Nama Warga Peminjam *
                </label>
                <input
                  type="text"
                  required
                  value={borrowForm.borrowedBy}
                  onChange={(e) => setBorrowForm({ ...borrowForm, borrowedBy: e.target.value })}
                  placeholder="Nama peminjam & No Rumah (cth: Bpk. Hendro Blok A1 No 02)"
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-stone-300 block mb-1">
                    Tanggal Pinjam
                  </label>
                  <input
                    type="date"
                    value={borrowForm.borrowDate}
                    onChange={(e) => setBorrowForm({ ...borrowForm, borrowDate: e.target.value })}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-300 block mb-1">
                    Estimasi Kembali
                  </label>
                  <input
                    type="date"
                    value={borrowForm.returnEstimate}
                    onChange={(e) =>
                      setBorrowForm({ ...borrowForm, returnEstimate: e.target.value })
                    }
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-300 block mb-1">
                  Keperluan Pinjam
                </label>
                <input
                  type="text"
                  value={borrowForm.notes}
                  onChange={(e) => setBorrowForm({ ...borrowForm, notes: e.target.value })}
                  placeholder="Contoh: Acara tasyakuran keluarga"
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-hidden"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsBorrowModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-stone-800 text-stone-300 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold shadow-md"
                >
                  Konfirmasi Pinjam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
