import React, { useState } from 'react';
import {
  Users,
  Home,
  Search,
  Plus,
  Phone,
  Edit2,
  Trash2,
  X,
  Check,
  Building,
  UserCheck,
  Shield,
  MessageCircle,
  Filter
} from 'lucide-react';
import { Citizen, DomicileStatus, FamilyRole, Gender } from '../../types/rtqu';

interface RtKependudukanTabProps {
  citizens: Citizen[];
  onSaveCitizens: (citizens: Citizen[]) => void;
  onShowNotification: (msg: string) => void;
}

export const RtKependudukanTab: React.FC<RtKependudukanTabProps> = ({
  citizens,
  onSaveCitizens,
  onShowNotification,
}) => {
  const [viewMode, setViewMode] = useState<'warga' | 'kk'>('warga');
  const [domicileFilter, setDomicileFilter] = useState<'semua' | 'tetap' | 'kontrak'>('semua');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCitizen, setEditingCitizen] = useState<Citizen | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    nik: string;
    noKk: string;
    name: string;
    gender: Gender;
    religion: string;
    domicileStatus: DomicileStatus;
    familyRole: FamilyRole;
    phone: string;
    addressBlock: string;
    addressNumber: string;
    occupation: string;
  }>({
    nik: '',
    noKk: '',
    name: '',
    gender: 'L',
    religion: 'Islam',
    domicileStatus: 'tetap',
    familyRole: 'kepala_keluarga',
    phone: '',
    addressBlock: 'Blok A1',
    addressNumber: '01',
    occupation: '',
  });

  const handleOpenAdd = () => {
    setEditingCitizen(null);
    setFormData({
      nik: '',
      noKk: '',
      name: '',
      gender: 'L',
      religion: 'Islam',
      domicileStatus: 'tetap',
      familyRole: 'kepala_keluarga',
      phone: '',
      addressBlock: 'Blok A1',
      addressNumber: '01',
      occupation: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cz: Citizen) => {
    setEditingCitizen(cz);
    setFormData({
      nik: cz.nik,
      noKk: cz.noKk,
      name: cz.name,
      gender: cz.gender,
      religion: cz.religion,
      domicileStatus: cz.domicileStatus,
      familyRole: cz.familyRole,
      phone: cz.phone,
      addressBlock: cz.addressBlock,
      addressNumber: cz.addressNumber,
      occupation: cz.occupation,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Yakin ingin menghapus data warga ini?')) {
      const updated = citizens.filter((c) => c.id !== id);
      onSaveCitizens(updated);
      onShowNotification('Data warga berhasil dihapus.');
    }
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Nama warga harus diisi.');
      return;
    }

    if (editingCitizen) {
      const updated = citizens.map((c) =>
        c.id === editingCitizen.id
          ? {
              ...c,
              ...formData,
              isHeadOfFamily: formData.familyRole === 'kepala_keluarga',
            }
          : c
      );
      onSaveCitizens(updated);
      onShowNotification('Data warga berhasil diperbarui.');
    } else {
      const newCitizen: Citizen = {
        id: `cz-${Date.now()}`,
        ...formData,
        isHeadOfFamily: formData.familyRole === 'kepala_keluarga',
        createdAt: new Date().toISOString(),
      };
      const updated = [newCitizen, ...citizens];
      onSaveCitizens(updated);
      onShowNotification(`Data ${formData.name} berhasil ditambahkan.`);
    }

    setIsModalOpen(false);
  };

  // Filtering
  const filteredCitizens = citizens.filter((c) => {
    if (domicileFilter !== 'semua' && c.domicileStatus !== domicileFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q);
      const matchNik = c.nik.includes(q);
      const matchKk = c.noKk.includes(q);
      const matchAddr = `${c.addressBlock} ${c.addressNumber}`.toLowerCase().includes(q);
      return matchName || matchNik || matchKk || matchAddr;
    }
    return true;
  });

  // Group by KK for KK view
  const kkMap = new Map<string, Citizen[]>();
  citizens.forEach((c) => {
    const list = kkMap.get(c.noKk) || [];
    list.push(c);
    kkMap.set(c.noKk, list);
  });

  const kkList = Array.from(kkMap.entries()).map(([noKk, members]) => {
    const head =
      members.find((m) => m.familyRole === 'kepala_keluarga') ||
      members[0];
    return {
      noKk,
      head,
      members,
      memberCount: members.length,
      address: `${head.addressBlock} No. ${head.addressNumber}`,
      domicileStatus: head.domicileStatus,
      phone: head.phone,
    };
  });

  const filteredKkList = kkList.filter((kk) => {
    if (domicileFilter !== 'semua' && kk.domicileStatus !== domicileFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchHead = kk.head.name.toLowerCase().includes(q);
      const matchKk = kk.noKk.includes(q);
      const matchAddr = kk.address.toLowerCase().includes(q);
      return matchHead || matchKk || matchAddr;
    }
    return true;
  });

  const formatRoleLabel = (role: FamilyRole) => {
    switch (role) {
      case 'kepala_keluarga':
        return 'Kepala Keluarga';
      case 'istri':
        return 'Istri';
      case 'anak':
        return 'Anak';
      case 'orang_tua':
        return 'Orang Tua / Mertua';
      default:
        return 'Famili Lain';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-stone-900 text-stone-100 overflow-hidden">
      {/* Top Filter and Search Bar */}
      <div className="p-3 bg-stone-950 border-b border-stone-800 space-y-2.5 shrink-0">
        <div className="flex items-center justify-between gap-2">
          {/* Mode Switcher: Warga vs KK */}
          <div className="flex bg-stone-850 p-1 rounded-xl border border-stone-700/60">
            <button
              onClick={() => setViewMode('warga')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'warga'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              Warga ({citizens.length})
            </button>
            <button
              onClick={() => setViewMode('kk')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'kk'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              Kartu Keluarga ({kkList.length})
            </button>
          </div>

          {/* Add Button */}
          <button
            onClick={handleOpenAdd}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah</span>
          </button>
        </div>

        {/* Filter Domisili Chips & Search Input */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setDomicileFilter('semua')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                domicileFilter === 'semua'
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'bg-stone-800 text-stone-400 hover:text-white'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setDomicileFilter('tetap')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                domicileFilter === 'tetap'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-stone-800 text-emerald-400 hover:text-white'
              }`}
            >
              Tetap
            </button>
            <button
              onClick={() => setDomicileFilter('kontrak')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                domicileFilter === 'kontrak'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-stone-800 text-blue-400 hover:text-white'
              }`}
            >
              Kontrak
            </button>
          </div>

          <div className="relative flex-1 max-w-[170px]">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari NIK / Nama / Blok..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-800 border border-stone-700 rounded-xl pl-8 pr-2 py-1 text-xs text-stone-200 placeholder-stone-500 focus:outline-hidden focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Main List Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {viewMode === 'warga' ? (
          filteredCitizens.length === 0 ? (
            <div className="text-center py-12 text-stone-500">
              <Users className="w-10 h-10 mx-auto text-stone-600 mb-2" />
              <p className="text-xs">Tidak ada data warga yang sesuai.</p>
            </div>
          ) : (
            filteredCitizens.map((cz) => (
              <div
                key={cz.id}
                className="p-3.5 rounded-2xl bg-stone-850 border border-stone-700/70 shadow-sm hover:border-stone-600 transition-all space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 shadow-sm ${
                        cz.gender === 'L'
                          ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {cz.name.charAt(0)}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-sm font-bold text-white tracking-tight">{cz.name}</h4>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                            cz.domicileStatus === 'tetap'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-blue-950 text-blue-300 border border-blue-800'
                          }`}
                        >
                          {cz.domicileStatus}
                        </span>
                      </div>

                      <div className="text-[11px] text-amber-300 font-semibold mt-0.5">
                        {formatRoleLabel(cz.familyRole)}
                      </div>

                      <div className="text-[10px] text-stone-400 font-mono mt-0.5">
                        NIK: {cz.nik || '-'} · KK: {cz.noKk || '-'}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(cz)}
                      className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-750 text-stone-300 hover:text-white"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(cz.id)}
                      className="p-1.5 rounded-lg bg-stone-800 hover:bg-red-950 text-stone-400 hover:text-red-400"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Address & Contact Details */}
                <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-xs text-stone-300">
                  <div className="flex items-center gap-1 text-[11px] text-stone-300">
                    <Home className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>
                      {cz.addressBlock} No. {cz.addressNumber}
                    </span>
                    <span className="text-stone-500">·</span>
                    <span className="text-stone-400 truncate max-w-[100px]">{cz.occupation}</span>
                  </div>

                  {cz.phone && cz.phone !== '-' && (
                    <a
                      href={`https://wa.me/${cz.phone.replace(/^0/, '62')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1 active:scale-95 transition-all"
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>WA</span>
                    </a>
                  )}
                </div>
              </div>
            ))
          )
        ) : (
          /* Kartu Keluarga (KK) View */
          filteredKkList.length === 0 ? (
            <div className="text-center py-12 text-stone-500">
              <Home className="w-10 h-10 mx-auto text-stone-600 mb-2" />
              <p className="text-xs">Tidak ada data Kartu Keluarga.</p>
            </div>
          ) : (
            filteredKkList.map((kk) => (
              <div
                key={kk.noKk}
                className="p-3.5 rounded-2xl bg-stone-850 border border-stone-700/70 shadow-sm space-y-2.5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-stone-400 block">
                      NO KK: {kk.noKk}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-0.5">
                      Keluarga Bpk. {kk.head.name}
                    </h4>
                    <p className="text-xs text-emerald-400 flex items-center gap-1 mt-0.5">
                      <Home className="w-3.5 h-3.5" />
                      <span>{kk.address}</span>
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {kk.memberCount} Jiwa
                    </span>
                    <span
                      className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${
                        kk.domicileStatus === 'tetap'
                          ? 'bg-stone-800 text-stone-300'
                          : 'bg-blue-950 text-blue-300'
                      }`}
                    >
                      {kk.domicileStatus}
                    </span>
                  </div>
                </div>

                {/* List of members inside this KK */}
                <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 space-y-1.5 text-xs">
                  <div className="text-[10px] uppercase font-bold text-stone-400">
                    Anggota Keluarga:
                  </div>
                  {kk.members.map((m, idx) => (
                    <div key={m.id} className="flex items-center justify-between text-[11px]">
                      <span className="text-stone-200">
                        {idx + 1}. {m.name}
                      </span>
                      <span className="text-amber-400 text-[10px] font-medium">
                        {formatRoleLabel(m.familyRole)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )
        )}
      </div>

      {/* Add / Edit Citizen Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm max-h-[90vh] bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-stone-100">
            {/* Modal Header */}
            <div className="p-4 border-b border-stone-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>{editingCitizen ? 'Edit Data Warga' : 'Tambah Warga / KK Baru'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-stone-800 hover:bg-stone-700 flex items-center justify-center text-stone-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitForm} className="flex-1 overflow-y-auto p-4 space-y-3">
              <div>
                <label className="text-[11px] font-bold text-stone-300 block mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: H. Bambang Sutrisno"
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-stone-300 block mb-1">
                    NIK (16 Digit)
                  </label>
                  <input
                    type="text"
                    value={formData.nik}
                    onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                    placeholder="327601..."
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-300 block mb-1">
                    No KK (16 Digit)
                  </label>
                  <input
                    type="text"
                    value={formData.noKk}
                    onChange={(e) => setFormData({ ...formData, noKk: e.target.value })}
                    placeholder="327601..."
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-stone-300 block mb-1">
                    Hubungan Keluarga
                  </label>
                  <select
                    value={formData.familyRole}
                    onChange={(e) =>
                      setFormData({ ...formData, familyRole: e.target.value as FamilyRole })
                    }
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                  >
                    <option value="kepala_keluarga">Kepala Keluarga</option>
                    <option value="istri">Istri</option>
                    <option value="anak">Anak</option>
                    <option value="orang_tua">Orang Tua</option>
                    <option value="famili_lain">Famili Lain</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-300 block mb-1">
                    Status Domisili
                  </label>
                  <select
                    value={formData.domicileStatus}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        domicileStatus: e.target.value as DomicileStatus,
                      })
                    }
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                  >
                    <option value="tetap">Warga Tetap</option>
                    <option value="kontrak">Kontrak / Kost</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-stone-300 block mb-1">
                    Jenis Kelamin
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                  >
                    <option value="L">Laki-Laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-300 block mb-1">Agama</label>
                  <input
                    type="text"
                    value={formData.religion}
                    onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                    placeholder="Islam / Kristen / dll"
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-stone-300 block mb-1">
                    Alamat Blok
                  </label>
                  <input
                    type="text"
                    value={formData.addressBlock}
                    onChange={(e) => setFormData({ ...formData, addressBlock: e.target.value })}
                    placeholder="Blok A1 / B2"
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-300 block mb-1">
                    Nomor Rumah
                  </label>
                  <input
                    type="text"
                    value={formData.addressNumber}
                    onChange={(e) => setFormData({ ...formData, addressNumber: e.target.value })}
                    placeholder="12 / 05"
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-stone-300 block mb-1">
                    No WhatsApp
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0812..."
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-300 block mb-1">
                    Pekerjaan
                  </label>
                  <input
                    type="text"
                    value={formData.occupation}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                    placeholder="Karyawan / Wiraswasta"
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-stone-800 text-stone-300 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
