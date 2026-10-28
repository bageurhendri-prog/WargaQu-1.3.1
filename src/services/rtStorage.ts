import {
  Citizen,
  IuranPayment,
  CashBookEntry,
  RtBoardMember,
  RtAsset,
  RtAnnouncement,
  RtSettings
} from '../types/rtqu';

const STORAGE_KEYS = {
  CITIZENS: 'rtqu_citizens_v1',
  IURAN: 'rtqu_iuran_v1',
  CASHBOOK: 'rtqu_cashbook_v1',
  BOARD: 'rtqu_board_v1',
  ASSETS: 'rtqu_assets_v1',
  ANNOUNCEMENTS: 'rtqu_announcements_v1',
  SETTINGS: 'rtqu_settings_v1',
};

export const INITIAL_SETTINGS: RtSettings = {
  rtName: 'RT 05',
  rwName: 'RW 08',
  kelurahan: 'Sukamaju Indah',
  kecamatan: 'Cilodong',
  kabupaten: 'Kota Depok',
  ketuaRtName: 'H. Bambang Sutrisno, S.T.',
  ketuaRtPhone: '081288990011',
  monthlyFeePerKk: 50000,
  feeDueDateDay: 10,
  suratPengantarFormat: '[NOMOR]/SP-RT05/RW08/[BULAN]/[TAHUN]',
  bankName: 'BCA',
  accountNumber: '8820192831',
  accountHolder: 'Kas RT 05 RW 08',
};

export const INITIAL_CITIZENS: Citizen[] = [
  {
    id: 'cz-1',
    nik: '3276011204850001',
    noKk: '3276010505100001',
    name: 'H. Bambang Sutrisno',
    gender: 'L',
    birthPlace: 'Solo',
    birthDate: '1985-04-12',
    religion: 'Islam',
    domicileStatus: 'tetap',
    familyRole: 'kepala_keluarga',
    phone: '081288990011',
    addressBlock: 'Blok A2',
    addressNumber: '12',
    occupation: 'Wiraswasta / Ketua RT',
    isHeadOfFamily: true,
    createdAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 'cz-2',
    nik: '3276015508880002',
    noKk: '3276010505100001',
    name: 'Hj. Siti Rahmawati',
    gender: 'P',
    birthPlace: 'Bogor',
    birthDate: '1988-08-15',
    religion: 'Islam',
    domicileStatus: 'tetap',
    familyRole: 'istri',
    phone: '081399881122',
    addressBlock: 'Blok A2',
    addressNumber: '12',
    occupation: 'Guru / Penggerak PKK',
    isHeadOfFamily: false,
    createdAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 'cz-3',
    nik: '3276012010150003',
    noKk: '3276010505100001',
    name: 'Rizky Pratama Sutrisno',
    gender: 'L',
    birthPlace: 'Depok',
    birthDate: '2015-10-20',
    religion: 'Islam',
    domicileStatus: 'tetap',
    familyRole: 'anak',
    phone: '-',
    addressBlock: 'Blok A2',
    addressNumber: '12',
    occupation: 'Pelajar SD',
    isHeadOfFamily: false,
    createdAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 'cz-4',
    nik: '3276011406820004',
    noKk: '3276010505100002',
    name: 'Ir. Agus Wijaya',
    gender: 'L',
    birthPlace: 'Semarang',
    birthDate: '1982-06-14',
    religion: 'Islam',
    domicileStatus: 'tetap',
    familyRole: 'kepala_keluarga',
    phone: '081277665544',
    addressBlock: 'Blok B1',
    addressNumber: '05',
    occupation: 'Karyawan BUMN / Sekretaris RT',
    isHeadOfFamily: true,
    createdAt: '2026-01-12T09:00:00Z',
  },
  {
    id: 'cz-5',
    nik: '3276015003840005',
    noKk: '3276010505100002',
    name: 'Dewi Lestari, S.E.',
    gender: 'P',
    birthPlace: 'Jakarta',
    birthDate: '1984-03-10',
    religion: 'Islam',
    domicileStatus: 'tetap',
    familyRole: 'istri',
    phone: '081388776655',
    addressBlock: 'Blok B1',
    addressNumber: '05',
    occupation: 'Akuntan / Bendahara RT',
    isHeadOfFamily: false,
    createdAt: '2026-01-12T09:00:00Z',
  },
  {
    id: 'cz-6',
    nik: '3276011909930006',
    noKk: '3276010505100003',
    name: 'Dimas Aditya',
    gender: 'L',
    birthPlace: 'Bandung',
    birthDate: '1993-09-19',
    religion: 'Islam',
    domicileStatus: 'kontrak',
    familyRole: 'kepala_keluarga',
    phone: '085711223344',
    addressBlock: 'Blok C3',
    addressNumber: '08',
    occupation: 'Software Engineer (Kontrak 2 Thn)',
    isHeadOfFamily: true,
    createdAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 'cz-7',
    nik: '3276016212950007',
    noKk: '3276010505100003',
    name: 'Nadia Putri',
    gender: 'P',
    birthPlace: 'Surabaya',
    birthDate: '1995-12-22',
    religion: 'Islam',
    domicileStatus: 'kontrak',
    familyRole: 'istri',
    phone: '085799887766',
    addressBlock: 'Blok C3',
    addressNumber: '08',
    occupation: 'Desainer Grafis',
    isHeadOfFamily: false,
    createdAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 'cz-8',
    nik: '3276010802790008',
    noKk: '3276010505100004',
    name: 'Drs. Hendro Wibowo',
    gender: 'L',
    birthPlace: 'Yogyakarta',
    birthDate: '1979-02-08',
    religion: 'Kristen',
    domicileStatus: 'tetap',
    familyRole: 'kepala_keluarga',
    phone: '081122334455',
    addressBlock: 'Blok A1',
    addressNumber: '02',
    occupation: 'Dosen Universitas Swasta',
    isHeadOfFamily: true,
    createdAt: '2026-01-05T08:00:00Z',
  },
];

