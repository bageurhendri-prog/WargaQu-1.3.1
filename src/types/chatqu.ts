export interface ChatMessage {
  id: string;
  roomId: string;
  senderName: string;
  senderRole?: string;
  isMe: boolean;
  text: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
  attachmentType?: 'image' | 'file' | 'location' | 'announcement';
  attachmentUrl?: string;
  attachmentTitle?: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  subtitle: string;
  avatarLetter: string;
  avatarColor?: string;
  isOnline: boolean;
  unreadCount?: number;
  category: 'grup' | 'pribadi' | 'siaga';
  description?: string;
  membersCount?: number;
}
