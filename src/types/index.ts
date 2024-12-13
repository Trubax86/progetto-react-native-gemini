export interface User {
  id: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  bio: string;
  createdAt: number;
  lastSeen: number;
}

export interface Message {
  id: string;
  text: string;
  createdAt: number;
  userId: string;
  chatId: string;
  read: boolean;
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: Message;
  createdAt: number;
  updatedAt: number;
}