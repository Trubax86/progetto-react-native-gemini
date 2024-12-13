import { db, auth } from '../config/firebase';
import { doc, setDoc, getDoc, serverTimestamp, collection, query, where, getDocs, deleteDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { v4 as uuidv4 } from 'uuid';
import NetInfo from '@react-native-community/netinfo';

interface DeviceInfo {
  platform: string;
  deviceName: string;
  os: string;
  deviceId: string;
  brand?: string;
  model?: string;
  fingerprint?: string;
}

interface Session {
  sessionId: string;
  deviceInfo: DeviceInfo;
  lastActive: Date;
  isCurrentSession: boolean;
  createdAt: Date;
  isActive: boolean;
}

export class SessionService {
  private static instance: SessionService;
  private currentSessionId: string | null = null;
  private userId: string | null = null;
  private lastActiveInterval: NodeJS.Timeout | null = null;
  private unsubscribe: (() => void) | null = null;
  private sessionListeners: Map<string, () => void> = new Map();
  private isMonitoringActive: boolean = false;

  private constructor() {
    // Inizializza il monitoraggio della connettività
    this.setupConnectivityMonitoring();
  }

  static getInstance(): SessionService {
    if (!SessionService.instance) {
      SessionService.instance = new SessionService();
    }
    return SessionService.instance;
  }

  private setupConnectivityMonitoring() {
    NetInfo.addEventListener(state => {
      if (state.isConnected && this.userId && !this.isMonitoringActive) {
        this.startSessionMonitoring();
      }
    });
  }

  private async getDeviceInfo(): Promise<DeviceInfo> {
    try {
      let deviceInfo: DeviceInfo = {
        platform: Platform.OS,
        deviceName: 'Web Browser',
        os: Platform.OS === 'web' ? navigator.userAgent : Platform.Version.toString(),
        deviceId: uuidv4()
      };

      if (Platform.OS !== 'web') {
        try {
          const [deviceName, brand, model] = await Promise.all([
            Device.getDeviceName(),
            Device.getBrand(),
            Device.getModelName()
          ]);

          deviceInfo = {
            ...deviceInfo,
            deviceName: deviceName || deviceInfo.deviceName,
            brand: brand || undefined,
            model: model || undefined,
          };
        } catch (error) {
          console.warn('Could not get detailed device info:', error);
        }
      }

      return deviceInfo;
    } catch (error) {
      console.error('Error getting device info:', error);
      return {
        platform: Platform.OS,
        deviceName: 'Unknown Device',
        os: Platform.OS === 'web' ? 'Web' : Platform.Version.toString(),
        deviceId: uuidv4()
      };
    }
  }

  async registerSession(userId: string): Promise<void> {
    try {
      if (!userId || !auth.currentUser) {
        console.warn('registerSession: Utente non autenticato');
        return;
      }

      // Genera un nuovo ID sessione se non esiste
      if (!this.currentSessionId) {
        this.currentSessionId = uuidv4();
      }

      // Modifica: usa la sottocollezione sessions dell'utente
      const sessionRef = doc(db, `users/${userId}/sessions`, this.currentSessionId);
      const sessionData = {
        userId,
        deviceInfo: await this.getDeviceInfo(),
        createdAt: serverTimestamp(),
        lastActive: serverTimestamp(),
        status: 'active',
        platform: Platform.OS,
        appVersion: Constants.manifest?.version || 'unknown'
      };

      await setDoc(sessionRef, sessionData, { merge: true });
      await AsyncStorage.setItem('currentSessionId', this.currentSessionId);
      this.userId = userId;
      this.startSessionMonitoring();

    } catch (error) {
      console.error('Errore durante la registrazione della sessione:', error);
      throw error;
    }
  }

  async findExistingSession(userId: string): Promise<boolean> {
    try {
      const currentSessionId = await AsyncStorage.getItem('currentSessionId');
      if (!currentSessionId) return false;

      const sessionRef = doc(db, `users/${userId}/sessions`, currentSessionId);
      const sessionDoc = await getDoc(sessionRef);

      if (sessionDoc.exists()) {
        const data = sessionDoc.data();
        if (data?.isActive) {
          this.currentSessionId = currentSessionId;
          this.userId = userId;
          this.startSessionMonitoring();
          await this.monitorOtherSessions(userId);
          return true;
        }
      }
      
      await AsyncStorage.removeItem('currentSessionId');
      return false;
    } catch (error) {
      console.error('Errore nella verifica della sessione esistente:', error);
      await AsyncStorage.removeItem('currentSessionId');
      return false;
    }
  }

  private async monitorOtherSessions(userId: string) {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }

    const sessionsRef = collection(db, `users/${userId}/sessions`);
    const q = query(sessionsRef, where('isActive', '==', true));

    this.unsubscribe = onSnapshot(q, 
      (snapshot) => {
        snapshot.docChanges().forEach(change => {
          const session = { id: change.doc.id, ...change.doc.data() };
          
          if (change.type === 'added' && session.id !== this.currentSessionId) {
            this.handleNewSession(session);
          }
          
          if (change.type === 'removed' && session.id === this.currentSessionId) {
            this.handleSessionTerminated();
          }
        });
      },
      (error) => {
        console.error('Errore nel monitoraggio delle sessioni:', error);
        if (error.code === 'permission-denied') {
          this.cleanup();
        }
      }
    );
  }

  private async handleNewSession(session: any) {
    // Qui puoi implementare la logica per le notifiche push native
    console.log('Nuova sessione rilevata:', session);
  }

  private async handleSessionTerminated() {
    await this.cleanup();
    // Qui puoi implementare la logica per le notifiche push native
    console.log('Sessione terminata da un altro dispositivo');
  }

  async terminateSession(userId: string, sessionId: string) {
    try {
      const sessionRef = doc(db, `users/${userId}/sessions`, sessionId);
      
      await updateDoc(sessionRef, {
        isActive: false,
        terminatedAt: serverTimestamp()
      });

      await deleteDoc(sessionRef);

      if (sessionId === this.currentSessionId) {
        await this.cleanup();
      }
    } catch (error) {
      console.error('Errore durante la terminazione della sessione:', error);
      throw error;
    }
  }

  private async updateLastActive() {
    if (!this.currentSessionId || !this.userId) return;
    
    try {
      const sessionRef = doc(db, `users/${this.userId}/sessions`, this.currentSessionId);
      await setDoc(sessionRef, {
        lastActive: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('Errore aggiornamento lastActive:', error);
      if (error.code === 'permission-denied') {
        await this.cleanup();
      }
    }
  }

  async cleanup() {
    try {
      this.isMonitoringActive = false;

      if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
      }

      this.sessionListeners.forEach(listener => listener());
      this.sessionListeners.clear();

      if (this.lastActiveInterval) {
        clearInterval(this.lastActiveInterval);
        this.lastActiveInterval = null;
      }
      
      const storedSessionId = await AsyncStorage.getItem('currentSessionId');
      if (storedSessionId && this.userId) {
        const sessionRef = doc(db, `users/${this.userId}/sessions`, storedSessionId);
        try {
          await deleteDoc(sessionRef);
        } catch (error) {
          console.error('Errore durante l\'eliminazione della sessione:', error);
        }
      }
      
      await AsyncStorage.removeItem('currentSessionId');
      this.currentSessionId = null;
      this.userId = null;
    } catch (error) {
      console.error('Errore durante la pulizia della sessione:', error);
    }
  }

  async getSessions(userId: string): Promise<Session[]> {
    try {
      const currentSessionId = await AsyncStorage.getItem('currentSessionId');
      const sessionsRef = collection(db, `users/${userId}/sessions`);
      const snapshot = await getDocs(sessionsRef);
      
      const sessions = snapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            sessionId: doc.id,
            deviceInfo: data.deviceInfo || {
              platform: 'Unknown',
              deviceName: 'Unknown',
              os: 'Unknown',
              deviceId: 'Unknown'
            },
            lastActive: data.lastActive?.toDate() || new Date(),
            isCurrentSession: doc.id === currentSessionId,
            createdAt: data.createdAt?.toDate() || new Date(),
            isActive: data.isActive || false
          };
        })
        .filter(session => session.isActive);

      return sessions.sort((a, b) => b.lastActive.getTime() - a.lastActive.getTime());
    } catch (error) {
      console.error('Errore nel recupero delle sessioni:', error);
      return [];
    }
  }

  async getCurrentSession(): Promise<Session | null> {
    if (!this.currentSessionId || !this.userId) return null;
    
    try {
      const docRef = doc(db, `users/${this.userId}/sessions`, this.currentSessionId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) return null;
      
      const data = docSnap.data();
      return {
        sessionId: docSnap.id,
        deviceInfo: data.deviceInfo,
        lastActive: data.lastActive.toDate(),
        isCurrentSession: true,
        createdAt: data.createdAt.toDate(),
        isActive: data.isActive
      };
    } catch (error) {
      console.error('Errore nel recupero della sessione corrente:', error);
      return null;
    }
  }

  private startSessionMonitoring() {
    if (this.lastActiveInterval) {
      clearInterval(this.lastActiveInterval);
    }

    this.isMonitoringActive = true;
    this.updateLastActive();

    this.lastActiveInterval = setInterval(() => {
      this.updateLastActive();
    }, 60000);
  }
}
