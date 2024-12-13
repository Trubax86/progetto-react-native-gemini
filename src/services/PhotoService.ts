import { storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export class PhotoService {
  static async uploadProfilePhoto(userId: string, file: Blob): Promise<string> {
    // Crea un nome file univoco con timestamp
    const fileName = `${userId}_${Date.now()}.jpg`;
    const storageRef = ref(storage, `profile_photos/${fileName}`);

    // Aggiungi i metadata come richiesto dalle regole di sicurezza
    const metadata = {
      contentType: 'image/jpeg',
      userId: userId
    };

    // Carica il file
    await uploadBytes(storageRef, file, metadata);

    // Restituisci l'URL della foto caricata
    return await getDownloadURL(storageRef);
  }

  static async getProfilePhotoUrl(userId: string, displayName: string): Promise<string> {
    try {
      // Prima cerca nella cartella profile_photos
      const storageRef = ref(storage, `profile_photos/${userId}`);
      return await getDownloadURL(storageRef);
    } catch (error) {
      // Se non trova una foto profilo, genera un avatar con le iniziali
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random&color=fff&size=256`;
    }
  }

  static getDefaultAvatarUrl(name: string): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=256`;
  }
}
