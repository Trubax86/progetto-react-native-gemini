import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  SafeAreaView,
  Switch,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { StepIndicator } from './StepIndicator';
import { setupSteps } from './setupConfig';
import { auth, db } from '../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import * as LocalAuthentication from 'expo-local-authentication';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Updates from 'expo-updates';

export default function SecuritySetup() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [hasBiometrics, setHasBiometrics] = useState(false);
  const [settings, setSettings] = useState({
    useBiometrics: false,
    requireAuth: true,
    autoLock: true,
    lockAfter: 'immediately', // 'immediately', '1min', '5min', '30min'
    twoFactorAuth: false,
    secureBackup: true
  });

  useEffect(() => {
    checkBiometrics();
  }, []);

  const checkBiometrics = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      if (!compatible) return;

      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setHasBiometrics(enrolled);
    } catch (error) {
      console.error('Error checking biometrics:', error);
    }
  };

  const handleNext = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Se l'utente ha attivato l'autenticazione biometrica, verifichiamola
      if (settings.useBiometrics) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Verifica la tua identità',
          disableDeviceFallback: false,
          cancelLabel: 'Annulla'
        });

        if (!result.success) {
          Alert.alert('Errore', 'Non è stato possibile verificare la tua identità');
          return;
        }
      }

      await updateDoc(doc(db, 'users', user.uid), {
        securitySettings: settings,
        setupCompleted: true,
        updatedAt: new Date().toISOString()
      });

      // Effettua il logout e naviga al login
      await auth.signOut();
      
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });

    } catch (error) {
      console.error('Error updating security settings:', error);
      Alert.alert('Errore', 'Non è stato possibile salvare le impostazioni');
    } finally {
      setLoading(false);
    }
  };

  const toggleSetting = (setting: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const setLockAfter = (value: string) => {
    setSettings(prev => ({
      ...prev,
      lockAfter: value
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header con Step Indicator */}
      <View style={styles.header}>
        <StepIndicator 
          currentStep={4}
          steps={setupSteps}
        />
      </View>

      {/* Contenuto scrollabile */}
      <ScrollView 
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContentContainer}
      >
        <Text style={styles.title}>Impostazioni Sicurezza</Text>
        <Text style={styles.subtitle}>
          Configura le impostazioni di sicurezza per proteggere il tuo account
        </Text>

        {/* Opzioni */}
        <View style={styles.optionsContainer}>
          {/* Autenticazione Biometrica */}
          {hasBiometrics && (
            <View style={styles.optionItem}>
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>
                  {Platform.OS === 'ios' ? 'Face ID / Touch ID' : 'Impronta Digitale'}
                </Text>
                <Text style={styles.optionDescription}>
                  Usa l'autenticazione biometrica per accedere all'app
                </Text>
              </View>
              <Switch
                value={settings.useBiometrics}
                onValueChange={() => toggleSetting('useBiometrics')}
                trackColor={{ false: colors.background.secondary, true: colors.success }}
                thumbColor={colors.background.primary}
              />
            </View>
          )}

          {/* Richiedi Autenticazione */}
          <View style={styles.optionItem}>
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>Richiedi Autenticazione</Text>
              <Text style={styles.optionDescription}>
                Richiedi l'autenticazione all'avvio dell'app
              </Text>
            </View>
            <Switch
              value={settings.requireAuth}
              onValueChange={() => toggleSetting('requireAuth')}
              trackColor={{ false: colors.background.secondary, true: colors.success }}
              thumbColor={colors.background.primary}
            />
          </View>

          {/* Blocco Automatico */}
          <View style={styles.optionItem}>
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>Blocco Automatico</Text>
              <Text style={styles.optionDescription}>
                Blocca automaticamente l'app quando in background
              </Text>
            </View>
            <Switch
              value={settings.autoLock}
              onValueChange={() => toggleSetting('autoLock')}
              trackColor={{ false: colors.background.secondary, true: colors.success }}
              thumbColor={colors.background.primary}
            />
          </View>

          {/* Tempo di Blocco */}
          {settings.autoLock && (
            <View style={styles.lockAfterSection}>
              <Text style={styles.sectionTitle}>Tempo di Blocco</Text>
              <View style={styles.lockAfterOptions}>
                <TouchableOpacity 
                  style={[
                    styles.lockAfterOption,
                    settings.lockAfter === 'immediately' && styles.lockAfterOptionSelected
                  ]}
                  onPress={() => setLockAfter('immediately')}
                >
                  <Text style={[
                    styles.lockAfterOptionText,
                    settings.lockAfter === 'immediately' && styles.lockAfterOptionTextSelected
                  ]}>
                    Subito
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[
                    styles.lockAfterOption,
                    settings.lockAfter === '1min' && styles.lockAfterOptionSelected
                  ]}
                  onPress={() => setLockAfter('1min')}
                >
                  <Text style={[
                    styles.lockAfterOptionText,
                    settings.lockAfter === '1min' && styles.lockAfterOptionTextSelected
                  ]}>
                    1 minuto
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[
                    styles.lockAfterOption,
                    settings.lockAfter === '5min' && styles.lockAfterOptionSelected
                  ]}
                  onPress={() => setLockAfter('5min')}
                >
                  <Text style={[
                    styles.lockAfterOptionText,
                    settings.lockAfter === '5min' && styles.lockAfterOptionTextSelected
                  ]}>
                    5 minuti
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[
                    styles.lockAfterOption,
                    settings.lockAfter === '30min' && styles.lockAfterOptionSelected
                  ]}
                  onPress={() => setLockAfter('30min')}
                >
                  <Text style={[
                    styles.lockAfterOptionText,
                    settings.lockAfter === '30min' && styles.lockAfterOptionTextSelected
                  ]}>
                    30 minuti
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Autenticazione a Due Fattori */}
          <View style={styles.optionItem}>
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>Autenticazione a Due Fattori</Text>
              <Text style={styles.optionDescription}>
                Aggiungi un livello extra di sicurezza al tuo account
              </Text>
            </View>
            <Switch
              value={settings.twoFactorAuth}
              onValueChange={() => toggleSetting('twoFactorAuth')}
              trackColor={{ false: colors.background.secondary, true: colors.success }}
              thumbColor={colors.background.primary}
            />
          </View>

          {/* Backup Sicuro */}
          <View style={styles.optionItem}>
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>Backup Sicuro</Text>
              <Text style={styles.optionDescription}>
                Cripta e salva i tuoi dati in modo sicuro
              </Text>
            </View>
            <Switch
              value={settings.secureBackup}
              onValueChange={() => toggleSetting('secureBackup')}
              trackColor={{ false: colors.background.secondary, true: colors.success }}
              thumbColor={colors.background.primary}
            />
          </View>
        </View>

        {/* Note sulla sicurezza */}
        <View style={styles.securityNote}>
          <Ionicons name="shield-checkmark" size={24} color={colors.success} />
          <Text style={styles.securityNoteText}>
            La sicurezza del tuo account è la nostra priorità. Ti consigliamo di attivare tutte le funzioni di sicurezza disponibili.
          </Text>
        </View>

        {/* Spazio extra in fondo */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Footer con pulsante */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Salvataggio...' : 'Completa Setup'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    paddingVertical: 16,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionInfo: {
    flex: 1,
    marginRight: 16,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  lockAfterSection: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 16,
  },
  lockAfterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  lockAfterOption: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  lockAfterOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.background.primary,
  },
  lockAfterOptionText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  lockAfterOptionTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  securityNoteText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: colors.text.secondary,
  },
  footer: {
    padding: 16,
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.text.button,
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 20,
  },
});
