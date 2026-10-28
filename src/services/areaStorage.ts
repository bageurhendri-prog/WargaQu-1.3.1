import { AreaLocationItem, AreaQuSettings, AreaCategory, AreaItemStatus } from '../types/areaqu';

const STORAGE_KEYS = {
  ITEMS: 'areaqu_items_v1',
  SETTINGS: 'areaqu_settings_v1',
};

// Default center: Pos RW / Komplek Warga (-6.2146, 106.8451)
export const DEFAULT_SETTINGS: AreaQuSettings = {
  centerLat: -6.2146,
  centerLng: 106.8451,
  centerLabel: 'Pos Ronda RW 05 / RT 02',
  radiusMeters: 5000, // 5km default (range 500m - 100km)
  mapTileLayer: 'osm',
  showRadarCircle: true,
  driverOnline: true,
  autoCenterGps: false,
};

export const INITIAL_ITEMS: AreaLocationItem[] = [
  // --- LOKER (Lowongan Kerja) ---
  {
    id: 'loker-1',
    title: 'Dibutuhkan Kasir & Barista Kedai Kopi',
    category: 'loker',
    subCategory: 'Kasir & FnB',
    status: 'buka',
    lat: -6.2162,
    lng: 106.8475,
    address: 'Jl. Melati No. 14, RT 02 (Sebelah Toko Sembako)',
    phone: '081234567890',
    whatsapp: '6281234567890',
    priceOrSalary: 'Gaji Rp 2.800.000 / bln',
    description: 'Dicari pemuda/pemudi warga sekitar yang jujur dan ramah untuk shift pagi-sore. Disediakan makan siang.',
    openingHours: 'Lamaran: 09:00 - 17:00',
    postedBy: 'Pak Hendra (RT 02)',
    rating: 4.8,
    verifiedWarga: true,
    createdAt: '2026-10-25T08:00:00Z',
  },
  {
    id: 'loker-2',
    title: 'Helper Gudang & Packing Paket UMKM',
    category: 'loker',
    subCategory: 'Gudang & Logistik',
    status: 'buka',
    lat: -6.2128,
    lng: 106.8415,
    address: 'Ruko Blok B No. 04, Belakang Balai Warga',
    phone: '081388776655',
    whatsapp: '6281388776655',
    priceOrSalary: 'Harian Rp 120.000 / hari',
    description: 'Membantu sortir barang dan packing kiriman online shop warga. Kerja santai, bonus target bulanan.',
    openingHours: 'Senin - Sabtu (08:30 - 16:30)',
    postedBy: 'Ibu Ratna UMKM',
    rating: 4.9,
    verifiedWarga: true,
    createdAt: '2026-10-26T10:00:00Z',
  },
  {
    id: 'loker-3',
    title: 'Driver Pengantar Galon & Gas LPG',
    category: 'loker',
    subCategory: 'Kurir Lokal',
    status: 'tutup',
    lat: -6.2215,
    lng: 106.8492,
    address: 'Pangkalan Gas RT 05, Depan Lapangan Voli',
    phone: '085711223344',
    whatsapp: '6285711223344',
    priceOrSalary: 'Gaji Rp 2.500.000 + Insentif',
    description: 'Posisi saat ini terisi sementara. Akan dibuka kembali awal bulan depan bila ada penambahan armada motor kancil.',
    openingHours: 'Pendaftaran Ditutup',
    postedBy: 'Haji Mansur',
    rating: 4.6,
    verifiedWarga: true,
    createdAt: '2026-10-20T12:00:00Z',
  },
  {
    id: 'loker-4',
    title: 'Staff Cuci Motor & Mobil Kilat',
    category: 'loker',
    subCategory: 'Otomotif & Jasa',
    status: 'buka',
    lat: -6.2085,
    lng: 106.8520,
    address: 'Jl. Flamboyan Raya No. 8 (Dekat gapura perbatasan RW)',
    phone: '081900112233',
    whatsapp: '6281900112233',
    priceOrSalary: 'Bagi Hasil 40% (Rp 100rb-180rb/hari)',
    description: 'Dibutuhkan 2 tenaga tambahan cuci motor waterjet salju. Langsung kerja tanpa ijazah, asal ulet.',
    openingHours: '08:00 - 20:00',
    postedBy: 'Mas Teguh',
    rating: 4.7,
    verifiedWarga: true,
    createdAt: '2026-10-27T07:00:00Z',
  },

  // --- TRANSPORTASI (Ojek, Driver, Angkot, Travel Warga) ---
  {
    id: 'trans-1',
    title: 'Pangkalan Ojek Berkah Warga RT 02',
    category: 'transportasi',
    subCategory: 'Ojek Pangkalan & Titip Belanja',
    status: 'buka',
    lat: -6.2135,
    lng: 106.8445,
    address: 'Pos Ronda Utama RT 02, Samping Warung Madura',
    phone: '081299887766',
    whatsapp: '6281299887766',
    priceOrSalary: 'Mulai Rp 10.000 / trip lingkungan',
    description: 'Standby 5 driver warga berpengalaman. Melayani antar stasiun, jemput anak sekolah, dan titip belanja pasar subuh.',
    openingHours: 'Siap Narik 05:30 - 23:00',
    postedBy: 'Kang Maman Ojek',
    rating: 4.9,
    verifiedWarga: true,
    createdAt: '2026-10-24T06:00:00Z',
  },
  {
    id: 'trans-2',
    title: 'Kang Asep - Ojek Online & Offline Siap Jemput',
    category: 'transportasi',
    subCategory: 'Driver Warga Prioritas',
    status: 'buka',
    lat: -6.2158,
    lng: 106.8432,
    address: 'Gang Salak 3 No. 9, RT 01',
    phone: '087811223399',
    whatsapp: '6287811223399',
    priceOrSalary: 'Tarif Warga Lebih Hemat',
    description: 'Motor matic terawat, helm bersih 2 buah, jas hujan siap sedia. Khusus warga RW 05 ada diskon langganan bulanan.',
    openingHours: 'Online Siap Antar',
    postedBy: 'Kang Asep Driver',
    rating: 5.0,
    verifiedWarga: true,
    createdAt: '2026-10-27T05:00:00Z',
  },
  {
    id: 'trans-3',
    title: 'Mobil Antar Jemput Bandara & Wisata Pak Darmo',
    category: 'transportasi',
    subCategory: 'Rental Mobil & Sopir',
    status: 'buka',
    lat: -6.2201,
    lng: 106.8398,
    address: 'Jl. Beringin No. 22, RT 03',
    phone: '081344556677',
    whatsapp: '6281344556677',
    priceOrSalary: 'Mulai Rp 250.000 (Drop Bandara)',
    description: 'Unit Toyota Innova & Avanza AC dingin dan bersih. Sopir santun warga sendiri, paham rute cepat bebas macet.',
    openingHours: 'Booking 24 Jam via WhatsApp',
    postedBy: 'Pak Darmo RW 05',
    rating: 4.9,
    verifiedWarga: true,
    createdAt: '2026-10-22T09:00:00Z',
  },
  {
    id: 'trans-4',
    title: 'Angkot Trayek Warga Paguyuban',
    category: 'transportasi',
    subCategory: 'Angkutan Lingkungan',
    status: 'tutup',
    lat: -6.2099,
    lng: 106.8385,
    address: 'Halte Gerbang Komplek',
    phone: '085699881122',
    whatsapp: '6285699881122',
    priceOrSalary: 'Rp 5.000 / orang',
    description: 'Rute lingkar komplek menuju pasar induk & terminal. Sedang istirahat siang, beroperasi kembali pukul 15:30.',
    openingHours: 'Shift Siang Tutup (Kembali 15:30)',
    postedBy: 'Paguyuban Sopir',
    rating: 4.5,
    verifiedWarga: true,
    createdAt: '2026-10-25T11:00:00Z',
  },

  // --- UMKM (Warung, Bengkel, Kuliner, Jasa) ---
  {
    id: 'umkm-1',
    title: 'Warung Nasi Uduk & Lontong Sayur Bu Nur',
    category: 'umkm',
    subCategory: 'Kuliner Sarapan Warga',
    status: 'buka',
    lat: -6.2152,
    lng: 106.8465,
    address: 'Jl. Kenanga No. 5, Depan Masjid Al-Ikhlas',
    phone: '081288990011',
    whatsapp: '6281288990011',
    priceOrSalary: 'Rp 12.000 - Rp 22.000 / porsi',
    description: 'Nasi uduk gurih wangi dengan lauk semur tahu, telur balado, dan bihun goreng. Sambal kacang khas mantap.',
    openingHours: '06:00 - 13:00 (Setiap Hari)',
    postedBy: 'Bu Nur (Kader PKK)',
    rating: 4.9,
    verifiedWarga: true,
    createdAt: '2026-10-23T06:30:00Z',
  },
  {
    id: 'umkm-2',
    title: 'Bengkel Motor "Jaya Sakti" Mas Bambang',
    category: 'umkm',
    subCategory: 'Servis Motor & Tambal Tubeless',
    status: 'buka',
    lat: -6.2138,
    lng: 106.8488,
    address: 'Jl. Melati Ujung No. 1, Pojok RT 04',
    phone: '087766554433',
    whatsapp: '6287766554433',
    priceOrSalary: 'Ganti Oli & Tune Up Mulai Rp 45.000',
    description: 'Melayani tambal ban press & tubeless cepat, servis karbu/injeksi, ganti oli mesin, dan kelistrikan motor.',
    openingHours: '08:00 - 21:00',
    postedBy: 'Mas Bambang',
    rating: 4.8,
    verifiedWarga: true,
    createdAt: '2026-10-24T08:00:00Z',
  },
  {
    id: 'umkm-3',
    title: 'Laundry Kiloan "Wangi Bersih" RT 03',
    category: 'umkm',
    subCategory: 'Laundry Kilat 1 Hari',
    status: 'buka',
    lat: -6.2178,
    lng: 106.8422,
    address: 'Gang Kamboja 2 No. 11, RT 03',
    phone: '081399001122',
    whatsapp: '6281399001122',
    priceOrSalary: 'Rp 7.000 / kg (Cuci + Setrika Wangi)',
    description: 'Pakaian dipisah tiap pelanggan, wangi tahan 1 minggu. Gratis jemput dan antar untuk warga satu RW.',
    openingHours: '07:30 - 20:00',
    postedBy: 'Mbak Dewi',
    rating: 5.0,
    verifiedWarga: true,
    createdAt: '2026-10-26T07:00:00Z',
  },
  {
    id: 'umkm-4',
    title: 'Depot Air Minum Galon RO Segar Qu',
    category: 'umkm',
    subCategory: 'Isi Ulang Galon & Gas',
    status: 'buka',
    lat: -6.2112,
    lng: 106.8460,
    address: 'Jl. Delima No. 18, RT 01',
    phone: '081200998877',
    whatsapp: '6281200998877',
    priceOrSalary: 'Rp 6.000 / galon (Diantar ke Rumah)',
    description: 'Proses filter 8 tahap Reverse Osmosis dengan sinar UV & Ozon. Higienis, segar, dan bersertifikasi Dinkes.',
    openingHours: '07:00 - 21:00',
    postedBy: 'Pak Rahmat',
    rating: 4.8,
    verifiedWarga: true,
    createdAt: '2026-10-25T07:00:00Z',
  },
  {
    id: 'umkm-5',
    title: 'Pangkas Rambut "Asli Garut" Kang Dedi',
    category: 'umkm',
    subCategory: 'Barbershop Warga',
    status: 'tutup',
    lat: -6.2188,
    lng: 106.8499,
    address: 'Ruko Pojok Pos RW 05',
    phone: '085788991122',
    whatsapp: '6285788991122',
    priceOrSalary: 'Dewasa Rp 20.000, Anak Rp 15.000',
    description: 'Potong rambut model kekinian, pijat kepala rileks, cukur kumis rapi. Sedang pulang kampung, buka kembali lusa.',
    openingHours: 'Tutup Sementara (Buka Lusa)',
    postedBy: 'Kang Dedi',
    rating: 4.7,
    verifiedWarga: true,
    createdAt: '2026-10-21T10:00:00Z',
  },
];

