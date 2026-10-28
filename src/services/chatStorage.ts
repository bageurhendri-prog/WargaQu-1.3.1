import { ChatMessage, ChatRoom } from '../types/chatqu';

const STORAGE_KEYS = {
  CHAT_MESSAGES: 'chatqu_messages_v1',
  ACTIVE_ROOM: 'chatqu_active_room_v1',
};

export const INITIAL_ROOMS: ChatRoom[] = [
  {
    id: 'wargaqu-official',
    name: 'WargaQu Official / Grup',
    subtitle: 'Online • Ketuk info grup',
    avatarLetter: 'W',
    avatarColor: 'bg-emerald-600',
    isOnline: true,
    category: 'grup',
    description: 'Grup komunikasi dan koordinasi warga RT 05 RW 08. Diskusi kegiatan, keamanan, dan warta warga.',
    membersCount: 48,
  },
  {
    id: 'pengurus-rt',
    name: 'Pengurus RT 05 & Seksi',
    subtitle: 'Online • Rapat & Koordinasi',
    avatarLetter: 'P',
    avatarColor: 'bg-teal-600',
    isOnline: true,
    category: 'grup',
    description: 'Forum pengurus RT: Ketua, Sekretaris, Bendahara, Seksi Pembangunan & Humas.',
    membersCount: 7,
  },
  {
    id: 'pos-kamling',
    name: 'Pos Kamling & Ronda Malam',
    subtitle: 'Siaga 24 Jam • Keamanan',
    avatarLetter: 'S',
    avatarColor: 'bg-red-600',
    isOnline: true,
    category: 'siaga',
    description: 'Jalur siaga darurat, jadwal giliran ronda malam, dan laporan kamtibmas lingkungan.',
    membersCount: 16,
  },
  {
    id: 'pak-rt-direct',
    name: 'H. Bambang Sutrisno (Ketua RT)',
    subtitle: 'Online • Surat & Izin Warga',
    avatarLetter: 'B',
    avatarColor: 'bg-amber-600',
    isOnline: true,
    category: 'pribadi',
    description: 'Kontak langsung Ketua RT 05 untuk urusan surat pengantar, izin domisili, dan konsultasi warga.',
    membersCount: 2,
  },
];

export const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    roomId: 'wargaqu-official',
    senderName: 'Pak RT (Bambang)',
    senderRole: 'Ketua RT',
    isMe: false,
    text: 'Selamat datang di modul ChatQu WargaQu! Silakan koordinasi warga lewat sini.',
    timestamp: '08:30',
    status: 'read',
  },
  {
    id: 'msg-2',
    roomId: 'wargaqu-official',
    senderName: 'Hj. Siti Rahmawati',
    senderRole: 'Warga Blok A2',
    isMe: false,
    text: 'Assalamu alaikum Bapak/Ibu, info kerja bakti Minggu pagi jam 07.00 kumpul di pos ronda ya.',
    timestamp: '08:31',
    status: 'read',
  },
  {
    id: 'msg-3',
    roomId: 'wargaqu-official',
    senderName: 'Saya',
    isMe: true,
    text: 'Mantap pak! Sangat ringan, gak pakai lemot, cocok buat HP jadul sekalipun.',
    timestamp: '08:32',
    status: 'read',
  },
  {
    id: 'msg-4',
    roomId: 'wargaqu-official',
    senderName: 'Drs. Hendro Wibowo',
    senderRole: 'Sekretaris RT',
    isMe: false,
    text: 'Bagi warga yang membutuhkan surat pengantar domisili atau SKCK, sekarang bisa langsung request lewat modul PaguyubanQu.',
    timestamp: '08:35',
    status: 'read',
  },

  // Room: Pengurus RT
  {
    id: 'msg-p1',
    roomId: 'pengurus-rt',
    senderName: 'H. Bambang Sutrisno',
    senderRole: 'Ketua RT',
    isMe: false,
    text: 'Laporan kas iuran bulan Oktober sudah terkumpul 82%. Rekap buku kas sudah rapi di sistem.',
    timestamp: 'Kemarin 19:40',
    status: 'read',
  },
  {
    id: 'msg-p2',
    roomId: 'pengurus-rt',
    senderName: 'Saya',
    isMe: true,
    text: 'Siap Pak RT, data iuran warga siap dicetak bukti kwitansi pembayarannya.',
    timestamp: 'Kemarin 19:45',
    status: 'read',
  },

  // Room: Pos Kamling
  {
    id: 'msg-s1',
    roomId: 'pos-kamling',
    senderName: 'Pak Joko (Satpam)',
    senderRole: 'Petugas Ronda',
    isMe: false,
    text: 'Situasi malam ini terpantau aman dan kondusif. Portal blok A dan B sudah ditutup jam 23.00.',
    timestamp: '02:15',
    status: 'read',
  },

  // Room: Pak RT direct
  {
    id: 'msg-d1',
    roomId: 'pak-rt-direct',
    senderName: 'H. Bambang Sutrisno',
    senderRole: 'Ketua RT',
    isMe: false,
    text: 'Halo Mas Hendri, ada yang bisa saya bantu terkait administrasi warga hari ini?',
    timestamp: '07:50',
    status: 'read',
  },
];

export const ChatStorageService = {
  getRooms(): ChatRoom[] {
    return INITIAL_ROOMS;
  },

  getMessages(): ChatMessage[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Gagal memuat pesan chat dari storage:', e);
    }
    // Seed initial messages
    this.saveMessages(INITIAL_MESSAGES);
    return INITIAL_MESSAGES;
  },

  saveMessages(messages: ChatMessage[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(messages));
    } catch (e) {
      console.warn('Gagal menyimpan pesan chat ke storage:', e);
    }
  },

  addMessage(
    roomId: string,
    text: string,
    isMe: boolean = true,
    senderName: string = 'Saya',
    attachment?: { type: 'image' | 'file' | 'location' | 'announcement'; url?: string; title?: string }
  ): ChatMessage {
    const messages = this.getMessages();
    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      roomId,
      senderName,
      isMe,
      text: text.trim(),
      timestamp: timeStr,
      status: 'read',
      attachmentType: attachment?.type,
      attachmentUrl: attachment?.url,
      attachmentTitle: attachment?.title,
    };

    const updated = [...messages, newMsg];
    this.saveMessages(updated);
    return newMsg;
  },

  clearRoomMessages(roomId: string): void {
    const messages = this.getMessages().filter((m) => m.roomId !== roomId);
    this.saveMessages(messages);
  },

  resetAll(): void {
    this.saveMessages(INITIAL_MESSAGES);
  },
};
