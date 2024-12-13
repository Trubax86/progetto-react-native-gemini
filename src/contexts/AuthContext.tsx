import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import { User, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, signInWithPhoneNumber, signInAnonymously } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { SessionService } from '../services/SessionService';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  userProfile: UserProfile | null;
  loginAnonymously: () => Promise<void>;
  loginWithPhone: (phoneNumber: string, verifier: any) => Promise<{ verificationId: string }>;
  confirmPhoneCode: (verificationId: string, code: string) => Promise<void>;
  needsSetup: boolean;
  setupType: 'anonymous' | 'email' | 'phone' | null;
}

interface UserProfile {
  username: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  bio?: string;
  isAnonymous?: boolean;
  createdAt: Date;
  status: 'online' | 'offline';
  lastSeen: Date;
  setupCompleted?: boolean;
  expiresAt?: Date;
  loginType?: 'anonymous' | 'email' | 'phone';
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [setupType, setSetupType] = useState<'anonymous' | 'email' | 'phone' | null>(null);
  const sessionService = SessionService.getInstance();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          const profile = await loadUserProfile(user.uid);
          setCurrentUser({ ...user, profile });
          setUserProfile(profile);

          // Determina il tipo di setup necessario
          if (!profile || !profile.setupCompleted) {
            setNeedsSetup(true);
            if (user.isAnonymous) {
              setSetupType('anonymous');
            } else if (user.phoneNumber) {
              setSetupType('phone');
            } else {
              setSetupType('email');
            }
          } else {
            setNeedsSetup(false);
            setSetupType(null);
          }
        } else {
          setCurrentUser(null);
          setUserProfile(null);
          setNeedsSetup(false);
          setSetupType(null);
        }
      } catch (error) {
        console.error("Auth state change error:", error);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error loading user profile:', error);
      return null;
    }
  };

  const loginAnonymously = async () => {
    try {
      const result = await signInAnonymously(auth);
      const userProfile: UserProfile = {
        username: `Guest${Math.floor(Math.random() * 10000)}`,
        createdAt: new Date(),
        status: 'online',
        lastSeen: new Date(),
        setupCompleted: false,
        loginType: 'anonymous'
      };
      await setDoc(doc(db, 'users', result.user.uid), userProfile);
      setUserProfile(userProfile);
      setNeedsSetup(true);
      setSetupType('anonymous');
    } catch (error) {
      throw error;
    }
  };

  const loginWithPhone = async (phoneNumber: string, verifier: any) => {
    try {
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, verifier);
      return { verificationId: confirmationResult.verificationId };
    } catch (error) {
      throw error;
    }
  };

  const confirmPhoneCode = async (verificationId: string, code: string) => {
    // Implementare la conferma del codice di verifica
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      const profile = await loadUserProfile(user.uid);
      
      // Aggiorna lastSeen
      await setDoc(doc(db, 'users', user.uid), {
        lastSeen: serverTimestamp(),
        status: 'online'
      }, { merge: true });

      if (profile) {
        setUserProfile(profile);
        setNeedsSetup(!profile.setupCompleted);
        setSetupType(profile.setupCompleted ? null : 'email');
      }
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      const userProfile: UserProfile = {
        username,
        email,
        displayName: username,
        photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`,
        bio: '',
        isAnonymous: false,
        createdAt: new Date(),
        status: 'online',
        lastSeen: new Date(),
        setupCompleted: false,
        loginType: 'email'
      };

      await setDoc(doc(db, 'users', user.uid), {
        ...userProfile,
        createdAt: serverTimestamp(),
        lastSeen: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setUserProfile(userProfile);
      setNeedsSetup(true);
      setSetupType('email');
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await sessionService.cleanup();
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!currentUser) return;

    try {
      await setDoc(doc(db, 'users', currentUser.uid), data, { merge: true });
      setUserProfile(prev => prev ? { ...prev, ...data } : null);
    } catch (error) {
      throw error;
    }
  };

  const value = {
    currentUser,
    loading,
    signIn,
    signUp,
    logout,
    updateUserProfile,
    userProfile,
    loginAnonymously,
    loginWithPhone,
    confirmPhoneCode,
    needsSetup,
    setupType
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
