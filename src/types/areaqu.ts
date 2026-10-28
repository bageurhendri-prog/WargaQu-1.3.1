export type AreaCategory = 'loker' | 'transportasi' | 'umkm';

export type AreaItemStatus = 'buka' | 'tutup';

export interface AreaLocationItem {
  id: string;
  title: string;
  category: AreaCategory;
  subCategory?: string;
  status: AreaItemStatus;
  lat: number;
  lng: number;
  address: string;
  phone?: string;
  whatsapp?: string;
  priceOrSalary?: string;
  description: string;
  openingHours?: string;
  postedBy: string;
  rating?: number;
  verifiedWarga?: boolean;
  createdAt: string;
  distanceMeters?: number;
}

export interface AreaQuSettings {
  centerLat: number;
  centerLng: number;
  centerLabel: string;
  radiusMeters: number; // 500 to 100000 (100km)
  mapTileLayer: 'dark' | 'osm' | 'satellite';
  showRadarCircle: boolean;
  driverOnline: boolean; // Grab Driver style online status
  autoCenterGps: boolean;
}
