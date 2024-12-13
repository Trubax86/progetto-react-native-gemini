import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  Image,
  Platform,
  Alert,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { StepIndicator } from './StepIndicator';
import { setupSteps } from './setupConfig';
import { auth, db } from '../config/firebase';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function ProfileSetup() {
  const navigation = useNavigation();
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [loading, setLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (user?.displayName) {
      setDisplayName(user.displayName);
    }
    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || 'U')}&background=random&size=150`;
    setPhotoURL(user?.photoURL || defaultAvatar);
  }, []);

  useEffect(() => {
    if (!photoURL || photoURL.includes('ui-avatars.com')) {
      const newAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || 'U')}&background=random&size=150`;
      setPhotoURL(newAvatar);
    }
  }, [displayName]);

  useEffect(() => {
    setIsValid(displayName.trim() !== '');
  }, [displayName]);

  const uploadProfileImage = async (uri: string) => {
    if (!auth.currentUser) return;

    try {
      setLoading(true);
      const response = await fetch(uri);
      const blob = await response.blob();
      
      const storage = getStorage();
      const timestamp = Date.now();
      const storageRef = ref(storage, `profile_photos/${auth.currentUser.uid}_${timestamp}.jpg`);
      
      const metadata = {
        contentType: 'image/jpeg',
        customMetadata: {
          userId: auth.currentUser.uid,
          uploadedAt: new Date().toISOString()
        }
      };
      
      await uploadBytes(storageRef, blob, metadata);
      const photoURL = await getDownloadURL(storageRef);
      
      // Aggiorna il profilo di autenticazione
      await updateProfile(auth.currentUser, { photoURL });
      
      // Aggiorna il documento dell'utente
      await updateDoc(doc(db, 'users', auth.currentUser.uid), { photoURL });

      // Aggiorna i riferimenti nelle chat
      const chatsQuery = query(
        collection(db, 'chats'),
        where('participants', 'array-contains', auth.currentUser.uid)
      );
      
      const chatsSnapshot = await getDocs(chatsQuery);
      const updatePromises = chatsSnapshot.docs.map(async (chatDoc) => {
        const participantsData = chatDoc.data().participantsData || {};
        
        if (participantsData[auth.currentUser.uid]) {
          participantsData[auth.currentUser.uid].photoURL = photoURL;
          await updateDoc(doc(db, 'chats', chatDoc.id), {
            participantsData
          });
        }
      });
      
      await Promise.all(updatePromises);
      
      setPhotoURL(photoURL);
      return photoURL;
    } catch (error: any) {
      Alert.alert('Errore', error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        navigation.navigate('ImageEdit', {
          imageUri: result.assets[0].uri,
          onSave: async (photoURL: string) => {
            setPhotoURL(photoURL);
          }
        });
      }
    } catch (error: any) {
      Alert.alert('Errore', 'Non è stato possibile selezionare l\'immagine');
    }
  };

  const handleNext = async () => {
    if (!displayName.trim()) {
      Alert.alert('Errore', 'Inserisci un nome utente');
      return;
    }

    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }]
        });
        return;
      }

      // Aggiorna prima il profilo di autenticazione
      await updateProfile(user, {
        displayName: displayName.trim(),
        photoURL: photoURL
      });

      // Poi aggiorna il documento utente
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: displayName.trim(),
        bio: bio.trim(),
        photoURL: photoURL,
        profileSetupCompleted: true
      });

      // Aggiorna i riferimenti nelle chat
      const chatsQuery = query(
        collection(db, 'chats'),
        where('participants', 'array-contains', user.uid)
      );
      
      const chatsSnapshot = await getDocs(chatsQuery);
      const updatePromises = chatsSnapshot.docs.map(async (chatDoc) => {
        const participantsData = chatDoc.data().participantsData || {};
        
        if (participantsData[user.uid]) {
          participantsData[user.uid].photoURL = photoURL;
          participantsData[user.uid].displayName = displayName.trim();
          await updateDoc(doc(db, 'chats', chatDoc.id), {
            participantsData
          });
        }
      });
      
      await Promise.all(updatePromises);

      // Procedi al prossimo step
      navigation.navigate('ContactSetup');
    } catch (error: any) {
      Alert.alert('Errore', error.message);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }]
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header con Step Indicator */}
      <View style={styles.header}>
        <StepIndicator 
          currentStep={0}
          steps={setupSteps}
        />
      </View>

      <ScrollView 
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContentContainer}
      >
        <Text style={styles.title}>Configura il tuo Profilo</Text>
        <Text style={styles.subtitle}>
          Personalizza il tuo profilo CriptX per farti riconoscere dagli altri utenti
        </Text>

        {/* Avatar Section */}
        <View style={styles.avatarContainer}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarButton}>
            {photoURL ? (
              <Image 
                source={{ uri: photoURL }} 
                style={styles.avatar}
                onError={() => {
                  // Se il caricamento dell'immagine fallisce, usa l'avatar generato
                  setPhotoURL(`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || 'U')}&background=random`);
                }}
              />
            ) : (
              <View style={[styles.avatar, styles.placeholderAvatar]}>
                <Ionicons name="person-outline" size={40} color={colors.text.secondary} />
              </View>
            )}
            <View style={styles.editIconContainer}>
              <Ionicons name="camera" size={20} color={colors.text.white} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          <Text style={styles.label}>Nome Utente</Text>
          <TextInput
            style={styles.input}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Inserisci il tuo nome"
            placeholderTextColor={colors.text.secondary}
          />

          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.bioInput]}
            value={bio}
            onChangeText={setBio}
            placeholder="Scrivi qualcosa su di te"
            placeholderTextColor={colors.text.secondary}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Spazio extra in fondo */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Footer con pulsante */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={loading || !isValid}
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
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarButton: {
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.background.secondary,
  },
  placeholderAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.background.primary,
  },
  formContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: 20,
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
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