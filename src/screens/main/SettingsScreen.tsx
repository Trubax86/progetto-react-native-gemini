import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { auth, db } from '../../config/firebase';
import { signOut, deleteUser } from 'firebase/auth';
import { useTheme } from '../../contexts/ThemeContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { SessionManager } from '../../components/settings/SessionManager';
import { useAuth } from '../../contexts/AuthContext';
import { DeleteAccountDialog } from '../../components/dialogs/DeleteAccountDialog';

type PrivacySettings = {
  accountType: 'public' | 'private';
  profileVisibility: 'public' | 'private';
  showLastSeen: boolean;
  showStatus: boolean;
  showBio: boolean;
  showPosts: boolean;
  showServices: boolean;
  whoCanMessageMe: 'everyone' | 'followers' | 'none';
  whoCanSeeMyPosts: 'everyone' | 'followers' | 'none';
  blockedUsers: string[];
  closeFollowers: string[];
};

export const SettingsScreen = ({ navigation }: any) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [privacy, setPrivacy] = useState<PrivacySettings>({
    accountType: 'public',
    profileVisibility: 'public',
    showLastSeen: true,
    showStatus: true,
    showBio: true,
    showPosts: true,
    showServices: true,
    whoCanMessageMe: 'everyone',
    whoCanSeeMyPosts: 'everyone',
    blockedUsers: [],
    closeFollowers: []
  });

  useEffect(() => {
    fetchPrivacySettings();
  }, []);

  const fetchPrivacySettings = async () => {
    if (!auth.currentUser) return;
    
    try {
      const privacyDoc = await getDoc(doc(db, 'users', auth.currentUser.uid, 'settings', 'privacy'));
      if (privacyDoc.exists()) {
        setPrivacy(privacyDoc.data() as PrivacySettings);
      }
    } catch (error) {
      console.error('Errore nel caricamento delle impostazioni privacy:', error);
    }
  };

  const handlePrivacyUpdate = async (updates: Partial<PrivacySettings>) => {
    if (!auth.currentUser) return;

    try {
      const userRef = doc(db, 'users', auth.currentUser.uid, 'settings', 'privacy');
      await setDoc(userRef, { ...privacy, ...updates }, { merge: true });
      setPrivacy(prev => ({ ...prev, ...updates }));
    } catch (error) {
      console.error('Errore durante l\'aggiornamento della privacy:', error);
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Elimina Account',
      'Sei sicuro di voler eliminare il tuo account? Questa azione è irreversibile.',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const user = auth.currentUser;
              if (user) {
                await deleteUser(user);
              }
            } catch (error) {
              Alert.alert('Errore', 'Impossibile eliminare l\'account');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      Alert.alert('Errore', 'Impossibile effettuare il logout');
    }
  };

  const SettingItem = ({ icon, title, description, value, onPress, isSwitch = false, isDestructive = false }: any) => (
    <TouchableOpacity 
      style={styles.settingItem}
      onPress={isSwitch ? undefined : onPress}
    >
      <View style={styles.settingLeft}>
        <Ionicons 
          name={icon} 
          size={24} 
          color={isDestructive ? colors.status.error : colors.text.primary} 
          style={styles.icon} 
        />
        <View>
          <Text style={[
            styles.settingTitle,
            isDestructive && { color: colors.status.error }
          ]}>{title}</Text>
          {description && (
            <Text style={styles.settingDescription}>{description}</Text>
          )}
        </View>
      </View>
      {isSwitch ? (
        <Switch
          value={value}
          onValueChange={onPress}
          trackColor={{ false: colors.background.tertiary, true: colors.button.primary }}
          thumbColor={colors.text.primary}
        />
      ) : value ? (
        <Text style={styles.settingValue}>{value}</Text>
      ) : (
        <Ionicons name="chevron-forward" size={24} color={colors.text.secondary} />
      )}
    </TouchableOpacity>
  );

  const Section = ({ title, children }: any) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  const ProfileSection = () => (
    <TouchableOpacity 
      style={styles.profileSection}
      onPress={() => navigation.navigate('Profile')}
    >
      <Image
        source={{ 
          uri: auth.currentUser?.photoURL || 
          `https://ui-avatars.com/api/?name=${encodeURIComponent(auth.currentUser?.displayName || 'User')}` 
        }}
        style={styles.profileImage}
      />
      <View style={styles.profileInfo}>
        <Text style={styles.profileName}>{auth.currentUser?.displayName || 'Utente'}</Text>
        <Text style={styles.profileHint}>Tocca per vedere il tuo profilo</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.mainContainer}>
      <ScrollView style={styles.container}>
        <ProfileSection />

        <Section title="Tema">
          <SettingItem
            icon="color-palette-outline"
            title="Tema scuro"
            value={isDarkMode}
            onPress={toggleTheme}
            isSwitch
          />
        </Section>

        <Section title="Dispositivi">
          <SessionManager />
        </Section>

        <Section title="Notifiche">
          <SettingItem
            icon="notifications-outline"
            title="Notifiche push"
            value={notifications}
            onPress={() => setNotifications(!notifications)}
            isSwitch
          />
          <SettingItem
            icon="volume-high-outline"
            title="Suoni"
            value={soundEnabled}
            onPress={() => setSoundEnabled(!soundEnabled)}
            isSwitch
          />
        </Section>

        <Section title="Privacy e Sicurezza">
          <SettingItem
            icon="lock-closed-outline"
            title="Account privato"
            value={privacy.accountType === 'private'}
            onPress={() => handlePrivacyUpdate({ 
              accountType: privacy.accountType === 'private' ? 'public' : 'private' 
            })}
            isSwitch
          />
          <SettingItem
            icon="eye-outline"
            title="Mostra ultimo accesso"
            value={privacy.showLastSeen}
            onPress={() => handlePrivacyUpdate({ showLastSeen: !privacy.showLastSeen })}
            isSwitch
          />
          <SettingItem
            icon="people-outline"
            title="Chi può contattarmi"
            value={privacy.whoCanMessageMe === 'everyone' ? 'Tutti' : 'Solo follower'}
            onPress={() => navigation.navigate('PrivacySettings')}
          />
        </Section>

        <Section title="Dati e Archiviazione">
          <SettingItem
            icon="phone-portrait-outline"
            title="Utilizzo dati"
            description="Gestisci l'utilizzo dei dati"
            onPress={() => navigation.navigate('DataUsage')}
          />
          <SettingItem
            icon="save-outline"
            title="Spazio di archiviazione"
            description="Gestisci lo spazio utilizzato"
            value="2.4 GB"
            onPress={() => navigation.navigate('Storage')}
          />
        </Section>

        <Section title="Account">
          {!auth.currentUser?.isAnonymous && (
            <SettingItem
              icon="trash-outline"
              title="Elimina account"
              description="Elimina permanentemente il tuo account"
              onPress={() => setShowDeleteDialog(true)}
              isDestructive
            />
          )}
          <SettingItem
            icon="log-out-outline"
            title={auth.currentUser?.isAnonymous ? 'Esci ed elimina' : 'Logout'}
            onPress={handleSignOut}
            isDestructive
          />
        </Section>

        <View style={styles.footer}>
          <Text style={styles.version}>CriptX v1.0.0</Text>
          <Text style={styles.copyright}> 2024 CriptX. Tutti i diritti riservati.</Text>
        </View>
      </ScrollView>
      <DeleteAccountDialog 
        isVisible={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.background.secondary,
    marginVertical: 16,
    marginHorizontal: 16,
    borderRadius: 12,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  profileHint: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginLeft: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionContent: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    marginHorizontal: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    color: colors.text.primary,
  },
  settingDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 2,
  },
  settingValue: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  version: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  copyright: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 4,
  },
});