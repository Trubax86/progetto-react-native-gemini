export interface UserSession {
  id: string;
  userId: string;
  deviceId: string;
  platform: 'ios' | 'android' | 'web';
  deviceInfo: {
    model?: string;
    os?: string;
    version?: string;
  };
  lastActive: string;
  createdAt: string;
  isActive: boolean;
  ipAddress?: string;
  fcmToken?: string;
  biometricEnabled?: boolean;
  autoLockTimeout?: number; // in minutes
  notificationsEnabled?: boolean;
}

export interface UserSettings {
  id: string;
  userId: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  email?: string;
  phoneNumber?: string;
  language: string;
  theme: 'light' | 'dark' | 'system';
  privacy: {
    profileVisibility: 'public' | 'contacts' | 'private';
    lastSeen: 'everyone' | 'contacts' | 'nobody';
    readReceipts: boolean;
    typingIndicator: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    biometricEnabled: boolean;
    autoLockTimeout: number; // in minutes
    backupEnabled: boolean;
    encryptionEnabled: boolean;
  };
  notifications: {
    enabled: boolean;
    sound: boolean;
    vibration: boolean;
    messagePreview: boolean;
    calls: boolean;
    groups: boolean;
  };
  updatedAt: string;
}
