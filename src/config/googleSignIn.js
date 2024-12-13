import { GoogleSignin } from '@react-native-google-signin/google-signin';

export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId: 'YOUR_WEB_CLIENT_ID', // ottieni questo dalla console di Firebase
    offlineAccess: true,
  });
};
