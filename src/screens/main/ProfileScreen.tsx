import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { auth, db } from '../../config/firebase';
import { signOut, updateProfile } from 'firebase/auth';
import { colors } from '../../theme/colors';
import { PostGrid } from '../../components/profile/PostGrid';
import { VideoGrid } from '../../components/profile/VideoGrid';
import { CollectionGrid } from '../../components/profile/CollectionGrid';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/MainStackParamList';

// Definisci il tipo di navigazione per ProfileScreen
type ProfileScreenNavigationProp = NativeStackNavigationProp<MainStackParamList, 'Profile'>;

// Definisci le schede disponibili
const tabs = ['Posts', 'Videos', 'Collections'] as const;
type TabType = typeof tabs[number];

export const ProfileScreen = () => {
  // Utilizza la navigazione nativa per accedere alle funzioni di navigazione
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  
  // Stato per la scheda attiva
  const [activeTab, setActiveTab] = useState<TabType>('Posts');
  
  // Stato per il caricamento dei dati
  const [loading, setLoading] = useState(false);
  
  // Stato per i dati del profilo
  const [profileData, setProfileData] = useState({
    displayName: auth.currentUser?.displayName || '',
    photoURL: auth.currentUser?.photoURL || '',
    bio: '',
    stats: {
      posts: 0,
      videos: 0,
      followers: 0,
      following: 0
    },
    posts: [],
    videos: [],
    collections: []
  });

  // Effetto per caricare i dati del profilo
  useEffect(() => {
    loadProfileData();
  }, []);

  // Funzione per caricare i dati del profilo
  const loadProfileData = async () => {
    if (!auth.currentUser) return;
    
    try {
      setLoading(true);
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        setProfileData(prev => ({
          ...prev,
          ...userDoc.data()
        }));
      }
    } catch (error: any) {
      Alert.alert('Errore', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Funzione per selezionare un'immagine dalla galleria
  const handleImagePick = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permesso Negato', 'Devi concedere l\'accesso alla galleria per cambiare la foto profilo.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
        aspect: [1, 1],
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const { uri } = result.assets[0];
        
        // Naviga a ImageEdit con i parametri corretti
        navigation.navigate('ImageEdit', {
          imageUri: uri,
          onSave: async (photoURL: string) => {
            setLoading(true);
            try {
              if (!auth.currentUser) {
                throw new Error('Utente non autenticato');
              }

              // Aggiorna il profilo utente
              await updateProfile(auth.currentUser, { photoURL });
              await updateDoc(doc(db, 'users', auth.currentUser.uid), { photoURL });
              
              // Aggiorna le chat
              const chatsQuery = query(
                collection(db, 'chats'),
                where('participants', 'array-contains', auth.currentUser.uid)
              );
              
              const chatsSnapshot = await getDocs(chatsQuery);
              const updatePromises = chatsSnapshot.docs.map(async (chatDoc) => {
                const participantsData = chatDoc.data().participantsData || {};
                if (participantsData[auth.currentUser!.uid]) {
                  participantsData[auth.currentUser!.uid].photoURL = photoURL;
                  await updateDoc(doc(db, 'chats', chatDoc.id), {
                    participantsData
                  });
                }
              });
              
              await Promise.all(updatePromises);
              setProfileData(prev => ({ ...prev, photoURL }));
            } catch (error: any) {
              Alert.alert('Errore', error.message);
            } finally {
              setLoading(false);
            }
          }
        });
      }
    } catch (error: any) {
      Alert.alert('Errore', error.message);
    }
  };

  // Funzione per gestire la disconnessione
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      Alert.alert('Errore', error.message);
    }
  };

  // Funzione per renderizzare il contenuto della scheda attiva
  const renderTabContent = () => {
    switch (activeTab) {
      case 'Posts':
        return <PostGrid posts={profileData.posts} />;
      case 'Videos':
        return <VideoGrid videos={profileData.videos} />;
      case 'Collections':
        return <CollectionGrid collections={profileData.collections} />;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleImagePick}>
          <Image
            source={{ 
              uri: profileData.photoURL || 
                `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.displayName || 'User')}&background=random&size=150` 
            }}
            style={styles.profileImage}
          />
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator color={colors.text.primary} />
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{profileData.stats.posts}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{profileData.stats.followers}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{profileData.stats.following}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>
      </View>

      <View style={styles.bioSection}>
        <Text style={styles.displayName}>{profileData.displayName}</Text>
        <Text style={styles.bio}>{profileData.bio}</Text>
      </View>

      <View style={styles.tabsContainer}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.content}>
        {renderTabContent()}
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Esci</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 40,
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginLeft: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  bioSection: {
    padding: 20,
    paddingTop: 0,
  },
  displayName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  bio: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  signOutButton: {
    margin: 20,
    padding: 15,
    backgroundColor: colors.danger,
    borderRadius: 8,
    alignItems: 'center',
  },
  signOutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});