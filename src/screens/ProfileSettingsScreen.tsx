import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import { auth, db, storage } from '../config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../theme/colors';
import { TextInput } from '../components/TextInput';
import { Switch } from '../components/Switch';
import { SessionService } from '../services/SessionService';
import { generateAvatar } from '../utils/avatarGenerator';

export const ProfileSettingsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [userSettings, setUserSettings] = useState({
    displayName: '',
    photoURL: '',
    bio: '',
    email: '',
    phoneNumber: '',
    privacy: {
      profileVisibility: 'public',
      lastSeen: 'everyone',
      readReceipts: true,
      typingIndicator: true,
    },
    security: {
      twoFactorEnabled: false,
      biometricEnabled: false,
      autoLockTimeout: 5,
      backupEnabled: false,
      encryptionEnabled: true,
    },
    notifications: {
      enabled: true,
      sound: true,
      vibration: true,
      messagePreview: true,
      calls: true,
      groups: true,
    },
  });

  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        
        // Se non c'è una foto profilo, genera un avatar
        if (!data.photoURL && data.displayName) {
          try {
            const generatedAvatar = await generateAvatar(user.uid, data.displayName);
            data.photoURL = generatedAvatar;
            
            // Salva l'avatar generato
            await updateDoc(doc(db, 'users', user.uid), {
              photoURL: generatedAvatar
            });
          } catch (error) {
            console.error('Error generating avatar:', error);
          }
        }
        
        setUserSettings(prev => ({
          ...prev,
          ...data,
          privacy: { ...prev.privacy, ...data.privacy },
          security: { ...prev.security, ...data.security },
          notifications: { ...prev.notifications, ...data.notifications },
        }));
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
      Alert.alert('Errore', 'Impossibile caricare le impostazioni');
    }
  };

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const user = auth.currentUser;
        if (!user) return;

        setLoading(true);
        const response = await fetch(result.assets[0].uri);
        const blob = await response.blob();
        
        const fileName = `${Date.now()}_${user.uid}`;
        const storageRef = ref(storage, `profile_photos/${fileName}`);
        
        const metadata = {
          contentType: 'image/jpeg',
          userId: user.uid,
        };
        
        await uploadBytes(storageRef, blob, metadata);
        const photoURL = await getDownloadURL(storageRef);

        await updateDoc(doc(db, 'users', user.uid), {
          photoURL,
          updatedAt: new Date().toISOString(),
        });

        setUserSettings(prev => ({ ...prev, photoURL }));
      }
    } catch (error) {
      console.error('Error updating profile photo:', error);
      Alert.alert('Errore', 'Impossibile aggiornare la foto profilo');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      setLoading(true);
      await updateDoc(doc(db, 'users', user.uid), {
        ...userSettings,
        updatedAt: new Date().toISOString(),
      });

      Alert.alert('Successo', 'Impostazioni aggiornate con successo');
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Errore', 'Impossibile salvare le impostazioni');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const sessionService = SessionService.getInstance();
      await sessionService.cleanup();
      await auth.signOut();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert('Errore', 'Impossibile effettuare il logout');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleImagePick} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <Image
              source={{ uri: userSettings.photoURL }}
              style={styles.avatar}
              onError={() => {
                // Se il caricamento dell'immagine fallisce, genera un nuovo avatar
                if (userSettings.displayName) {
                  generateAvatar(auth.currentUser?.uid || '', userSettings.displayName)
                    .then(avatarUrl => {
                      setUserSettings(prev => ({ ...prev, photoURL: avatarUrl }));
                    })
                    .catch(console.error);
                }
              }}
            />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informazioni Profilo</Text>
        <TextInput
          label="Nome"
          value={userSettings.displayName}
          onChangeText={(text) =>
            setUserSettings((prev) => ({ ...prev, displayName: text }))
          }
          editable={!loading}
        />
        <TextInput
          label="Bio"
          value={userSettings.bio}
          onChangeText={(text) =>
            setUserSettings((prev) => ({ ...prev, bio: text }))
          }
          multiline
          editable={!loading}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy</Text>
        <View style={styles.setting}>
          <Text>Visibilità Profilo</Text>
          <Switch
            value={userSettings.privacy.profileVisibility === 'public'}
            onValueChange={(value) =>
              setUserSettings((prev) => ({
                ...prev,
                privacy: {
                  ...prev.privacy,
                  profileVisibility: value ? 'public' : 'private',
                },
              }))
            }
            disabled={loading}
          />
        </View>
        <View style={styles.setting}>
          <Text>Ultimo Accesso</Text>
          <Switch
            value={userSettings.privacy.lastSeen === 'everyone'}
            onValueChange={(value) =>
              setUserSettings((prev) => ({
                ...prev,
                privacy: {
                  ...prev.privacy,
                  lastSeen: value ? 'everyone' : 'nobody',
                },
              }))
            }
            disabled={loading}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sicurezza</Text>
        <View style={styles.setting}>
          <Text>Autenticazione Biometrica</Text>
          <Switch
            value={userSettings.security.biometricEnabled}
            onValueChange={(value) =>
              setUserSettings((prev) => ({
                ...prev,
                security: {
                  ...prev.security,
                  biometricEnabled: value,
                },
              }))
            }
            disabled={loading}
          />
        </View>
        <View style={styles.setting}>
          <Text>Backup Automatico</Text>
          <Switch
            value={userSettings.security.backupEnabled}
            onValueChange={(value) =>
              setUserSettings((prev) => ({
                ...prev,
                security: {
                  ...prev.security,
                  backupEnabled: value,
                },
              }))
            }
            disabled={loading}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifiche</Text>
        <View style={styles.setting}>
          <Text>Notifiche Push</Text>
          <Switch
            value={userSettings.notifications.enabled}
            onValueChange={(value) =>
              setUserSettings((prev) => ({
                ...prev,
                notifications: {
                  ...prev.notifications,
                  enabled: value,
                },
              }))
            }
            disabled={loading}
          />
        </View>
        <View style={styles.setting}>
          <Text>Suoni</Text>
          <Switch
            value={userSettings.notifications.sound}
            onValueChange={(value) =>
              setUserSettings((prev) => ({
                ...prev,
                notifications: {
                  ...prev.notifications,
                  sound: value,
                },
              }))
            }
            disabled={loading}
          />
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.text.primary} />
          ) : (
            <Text style={styles.buttonText}>Salva Modifiche</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={loading}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    padding: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: colors.text.primary,
  },
  setting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonContainer: {
    padding: 20,
  },
  saveButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.danger,
  },
  logoutButtonText: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
