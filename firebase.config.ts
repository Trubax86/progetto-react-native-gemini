import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  initializeAuth,
  getReactNativePersistence,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
  OAuthProvider
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';

const firebaseConfig = {
  apiKey: "AIzaSyD38C-wyEziutHYrQG4rFatW-9Z5In37Ss",
  authDomain: "criptax-8d87d.firebaseapp.com",
  projectId: "criptax-8d87d",
  storageBucket: "criptax-8d87d.appspot.com",
  messagingSenderId: "693837443791",
  appId: "1:693837443791:web:c3d93b462cc82458e6bdba",
  measurementId: "G-YNX6MZDC7K",
  databaseURL: "https://criptax-8d87d-default-rtdb.europe-west1.firebasedatabase.app/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
let auth;
if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

// Initialize Firestore
const db = getFirestore(app);

// Initialize Storage
const storage = getStorage(app);

// Configure Google Sign In
GoogleSignin.configure({
  webClientId: '693837443791-qm9f7q7g4v7v7v7v7v7v7v7v7v7v7v7.apps.googleusercontent.com', // Ottieni questo dall'console di Google Cloud
  offlineAccess: true,
});

// Configure Google provider for web
const provider = new GoogleAuthProvider();
provider.addScope('profile');
provider.addScope('email');
provider.setCustomParameters({
  prompt: 'select_account'
});

// Helper function for Google Sign In
export const signInWithGoogle = async () => {
  if (Platform.OS === 'web') {
    return await signInWithPopup(auth, provider);
  } else {
    try {
      await GoogleSignin.hasPlayServices();
      const { idToken } = await GoogleSignin.signIn();
      const credential = GoogleAuthProvider.credential(idToken);
      return await signInWithCredential(auth, credential);
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        throw new Error('Login annullato');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        throw new Error('Login già in corso');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error('Google Play Services non disponibile');
      } else {
        throw error;
      }
    }
  }
};

export { app, auth, db, storage, provider };
