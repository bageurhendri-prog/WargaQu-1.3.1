import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  MoreVertical,
  Paperclip,
  Smile,
  Send,
  ArrowLeft,
  Users,
  Shield,
  Info,
  Search,
  Trash2,
  Check,
  CheckCheck,
  X,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  FileText,
  Image as ImageIcon,
  MapPin,
  Megaphone,
  Layers,
  Clock
} from 'lucide-react';
import { ChatMessage, ChatRoom } from '../../types/chatqu';
import { ChatStorageService } from '../../services/chatStorage';

interface ChatQuViewProps {
  onBackToKasir?: () => void;
  onOpenSwitchModul?: () => void;
  onShowNotification?: (msg: string) => void;
}

export const ChatQuView: React.FC<ChatQuViewProps> = ({
  onBackToKasir,
  onOpenSwitchModul,
  onShowNotification,
}) => {
  const rooms = ChatStorageService.getRooms();
  const [activeRoomId, setActiveRoomId] = useState<string>('wargaqu-official');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState<boolean>(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState<boolean>(false);
  const [showGroupInfo, setShowGroupInfo] = useState<boolean>(false);
  const [showCallModal, setShowCallModal] = useState<boolean>(false);
  const [isCallingConnected, setIsCallingConnected] = useState<boolean>(false);
  const [callDuration, setCallDuration] = useState<number>(0);
  const [isCallMuted, setIsCallMuted] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeRoom = rooms.find((r) => r.id === activeRoomId) || rooms[0];

  // Load messages from localStorage on mount & room switch
  useEffect(() => {
    const loaded = ChatStorageService.getMessages();
    setMessages(loaded);
  }, []);

  // Auto scroll to bottom
  const scrollToBottom = (smooth: boolean = true) => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  };

  useEffect(() => {
    scrollToBottom(false);
  }, [activeRoomId]);

  useEffect(() => {
    scrollToBottom(true);
  }, [messages, isTyping]);

  // Voice call timer simulation
  useEffect(() => {
    let interval: any;
    if (showCallModal) {
      const connectTimeout = setTimeout(() => {
        setIsCallingConnected(true);
      }, 2500);

      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);

      return () => {
        clearTimeout(connectTimeout);
        clearInterval(interval);
      };
    } else {
      setIsCallingConnected(false);
      setCallDuration(0);
      setIsCallMuted(false);
    }
  }, [showCallModal]);

  // Send new message
  const handleSendMessage = (textToSend?: string) => {
    const content = (textToSend !== undefined ? textToSend : inputText).trim();
    if (!content) return;

    const newMsg = ChatStorageService.addMessage(activeRoomId, content, true, 'Saya');
    setMessages(ChatStorageService.getMessages());
    setInputText('');
    setShowEmojiPicker(false);
    setShowAttachmentMenu(false);

    // Provide haptic feedback if supported
    if (navigator.vibrate) {
      try {
        navigator.vibrate(15);
      } catch {}
    }

    // Trigger intelligent simulated auto-reply from Pak RT / Admin after short delay
    triggerAutoReply(content, activeRoomId);
  };

  // Smart simulated responses for community feel
  const triggerAutoReply = (userText: string, roomId: string) => {
    const lower = userText.toLowerCase();

    // Determine responder and reply content
    let replySender = 'Pak RT (Bambang)';
    let replyRole = 'Ketua RT';
    let replyText = '';

    if (roomId === 'pos-kamling') {
      replySender = 'Pak Joko (Satpam)';
      replyRole = 'Petugas Keamanan';
      if (lower.includes('patroli') || lower.includes('ronda') || lower.includes('aman')) {
        replyText = 'Siap monitor! Petugas ronda sedang patroli keliling blok. Situasi terpantau aman terkendali.';
      } else {
        replyText = 'Siap kami catat di pos satpam. Jika ada hal mencurigakan langsung hubungi kami ya.';
      }
    } else if (roomId === 'pak-rt-direct') {
      replySender = 'H. Bambang Sutrisno';
      replyRole = 'Ketua RT';
      if (lower.includes('surat') || lower.includes('pengantar') || lower.includes('ktp') || lower.includes('domisili')) {
        replyText = 'Baik Pak/Bu, surat pengantarnya sedang kami siapkan. Bisa diambil sore ini di rumah atau lewat modul PaguyubanQu ya.';
      } else if (lower.includes('iuran') || lower.includes('bayar')) {
        replyText = 'Terima kasih atas konfirmasinya. Bendahara kami akan langsung update status iuran di buku kas RT.';
      } else {
        replyText = 'Baik, terima kasih atas laporannya. Segera kami koordinasikan dengan seksi terkait.';
      }
    } else {
      // General group
      if (lower.includes('assalam') || lower.includes('halo') || lower.includes('selamat')) {
        replyText = 'Waalaikumsalam wr. wb. Selamat bergabung dan salam guyub rukun untuk seluruh warga RT 05!';
      } else if (lower.includes('kerja bakti') || lower.includes('gotong royong')) {
        replyText = 'Siap! Jangan lupa bawa peralatan cangkul dan sapu lidi. Konsumsi kopi dan snack disiapkan warga.';
      } else if (lower.includes('iuran') || lower.includes('kas')) {
        replyText = 'Untuk rekapitulasi iuran warga bulan ini sudah transparan dicatat pada menu Iuran di modul PaguyubanQu.';
      } else if (lower.includes('terima kasih') || lower.includes('makasih') || lower.includes('siap')) {
        replyText = 'Sama-sama bapak/ibu, mari bersama menjaga keamanan dan kebersihan lingkungan kita.';
      } else {
        replyText = 'Terima kasih atas masukannya. Pesan sudah terbaca oleh pengurus RT.';
      }
    }

    // Show typing indicator
    setTimeout(() => {
      setIsTyping(true);
    }, 600);

    setTimeout(() => {
      setIsTyping(false);
      ChatStorageService.addMessage(roomId, replyText, false, replySender);
      setMessages(ChatStorageService.getMessages());
    }, 2000);
  };

  // Quick preset template replies
  const quickReplies = [
    'Waalaikumsalam wr wb 🙏',
    'Siap Pak RT! 👍',
    'Hadir kerja bakti! 🧹',
    'Terima kasih banyak infonya 🙏',
    'Iuran RT sudah ditransfer via QRIS 💳',
    'Mohon izin tanya jadwal ronda malam 🌙',
  ];

  // Quick emojis
  const quickEmojis = ['😊', '👍', '🙏', '❤️', '👏', '🤝', '☕', '📢', '🏠', '✨', '🔥', '✅'];

  // Handle attachments
  const handleSendAttachment = (type: 'image' | 'file' | 'location' | 'announcement', title: string, text: string) => {
    ChatStorageService.addMessage(activeRoomId, text, true, 'Saya', {
      type,
      title,
    });
    setMessages(ChatStorageService.getMessages());
    setShowAttachmentMenu(false);
    if (onShowNotification) {
      onShowNotification(`Lampiran "${title}" terkirim`);
    }
  };

  // Clear messages
  const handleClearChat = () => {
    if (confirm('Bersihkan seluruh pesan pada ruang obrolan ini?')) {
      ChatStorageService.clearRoomMessages(activeRoomId);
      setMessages(ChatStorageService.getMessages());
      setShowOptionsMenu(false);
      if (onShowNotification) {
        onShowNotification('Riwayat pesan dibersihkan.');
      }
    }
  };

  // Format call duration MM:SS
  const formatCallTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  // Filter messages by room and search query
  const roomMessages = messages.filter((m) => m.roomId === activeRoomId);
  const displayMessages = searchQuery.trim()
    ? roomMessages.filter((m) => m.text.toLowerCase().includes(searchQuery.toLowerCase()) || m.senderName.toLowerCase().includes(searchQuery.toLowerCase()))
    : roomMessages;

  return (
    <div className="h-full flex flex-col bg-slate-900 text-slate-100 select-none overflow-hidden relative font-sans">
      
      {/* ======================================================== */}
      {/* 1. WHATSAPP HEADER (Matching user spec exactly)          */}
      {/* ======================================================== */}
      <header className="bg-slate-800 px-3 py-2.5 flex items-center justify-between border-b border-slate-700 shrink-0 z-20 shadow-md">
        <div className="flex items-center space-x-2.5 flex-1 min-w-0">
          {/* Back button to Kasir or previous screen */}
          <button
            onClick={onBackToKasir}
            title="Kembali ke KasirQu"
            className="p-1 -ml-1 text-slate-300 hover:text-white rounded-full hover:bg-slate-700 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Avatar with Green Online Badge Indicator */}
          <div
            onClick={() => setShowGroupInfo(true)}
            className="relative cursor-pointer shrink-0 group"
            title="Lihat info grup"
          >
            <div
              className={`w-10 h-10 rounded-full ${
                activeRoom.avatarColor || 'bg-emerald-600'
              } flex items-center justify-center font-bold text-white text-lg shadow-md transition group-hover:scale-105`}
            >
              {activeRoom.avatarLetter}
            </div>
            {/* Indikator Online Hijau */}
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-800 rounded-full animate-pulse"></span>
          </div>

          {/* Group / Contact Title & Subtitle */}
          <div
            onClick={() => setShowGroupInfo(true)}
            className="flex-1 min-w-0 cursor-pointer"
          >
            <h2 className="font-bold text-sm sm:text-base text-white truncate tracking-tight flex items-center gap-1.5">
              {activeRoom.name}
            </h2>
            <p className="text-[11px] text-emerald-400 truncate flex items-center gap-1">
              {isTyping ? (
                <span className="text-emerald-300 font-semibold animate-pulse">
                  sedang mengetik...
                </span>
              ) : (
                activeRoom.subtitle
              )}
            </p>
          </div>
        </div>

        {/* Action Buttons: Phone & Vertical Ellipsis */}
        <div className="flex items-center space-x-2 sm:space-x-3 text-slate-300 shrink-0">
          <button
            onClick={() => setIsSearching(!isSearching)}
            title="Cari pesan"
            className={`p-2 rounded-full hover:text-emerald-400 hover:bg-slate-700 transition ${
              isSearching ? 'text-emerald-400 bg-slate-700' : ''
            }`}
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowCallModal(true)}
            title="Panggilan Suara WargaQu"
            className="p-2 rounded-full hover:text-emerald-400 hover:bg-slate-700 transition"
          >
            <Phone className="w-4 h-4 text-emerald-400" />
          </button>

          <button
            onClick={() => setShowOptionsMenu(!showOptionsMenu)}
            title="Menu opsi"
            className="p-2 rounded-full hover:text-emerald-400 hover:bg-slate-700 transition"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Optional In-Chat Search Bar */}
      {isSearching && (
        <div className="bg-slate-800 px-3 py-2 border-b border-slate-700 flex items-center gap-2 animate-in slide-in-from-top duration-200">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kata di ruang obrolan..."
            autoFocus
            className="flex-1 bg-slate-900 text-xs text-slate-100 placeholder-slate-400 px-3 py-1.5 rounded-full border border-slate-700 focus:outline-none focus:border-emerald-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-slate-400 hover:text-white text-xs px-1"
            >
              ✕
            </button>
          )}
          <button
            onClick={() => {
              setIsSearching(false);
              setSearchQuery('');
            }}
            className="text-emerald-400 text-xs font-semibold px-2"
          >
            Batal
          </button>
        </div>
      )}

      {/* Room / Channel Selector Pill Bar */}
      <div className="bg-slate-950 px-3 py-1.5 border-b border-slate-800 flex items-center space-x-1.5 overflow-x-auto no-scrollbar shrink-0">
        {rooms.map((room) => {
          const isSelected = room.id === activeRoomId;
          return (
            <button
              key={room.id}
              onClick={() => {
                setActiveRoomId(room.id);
                setSearchQuery('');
              }}
              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition flex items-center space-x-1.5 shrink-0 ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isSelected ? 'bg-white' : 'bg-emerald-400'
                }`}
              />
              <span>{room.name.split('/')[0].trim()}</span>
            </button>
          );
        })}
      </div>

      {/* Dropdown Options Menu */}
      {showOptionsMenu && (
        <div
          className="absolute top-14 right-3 z-30 w-52 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl py-1 text-xs text-slate-200 animate-in fade-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              setShowOptionsMenu(false);
              setShowGroupInfo(true);
            }}
            className="w-full px-4 py-2.5 text-left hover:bg-slate-700 flex items-center gap-2"
          >
            <Info className="w-4 h-4 text-emerald-400" />
            <span>Info Grup & Anggota</span>
          </button>

          <button
            onClick={() => {
              setShowOptionsMenu(false);
              if (onOpenSwitchModul) onOpenSwitchModul();
            }}
            className="w-full px-4 py-2.5 text-left hover:bg-slate-700 flex items-center gap-2"
          >
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Ganti Modul Aplikasi</span>
          </button>

          <button
            onClick={() => {
              setShowOptionsMenu(false);
              setIsSearching(true);
            }}
            className="w-full px-4 py-2.5 text-left hover:bg-slate-700 flex items-center gap-2"
          >
            <Search className="w-4 h-4 text-slate-400" />
            <span>Cari Pesan</span>
          </button>

          <div className="h-px bg-slate-700 my-1" />

          <button
            onClick={handleClearChat}
            className="w-full px-4 py-2.5 text-left hover:bg-red-950/40 text-red-400 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
            <span>Bersihkan Riwayat Pesan</span>
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. RUANG PERCAKAPAN (Chat Window ala WA)                 */}
      {/* ======================================================== */}
      <div
        id="chat-container"
        ref={chatContainerRef}
        onClick={() => {
          setShowOptionsMenu(false);
          setShowEmojiPicker(false);
          setShowAttachmentMenu(false);
        }}
        className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3 bg-slate-950/60 flex flex-col"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.03) 0%, transparent 80%)',
        }}
      >
        {/* Encrypted Notice Banner */}
        <div className="mx-auto max-w-[85%] bg-slate-800/80 border border-slate-700/60 rounded-xl px-3 py-1.5 text-center shadow-xs">
          <p className="text-[10px] text-amber-300/90 font-medium leading-relaxed flex items-center justify-center gap-1">
            <Shield className="w-3 h-3 text-amber-400 shrink-0 inline" />
            Pesan dan panggilan dienkripsi secara lokal. Aman untuk koordinasi warga.
          </p>
        </div>

        {/* Date Divider Pill */}
        <div className="flex justify-center my-1">
          <span className="bg-slate-800/90 text-slate-300 text-[10px] px-3 py-0.5 rounded-full font-semibold border border-slate-700/80 shadow-xs">
            HARI INI
          </span>
        </div>

        {/* List of Messages */}
        {displayMessages.map((msg) => {
          if (msg.isMe) {
            // Gelembung Chat Keluar (Pesan Saya)
            return (
              <div
                key={msg.id}
                className="self-end bg-emerald-600 text-white px-4 py-2.5 rounded-2xl rounded-tr-none max-w-[82%] text-sm shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-150"
              >
                {/* Optional attachment preview */}
                {msg.attachmentType && (
                  <div className="mb-1.5 p-2 bg-emerald-700/60 rounded-xl border border-emerald-400/30 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-100">
                      {msg.attachmentType === 'image' && <ImageIcon className="w-3.5 h-3.5" />}
                      {msg.attachmentType === 'file' && <FileText className="w-3.5 h-3.5" />}
                      {msg.attachmentType === 'location' && <MapPin className="w-3.5 h-3.5" />}
                      {msg.attachmentType === 'announcement' && <Megaphone className="w-3.5 h-3.5" />}
                      <span>{msg.attachmentTitle || 'Lampiran'}</span>
                    </div>
                  </div>
                )}

                <p className="whitespace-pre-wrap leading-relaxed break-words">{msg.text}</p>
                <span className="block text-[10px] text-emerald-200 text-right mt-1 font-mono tracking-tight">
                  {msg.timestamp} ✓✓
                </span>
              </div>
            );
          } else {
            // Gelembung Chat Masuk
            return (
              <div
                key={msg.id}
                className="self-start bg-slate-800 text-slate-100 px-4 py-2.5 rounded-2xl rounded-tl-none max-w-[82%] text-sm shadow-sm border border-slate-700/50 animate-in fade-in slide-in-from-bottom-2 duration-150"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="font-bold text-xs text-emerald-400 truncate">
                    {msg.senderName}
                  </p>
                  {msg.senderRole && (
                    <span className="text-[9px] font-semibold text-slate-400 bg-slate-900/60 px-1.5 py-0.2 rounded border border-slate-700/60">
                      {msg.senderRole}
                    </span>
                  )}
                </div>

                {/* Optional attachment preview */}
                {msg.attachmentType && (
                  <div className="mb-1.5 p-2 bg-slate-900/60 rounded-xl border border-slate-700 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                      {msg.attachmentType === 'image' && <ImageIcon className="w-3.5 h-3.5" />}
                      {msg.attachmentType === 'file' && <FileText className="w-3.5 h-3.5" />}
                      {msg.attachmentType === 'location' && <MapPin className="w-3.5 h-3.5" />}
                      {msg.attachmentType === 'announcement' && <Megaphone className="w-3.5 h-3.5" />}
                      <span>{msg.attachmentTitle || 'Lampiran'}</span>
                    </div>
                  </div>
                )}

                <p className="whitespace-pre-wrap leading-relaxed break-words">{msg.text}</p>
                <span className="block text-[10px] text-slate-400 text-right mt-1 font-mono tracking-tight">
                  {msg.timestamp}
                </span>
              </div>
            );
          }
        })}

        {/* Typing indicator bubble */}
        {isTyping && (
          <div className="self-start bg-slate-800 text-slate-300 px-4 py-2 rounded-2xl rounded-tl-none text-xs border border-slate-700/50 flex items-center space-x-1.5 animate-pulse">
            <span className="text-emerald-400 font-bold text-xs">Pak RT</span>
            <span>sedang mengetik</span>
            <span className="flex space-x-1 ml-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </span>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 3. ATTACHMENT POPOVER MENU                              */}
      {/* ======================================================== */}
      {showAttachmentMenu && (
        <div className="bg-slate-800 border-t border-slate-700 p-3 grid grid-cols-4 gap-2 animate-in slide-in-from-bottom-3 duration-200 z-20">
          <button
            onClick={() =>
              handleSendAttachment(
                'announcement',
                'Surat Edaran RT 05',
                'Undangan Rapat Evaluasi Bulanan & Laporan Kas RT Hari Sabtu jam 20.00 di Balai Warga.'
              )
            }
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-900 hover:bg-slate-750 border border-slate-700 transition active:scale-95 text-slate-200"
          >
            <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mb-1">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold">Surat RT</span>
          </button>

          <button
            onClick={() =>
              handleSendAttachment(
                'image',
                'Foto Kegiatan Warga',
                'Dokumentasi kerja bakti perbaikan saluran air & pemasangan lampu jalan RT 05.'
              )
            }
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-900 hover:bg-slate-750 border border-slate-700 transition active:scale-95 text-slate-200"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-1">
              <ImageIcon className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold">Galeri Foto</span>
          </button>

          <button
            onClick={() =>
              handleSendAttachment(
                'location',
                'Titik Lokasi Pos Ronda',
                'Pos Ronda Utama Blok A-B RT 05 (Siaga 24 Jam)'
              )
            }
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-900 hover:bg-slate-750 border border-slate-700 transition active:scale-95 text-slate-200"
          >
            <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mb-1">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold">Lokasi Pos</span>
          </button>

          <button
            onClick={() =>
              handleSendAttachment(
                'announcement',
                'Warta PaguyubanQu',
                'Status Kas RT: Rp 14.500.000 | Saldo Aman & Siaga Bencana Lingkungan.'
              )
            }
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-900 hover:bg-slate-750 border border-slate-700 transition active:scale-95 text-slate-200"
          >
            <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mb-1">
              <Megaphone className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold">Warta RT</span>
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. EMOJI & QUICK TEMPLATES BAR                          */}
      {/* ======================================================== */}
      {showEmojiPicker && (
        <div className="bg-slate-800 border-t border-slate-700 p-2.5 animate-in slide-in-from-bottom-2 duration-150 z-20">
          {/* Quick Emoji row */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-700/60 overflow-x-auto no-scrollbar gap-1.5 px-1">
            {quickEmojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => setInputText((prev) => prev + emoji)}
                className="text-xl p-1.5 rounded-lg hover:bg-slate-700 transition active:scale-90"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Quick template chip answers */}
          <div className="pt-2 flex flex-wrap gap-1.5 max-h-24 overflow-y-auto no-scrollbar">
            {quickReplies.map((reply, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(reply)}
                className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-700 text-slate-200 border border-slate-700 transition text-left"
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. AREA INPUT PESAN (Bawah ala WA - User Spec Exact)     */}
      {/* ======================================================== */}
      <footer className="bg-slate-800 p-3 flex items-center space-x-2 border-t border-slate-700 shrink-0 z-20">
        {/* Emoji Button 😊 */}
        <button
          onClick={() => {
            setShowEmojiPicker(!showEmojiPicker);
            setShowAttachmentMenu(false);
          }}
          title="Pilih Emoji"
          className={`p-2 text-xl rounded-full transition active:scale-95 ${
            showEmojiPicker ? 'text-emerald-400 bg-slate-700' : 'text-slate-400 hover:text-emerald-400'
          }`}
        >
          😊
        </button>

        {/* Input Text Field */}
        <input
          ref={inputRef}
          type="text"
          id="input-pesan"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="Ketik pesan..."
          className="flex-1 bg-slate-900 text-slate-100 placeholder-slate-400 text-sm px-4 py-2.5 rounded-full border border-slate-700 focus:outline-none focus:border-emerald-500 transition"
        />

        {/* Attachment Button 📎 */}
        <button
          onClick={() => {
            setShowAttachmentMenu(!showAttachmentMenu);
            setShowEmojiPicker(false);
          }}
          title="Lampirkan Dokumen / Berkas"
          className={`p-2 text-xl rounded-full transition active:scale-95 ${
            showAttachmentMenu ? 'text-emerald-400 bg-slate-700' : 'text-slate-400 hover:text-emerald-400'
          }`}
        >
          📎
        </button>

        {/* Send Button ➤ */}
        <button
          id="btn-kirim"
          onClick={() => handleSendMessage()}
          title="Kirim pesan"
          disabled={!inputText.trim()}
          className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition active:scale-95 shrink-0 ${
            inputText.trim()
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-emerald-900/40'
              : 'bg-slate-700 text-slate-400 cursor-default'
          }`}
        >
          <span className="font-bold text-base leading-none">➤</span>
        </button>
      </footer>

      {/* ======================================================== */}
      {/* 6. GROUP INFO MODAL                                      */}
      {/* ======================================================== */}
      {showGroupInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="relative bg-emerald-700 p-6 flex flex-col items-center text-center">
              <button
                onClick={() => setShowGroupInfo(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full bg-black/20"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-20 h-20 rounded-full bg-emerald-600 border-4 border-slate-900 flex items-center justify-center text-3xl font-black text-white shadow-xl mb-3">
                {activeRoom.avatarLetter}
              </div>
              <h3 className="text-lg font-black text-white">{activeRoom.name}</h3>
              <p className="text-xs text-emerald-200 mt-1">{activeRoom.subtitle}</p>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto text-xs text-slate-300">
              <div className="bg-slate-800 p-3 rounded-2xl border border-slate-700">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                  Deskripsi Saluran
                </span>
                <p className="text-slate-200 leading-relaxed">
                  {activeRoom.description || 'Grup koordinasi warga RT 05 RW 08.'}
                </p>
              </div>

              <div className="bg-slate-800 p-3 rounded-2xl border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                    Daftar Pengurus & Kontak
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {activeRoom.membersCount || 48} Peserta
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center text-xs">
                        B
                      </div>
                      <div>
                        <p className="font-bold text-slate-100">H. Bambang Sutrisno</p>
                        <p className="text-[10px] text-slate-400">Ketua RT 05</p>
                      </div>
                    </div>
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                      Admin
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                        H
                      </div>
                      <div>
                        <p className="font-bold text-slate-100">Drs. Hendro Wibowo</p>
                        <p className="text-[10px] text-slate-400">Sekretaris RT</p>
                      </div>
                    </div>
                    <span className="text-[9px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full font-bold">
                      Pengurus
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-xs">
                        J
                      </div>
                      <div>
                        <p className="font-bold text-slate-100">Pak Joko</p>
                        <p className="text-[10px] text-slate-400">Satpam Lingkungan</p>
                      </div>
                    </div>
                    <span className="text-[9px] bg-red-500/20 text-red-300 border border-red-500/40 px-2 py-0.5 rounded-full font-bold">
                      Siaga
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowGroupInfo(false);
                  setShowCallModal(true);
                }}
                className="w-full py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition"
              >
                <Phone className="w-4 h-4" />
                <span>Mulai Panggilan Audio Grup</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. WHATSAPP AUDIO CALL SIMULATION MODAL                 */}
      {/* ======================================================== */}
      {showCallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm flex flex-col items-center justify-between h-[520px] p-6 text-center">
            
            {/* Top Call Info */}
            <div className="flex flex-col items-center">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                <Shield className="w-3.5 h-3.5" />
                PANGGILAN SUARA WARGAQU
              </span>
              <h3 className="text-2xl font-black text-white tracking-tight">{activeRoom.name}</h3>
              <p className="text-sm text-slate-300 font-mono mt-1">
                {isCallingConnected ? (
                  <span className="text-emerald-400 font-bold">{formatCallTime(callDuration)}</span>
                ) : (
                  <span className="animate-pulse">Menghubungkan...</span>
                )}
              </p>
            </div>

            {/* Pulsing Avatar */}
            <div className="relative my-8">
              <div className="w-32 h-32 rounded-full bg-emerald-600 border-4 border-slate-800 flex items-center justify-center text-5xl font-black text-white shadow-2xl z-10 relative">
                {activeRoom.avatarLetter}
              </div>
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
            </div>

            {/* Bottom Call Controls */}
            <div className="w-full">
              <div className="flex items-center justify-center space-x-6 mb-8">
                {/* Mute button */}
                <button
                  onClick={() => setIsCallMuted(!isCallMuted)}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition ${
                    isCallMuted
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  {isCallMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>

                {/* Speaker button */}
                <button
                  onClick={() => {
                    if (onShowNotification) onShowNotification('Speaker aktif');
                  }}
                  className="w-14 h-14 rounded-full bg-slate-800 text-slate-200 hover:bg-slate-700 flex items-center justify-center transition"
                >
                  <Volume2 className="w-6 h-6" />
                </button>
              </div>

              {/* End Call Button */}
              <button
                onClick={() => setShowCallModal(false)}
                className="w-full py-3.5 rounded-full bg-red-600 hover:bg-red-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-900/50 transition active:scale-95"
              >
                <PhoneOff className="w-5 h-5" />
                <span>AKHIRI PANGGILAN</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
