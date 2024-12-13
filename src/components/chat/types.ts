export interface ChatPreview {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  otherParticipant: string;
  pinned: boolean;
  isGroup: boolean;
  isService: boolean;
  isArchived: boolean;
  name?: string;
  photoURL?: string;
  status?: string;
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: Date;
  read: boolean;
  type: 'text' | 'image' | 'file' | 'audio';
  metadata?: {
    mimeType?: string;
    fileSize?: number;
    thumbnail?: string;
    duration?: number;
  };
}

export interface ChatInfo {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: { [key: string]: number };
  isGroup: boolean;
  isService: boolean;
  isArchived: boolean;
  name?: string;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
  pinnedBy: string[];
  admins?: string[];
  description?: string;
  metadata?: {
    [key: string]: any;
  };
}