export const INITIAL_BOARD: RtBoardMember[] = [
  {
    id: 'bd-1',
    position: 'Ketua RT',
    name: 'H. Bambang Sutrisno, S.T.',
    period: '2025 - 2028',
    phone: '081288990011',
    address: 'Blok A2 No. 12',
    duties: 'Memimpin koordinasi paguyuban, hubungan RW & instansi kelurahan',
  },
  {
    id: 'bd-2',
    position: 'Sekretaris RT',
    name: 'Ir. Agus Wijaya',
    period: '2025 - 2028',
    phone: '081277665544',
    address: 'Blok B1 No. 05',
    duties: 'Administrasi kependudukan, surat pengantar & notulensi rapat',
  },
  {
    id: 'bd-3',
    position: 'Bendahara RT',
    name: 'Dewi Lestari, S.E.',
    period: '2025 - 2028',
    phone: '081388776655',
    address: 'Blok B1 No. 05',
    duties: 'Pengelolaan iuran bulanan, pembukuan kas & laporan keuangan',
  },
  {
    id: 'bd-4',
    position: 'Seksi Keamanan & Ketertiban',
    name: 'Kapten (Purn) Sunardi',
    period: '2025 - 2028',
    phone: '081233445566',
    address: 'Blok C1 No. 01',
    duties: 'Koordinator pos ronda malam, CCTV lingkungan & keamanan warga',
  },
  {
    id: 'bd-5',
    position: 'Seksi Kebersihan & Lingkungan',
    name: 'Yanto Sugiarto',
    period: '2025 - 2028',
    phone: '085811224455',
    address: 'Blok B2 No. 07',
    duties: 'Jadwal kerja bakti, pengangkutan sampah & pemeliharaan drainase',
  },
  {
    id: 'bd-6',
    position: 'Seksi Pemuda & Olahraga',
    name: 'Fajar Nugroho (Karang Taruna)',
    period: '2025 - 2028',
    phone: '087899881122',
    address: 'Blok A3 No. 04',
    duties: 'Peringatan HUT RI, turnamen badminton & kegiatan kepemudaan',
  },
];

export const INITIAL_ASSETS: RtAsset[] = [
  {
    id: 'ast-1',
    code: 'AST-TND-01',
    name: 'Tenda Terop Besi (4x6 m)',
    category: 'Fasilitas Acara',
    quantity: 2,
    condition: 'baik',
    status: 'tersedia',
    notes: 'Disimpan di gudang balai warga RT',
  },
  {
    id: 'ast-2',
    code: 'AST-KRS-01',
    name: 'Kursi Plastik Napolly',
    category: 'Fasilitas Acara',
    quantity: 80,
    condition: 'baik',
    status: 'tersedia',
    notes: 'Warna hijau toska berstempel RT 05',
  },
  {
    id: 'ast-3',
    code: 'AST-SND-01',
    name: 'Sound System Portabel + 2 Mic Wireless',
    category: 'Elektronik',
    quantity: 1,
    condition: 'baik',
    status: 'dipinjam',
    borrowedBy: 'Keluarga Bpk. Hendro (Blok A1 No. 02)',
    borrowDate: '2026-10-25',
    returnEstimate: '2026-10-28',
    notes: 'Dipinjam untuk acara syukuran keluarga',
  },
  {
    id: 'ast-4',
    code: 'AST-RMT-01',
    name: 'Mesin Pemotong Rumput Gendong (Honda)',
    category: 'Peralatan Lingkungan',
    quantity: 1,
    condition: 'baik',
    status: 'tersedia',
    notes: 'Dipakai kerja bakti & rumput lapangan fasum',
  },
  {
    id: 'ast-5',
    code: 'AST-GNS-01',
    name: 'Genset Listrik 3000 Watt',
    category: 'Elektronik',
    quantity: 1,
    condition: 'baik',
    status: 'tersedia',
    notes: 'Siaga darurat pemadaman listrik',
  },
  {
    id: 'ast-6',
    code: 'AST-GTR-01',
    name: 'Set Cangkul, Sekop & Gerobak Sorong Artco',
    category: 'Alat Gotong Royong',
    quantity: 4,
    condition: 'baik',
    status: 'tersedia',
    notes: 'Lengkap siap pakai',
  },
];

