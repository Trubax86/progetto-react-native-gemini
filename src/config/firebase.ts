import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  initializeAuth,
  getReactNativePersistence,
  GoogleAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
 import { FIREBASE_API_KEY, FIREBASE_AUTH_DOMAIN, FIREBASE_PROJECT_ID, FIREBASE_STORAGE_BUCKET, FIREBASE_MESSAGING_SENDER_ID, FIREBASE_APP_ID, FIREBASE_MEASUREMENT_ID, FIREBASE_DATABASE_URL, GOOGLE_WEB_CLIENT_ID, GOOGLE_ANDROID_CLIENT_ID, GOOGLE_IOS_CLIENT_ID } from '@env';


const firebaseConfig = {
    apiKey: FIREBASE_API_KEY,
    authDomain: FIREBASE_AUTH_DOMAIN,
    projectId: FIREBASE_PROJECT_ID,
    storageBucket: FIREBASE_STORAGE_BUCKET,
    messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
    appId: FIREBASE_APP_ID,
    measurementId: FIREBASE_MEASUREMENT_ID,
    databaseURL: FIREBASE_DATABASE_URL
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth based on platform
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
  webClientId: GOOGLE_WEB_CLIENT_ID,
  offlineAccess: true,
  androidClientId: GOOGLE_ANDROID_CLIENT_ID,
  iosClientId: GOOGLE_IOS_CLIENT_ID,
  iosURLScheme: 'com.googleusercontent.apps.693837443791-u5rkn64bd9mebp54h936aigr3b9nsb9v'
});

// Helper function for Google Sign In
export const signInWithGoogle = async () => {
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
      console.error('Google Sign In Error:', error);
      throw error;
    }
  }
};

export { app, auth, db, storage };