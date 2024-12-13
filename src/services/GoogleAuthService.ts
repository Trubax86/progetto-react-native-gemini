import { Platform } from 'react-native';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../config/firebase';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';

class GoogleAuthService {
  static async signIn() {
    if (Platform.OS === 'web') {
      return await this.webSignIn();
    } else {
      return await this.nativeSignIn();
    }
  }

  private static async webSignIn() {
    try {
      const provider = new GoogleAuthProvider();
      return await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Web Google Sign In Error:', error);
      throw new Error(error.message || 'Errore durante il login con Google');
    }
  }

  private static async nativeSignIn() {
    try {
      await GoogleSignin.hasPlayServices();
      const { idToken } = await GoogleSignin.signIn();
      const credential = GoogleAuthProvider.credential(idToken);
      return await auth.signInWithCredential(credential);
    } catch (error: any) {
      console.error('Native Google Sign In Error:', error);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        throw new Error('Login annullato');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        throw new Error('Login già in corso');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error('Google Play Services non disponibile');
      }
      throw error;
    }
  }
}

export default GoogleAuthService;