export const INITIAL_CASHBOOK: CashBookEntry[] = [
  {
    id: 'cb-1',
    date: '2026-10-01',
    type: 'masuk',
    category: 'Saldo Awal',
    description: 'Saldo kas RT awal bulan Oktober 2026',
    amount: 8750000,
    recordedBy: 'Dewi Lestari (Bendahara)',
  },
  {
    id: 'cb-2',
    date: '2026-10-05',
    type: 'masuk',
    category: 'Iuran Warga',
    description: 'Penerimaan iuran bulanan 40 KK',
    amount: 2000000,
    recordedBy: 'Dewi Lestari (Bendahara)',
  },
  {
    id: 'cb-3',
    date: '2026-10-08',
    type: 'keluar',
    category: 'Keamanan',
    description: 'Honor petugas satpam pos ronda periode Oktober',
    amount: 1500000,
    recordedBy: 'Dewi Lestari (Bendahara)',
  },
  {
    id: 'cb-4',
    date: '2026-10-12',
    type: 'keluar',
    category: 'Kebersihan',
    description: 'Iuran truk sampah dinas kebersihan DLH',
    amount: 600000,
    recordedBy: 'Dewi Lestari (Bendahara)',
  },
  {
    id: 'cb-5',
    date: '2026-10-18',
    type: 'keluar',
    category: 'Perbaikan Fasum',
    description: 'Pembelian 6 lampu LED PJU & kabel jalan warga',
    amount: 420000,
    recordedBy: 'Agus Wijaya (Sekretaris)',
  },
  {
    id: 'cb-6',
    date: '2026-10-22',
    type: 'masuk',
    category: 'Sumbangan Warga',
    description: 'Donasi sukarela warga donatur untuk perbaikan gapura',
    amount: 1000000,
    recordedBy: 'Dewi Lestari (Bendahara)',
  },
];

export const INITIAL_IURAN: IuranPayment[] = [
  {
    id: 'iur-1',
    noKk: '3276010505100001',
    headName: 'H. Bambang Sutrisno',
    month: 10,
    year: 2026,
    amount: 50000,
    method: 'transfer_wargaqu',
    paidAt: '2026-10-02T10:15:00Z',
    receiptNumber: 'IUR-202610-001',
    notes: 'Lunas iuran Oktober',
    recordedBy: 'Sistem WargaQu',
  },
  {
    id: 'iur-2',
    noKk: '3276010505100002',
    headName: 'Ir. Agus Wijaya',
    month: 10,
    year: 2026,
    amount: 50000,
    method: 'transfer_wargaqu',
    paidAt: '2026-10-04T14:30:00Z',
    receiptNumber: 'IUR-202610-002',
    notes: 'Lunas iuran Oktober',
    recordedBy: 'Sistem WargaQu',
  },
  {
    id: 'iur-3',
    noKk: '3276010505100003',
    headName: 'Dimas Aditya',
    month: 10,
    year: 2026,
    amount: 50000,
    method: 'tunai',
    paidAt: '2026-10-06T19:00:00Z',
    receiptNumber: 'IUR-202610-003',
    notes: 'Diserahkan langsung ke bendahara',
    recordedBy: 'Dewi Lestari (Bendahara)',
  },
];

