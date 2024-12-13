import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  SafeAreaView,
  Switch
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { StepIndicator } from './StepIndicator';
import { setupSteps } from './setupConfig';
import { auth, db } from '../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function ContactSetup() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    allowContactSync: false,
    allowContactSearch: true,
    allowInvites: true
  });

  const handleNext = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      await updateDoc(doc(db, 'users', user.uid), {
        contactSettings: settings,
        updatedAt: new Date().toISOString()
      });

      navigation.navigate('PrivacySetup');
    } catch (error) {
      console.error('Error updating contact settings:', error);
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header con Step Indicator */}
      <View style={styles.header}>
        <StepIndicator 
          currentStep={1}
          steps={setupSteps}
        />
      </View>

      <ScrollView 
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContentContainer}
      >
        <Text style={styles.title}>Impostazioni Contatti</Text>
        <Text style={styles.subtitle}>
          Configura come gli altri utenti possono trovarti e interagire con te
        </Text>

        {/* Opzioni */}
        <View style={styles.optionsContainer}>
          <View style={styles.optionItem}>
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>Sincronizzazione Contatti</Text>
              <Text style={styles.optionDescription}>
                Permetti a CriptX di accedere ai tuoi contatti per trovare altri utenti
              </Text>
            </View>
            <Switch
              value={settings.allowContactSync}
              onValueChange={() => toggleSetting('allowContactSync')}
              trackColor={{ false: colors.background.secondary, true: colors.success }}
              thumbColor={colors.background.primary}
            />
          </View>

          <View style={styles.optionItem}>
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>Ricerca per Contatti</Text>
              <Text style={styles.optionDescription}>
                Permetti agli altri di trovarti tramite il numero di telefono
              </Text>
            </View>
            <Switch
              value={settings.allowContactSearch}
              onValueChange={() => toggleSetting('allowContactSearch')}
              trackColor={{ false: colors.background.secondary, true: colors.success }}
              thumbColor={colors.background.primary}
            />
          </View>

          <View style={styles.optionItem}>
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>Inviti</Text>
              <Text style={styles.optionDescription}>
                Ricevi inviti da altri utenti di CriptX
              </Text>
            </View>
            <Switch
              value={settings.allowInvites}
              onValueChange={() => toggleSetting('allowInvites')}
              trackColor={{ false: colors.background.secondary, true: colors.success }}
              thumbColor={colors.background.primary}
            />
          </View>
        </View>

        {/* Note sulla privacy */}
        <View style={styles.privacyNote}>
          <Ionicons name="shield-checkmark" size={24} color={colors.success} />
          <Text style={styles.privacyNoteText}>
            Potrai modificare queste impostazioni in qualsiasi momento dalle impostazioni dell'app
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
            {loading ? 'Caricamento...' : 'Continua'}
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
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  privacyNoteText: {
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