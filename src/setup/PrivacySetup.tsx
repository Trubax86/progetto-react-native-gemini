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

export default function PrivacySetup() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    profileVisibility: 'contacts', // 'public', 'contacts', 'private'
    showLastSeen: true,
    showReadReceipts: true,
    allowScreenshots: false,
    enableE2EEncryption: true
  });

  const handleNext = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      await updateDoc(doc(db, 'users', user.uid), {
        privacySettings: settings,
        updatedAt: new Date().toISOString()
      });

      navigation.navigate('SecuritySetup');
    } catch (error) {
      console.error('Error updating privacy settings:', error);
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

  const setProfileVisibility = (value: string) => {
    setSettings(prev => ({
      ...prev,
      profileVisibility: value
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header con Step Indicator */}
      <View style={styles.header}>
        <StepIndicator 
          currentStep={2}
          steps={setupSteps}
        />
      </View>

      <ScrollView 
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContentContainer}
      >
        <Text style={styles.title}>Impostazioni Privacy</Text>
        <Text style={styles.subtitle}>
          Configura le tue preferenze di privacy per proteggere i tuoi dati e le tue conversazioni
        </Text>

        {/* Opzioni */}
        <View style={styles.optionsContainer}>
          {/* Visibilità Profilo */}
          <View style={styles.visibilitySection}>
            <Text style={styles.sectionTitle}>Visibilità Profilo</Text>
            <View style={styles.visibilityOptions}>
              <TouchableOpacity 
                style={[
                  styles.visibilityOption,
                  settings.profileVisibility === 'public' && styles.visibilityOptionSelected
                ]}
                onPress={() => setProfileVisibility('public')}
              >
                <Ionicons 
                  name="globe-outline" 
                  size={24} 
                  color={settings.profileVisibility === 'public' ? colors.primary : colors.text.secondary} 
                />
                <Text style={[
                  styles.visibilityOptionText,
                  settings.profileVisibility === 'public' && styles.visibilityOptionTextSelected
                ]}>
                  Pubblico
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.visibilityOption,
                  settings.profileVisibility === 'contacts' && styles.visibilityOptionSelected
                ]}
                onPress={() => setProfileVisibility('contacts')}
              >
                <Ionicons 
                  name="people-outline" 
                  size={24} 
                  color={settings.profileVisibility === 'contacts' ? colors.primary : colors.text.secondary} 
                />
                <Text style={[
                  styles.visibilityOptionText,
                  settings.profileVisibility === 'contacts' && styles.visibilityOptionTextSelected
                ]}>
                  Solo Contatti
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.visibilityOption,
                  settings.profileVisibility === 'private' && styles.visibilityOptionSelected
                ]}
                onPress={() => setProfileVisibility('private')}
              >
                <Ionicons 
                  name="lock-closed-outline" 
                  size={24} 
                  color={settings.profileVisibility === 'private' ? colors.primary : colors.text.secondary} 
                />
                <Text style={[
                  styles.visibilityOptionText,
                  settings.profileVisibility === 'private' && styles.visibilityOptionTextSelected
                ]}>
                  Privato
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Altre opzioni */}
          <View style={styles.optionItem}>
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>Mostra Ultimo Accesso</Text>
              <Text style={styles.optionDescription}>
                Permetti agli altri di vedere quando sei stato online l'ultima volta
              </Text>
            </View>
            <Switch
              value={settings.showLastSeen}
              onValueChange={() => toggleSetting('showLastSeen')}
              trackColor={{ false: colors.background.secondary, true: colors.success }}
              thumbColor={colors.background.primary}
            />
          </View>

          <View style={styles.optionItem}>
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>Conferme di Lettura</Text>
              <Text style={styles.optionDescription}>
                Mostra quando hai letto i messaggi
              </Text>
            </View>
            <Switch
              value={settings.showReadReceipts}
              onValueChange={() => toggleSetting('showReadReceipts')}
              trackColor={{ false: colors.background.secondary, true: colors.success }}
              thumbColor={colors.background.primary}
            />
          </View>

          <View style={styles.optionItem}>
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>Screenshot</Text>
              <Text style={styles.optionDescription}>
                Permetti agli altri di fare screenshot delle chat
              </Text>
            </View>
            <Switch
              value={settings.allowScreenshots}
              onValueChange={() => toggleSetting('allowScreenshots')}
              trackColor={{ false: colors.background.secondary, true: colors.success }}
              thumbColor={colors.background.primary}
            />
          </View>

          <View style={styles.optionItem}>
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>Crittografia End-to-End</Text>
              <Text style={styles.optionDescription}>
                Abilita la crittografia end-to-end per tutte le chat
              </Text>
            </View>
            <Switch
              value={settings.enableE2EEncryption}
              onValueChange={() => toggleSetting('enableE2EEncryption')}
              trackColor={{ false: colors.background.secondary, true: colors.success }}
              thumbColor={colors.background.primary}
            />
          </View>
        </View>

        {/* Note sulla privacy */}
        <View style={styles.privacyNote}>
          <Ionicons name="shield-checkmark" size={24} color={colors.success} />
          <Text style={styles.privacyNoteText}>
            La tua privacy è importante per noi. Tutte le impostazioni possono essere modificate in seguito dalle impostazioni dell'app
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
  visibilitySection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 16,
  },
  visibilityOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  visibilityOption: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  visibilityOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.background.primary,
  },
  visibilityOptionText: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 8,
    textAlign: 'center',
  },
  visibilityOptionTextSelected: {
    color: colors.primary,
    fontWeight: '600',
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