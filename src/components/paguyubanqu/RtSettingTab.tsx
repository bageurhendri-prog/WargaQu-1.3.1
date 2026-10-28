import React, { useState } from 'react';
import {
  Settings,
  Save,
  FileText,
  DollarSign,
  Calendar,
  Building,
  CreditCard,
  CheckCircle2,
  Sparkles,
  Info
} from 'lucide-react';
import { RtSettings } from '../../types/rtqu';

interface RtSettingTabProps {
  settings: RtSettings;
  onSaveSettings: (settings: RtSettings) => void;
  onShowNotification: (msg: string) => void;
}

export const RtSettingTab: React.FC<RtSettingTabProps> = ({
  settings,
  onSaveSettings,
  onShowNotification,
}) => {
  const [form, setForm] = useState<RtSettings>({ ...settings });

  const romanMonths = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  const currentMonthIdx = new Date().getMonth();
  const currentYearStr = new Date().getFullYear().toString();

  // Generate live preview for surat pengantar
  const generatePreviewSurat = (format: string) => {
    let result = format || '[NOMOR]/SP-RT05/RW08/[BULAN]/[TAHUN]';
    result = result.replace(/\[NOMOR\]/g, '042');
    result = result.replace(/\[BULAN\]/g, romanMonths[currentMonthIdx]);
    result = result.replace(/\[TAHUN\]/g, currentYearStr);
    result = result.replace(/\[RT\]/g, form.rtName.replace(/\s+/g, ''));
    result = result.replace(/\[RW\]/g, form.rwName.replace(/\s+/g, ''));
    return result;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(form);
    onShowNotification('Pengaturan khusus RTQu berhasil disimpan.');
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 text-stone-100 bg-stone-900">
      <div className="flex items-center gap-2.5 pb-2 border-b border-stone-800">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
          <Settings className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white tracking-tight">
            Setting Khusus Modul RTQu
          </h2>
          <p className="text-[11px] text-stone-400">
            Konfigurasi iuran bulanan, jatuh tempo, dan format surat pengantar
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {/* SECTION 1: IURAN & JATUH TEMPO */}
        <div className="p-4 rounded-3xl bg-stone-850 border border-stone-700/80 shadow-md space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
            <DollarSign className="w-4 h-4" />
            <span>1. Pengaturan Iuran Wajib Bulanan per KK</span>
          </div>

          <div>
            <label className="text-[11px] font-bold text-stone-300 block mb-1">
              Nominal Iuran Wajib Bulanan per KK (Rp) *
            </label>
            <input
              type="number"
              min={0}
              step={5000}
              required
              value={form.monthlyFeePerKk}
              onChange={(e) => setForm({ ...form, monthlyFeePerKk: Number(e.target.value) })}
              className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-sm text-amber-300 font-bold focus:outline-hidden font-mono"
            />
            <span className="text-[10px] text-stone-400 mt-1 block">
              Nominal ini otomatis menjadi tagihan default setiap KK per bulan.
            </span>
          </div>

          <div>
            <label className="text-[11px] font-bold text-stone-300 block mb-1">
              Periode Jatuh Tempo Pembayaran Tiap Bulan *
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-400">Tanggal</span>
              <select
                value={form.feeDueDateDay}
                onChange={(e) => setForm({ ...form, feeDueDateDay: Number(e.target.value) })}
                className="bg-stone-900 border border-stone-700 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:outline-hidden"
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <span className="text-xs text-stone-400">setiap bulannya</span>
            </div>
            <span className="text-[10px] text-stone-400 mt-1 block">
              Pembayaran setelah tanggal ini akan ditandai dengan peringatan jatuh tempo.
            </span>
          </div>
        </div>

        {/* SECTION 2: FORMAT SURAT PENGANTAR RT */}
        <div className="p-4 rounded-3xl bg-stone-850 border border-stone-700/80 shadow-md space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <FileText className="w-4 h-4" />
            <span>2. Kustomisasi Format Nomor Surat Pengantar RT</span>
          </div>

          <div>
            <label className="text-[11px] font-bold text-stone-300 block mb-1">
              Pola Format Nomor Surat *
            </label>
            <input
              type="text"
              required
              value={form.suratPengantarFormat}
              onChange={(e) => setForm({ ...form, suratPengantarFormat: e.target.value })}
              placeholder="[NOMOR]/SP-RT05/RW08/[BULAN]/[TAHUN]"
              className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-hidden"
            />
          </div>

          {/* Live Preview Box */}
          <div className="p-3 rounded-2xl bg-stone-900 border border-emerald-500/30 space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              <Sparkles className="w-3 h-3" />
              <span>Contoh Hasil Nomor Surat:</span>
            </div>
            <div className="text-xs font-bold font-mono text-white bg-black/30 p-2 rounded-lg border border-stone-800">
              {generatePreviewSurat(form.suratPengantarFormat)}
            </div>
            <p className="text-[10px] text-stone-400 mt-1">
              Tag otomatis: <code className="text-amber-300">[NOMOR]</code>,{' '}
              <code className="text-amber-300">[BULAN]</code> (Romawi),{' '}
              <code className="text-amber-300">[TAHUN]</code>
            </p>
          </div>
        </div>

        {/* SECTION 3: IDENTITAS RT / RW */}
        <div className="p-4 rounded-3xl bg-stone-850 border border-stone-700/80 shadow-md space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-teal-400">
            <Building className="w-4 h-4" />
            <span>3. Identitas Wilayah RT & RW</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-bold text-stone-300 block mb-1">Nama RT</label>
              <input
                type="text"
                value={form.rtName}
                onChange={(e) => setForm({ ...form, rtName: e.target.value })}
                placeholder="RT 05"
                className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-300 block mb-1">Nama RW</label>
              <input
                type="text"
                value={form.rwName}
                onChange={(e) => setForm({ ...form, rwName: e.target.value })}
                placeholder="RW 08"
                className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-bold text-stone-300 block mb-1">Kelurahan / Desa</label>
              <input
                type="text"
                value={form.kelurahan}
                onChange={(e) => setForm({ ...form, kelurahan: e.target.value })}
                placeholder="Sukamaju Indah"
                className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-300 block mb-1">Kecamatan</label>
              <input
                type="text"
                value={form.kecamatan}
                onChange={(e) => setForm({ ...form, kecamatan: e.target.value })}
                placeholder="Cilodong"
                className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-bold text-stone-300 block mb-1">
                Nama Ketua RT
              </label>
              <input
                type="text"
                value={form.ketuaRtName}
                onChange={(e) => setForm({ ...form, ketuaRtName: e.target.value })}
                placeholder="H. Bambang Sutrisno"
                className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-300 block mb-1">
                No HP Ketua RT
              </label>
              <input
                type="text"
                value={form.ketuaRtPhone}
                onChange={(e) => setForm({ ...form, ketuaRtPhone: e.target.value })}
                placeholder="0812..."
                className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-hidden font-mono"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: REKENING KAS RT */}
        <div className="p-4 rounded-3xl bg-stone-850 border border-stone-700/80 shadow-md space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
            <CreditCard className="w-4 h-4" />
            <span>4. Rekening Kas Paguyuban RT</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[11px] font-bold text-stone-300 block mb-1">Bank</label>
              <input
                type="text"
                value={form.bankName}
                onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                placeholder="BCA / Mandiri"
                className="w-full bg-stone-900 border border-stone-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-hidden"
              />
            </div>

            <div className="col-span-2">
              <label className="text-[11px] font-bold text-stone-300 block mb-1">
                Nomor Rekening
              </label>
              <input
                type="text"
                value={form.accountNumber}
                onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                placeholder="882019..."
                className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-stone-300 block mb-1">
              Atas Nama Rekening
            </label>
            <input
              type="text"
              value={form.accountHolder}
              onChange={(e) => setForm({ ...form, accountHolder: e.target.value })}
              placeholder="Kas RT 05 RW 08"
              className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-hidden"
            />
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/50 active:scale-95 transition-all"
        >
          <Save className="w-4 h-4" />
          <span>Simpan Semua Pengaturan RTQu</span>
        </button>
      </form>
    </div>
  );
};