export const INITIAL_ANNOUNCEMENTS: RtAnnouncement[] = [
  {
    id: 'anc-1',
    title: 'Kerja Bakti Akbar Bersih Drainase Menyambut Musim Hujan',
    category: 'kegiatan',
    content:
      'Diberitahukan kepada seluruh bapak/ibu warga RT 05 RW 08 bahwa kerja bakti akan diadakan pada hari Minggu, 1 November 2026 pukul 07.00 WIB. Titik kumpul di Balai Warga. Harap membawa alat kebersihan masing-masing. Konsumsi disediakan oleh pengurus RT.',
    date: '2026-10-26',
    author: 'Pengurus RT 05',
    isPinned: true,
    targetAudience: 'Seluruh Warga RT 05',
  },
  {
    id: 'anc-2',
    title: 'Pemberitahuan Pemeliharaan Saluran Air Bersih PDAM',
    category: 'penting',
    content:
      'Pihak PDAM menginformasikan adanya perbaikan pipa distribusi utama pada hari Kamis, 29 Oktober 2026 mulai pkl 09.00 - 15.00 WIB. Warga dihimbau untuk menampung air secukupnya sebelum pemadaman aliran.',
    date: '2026-10-25',
    author: 'Sekretariat RT 05',
    isPinned: true,
    targetAudience: 'Warga Blok A, B, C',
  },
  {
    id: 'anc-3',
    title: 'Posyandu Balita & Pemeriksaan Kesehatan Lansia Bulanan',
    category: 'umum',
    content:
      'Posyandu Mawar RT 05 akan beroperasi pada hari Sabtu, 7 November 2026 pukul 08.30 - 11.30 WIB di Balai Warga. Melayani penimbangan berat badan, imunisasi balita, dan cek tensi/gula darah gratis untuk lansia.',
    date: '2026-10-23',
    author: 'Kader Posyandu & PKK',
    isPinned: false,
    targetAudience: 'Keluarga Balita & Lansia',
  },
  {
    id: 'anc-4',
    title: 'Penyegaran Jadwal Ronda Malam & Pengawasan Tamu 1x24 Jam',
    category: 'keamanan',
    content:
      'Mengingat keamanan lingkungan bersama, jadwal ronda malam terbaru telah dipasang di Pos Ronda. Tamu yang menginap lebih dari 1x24 jam wajib melapor kepada Ketua RT / petugas pos ronda.',
    date: '2026-10-20',
    author: 'Seksi Keamanan RT',
    isPinned: false,
    targetAudience: 'Warga & Petugas Ronda',
  },
];

export const RtStorageService = {
  getSettings(): RtSettings {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
      return INITIAL_SETTINGS;
    }
    try {
      return { ...INITIAL_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return INITIAL_SETTINGS;
    }
  },

  saveSettings(settings: RtSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  getCitizens(): Citizen[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CITIZENS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CITIZENS, JSON.stringify(INITIAL_CITIZENS));
      return INITIAL_CITIZENS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_CITIZENS;
    }
  },

  saveCitizens(citizens: Citizen[]): void {
    localStorage.setItem(STORAGE_KEYS.CITIZENS, JSON.stringify(citizens));
  },

  getBoard(): RtBoardMember[] {
    const raw = localStorage.getItem(STORAGE_KEYS.BOARD);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.BOARD, JSON.stringify(INITIAL_BOARD));
      return INITIAL_BOARD;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_BOARD;
    }
  },

  saveBoard(board: RtBoardMember[]): void {
    localStorage.setItem(STORAGE_KEYS.BOARD, JSON.stringify(board));
  },

  getAssets(): RtAsset[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ASSETS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(INITIAL_ASSETS));
      return INITIAL_ASSETS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_ASSETS;
    }
  },

  saveAssets(assets: RtAsset[]): void {
    localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(assets));
  },

  getCashBook(): CashBookEntry[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CASHBOOK);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CASHBOOK, JSON.stringify(INITIAL_CASHBOOK));
      return INITIAL_CASHBOOK;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_CASHBOOK;
    }
  },

  saveCashBook(entries: CashBookEntry[]): void {
    localStorage.setItem(STORAGE_KEYS.CASHBOOK, JSON.stringify(entries));
  },

  getIuran(): IuranPayment[] {
    const raw = localStorage.getItem(STORAGE_KEYS.IURAN);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.IURAN, JSON.stringify(INITIAL_IURAN));
      return INITIAL_IURAN;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_IURAN;
    }
  },

  saveIuran(payments: IuranPayment[]): void {
    localStorage.setItem(STORAGE_KEYS.IURAN, JSON.stringify(payments));
  },

  getAnnouncements(): RtAnnouncement[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(INITIAL_ANNOUNCEMENTS));
      return INITIAL_ANNOUNCEMENTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_ANNOUNCEMENTS;
    }
  },

  saveAnnouncements(announcements: RtAnnouncement[]): void {
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(announcements));
  },
};
