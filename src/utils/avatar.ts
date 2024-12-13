import { storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const generateAvatarUrl = (name: string) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=256`;
};

export const uploadProfilePhoto = async (
  userId: string,
  file: Blob,
  onProgress?: (progress: number) => void
): Promise<string> => {
  const fileName = `${userId}_${Date.now()}.jpg`;
  const storageRef = ref(storage, `profile_photos/${fileName}`);
  
  // Aggiungi i metadata richiesti dalle regole di sicurezza
  const metadata = {
    contentType: 'image/jpeg',
    userId: userId
  };

  await uploadBytes(storageRef, file, metadata);
  return await getDownloadURL(storageRef);
};

export const getProfilePhotoUrl = async (userId: string, displayName: string): Promise<string> => {
  try {
    // Prima cerca nella cartella profile_photos
    const storageRef = ref(storage, `profile_photos/${userId}`);
    return await getDownloadURL(storageRef);
  } catch (error) {
    // Se non trova una foto profilo, genera un avatar con le iniziali
    return generateAvatarUrl(displayName || 'U');
  }
};
