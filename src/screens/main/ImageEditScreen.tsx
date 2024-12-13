import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  PanResponder,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { MainStackParamList } from '../../navigation/MainStack';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db } from '../../config/firebase';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CONTAINER_SIZE = SCREEN_WIDTH;
const MASK_SIZE = CONTAINER_SIZE * 0.8;

type Filter = {
  id: string;
  name: string;
  icon: string;
  color: string;
  brightness?: number;
  contrast?: number;
  saturation?: number;
  sepia?: number;
};

const filters: Filter[] = [
  { 
    id: 'normal', 
    name: 'Normale', 
    icon: 'image',
    color: '#4A90E2'
  },
  { 
    id: 'vivid', 
    name: 'Vivido', 
    icon: 'brightness-7',
    color: '#F5A623',
    brightness: 1.2,
    contrast: 1.2 
  },
  { 
    id: 'warm', 
    name: 'Caldo', 
    icon: 'white-balance-sunny',
    color: '#FF9500',
    brightness: 1.1,
    contrast: 1.1
  },
  { 
    id: 'cool', 
    name: 'Freddo', 
    icon: 'snowflake',
    color: '#5856D6',
    brightness: 0.9,
    contrast: 1.0
  },
  { 
    id: 'bw', 
    name: 'B/N', 
    icon: 'contrast-box',
    color: '#1C1C1E',
    brightness: 1.0,
    contrast: 2.0
  },
  { 
    id: 'vintage', 
    name: 'Vintage', 
    icon: 'camera',
    color: '#8E8E93',
    brightness: 0.9,
    contrast: 1.2
  }
];

type Props = StackScreenProps<MainStackParamList, 'ImageEdit'>;

