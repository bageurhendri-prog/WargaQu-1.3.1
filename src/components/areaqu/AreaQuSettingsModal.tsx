import React, { useState } from 'react';
import {
  X,
  MapPin,
  Compass,
  Layers,
  CircleDot,
  Radio,
  Navigation,
  CheckCircle2,
  Sliders,
  ShieldCheck
} from 'lucide-react';
import { AreaQuSettings } from '../../types/areaqu';
import { formatDistance } from '../../services/areaStorage';

interface AreaQuSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AreaQuSettings;
  onSaveSettings: (newSettings: AreaQuSettings) => void;
  onShowNotification?: (msg: string) => void;
  onUseCurrentGps: () => void;
  isGpsLoading?: boolean;
}

export const AreaQuSettingsModal: React.FC<AreaQuSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onShowNotification,
  onUseCurrentGps,
  isGpsLoading = false,
}) => {
  const [formData, setFormData] = useState<AreaQuSettings>({ ...settings });

  if (!isOpen) return null;

  // Preset Radius Options: 500m to 100km
  const radiusPresets = [
    { label: '500 m', value: 500 },
    { label: '1 km', value: 1000 },
    { label: '2 km', value: 2000 },
    { label: '5 km', value: 5000 },
    { label: '10 km', value: 10000 },
    { label: '25 km', value: 25000 },
    { label: '50 km', value: 50000 },
    { label: '100 km', value: 100000 },
  ];

  const handleSave = () => {
    onSaveSettings(formData);
    if (onShowNotification) {
      onShowNotification('Pengaturan AreaQu berhasil disimpan.');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 select-none">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-800 px-5 py-4 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Pengaturan Khusus AreaQu</h3>
              <p className="text-xs text-emerald-400 font-medium">Peta Lingkungan & Radar Warga</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          {/* Status Driver / Layanan Warga Online ala Grab Driver */}
          <div className="bg-slate-800/90 border border-slate-700 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${
                    formData.driverOnline ? 'bg-emerald-600 shadow-lg shadow-emerald-500/30' : 'bg-slate-700'
                  }`}
                >
                  <Navigation className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Status Siaga / Driver Warga</h4>
                  <p className="text-xs text-slate-400">
                    {formData.driverOnline ? 'Online (Terlihat di radar lingkungan)' : 'Offline (Sedang istirahat)'}
                  </p>
                </div>
              </div>

              {/* Switch Toggle */}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, driverOnline: !formData.driverOnline })}
                className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer ${
                  formData.driverOnline ? 'bg-emerald-600' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                    formData.driverOnline ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Titik Acuan Pusat Wilayah */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-400" />
              Titik Pusat Peta Lingkungan
            </label>

            <div>
              <input
                type="text"
                value={formData.centerLabel}
                onChange={(e) => setFormData({ ...formData, centerLabel: e.target.value })}
                placeholder="Nama Pos RT / Titik Warga"
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500 font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">Latitude (Lintang)</span>
                <input
                  type="number"
                  step="any"
                  value={formData.centerLat}
                  onChange={(e) => setFormData({ ...formData, centerLat: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">Longitude (Bujur)</span>
                <input
                  type="number"
                  step="any"
                  value={formData.centerLng}
                  onChange={(e) => setFormData({ ...formData, centerLng: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={onUseCurrentGps}
              disabled={isGpsLoading}
              className="w-full mt-1 bg-slate-800 hover:bg-slate-750 text-emerald-400 border border-emerald-500/40 text-xs font-bold py-2 px-3 rounded-xl transition flex items-center justify-center space-x-2 active:scale-98"
            >
              <Navigation className={`w-4 h-4 ${isGpsLoading ? 'animate-spin' : ''}`} />
              <span>{isGpsLoading ? 'Mengambil GPS HP...' : 'Gunakan Koordinat GPS HP Saya'}</span>
            </button>
          </div>

          {/* Radius Jarak Pencarian (500m - 100km) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <CircleDot className="w-4 h-4 text-emerald-400" />
                Radius Radar Pencarian
              </label>
              <span className="text-xs font-extrabold text-emerald-400 bg-emerald-950/70 border border-emerald-500/30 px-2.5 py-1 rounded-lg font-mono">
                {formatDistance(formData.radiusMeters)}
              </span>
            </div>

            {/* Slider 500m - 100km (using log/stepped scale) */}
            <input
              type="range"
              min="500"
              max="100000"
              step="500"
              value={formData.radiusMeters}
              onChange={(e) => setFormData({ ...formData, radiusMeters: parseInt(e.target.value, 10) })}
              className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-950 rounded-lg"
            />

            {/* Quick Preset Buttons */}
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {radiusPresets.map((preset) => {
                const isSelected = formData.radiusMeters === preset.value;
                return (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, radiusMeters: preset.value })}
                    className={`text-[11px] py-1.5 px-1 rounded-lg font-bold border transition ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pilihan Gaya Layer Peta */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-400" />
              Tampilan Peta (Tile Layer)
            </label>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, mapTileLayer: 'dark' })}
                className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                  formData.mapTileLayer === 'dark'
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="w-6 h-6 rounded-md bg-slate-950 border border-slate-700 flex items-center justify-center text-xs">
                  🌙
                </div>
                <span className="text-[11px]">Dark Grab</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, mapTileLayer: 'osm' })}
                className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                  formData.mapTileLayer === 'osm'
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="w-6 h-6 rounded-md bg-sky-950 border border-slate-700 flex items-center justify-center text-xs">
                  🗺️
                </div>
                <span className="text-[11px]">OSM Standar</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, mapTileLayer: 'satellite' })}
                className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                  formData.mapTileLayer === 'satellite'
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="w-6 h-6 rounded-md bg-emerald-950 border border-slate-700 flex items-center justify-center text-xs">
                  🛰️
                </div>
                <span className="text-[11px]">Satelit</span>
              </button>
            </div>
          </div>

          {/* Toggle Lingkaran Radar */}
          <div className="flex items-center justify-between bg-slate-800/80 border border-slate-700 p-3.5 rounded-xl">
            <div className="flex items-center space-x-2.5">
              <Radio className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="text-xs font-bold text-white">Visual Lingkaran Radar</p>
                <p className="text-[10px] text-slate-400">Tampilkan batas area jangkauan pada peta</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={formData.showRadarCircle}
              onChange={(e) => setFormData({ ...formData, showRadarCircle: e.target.checked })}
              className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-800 px-5 py-4 border-t border-slate-700 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-700 rounded-xl transition"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-lg flex items-center space-x-1.5 active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Terapkan Pengaturan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
