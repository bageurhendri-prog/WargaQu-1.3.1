export type DomicileStatus = 'tetap' | 'kontrak';
export type FamilyRole = 'kepala_keluarga' | 'istri' | 'anak' | 'orang_tua' | 'famili_lain';
export type Gender = 'L' | 'P';

export interface Citizen {
  id: string;
  nik: string;
  noKk: string;
  name: string;
  gender: Gender;
  birthPlace?: string;
  birthDate?: string;
  religion: string;
  domicileStatus: DomicileStatus;
  familyRole: FamilyRole;
  phone: string;
  addressBlock: string;
  addressNumber: string;
  occupation: string;
  isHeadOfFamily: boolean;
  createdAt: string;
}

export interface FamilyCard {
  noKk: string;
  headName: string;
  address: string;
  memberCount: number;
  phone: string;
  domicileStatus: DomicileStatus;
}

export type PaymentMethodRt = 'tunai' | 'transfer_wargaqu';

export interface IuranPayment {
  id: string;
  noKk: string;
  headName: string;
  month: number; // 1 - 12
  year: number;
  amount: number;
  method: PaymentMethodRt;
  paidAt: string;
  receiptNumber: string;
  notes?: string;
  recordedBy: string;
}

export type CashType = 'masuk' | 'keluar';

export interface CashBookEntry {
  id: string;
  date: string;
  type: CashType;
  category: string;
  description: string;
  amount: number;
  recordedBy: string;
}

export interface RtBoardMember {
  id: string;
  position: string;
  name: string;
  period: string;
  phone: string;
  address: string;
  duties?: string;
}

export type AssetCondition = 'baik' | 'rusak_ringan' | 'rusak_berat';
export type AssetStatus = 'tersedia' | 'dipinjam';

export interface RtAsset {
  id: string;
  code: string;
  name: string;
  category: string;
  quantity: number;
  condition: AssetCondition;
  status: AssetStatus;
  borrowedBy?: string;
  borrowDate?: string;
  returnEstimate?: string;
  notes?: string;
}

export type AnnouncementCategory = 'penting' | 'kegiatan' | 'umum' | 'keamanan';

export interface RtAnnouncement {
  id: string;
  title: string;
  category: AnnouncementCategory;
  content: string;
  date: string;
  author: string;
  isPinned: boolean;
  targetAudience?: string;
}

export interface RtSettings {
  rtName: string; // e.g., "RT 05"
  rwName: string; // e.g., "RW 08"
  kelurahan: string;
  kecamatan: string;
  kabupaten: string;
  ketuaRtName: string;
  ketuaRtPhone: string;
  monthlyFeePerKk: number;
  feeDueDateDay: number; // e.g. 10th of every month
  suratPengantarFormat: string; // e.g., "[NOMOR]/SP-RT05/RW08/[BULAN]/[TAHUN]"
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}
