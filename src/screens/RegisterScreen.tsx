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
import { createUserWithEmailAndPassword, updateProfile, getDoc } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { colors } from '../theme/colors';
import { MaterialIcons } from '@expo/vector-icons';
import { useSetupCheck } from '../hooks/useSetupCheck';
import { SessionService } from '../services/SessionService';

export const RegisterScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const { loading: checkingSetup } = useSetupCheck();

  const handleRegister = async () => {
    if (loading) return;
    
    // Validazioni
    if (!email || !password || !confirmPassword || !username) {
      Alert.alert('Errore', 'Compila tutti i campi');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Errore', 'Le password non coincidono');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Errore', 'La password deve essere di almeno 6 caratteri');
      return;
    }

    try {
      setLoading(true);
      
      // 1. Crea l'utente Firebase
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      const photoURL = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`;
      
      // 2. Aggiorna il profilo Firebase
      await updateProfile(user, {
        displayName: username,
        photoURL
      });
      
      // 3. Crea il documento utente
      const userRef = doc(db, 'users', user.uid);
      const userData = {
        id: user.uid,
        email: user.email,
        displayName: username,
        photoURL,
        bio: '',
        isAnonymous: false,
        createdAt: serverTimestamp(),
        lastSeen: serverTimestamp(),
        status: 'online',
        updatedAt: serverTimestamp(),
        setupCompleted: false,
        termsAccepted: false
      };

      await setDoc(userRef, userData);

      // 4. Verifica che il documento sia stato creato
      const docCheck = await getDoc(userRef);
      if (!docCheck.exists()) {
        throw new Error('Errore nella creazione del documento utente');
      }

      // 5. Registra la sessione
      await SessionService.getInstance().registerSession(user.uid);

      console.log('Registrazione completata con successo');
      
    } catch (error: any) {
      let errorMessage = 'Si è verificato un errore durante la registrazione';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Questa email è già registrata';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email non valida';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Registrazione non consentita';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password troppo debole';
          break;
      }
      
      Alert.alert('Errore', errorMessage);
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
    <ImageBackground 
      source={require('./../../assets/images/background.jpg')} 
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.overlay}>
            <Image 
              source={require('./../../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>CriptaX Social World</Text>
            <Text style={styles.subtitle}>Crea il tuo account protetto</Text>
            
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <MaterialIcons name="person" size={24} color={colors.text.secondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Username"
                  placeholderTextColor={colors.text.secondary}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </View>

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

              <View style={styles.inputContainer}>
                <MaterialIcons name="lock" size={24} color={colors.text.secondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Conferma Password"
                  placeholderTextColor={colors.text.secondary}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity 
                style={[styles.button, styles.registerButton]} 
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.text.primary} />
                ) : (
                  <Text style={styles.buttonText}>Registrati</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.linkButton}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.linkText}>Hai già un account? Accedi</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
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
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#000000',
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
  registerButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
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