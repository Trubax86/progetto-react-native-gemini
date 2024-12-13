export interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  userId?: string;
  photoURL?: string;
  status?: 'online' | 'offline';
  lastSeen?: Date;
  isRegistered: boolean;
  isBlocked: boolean;
}
