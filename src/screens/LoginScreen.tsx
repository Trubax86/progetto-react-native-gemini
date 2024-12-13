import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ImageBackground, 
  Image, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  Alert,
  ActivityIndicator 
} from 'react-native';
import { signInWithEmailAndPassword, signInAnonymously, signInWithGoogle, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { colors } from '../theme/colors';
import { MaterialIcons } from '@expo/vector-icons';
import { useSetupCheck } from '../hooks/useSetupCheck';
import { SessionService } from '../services/SessionService';

export const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { loading: checkingSetup } = useSetupCheck();

  const handleLogin = async () => {
    if (loading || !email || !password) return;
    
    try {
      setLoading(true);
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      
      // Registra la sessione dopo il login
      await SessionService.getInstance().registerSession(user.uid);
    } catch (error: any) {
      let errorMessage = 'Si è verificato un errore durante il login';
      
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Email non valida';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Questo account è stato disabilitato';
          break;
        case 'auth/user-not-found':
          errorMessage = 'Nessun account trovato con questa email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Password non corretta';
          break;
      }
      
      Alert.alert('Errore', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (loading) return;

    try {
      setLoading(true);
      const result = await signInWithGoogle();
      
      // Registra la sessione dopo il login con Google
      if (result.user) {
        await SessionService.getInstance().registerSession(result.user.uid);
      }
    } catch (error: any) {
      Alert.alert('Errore', error.message || 'Si è verificato un errore durante il login con Google');
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymousLogin = async () => {
    if (loading) return;

    try {
      setLoading(true);
      const { user } = await signInAnonymously(auth);
      
      const guestNumber = Math.floor(1000 + Math.random() * 9000);
      const displayName = `Guest${guestNumber}`;
      const photoURL = `https://ui-avatars.com/api/?name=G${guestNumber}&background=random`;
      
      await updateProfile(user, {
        displayName,
        photoURL
      });
      
      // Crea il documento utente
      await setDoc(doc(db, 'users', user.uid), {
        id: user.uid,
        displayName,
        photoURL,
        bio: '',
        isAnonymous: true,
        createdAt: serverTimestamp(),
        lastSeen: serverTimestamp(),
        status: 'online',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 ore
        updatedAt: serverTimestamp(),
        setupCompleted: false,
        termsAccepted: false
      });

      // Registra la sessione dopo il login anonimo
      await SessionService.getInstance().registerSession(user.uid);

    } catch (error: any) {
      Alert.alert('Errore', error.message || 'Si è verificato un errore durante il login anonimo');
    } finally {
      setLoading(false);
    }
  };

  if (checkingSetup) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.overlay}>
          <Image 
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>CriptaX Social World</Text>
          <Text style={styles.subtitle}>Le tue chiamate e messaggi sono protetti</Text>
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <MaterialIcons name="email" size={24} color={colors.text.secondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={colors.text.secondary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputContainer}>
              <MaterialIcons name="lock" size={24} color={colors.text.secondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={colors.text.secondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity 
              style={[styles.button, styles.loginButton]} 
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.text.primary} />
              ) : (
                <Text style={styles.buttonText}>Accedi</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.googleButton]} 
              onPress={handleGoogleLogin}
              disabled={loading}
            >
              <Image 
                source={require('../../assets/google.png')} 
                style={styles.googleIcon}
              />
              <Text style={styles.buttonText}>Accedi con Google</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.anonymousButton]} 
              onPress={handleAnonymousLogin}
              disabled={loading}
            >
              <MaterialIcons name="person-outline" size={24} color={colors.text.primary} style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Accedi come Ospite</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.linkButton}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.linkText}>Non hai un account? Registrati</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#000000',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#000000',
  },
  title: {
    fontSize: 28,
    color: colors.text.primary,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
  logo: {
    width: '80%',
    height: 100,
    alignSelf: 'center',
    marginBottom: 20,
  },
  form: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
    width: '100%',
    height: 55,
  },
  inputIcon: {
    marginRight: 12,
    opacity: 0.7,
  },
  input: {
    flex: 1,
    height: 55,
    color: colors.text.primary,
    fontSize: 16,
    backgroundColor: 'transparent',
  },
  button: {
    width: '100%',
    maxWidth: 320,
    height: 55,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  loginButton: {
    backgroundColor: '#007AFF',
  },
  googleButton: {
    backgroundColor: '#4285F4',
  },
  anonymousButton: {
    backgroundColor: colors.background.tertiary,
  },
  buttonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 12,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  linkButton: {
    marginTop: 20,
    padding: 10,
  },
  linkText: {
    color: colors.text.primary,
    fontSize: 15,
    opacity: 0.9,
  },
});