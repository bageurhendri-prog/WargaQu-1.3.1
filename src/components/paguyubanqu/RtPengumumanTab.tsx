import React, { useState } from 'react';
import {
  Megaphone,
  Plus,
  Pin,
  Share2,
  Trash2,
  X,
  Calendar,
  AlertCircle,
  Shield,
  Activity,
  CheckCircle2,
  MessageCircle
} from 'lucide-react';
import { RtAnnouncement, AnnouncementCategory, RtSettings } from '../../types/rtqu';

interface RtPengumumanTabProps {
  announcements: RtAnnouncement[];
  settings: RtSettings;
  onSaveAnnouncements: (announcements: RtAnnouncement[]) => void;
  onShowNotification: (msg: string) => void;
}

export const RtPengumumanTab: React.FC<RtPengumumanTabProps> = ({
  announcements,
  settings,
  onSaveAnnouncements,
  onShowNotification,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('semua');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [form, setForm] = useState<{
    title: string;
    category: AnnouncementCategory;
    content: string;
    author: string;
    targetAudience: string;
    isPinned: boolean;
  }>({
    title: '',
    category: 'kegiatan',
    content: '',
    author: `Pengurus ${settings.rtName}`,
    targetAudience: 'Seluruh Warga',
    isPinned: false,
  });

  const filteredAnnouncements = announcements
    .filter((anc) => {
      if (filterCategory !== 'semua' && anc.category !== filterCategory) return false;
      return true;
    })
    .sort((a, b) => {
      // Pinned first, then by date descending
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  const handleDelete = (id: string) => {
    if (confirm('Hapus pengumuman ini?')) {
      const updated = announcements.filter((a) => a.id !== id);
      onSaveAnnouncements(updated);
      onShowNotification('Pengumuman dihapus.');
    }
  };

  const handleTogglePin = (id: string) => {
    const updated = announcements.map((a) =>
      a.id === id ? { ...a, isPinned: !a.isPinned } : a
    );
    onSaveAnnouncements(updated);
    onShowNotification('Status sematan pengumuman diperbarui.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      alert('Judul dan isi pengumuman wajib diisi.');
      return;
    }

    const newAnc: RtAnnouncement = {
      id: `anc-${Date.now()}`,
      title: form.title,
      category: form.category,
      content: form.content,
      author: form.author || `Pengurus ${settings.rtName}`,
      targetAudience: form.targetAudience,
      date: new Date().toISOString().split('T')[0],
      isPinned: form.isPinned,
    };

    onSaveAnnouncements([newAnc, ...announcements]);
    setIsModalOpen(false);
    setForm({
      title: '',
      category: 'kegiatan',
      content: '',
      author: `Pengurus ${settings.rtName}`,
      targetAudience: 'Seluruh Warga',
      isPinned: false,
    });
    onShowNotification('Pengumuman baru berhasil diterbitkan.');
  };

  const handleShareToWa = (anc: RtAnnouncement) => {
    const text = `*PENGUMUMAN RESMI ${settings.rtName.toUpperCase()} / ${settings.rwName.toUpperCase()}*\n\n📌 *${anc.title.toUpperCase()}*\n📅 Tanggal: ${anc.date}\n👥 Sasaran: ${anc.targetAudience || 'Seluruh Warga'}\n\n${anc.content}\n\n_Diterbitkan oleh: ${anc.author}_\n_Aplikasi Paguyuban WargaQu_`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  const getCategoryBadge = (cat: AnnouncementCategory) => {
    switch (cat) {
      case 'penting':
        return 'bg-red-950 text-red-300 border-red-800';
      case 'kegiatan':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'keamanan':
        return 'bg-purple-950 text-purple-300 border-purple-800';
      default:
        return 'bg-blue-950 text-blue-300 border-blue-800';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-stone-900 text-stone-100 overflow-hidden">
      {/* Top Header & Categories */}
      <div className="p-3 bg-stone-950 border-b border-stone-800 space-y-2.5 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Megaphone className="w-4 h-4 text-amber-400" />
              <span>Papan Informasi & Broadcast Warga</span>
            </h3>
            <span className="text-[10px] text-stone-400">
              Pengumuman resmi lingkungan {settings.rtName}
            </span>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1 shadow-md active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Buat Info</span>
          </button>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
          {['semua', 'penting', 'kegiatan', 'keamanan', 'umum'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all capitalize shrink-0 ${
                filterCategory === cat
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                  : 'bg-stone-800 text-stone-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Announcements List */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
        {filteredAnnouncements.length === 0 ? (
          <div className="text-center py-12 text-stone-500">
            <Megaphone className="w-10 h-10 mx-auto text-stone-600 mb-2" />
            <p className="text-xs">Belum ada pengumuman untuk kategori ini.</p>
          </div>
        ) : (
          filteredAnnouncements.map((anc) => (
            <div
              key={anc.id}
              className={`p-4 rounded-3xl border transition-all space-y-2.5 shadow-md ${
                anc.isPinned
                  ? 'bg-gradient-to-b from-stone-850 to-amber-950/20 border-amber-500/50 ring-1 ring-amber-500/30'
                  : 'bg-stone-850 border-stone-700/80'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {anc.isPinned && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500 text-stone-950 font-black flex items-center gap-0.5">
                      <Pin className="w-2.5 h-2.5" /> Disematkan
                    </span>
                  )}
                  <span
                    className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border ${getCategoryBadge(
                      anc.category
                    )}`}
                  >
                    {anc.category}
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-stone-500" />
                    {anc.date}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleTogglePin(anc.id)}
                    className={`p-1.5 rounded-lg ${
                      anc.isPinned ? 'text-amber-400' : 'text-stone-400 hover:text-white'
                    }`}
                    title={anc.isPinned ? 'Lepas Sematan' : 'Sematkan di Atas'}
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(anc.id)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-red-400"
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Title & Content */}
              <div>
                <h4 className="text-sm font-bold text-white leading-snug">{anc.title}</h4>
                <p className="text-xs text-stone-300 mt-1.5 leading-relaxed whitespace-pre-line">
                  {anc.content}
                </p>
              </div>

              {/* Footer info & WA Broadcast Button */}
              <div className="pt-2.5 border-t border-stone-700/60 flex items-center justify-between text-xs">
                <span className="text-[11px] text-stone-400">
                  Oleh: <strong className="text-stone-300">{anc.author}</strong>
                </span>

                <button
                  onClick={() => handleShareToWa(anc)}
                  className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Broadcast ke WA Warga</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Announcement Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl p-4 text-stone-100 space-y-3">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Megaphone className="w-4 h-4 text-emerald-400" />
                <span>Buat Pengumuman Baru</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-stone-800 flex items-center justify-center text-stone-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-2.5">
              <div>
                <label className="text-[11px] font-bold text-stone-300 block mb-1">
                  Judul Pengumuman *
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Contoh: Kerja Bakti Bersih Drainase"
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-stone-300 block mb-1">Kategori</label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value as AnnouncementCategory })
                    }
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-hidden"
                  >
                    <option value="kegiatan">Kegiatan Warga</option>
                    <option value="penting">Penting / Urgent</option>
                    <option value="keamanan">Keamanan Lingkungan</option>
                    <option value="umum">Informasi Umum</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-300 block mb-1">
                    Sasaran Warga
                  </label>
                  <input
                    type="text"
                    value={form.targetAudience}
                    onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
                    placeholder="Seluruh Warga"
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-300 block mb-1">
                  Isi Pengumuman *
                </label>
                <textarea
                  rows={4}
                  required
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Tuliskan detail pengumuman, tanggal pelaksanaan, waktu, dan informasi penting lainnya..."
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pinToggle"
                  checked={form.isPinned}
                  onChange={(e) => setForm({ ...form, isPinned: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 bg-stone-800 border-stone-700 focus:ring-0"
                />
                <label htmlFor="pinToggle" className="text-xs text-stone-300 select-none cursor-pointer">
                  Sematkan di paling atas (Pin Papan Info)
                </label>
              </div>

              <div className="flex gap-2 pt-1">
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
                  Terbitkan Info
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
