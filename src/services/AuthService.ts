import { Platform } from 'react-native';
import { 
  auth, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut as firebaseSignOut,
  updateProfile
} from '../config/firebase';

class AuthService {
  private static instance: AuthService;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async registerWithEmailAndPassword(email: string, password: string, displayName?: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (displayName) {
        await updateProfile(user, { 
          displayName,
          photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`
        });
      }

      return userCredential;
    } catch (error: any) {
      console.error('Registration Error:', error);
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          throw new Error('Email già utilizzata');
        case 'auth/invalid-email':
          throw new Error('Email non valida');
        case 'auth/weak-password':
          throw new Error('Password troppo debole');
        default:
          throw new Error('Errore durante la registrazione');
      }
    }
  }

  async signInWithEmailAndPassword(email: string, password: string) {
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('Login Error:', error);
      
      switch (error.code) {
        case 'auth/invalid-email':
          throw new Error('Email non valida');
        case 'auth/user-disabled':
          throw new Error('Account disabilitato');
        case 'auth/user-not-found':
          throw new Error('Nessun account trovato con questa email');
        case 'auth/wrong-password':
          throw new Error('Password incorretta');
        default:
          throw new Error('Errore durante il login');
      }
    }
  }

  async signInAnonymously() {
    try {
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;

      const guestNumber = Math.floor(1000 + Math.random() * 9000);
      const displayName = `Guest${guestNumber}`;
      const photoURL = `https://ui-avatars.com/api/?name=G${guestNumber}&background=random`;

      await updateProfile(user, { 
        displayName, 
        photoURL 
      });

      return userCredential;
    } catch (error: any) {
      console.error('Anonymous Sign In Error:', error);
      throw new Error(error.message || 'Errore durante il login anonimo');
    }
  }

  async signOut() {
    try {
      await firebaseSignOut(auth);
    } catch (error: any) {
      console.error('Sign Out Error:', error);
      throw new Error(error.message || 'Errore durante il logout');
    }
  }
}

export default AuthService;
