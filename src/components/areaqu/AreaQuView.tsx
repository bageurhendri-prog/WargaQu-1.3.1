import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import {
  ArrowLeft,
  Layers,
  MapPin,
  Navigation,
  Sliders,
  Plus,
  Compass,
  Radio,
  Search,
  CheckCircle2,
  Phone,
  MessageCircle,
  Briefcase,
  Bike,
  Store,
  Clock,
  ChevronUp,
  ChevronDown,
  X,
  ExternalLink,
  DollarSign,
  Maximize2,
  RotateCcw,
  Sparkles,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { AreaLocationItem, AreaQuSettings, AreaCategory, AreaItemStatus } from '../../types/areaqu';
import {
  AreaStorageService,
  getDistanceInMeters,
  formatDistance,
  DEFAULT_SETTINGS
} from '../../services/areaStorage';
import { AreaQuSettingsModal } from './AreaQuSettingsModal';
import { AddAreaItemModal } from './AddAreaItemModal';

interface AreaQuViewProps {
  onBackToKasir?: () => void;
  onOpenSwitchModul?: () => void;
  onShowNotification?: (msg: string) => void;
}

export const AreaQuView: React.FC<AreaQuViewProps> = ({
  onBackToKasir,
  onOpenSwitchModul,
  onShowNotification,
}) => {
  // Core States
  const [items, setItems] = useState<AreaLocationItem[]>([]);
  const [settings, setSettings] = useState<AreaQuSettings>(DEFAULT_SETTINGS);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'semua' | AreaCategory>('semua');
  const [activeStatusFilter, setActiveStatusFilter] = useState<'semua' | AreaItemStatus>('semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<AreaLocationItem | null>(null);

  // Bottom Sheet Drawer States (Grab Driver style)
  const [isDrawerExpanded, setIsDrawerExpanded] = useState<boolean>(true);
  const [isRadiusPickerOpen, setIsRadiusPickerOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isAddItemOpen, setIsAddItemOpen] = useState<boolean>(false);
  const [isGpsLocating, setIsGpsLocating] = useState<boolean>(false);

  // Leaflet Map References
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const radarCircleRef = useRef<L.Circle | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Load Settings and Items on Mount
  useEffect(() => {
    const loadedSettings = AreaStorageService.getSettings();
    const loadedItems = AreaStorageService.getItems();
    setSettings(loadedSettings);
    setItems(loadedItems);
  }, []);

  // Filtered Items with Distance Calculation
  const processedItems = useMemo(() => {
    return items
      .map((item) => {
        const dist = getDistanceInMeters(
          settings.centerLat,
          settings.centerLng,
          item.lat,
          item.lng
        );
        return { ...item, distanceMeters: dist };
      })
      .filter((item) => {
        // Distance within radius
        const withinRadius = (item.distanceMeters ?? 0) <= settings.radiusMeters;

        // Category filter
        const matchCategory =
          activeCategoryFilter === 'semua' || item.category === activeCategoryFilter;

        // Status filter (Buka / Tutup)
        const matchStatus =
          activeStatusFilter === 'semua' || item.status === activeStatusFilter;

        // Search text
        const matchSearch =
          !searchQuery.trim() ||
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.subCategory && item.subCategory.toLowerCase().includes(searchQuery.toLowerCase()));

        return withinRadius && matchCategory && matchStatus && matchSearch;
      })
      .sort((a, b) => (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0));
  }, [items, settings.centerLat, settings.centerLng, settings.radiusMeters, activeCategoryFilter, activeStatusFilter, searchQuery]);

  // Counts for Category Badges
  const counts = useMemo(() => {
    const withinRadius = items.map((item) => ({
      ...item,
      dist: getDistanceInMeters(settings.centerLat, settings.centerLng, item.lat, item.lng),
    })).filter((i) => i.dist <= settings.radiusMeters);

    return {
      all: withinRadius.length,
      loker: withinRadius.filter((i) => i.category === 'loker').length,
      transportasi: withinRadius.filter((i) => i.category === 'transportasi').length,
      umkm: withinRadius.filter((i) => i.category === 'umkm').length,
      buka: withinRadius.filter((i) => i.status === 'buka').length,
      tutup: withinRadius.filter((i) => i.status === 'tutup').length,
    };
  }, [items, settings.centerLat, settings.centerLng, settings.radiusMeters]);

  // --------------------------------------------------------------------------
  // LEAFLET MAP INITIALIZATION & MANAGEMENT
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Create Leaflet Map instance
      const map = L.map(mapContainerRef.current, {
        center: [settings.centerLat, settings.centerLng],
        zoom: calculateZoomFromRadius(settings.radiusMeters),
        zoomControl: false,
        attributionControl: false,
      });

      // Layer Group for Spot Markers
      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Apply Tile Layer based on settings.mapTileLayer
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    let subdomains = 'abcd';
    let maxZoom = 19;

    if (settings.mapTileLayer === 'osm') {
      tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      subdomains = 'abc';
    } else if (settings.mapTileLayer === 'satellite') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      subdomains = '';
    }

    const newTile = L.tileLayer(tileUrl, {
      maxZoom,
      subdomains,
    }).addTo(map);
    tileLayerRef.current = newTile;

    // Cleanup on unmount
    return () => {
      // Intentionally do not destroy map on every re-render to avoid flashing
    };
  }, [settings.mapTileLayer]);

  // Update Center & Radar Circle when settings change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // 1. Radar Circle Overlay
    if (radarCircleRef.current) {
      map.removeLayer(radarCircleRef.current);
      radarCircleRef.current = null;
    }

    if (settings.showRadarCircle) {
      const circle = L.circle([settings.centerLat, settings.centerLng], {
        radius: settings.radiusMeters,
        color: '#10B981',
        weight: 2,
        opacity: 0.8,
        fillColor: '#10B981',
        fillOpacity: 0.08,
        dashArray: '5, 8',
      }).addTo(map);

      radarCircleRef.current = circle;
    }

    // 2. User / Center GPS Marker (Grab Driver pulsing beacon)
    if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current);
      userMarkerRef.current = null;
    }

    const userBeaconIcon = L.divIcon({
      className: 'custom-user-beacon',
      html: `
        <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: rgba(16, 185, 129, 0.35); border: 1.5px solid #10B981; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: relative; width: 20px; height: 20px; border-radius: 50%; background: #10B981; border: 3px solid #ffffff; box-shadow: 0 0 12px rgba(16,185,129,0.8); display: flex; align-items: center; justify-content: center;">
            <div style="width: 6px; height: 6px; border-radius: 50%; background: #042F2E;"></div>
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    const userMarker = L.marker([settings.centerLat, settings.centerLng], {
      icon: userBeaconIcon,
      zIndexOffset: 1000,
    }).addTo(map);

    userMarker.bindPopup(`
      <div style="font-family: inherit; font-size: 12px; color: #0f172a; padding: 2px;">
        <strong style="display: block; font-size: 13px; color: #047857;">📍 ${settings.centerLabel}</strong>
        <span style="font-size: 11px; color: #475569;">Pusat Radar Lingkungan (${formatDistance(settings.radiusMeters)})</span>
      </div>
    `);

    userMarkerRef.current = userMarker;
  }, [settings.centerLat, settings.centerLng, settings.radiusMeters, settings.showRadarCircle, settings.centerLabel]);

  // Update Item Markers on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    processedItems.forEach((item) => {
      // Determine Pin Color & Emoji
      let bgColor = '#10B981'; // Green for transportasi
      let borderColor = '#059669';
      let iconSymbol = '🛵';

      if (item.category === 'loker') {
        bgColor = '#F59E0B'; // Amber
        borderColor = '#D97706';
        iconSymbol = '💼';
      } else if (item.category === 'umkm') {
        bgColor = '#06B6D4'; // Cyan
        borderColor = '#0891B2';
        iconSymbol = '🏪';
      }

      const isOpen = item.status === 'buka';
      const statusBadge = isOpen ? '#10B981' : '#EF4444';

      const customPin = L.divIcon({
        className: 'custom-area-pin',
        html: `
          <div style="position: relative; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; cursor: pointer; transform: translate3d(0,0,0); transition: transform 0.15s ease;">
            <div style="width: 32px; height: 32px; border-radius: 12px; background: ${bgColor}; border: 2px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; font-size: 16px;">
              ${iconSymbol}
            </div>
            <!-- Buka / Tutup Status Indicator Dot -->
            <div style="position: absolute; top: -1px; right: -1px; width: 11px; height: 11px; border-radius: 50%; background: ${statusBadge}; border: 2px solid #0f172a; box-shadow: 0 0 6px ${statusBadge};"></div>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });

      const marker = L.marker([item.lat, item.lng], { icon: customPin });

      // Click Marker: Select item & center
      marker.on('click', () => {
        setSelectedItem(item);
        setIsDrawerExpanded(true);
        map.panTo([item.lat, item.lng], { animate: true, duration: 0.5 });
      });

      // Simple Popup
      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; color: #0f172a; padding: 2px; min-width: 170px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px;">
            <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: ${bgColor};">${item.category}</span>
            <span style="font-size: 9px; font-weight: 700; padding: 1px 5px; border-radius: 4px; background: ${isOpen ? '#D1FAE5' : '#FEE2E2'}; color: ${isOpen ? '#065F46' : '#991B1B'};">${isOpen ? 'BUKA' : 'TUTUP'}</span>
          </div>
          <strong style="font-size: 13px; display: block; line-height: 1.2; margin-bottom: 4px; color: #0f172a;">${item.title}</strong>
          <span style="font-size: 11px; color: #64748b; display: block; margin-bottom: 4px;">📍 ${item.address}</span>
          ${item.distanceMeters !== undefined ? `<span style="font-size: 11px; font-weight: 700; color: #059669;">Jarak: ${formatDistance(item.distanceMeters)}</span>` : ''}
        </div>
      `);

      markersLayer.addLayer(marker);
    });
  }, [processedItems]);

  // Helper zoom calculation based on radius in meters
  function calculateZoomFromRadius(radiusMeters: number): number {
    if (radiusMeters <= 800) return 16;
    if (radiusMeters <= 1500) return 15;
    if (radiusMeters <= 3000) return 14;
    if (radiusMeters <= 7000) return 13;
    if (radiusMeters <= 15000) return 12;
    if (radiusMeters <= 35000) return 11;
    if (radiusMeters <= 70000) return 10;
    return 9; // up to 100km
  }

  // Handle Quick Radius Change
  const handleSelectRadius = (meters: number) => {
    const updated = { ...settings, radiusMeters: meters };
    setSettings(updated);
    AreaStorageService.saveSettings(updated);
    setIsRadiusPickerOpen(false);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(
        [settings.centerLat, settings.centerLng],
        calculateZoomFromRadius(meters),
        { animate: true }
      );
    }

    if (onShowNotification) {
      onShowNotification(`Radius radar disetel ke ${formatDistance(meters)}`);
    }
  };

  // Re-center on GPS / Center Pos
  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(
        [settings.centerLat, settings.centerLng],
        calculateZoomFromRadius(settings.radiusMeters),
        { animate: true }
      );
    }
    if (onShowNotification) {
      onShowNotification(`Peta dipusatkan ke ${settings.centerLabel}`);
    }
  };

  // Toggle Driver Online / Offline Status (Grab Driver Style)
  const handleToggleDriverStatus = () => {
    const newOnline = !settings.driverOnline;
    const updated = { ...settings, driverOnline: newOnline };
    setSettings(updated);
    AreaStorageService.toggleDriverOnline(newOnline);

    if (navigator.vibrate) {
      try {
        navigator.vibrate(30);
      } catch {}
    }

    if (onShowNotification) {
      onShowNotification(
        newOnline
          ? 'Mode Siaga Aktif: Anda ONLINE & siap melayani warga!'
          : 'Mode Istirahat: Anda OFFLINE.'
      );
    }
  };

  // Toggle Status Buka / Tutup of a specific item
  const handleToggleItemStatus = (itemId: string, currentStatus: AreaItemStatus, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newStatus: AreaItemStatus = currentStatus === 'buka' ? 'tutup' : 'buka';
    const updated = AreaStorageService.updateItemStatus(itemId, newStatus);
    setItems(updated);

    if (selectedItem && selectedItem.id === itemId) {
      setSelectedItem({ ...selectedItem, status: newStatus });
    }

    if (onShowNotification) {
      onShowNotification(`Status diubah menjadi: ${newStatus.toUpperCase()}`);
    }
  };

  // Locate User Device GPS
  const handleLocateGps = () => {
    if (!navigator.geolocation) {
      if (onShowNotification) onShowNotification('Perangkat tidak mendukung Geolocation GPS.');
      return;
    }

    setIsGpsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsGpsLocating(false);
        const { latitude, longitude } = pos.coords;
        const updated: AreaQuSettings = {
          ...settings,
          centerLat: latitude,
          centerLng: longitude,
          centerLabel: 'Lokasi GPS Saya Saat Ini',
        };
        setSettings(updated);
        AreaStorageService.saveSettings(updated);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView(
            [latitude, longitude],
            calculateZoomFromRadius(settings.radiusMeters),
            { animate: true }
          );
        }

        if (onShowNotification) {
          onShowNotification('GPS berhasil dikunci ke posisi Anda!');
        }
      },
      (err) => {
        setIsGpsLocating(false);
        if (onShowNotification) {
          onShowNotification('Gagal mengakses GPS: ' + err.message);
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Add Item Handler
  const handleAddItem = (newItem: Omit<AreaLocationItem, 'id' | 'createdAt'>) => {
    const created = AreaStorageService.addItem(newItem);
    setItems(AreaStorageService.getItems());
    setSelectedItem(created);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([created.lat, created.lng], 16, { animate: true });
    }
  };

  // Focus Map on Item
  const handleFocusItemOnMap = (item: AreaLocationItem) => {
    setSelectedItem(item);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([item.lat, item.lng], 16, { animate: true });
    }
  };

  // Preset Radius List: 500m to 100km
  const radiusList = [
    { label: '500 m', value: 500 },
    { label: '1 km', value: 1000 },
    { label: '2 km', value: 2000 },
    { label: '5 km', value: 5000 },
    { label: '10 km', value: 10000 },
    { label: '25 km', value: 25000 },
    { label: '50 km', value: 50000 },
    { label: '100 km', value: 100000 },
  ];

  return (
    <div
      id="modul-areaqu"
      className="flex-1 min-h-0 bg-slate-900 text-slate-100 flex flex-col w-full max-w-md mx-auto shadow-2xl overflow-hidden border border-slate-800 relative select-none"
    >
      {/* =========================================================================
          1. TOP FLOATING GRAB DRIVER HEADER
          ========================================================================= */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-30 flex flex-col gap-2 pointer-events-none">
        <div className="flex items-center justify-between gap-2 pointer-events-auto">
          {/* Back to Kasir or Switch Module button */}
          <div className="flex items-center space-x-1.5 bg-slate-900/90 backdrop-blur-md p-1 rounded-2xl border border-slate-700 shadow-xl">
            {onBackToKasir && (
              <button
                onClick={onBackToKasir}
                title="Kembali ke KasirQu"
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition active:scale-95"
              >
                <ArrowLeft className="w-5 h-5 text-emerald-400" />
              </button>
            )}
            {onOpenSwitchModul && (
              <button
                onClick={onOpenSwitchModul}
                title="Ganti Modul Aplikasi"
                className="p-2 text-slate-300 hover:text-emerald-400 hover:bg-slate-800 rounded-xl transition active:scale-95"
              >
                <Layers className="w-5 h-5 text-emerald-400" />
              </button>
            )}
          </div>

          {/* Grab Driver Online / Offline Status Toggle Pill */}
          <button
            onClick={handleToggleDriverStatus}
            className={`flex-1 flex items-center justify-between px-3.5 py-2 rounded-2xl border transition-all duration-200 shadow-xl active:scale-98 ${
              settings.driverOnline
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400 shadow-emerald-950/60'
                : 'bg-slate-900/95 text-slate-400 border-slate-700 shadow-black/60'
            }`}
          >
            <div className="flex items-center space-x-2">
              <span className="relative flex h-3 w-3">
                {settings.driverOnline && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                )}
                <span
                  className={`relative inline-flex rounded-full h-3 w-3 ${
                    settings.driverOnline ? 'bg-white' : 'bg-slate-500'
                  }`}
                ></span>
              </span>
              <div className="flex flex-col text-left">
                <span className="text-xs font-black tracking-wider uppercase leading-none">
                  {settings.driverOnline ? 'ONLINE' : 'OFFLINE'}
                </span>
                <span
                  className={`text-[9px] font-semibold leading-tight ${
                    settings.driverOnline ? 'text-emerald-100' : 'text-slate-400'
                  }`}
                >
                  {settings.driverOnline ? 'Siaga Melayani Warga' : 'Mode Istirahat'}
                </span>
              </div>
            </div>

            <div className="text-[10px] bg-black/25 px-2 py-1 rounded-lg font-mono font-bold">
              {formatDistance(settings.radiusMeters)}
            </div>
          </button>

          {/* Setting Khusus Button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            title="Pengaturan Khusus AreaQu"
            className="p-2.5 bg-slate-900/90 backdrop-blur-md text-slate-300 hover:text-emerald-400 rounded-2xl border border-slate-700 shadow-xl transition active:scale-95"
          >
            <Sliders className="w-5 h-5" />
          </button>
        </div>

        {/* Ringkasan Penghasilan / Aktivitas Cepat ala Grab Driver */}
        <div className="mx-auto bg-slate-900/90 backdrop-blur-md border border-slate-800 px-3.5 py-1.5 rounded-full flex items-center space-x-3 text-xs shadow-lg pointer-events-auto">
          <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Rp 145.000</span>
          </div>
          <span className="text-slate-600">•</span>
          <span className="text-slate-300 text-[11px]">6 Order Selesai</span>
          <span className="text-slate-600">•</span>
          <span className="text-emerald-400 text-[11px] font-semibold">{processedItems.length} Spot Dekat</span>
        </div>
      </div>

      {/* =========================================================================
          2. LEAFLET MAP CANVAS CONTAINER
          ========================================================================= */}
      <div className="flex-1 w-full relative overflow-hidden bg-slate-950">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* FLOATING ACTION BUTTONS (Map Controls - Kanan) */}
        <div className="absolute right-3 top-28 z-20 flex flex-col space-y-2">
          {/* Re-center GPS */}
          <button
            onClick={handleRecenter}
            title="Pusatkan Peta ke Lokasi Saya"
            className="w-10 h-10 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700 text-slate-200 hover:text-emerald-400 flex items-center justify-center shadow-xl active:scale-90 transition"
          >
            <Navigation className="w-5 h-5" />
          </button>

          {/* Quick Radius Selector Trigger */}
          <div className="relative">
            <button
              onClick={() => setIsRadiusPickerOpen(!isRadiusPickerOpen)}
              title="Ganti Radius Radar (500m - 100km)"
              className="w-10 h-10 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-emerald-500/50 text-emerald-400 flex flex-col items-center justify-center shadow-xl active:scale-90 transition"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              <span className="text-[8px] font-bold mt-0.5">
                {formatDistance(settings.radiusMeters).replace(' ', '')}
              </span>
            </button>

            {/* Radius Presets Popover Menu */}
            {isRadiusPickerOpen && (
              <div className="absolute right-12 top-0 bg-slate-900 border border-slate-700 p-2 rounded-2xl shadow-2xl flex flex-col gap-1 w-32 animate-in zoom-in-95 duration-100 z-30">
                <span className="text-[10px] font-bold text-slate-400 px-2 py-0.5 uppercase tracking-wider">
                  Pilih Radius
                </span>
                {radiusList.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => handleSelectRadius(r.value)}
                    className={`text-left text-xs px-2.5 py-1.5 rounded-xl font-bold transition flex items-center justify-between ${
                      settings.radiusMeters === r.value
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{r.label}</span>
                    {settings.radiusMeters === r.value && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Locate Device GPS Button */}
          <button
            onClick={handleLocateGps}
            disabled={isGpsLocating}
            title="Kunci GPS Lokasi HP"
            className="w-10 h-10 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700 text-slate-200 hover:text-emerald-400 flex items-center justify-center shadow-xl active:scale-90 transition"
          >
            <Compass className={`w-5 h-5 ${isGpsLocating ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          {/* Tambah Titik Warga Baru */}
          <button
            onClick={() => setIsAddItemOpen(true)}
            title="Tambah Loker, Transport, atau UMKM"
            className="w-10 h-10 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-xl shadow-emerald-950/60 active:scale-90 transition"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Small Active Map Info Legend (Bottom Left above drawer) */}
        <div className="absolute left-3 bottom-14 z-20 pointer-events-none">
          <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 px-2.5 py-1 rounded-lg text-[10px] text-slate-400 shadow-md">
            <span>📍 {settings.centerLabel}</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. INTERACTIVE GRAB DRIVER BOTTOM SHEET / DRAWER
          ========================================================================= */}
      <div
        className={`bg-slate-900 border-t border-slate-700 z-30 transition-all duration-300 flex flex-col shadow-2xl relative ${
          isDrawerExpanded ? 'max-h-[58vh] h-[58vh]' : 'max-h-[72px] h-[72px]'
        }`}
      >
        {/* Drag Handle & Quick Stats Header */}
        <div
          onClick={() => setIsDrawerExpanded(!isDrawerExpanded)}
          className="px-4 py-2 bg-slate-850 hover:bg-slate-800 border-b border-slate-800 cursor-pointer flex flex-col items-center select-none shrink-0"
        >
          {/* Top Pill Handle */}
          <div className="w-10 h-1 bg-slate-600 rounded-full mb-1.5" />

          <div className="w-full flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-sm text-white">Radar Warga</span>
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                {processedItems.length} Spot Aktif
              </span>
            </div>

            <div className="flex items-center space-x-2 text-slate-400 text-[11px]">
              <span>Radius: <strong className="text-emerald-400">{formatDistance(settings.radiusMeters)}</strong></span>
              {isDrawerExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </div>
          </div>
        </div>

        {/* Filter Chips Bar (Category + Status Buka/Tutup) */}
        <div className="px-3 py-2 bg-slate-900 border-b border-slate-800 flex items-center space-x-1.5 overflow-x-auto no-scrollbar shrink-0 text-xs">
          {/* Kategori Chips */}
          <button
            onClick={() => setActiveCategoryFilter('semua')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
              activeCategoryFilter === 'semua'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
            }`}
          >
            Semua ({counts.all})
          </button>

          <button
            onClick={() => setActiveCategoryFilter('loker')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition flex items-center space-x-1 ${
              activeCategoryFilter === 'loker'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-800 text-amber-400 hover:text-amber-300 border border-slate-700'
            }`}
          >
            <span>💼 Loker</span>
            <span>({counts.loker})</span>
          </button>

          <button
            onClick={() => setActiveCategoryFilter('transportasi')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition flex items-center space-x-1 ${
              activeCategoryFilter === 'transportasi'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-800 text-emerald-400 hover:text-emerald-300 border border-slate-700'
            }`}
          >
            <span>🛵 Transport</span>
            <span>({counts.transportasi})</span>
          </button>

          <button
            onClick={() => setActiveCategoryFilter('umkm')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition flex items-center space-x-1 ${
              activeCategoryFilter === 'umkm'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'bg-slate-800 text-cyan-400 hover:text-cyan-300 border border-slate-700'
            }`}
          >
            <span>🏪 UMKM</span>
            <span>({counts.umkm})</span>
          </button>

          {/* Divider */}
          <div className="h-5 w-[1px] bg-slate-700 shrink-0 mx-1" />

          {/* Status Filter Toggle Chips */}
          <button
            onClick={() =>
              setActiveStatusFilter(
                activeStatusFilter === 'buka'
                  ? 'semua'
                  : activeStatusFilter === 'tutup'
                  ? 'semua'
                  : 'buka'
              )
            }
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition flex items-center space-x-1.5 border ${
              activeStatusFilter === 'buka'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>{activeStatusFilter === 'buka' ? 'Hanya Buka' : 'Status Buka'}</span>
          </button>
        </div>

        {/* Spot Cards List (Sorted by Distance) */}
        {isDrawerExpanded && (
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-slate-950/40">
            {processedItems.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Compass className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                <p className="font-bold text-white text-sm">Tidak ada titik dalam radius ini</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Coba perbesar radius radar (hingga 100km) atau daftarkan titik baru.
                </p>
                <button
                  onClick={() => handleSelectRadius(25000)}
                  className="mt-3 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl"
                >
                  Perluas Radar ke 25 km
                </button>
              </div>
            ) : (
              processedItems.map((item) => {
                const isLoker = item.category === 'loker';
                const isTrans = item.category === 'transportasi';
                const isUmkm = item.category === 'umkm';
                const isOpen = item.status === 'buka';
                const isCurrentSelected = selectedItem?.id === item.id;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleFocusItemOnMap(item)}
                    className={`bg-slate-900 border rounded-2xl p-3.5 transition cursor-pointer shadow-sm relative ${
                      isCurrentSelected
                        ? 'border-emerald-500 ring-1 ring-emerald-500 bg-slate-850'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Top Row: Category Icon, Title, and Distance Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start space-x-2.5 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                            isLoker
                              ? 'bg-amber-950/60 border border-amber-600/50 text-amber-300'
                              : isTrans
                              ? 'bg-emerald-950/60 border border-emerald-600/50 text-emerald-300'
                              : 'bg-cyan-950/60 border border-cyan-600/50 text-cyan-300'
                          }`}
                        >
                          {isLoker ? '💼' : isTrans ? '🛵' : '🏪'}
                        </div>

                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-white leading-tight truncate">
                            {item.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                            {item.subCategory || item.address}
                          </p>
                        </div>
                      </div>

                      {/* Distance Badge */}
                      {item.distanceMeters !== undefined && (
                        <span className="shrink-0 text-[11px] font-extrabold px-2.5 py-1 rounded-lg bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 font-mono">
                          {formatDistance(item.distanceMeters)}
                        </span>
                      )}
                    </div>

                    {/* Middle Info: Price/Salary, Status Buka/Tutup Toggle */}
                    <div className="mt-2.5 flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                      <span className="font-semibold text-emerald-400 truncate max-w-[180px]">
                        {item.priceOrSalary || item.openingHours || 'Warga Terverifikasi'}
                      </span>

                      {/* Quick Buka/Tutup Status Switch */}
                      <button
                        onClick={(e) => handleToggleItemStatus(item.id, item.status, e)}
                        title="Ubah Status Buka/Tutup"
                        className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold flex items-center space-x-1 border transition ${
                          isOpen
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-red-500/20 text-red-300 border-red-500/40'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}
                        />
                        <span>{isOpen ? 'BUKA / ON' : 'TUTUP / OFF'}</span>
                      </button>
                    </div>

                    {/* Bottom Action Row: WA, Telp, Rute */}
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        {item.whatsapp && (
                          <a
                            href={`https://wa.me/${item.whatsapp}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition flex items-center space-x-1"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WA</span>
                          </a>
                        )}

                        {item.phone && (
                          <a
                            href={`tel:${item.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center space-x-1"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Telp</span>
                          </a>
                        )}
                      </div>

                      {/* Focus / Route Button */}
                      <button
                        onClick={() => handleFocusItemOnMap(item)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center space-x-1 ml-auto"
                      >
                        <Navigation className="w-3 h-3 text-emerald-400" />
                        <span>Arahkan Rute</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* =========================================================================
          4. MODAL DIALOGS (SETTINGS & ADD ITEM)
          ========================================================================= */}
      {/* Pengaturan Khusus AreaQu */}
      <AreaQuSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={(newSettings) => {
          setSettings(newSettings);
          AreaStorageService.saveSettings(newSettings);
        }}
        onShowNotification={onShowNotification}
        onUseCurrentGps={handleLocateGps}
        isGpsLoading={isGpsLocating}
      />

      {/* Modal Tambah Titik Warga */}
      <AddAreaItemModal
        isOpen={isAddItemOpen}
        onClose={() => setIsAddItemOpen(false)}
        onAddItem={handleAddItem}
        defaultLat={settings.centerLat}
        defaultLng={settings.centerLng}
        onShowNotification={onShowNotification}
      />
    </div>
  );
};
