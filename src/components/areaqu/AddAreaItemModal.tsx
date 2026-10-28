import React, { useState } from 'react';
import {
  X,
  Plus,
  MapPin,
  Briefcase,
  Bike,
  Store,
  Clock,
  Phone,
  MessageCircle,
  DollarSign,
  User,
  CheckCircle2
} from 'lucide-react';
import { AreaCategory, AreaItemStatus, AreaLocationItem } from '../../types/areaqu';

interface AddAreaItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: Omit<AreaLocationItem, 'id' | 'createdAt'>) => void;
  defaultLat: number;
  defaultLng: number;
  onShowNotification?: (msg: string) => void;
}

export const AddAreaItemModal: React.FC<AddAreaItemModalProps> = ({
  isOpen,
  onClose,
  onAddItem,
  defaultLat,
  defaultLng,
  onShowNotification,
}) => {
  const [category, setCategory] = useState<AreaCategory>('umkm');
  const [title, setTitle] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [status, setStatus] = useState<AreaItemStatus>('buka');
  const [lat, setLat] = useState<number>(defaultLat);
  const [lng, setLng] = useState<number>(defaultLng);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [priceOrSalary, setPriceOrSalary] = useState('');
  const [description, setDescription] = useState('');
  const [openingHours, setOpeningHours] = useState('');
  const [postedBy, setPostedBy] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !address.trim()) {
      if (onShowNotification) onShowNotification('Judul dan alamat wajib diisi.');
      return;
    }

    let cleanWa = whatsapp.replace(/[^0-9]/g, '');
    if (cleanWa.startsWith('0')) {
      cleanWa = '62' + cleanWa.slice(1);
    }

    onAddItem({
      title: title.trim(),
      category,
      subCategory: subCategory.trim() || undefined,
      status,
      lat: Number(lat) || defaultLat,
      lng: Number(lng) || defaultLng,
      address: address.trim(),
      phone: phone.trim() || undefined,
      whatsapp: cleanWa || undefined,
      priceOrSalary: priceOrSalary.trim() || undefined,
      description: description.trim(),
      openingHours: openingHours.trim() || undefined,
      postedBy: postedBy.trim() || 'Warga Lingkungan',
      rating: 5.0,
      verifiedWarga: true,
    });

    if (onShowNotification) {
      onShowNotification(`Titik ${title} berhasil ditambahkan ke AreaQu.`);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 select-none">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-800 px-5 py-4 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Tambah Titik Baru</h3>
              <p className="text-xs text-emerald-400 font-medium">Loker, Transportasi, atau UMKM Warga</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Pilih Kategori Utama */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">Pilih Jenis Layanan *</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setCategory('loker')}
                className={`py-2.5 px-2 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 ${
                  category === 'loker'
                    ? 'bg-amber-600/30 border-amber-500 text-amber-300 shadow-sm'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Briefcase className="w-4 h-4 text-amber-400" />
                <span>💼 Loker</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory('transportasi')}
                className={`py-2.5 px-2 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 ${
                  category === 'transportasi'
                    ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300 shadow-sm'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Bike className="w-4 h-4 text-emerald-400" />
                <span>🛵 Transport</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory('umkm')}
                className={`py-2.5 px-2 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 ${
                  category === 'umkm'
                    ? 'bg-cyan-600/30 border-cyan-500 text-cyan-300 shadow-sm'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Store className="w-4 h-4 text-cyan-400" />
                <span>🏪 UMKM</span>
              </button>
            </div>
          </div>

          {/* Status Buka / Tutup */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">Status Operasional Awal *</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStatus('buka')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                  status === 'buka'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>🟢 BUKA / AKTIF</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('tutup')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                  status === 'tutup'
                    ? 'bg-red-700 text-white border-red-600 shadow-sm'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                <span>🔴 TUTUP / OFF</span>
              </button>
            </div>
          </div>

          {/* Judul & SubKategori */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              {category === 'loker'
                ? 'Posisi / Judul Lowongan *'
                : category === 'transportasi'
                ? 'Nama Pengemudi / Pangkalan *'
                : 'Nama Usaha / Warung UMKM *'}
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                category === 'loker'
                  ? 'Contoh: Staf Toko & Kasir Sembako'
                  : category === 'transportasi'
                  ? 'Contoh: Ojek Kang Asep Standby RT 02'
                  : 'Contoh: Warung Nasi Uduk Bu Hartini'
              }
              className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Sub-kategori</label>
              <input
                type="text"
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                placeholder="Misal: Ojek / Kuliner"
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {category === 'loker' ? 'Gaji / Upah' : 'Tarif / Estimasi Biaya'}
              </label>
              <input
                type="text"
                value={priceOrSalary}
                onChange={(e) => setPriceOrSalary(e.target.value)}
                placeholder="Rp 2.500.000 / trip Rp 10rb"
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Alamat & Jam Operasional */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Alamat Lengkap / Patokan *</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Contoh: Jl. Melati No. 12, Samping Masjid"
              className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Jam Operasional</label>
              <input
                type="text"
                value={openingHours}
                onChange={(e) => setOpeningHours(e.target.value)}
                placeholder="07:00 - 21:00"
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Nama Pemilik / PIC</label>
              <input
                type="text"
                value={postedBy}
                onChange={(e) => setPostedBy(e.target.value)}
                placeholder="Pak Budi (RT 03)"
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Kontak WhatsApp & Telepon */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">No. WhatsApp</label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="08123456789"
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">No. Telepon / HP</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08123456789"
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Koordinat Titik */}
          <div className="grid grid-cols-2 gap-2 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 block mb-0.5">Latitude (GPS)</span>
              <input
                type="number"
                step="any"
                value={lat}
                onChange={(e) => setLat(parseFloat(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg font-mono"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block mb-0.5">Longitude (GPS)</span>
              <input
                type="number"
                step="any"
                value={lng}
                onChange={(e) => setLng(parseFloat(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg font-mono"
              />
            </div>
          </div>

          {/* Keterangan Tambahan */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Keterangan & Rincian</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan detail lowongan, menu kuliner, atau armada kendaraan..."
              className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 rounded-xl transition shadow-lg flex items-center justify-center space-x-1.5 active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan Titik ke AreaQu</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