// Haversine distance calculator between two GPS coordinates in meters
export function getDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

// Format meters into human-readable distance (e.g. "350 m" or "4.2 km")
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters} m`;
  }
  const km = (meters / 1000).toFixed(1);
  return `${km.replace('.0', '')} km`;
}

export const AreaStorageService = {
  getItems(): AreaLocationItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ITEMS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(INITIAL_ITEMS));
        return INITIAL_ITEMS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_ITEMS;
    }
  },

  saveItems(items: AreaLocationItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save AreaQu items', e);
    }
  },

  addItem(item: Omit<AreaLocationItem, 'id' | 'createdAt'>): AreaLocationItem {
    const items = this.getItems();
    const newItem: AreaLocationItem = {
      ...item,
      id: `${item.category}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newItem, ...items];
    this.saveItems(updated);
    return newItem;
  },

  updateItemStatus(id: string, status: AreaItemStatus): AreaLocationItem[] {
    const items = this.getItems().map((item) => {
      if (item.id === id) {
        return { ...item, status };
      }
      return item;
    });
    this.saveItems(items);
    return items;
  },

  getSettings(): AreaQuSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
        return DEFAULT_SETTINGS;
      }
      const parsed = JSON.parse(data);
      const result: AreaQuSettings = { ...DEFAULT_SETTINGS, ...parsed };
      // If mapTileLayer is dark or not set, default to osm for maximum reliability & openstreetmap clarity
      if (!parsed.mapTileLayer || parsed.mapTileLayer === 'dark') {
        result.mapTileLayer = 'osm';
      }
      return result;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: AreaQuSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save AreaQu settings', e);
    }
  },

  toggleDriverOnline(isOnline: boolean): void {
    const current = this.getSettings();
    this.saveSettings({ ...current, driverOnline: isOnline });
  },

  setRadius(meters: number): void {
    const current = this.getSettings();
    this.saveSettings({ ...current, radiusMeters: meters });
  },
};