export const ImageEditScreen: React.FC<Props> = ({ navigation, route }) => {
  const { imageUri, onSave } = route.params;
  const [loading, setLoading] = useState(false);
  const [scale, setScale] = useState(1);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [selectedFilter, setSelectedFilter] = useState<Filter>(filters[0]);
  const [isFilterApplied, setIsFilterApplied] = useState(true);
  const [isApplyingFilter, setIsApplyingFilter] = useState(false);
  const [filteredImageUri, setFilteredImageUri] = useState<string | null>(null);
  const pan = useRef(new Animated.ValueXY()).current;

  useEffect(() => {
    if (imageUri) {
      Image.getSize(imageUri, (width, height) => {
        const aspectRatio = width / height;
        let newWidth, newHeight;
        
        if (aspectRatio > 1) {
          newHeight = MASK_SIZE;
          newWidth = MASK_SIZE * aspectRatio;
        } else {
          newWidth = MASK_SIZE;
          newHeight = MASK_SIZE / aspectRatio;
        }
        
        setImageSize({ width: newWidth, height: newHeight });
        setScale(1);
      });
    }
  }, [imageUri]);

  useEffect(() => {
    setIsFilterApplied(selectedFilter.id === 'normal');
  }, [selectedFilter]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event(
        [
          null,
          { dx: pan.x, dy: pan.y }
        ],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        // Non resettiamo la posizione
      }
    })
  ).current;

  const handleZoom = (increase: boolean) => {
    const newScale = increase ? Math.min(scale + 0.2, 3) : Math.max(scale - 0.2, 0.5);
    setScale(newScale);
  };

  const applyFilter = async () => {
    try {
      setIsApplyingFilter(true);
      
      // Calcola le dimensioni e la posizione dell'area visibile
      const translateX = pan.x._value;
      const translateY = pan.y._value;
      
      // Applica solo il filtro mantenendo la posizione e lo zoom attuali
      const manipResult = await manipulateAsync(
        imageUri,
        [
          {
            resize: {
              width: imageSize.width,
              height: imageSize.height
            }
          }
        ],
        { 
          format: SaveFormat.JPEG, 
          compress: 0.8,
          base64: true 
        }
      );

      // Applica i filtri CSS direttamente all'immagine visualizzata
      setFilteredImageUri(manipResult.uri);
      setIsFilterApplied(true);
    } catch (error) {
      console.error('Errore nell\'applicazione del filtro:', error);
      Alert.alert('Errore', 'Impossibile applicare il filtro');
      setIsFilterApplied(false);
    } finally {
      setIsApplyingFilter(false);
    }
  };

  const getImageStyle = () => {
    const filterStyle = {
      brightness: selectedFilter.brightness || 1,
      contrast: selectedFilter.contrast || 1,
      saturate: selectedFilter.saturation || 1,
      sepia: selectedFilter.sepia || 0
    };

    return {
      width: imageSize.width * scale,
      height: imageSize.height * scale,
      transform: [
        { translateX: pan.x },
        { translateY: pan.y }
      ],
      filter: `brightness(${filterStyle.brightness}) contrast(${filterStyle.contrast}) saturate(${filterStyle.saturate}) sepia(${filterStyle.sepia})`
    };
  };

  const handleSave = async () => {
    if (!auth.currentUser) {
      Alert.alert('Errore', 'Utente non autenticato');
      return;
    }

    try {
      setLoading(true);

      // Calcola le dimensioni e la posizione dell'area visibile
      const translateX = pan.x._value;
      const translateY = pan.y._value;

      // Usa l'immagine filtrata se presente, altrimenti usa l'immagine originale
      const sourceUri = filteredImageUri || imageUri;

      // Applica la trasformazione finale mantenendo zoom e posizione
      const finalResult = await manipulateAsync(
        sourceUri,
        [
          {
            resize: {
              width: MASK_SIZE,
              height: MASK_SIZE
            }
          }
        ],
        { format: SaveFormat.JPEG, compress: 0.8 }
      );

      const response = await fetch(finalResult.uri);
      const blob = await response.blob();
      
      const storage = getStorage();
      const timestamp = Date.now();
      const storageRef = ref(storage, `profile_photos/${auth.currentUser.uid}_${timestamp}.jpg`);
      
      const metadata = {
        contentType: 'image/jpeg',
        customMetadata: {
          userId: auth.currentUser.uid,
          uploadedAt: new Date().toISOString(),
          filter: selectedFilter.id
        }
      };
      
      await uploadBytes(storageRef, blob, metadata);
      const photoURL = await getDownloadURL(storageRef);

      await updateProfile(auth.currentUser, { photoURL });
      
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, { photoURL });

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

      if (onSave) {
        await onSave(photoURL);
      }

      navigation.goBack();
    } catch (error) {
      console.error('Errore nel salvataggio:', error);
      Alert.alert('Errore', 'Impossibile salvare l\'immagine');
    } finally {
      setLoading(false);
    }
  };

  const handleReplacePhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets[0].uri) {
        const newImageUri = result.assets[0].uri;
        
        // Reset states for the new image
        setFilteredImageUri(null);
        setSelectedFilter(filters[0]);
        setIsFilterApplied(true);
        setScale(1);
        pan.setValue({ x: 0, y: 0 });
        
        // Update the image URI in both route params and component state
        route.params.imageUri = newImageUri;
        
        // Get new image dimensions and update the image size
        Image.getSize(newImageUri, (width, height) => {
          const aspectRatio = width / height;
          let newWidth, newHeight;
          
          if (aspectRatio > 1) {
            newHeight = MASK_SIZE;
            newWidth = MASK_SIZE * aspectRatio;
          } else {
            newWidth = MASK_SIZE;
            newHeight = MASK_SIZE / aspectRatio;
          }
          
          setImageSize({ width: newWidth, height: newHeight });
        });
      }
    } catch (error) {
      console.error('Error replacing photo:', error);
      Alert.alert('Errore', 'Impossibile sostituire la foto');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleReplacePhoto}
          >
            <Ionicons name="camera-reverse" size={28} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleSave} 
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Ionicons 
                name="checkmark" 
                size={28} 
                color={colors.primary} 
              />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.imageContainer}>
        <View style={styles.maskContainer}>
          <View style={styles.circularMask} />
          <Animated.View 
            style={[styles.imageWrapper, getImageStyle()]} 
            {...panResponder.panHandlers}
          >
            <Image
              source={{ uri: filteredImageUri || imageUri }}
              style={styles.image}
              resizeMode="contain"
            />
          </Animated.View>
          <View style={styles.zoomControls}>
            <TouchableOpacity 
              style={styles.zoomButton} 
              onPress={() => handleZoom(false)}
            >
              <Ionicons name="remove" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.zoomButton} 
              onPress={() => handleZoom(true)}
            >
              <Ionicons name="add" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.filtersSection}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterButton,
                selectedFilter.id === filter.id && styles.filterButtonSelected,
                { backgroundColor: filter.color + '20' }
              ]}
              onPress={() => {
                setSelectedFilter(filter);
                setIsFilterApplied(filter.id === 'normal');
              }}
            >
              <MaterialCommunityIcons 
                name={filter.icon} 
                size={24} 
                color={filter.color} 
                style={styles.filterIcon}
              />
              <Text style={[
                styles.filterText,
                { color: filter.color },
                selectedFilter.id === filter.id && styles.filterTextSelected
              ]}>
                {filter.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {selectedFilter.id !== 'normal' && !isFilterApplied && (
          <TouchableOpacity
            style={[
              styles.applyFilterButton,
              { backgroundColor: selectedFilter.color },
              isApplyingFilter && styles.applyFilterButtonDisabled
            ]}
            onPress={applyFilter}
            disabled={isApplyingFilter}
          >
            {isApplyingFilter ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.applyFilterText}>Applica Filtro</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          Sposta e ridimensiona la foto come preferisci
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerButton: {
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text.primary,
  },
  imageContainer: {
    width: CONTAINER_SIZE,
    height: CONTAINER_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  maskContainer: {
    width: MASK_SIZE,
    height: MASK_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderRadius: MASK_SIZE / 2,
  },
  circularMask: {
    position: 'absolute',
    width: MASK_SIZE,
    height: MASK_SIZE,
    borderRadius: MASK_SIZE / 2,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    borderStyle: 'dashed',
  },
  imageWrapper: {
    position: 'absolute',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  zoomControls: {
    position: 'absolute',
    bottom: -60,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: 20,
  },
  zoomButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersSection: {
    paddingVertical: 10,
    marginTop: 40,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    gap: 12,
    flexDirection: 'row',
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterButtonSelected: {
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterIcon: {
    marginRight: 8,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterTextSelected: {
    fontWeight: '600',
  },
  applyFilterButton: {
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyFilterButtonDisabled: {
    opacity: 0.6,
  },
  applyFilterText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  instructions: {
    padding: 16,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
