export interface User {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  createdAt: number;
  lastLoginAt: number;
  isAnonymous?: boolean;
  status?: 'online' | 'offline';
  lastSeen?: Date;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}