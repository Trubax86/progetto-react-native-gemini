import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AppState, AppStateStatus } from 'react-native';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export function useSessionManager() {
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    const userDocRef = doc(db, 'users', currentUser.uid);
    let isUnmounting = false;

    // Funzione per aggiornare lo stato online
    const updateOnlineStatus = async (status: 'online' | 'offline') => {
      if (isUnmounting) return;

      try {
        await updateDoc(userDocRef, {
          status,
          lastSeen: serverTimestamp()
        });
      } catch (error) {
        console.error('Error updating online status:', error);
      }
    };

    // Gestisci cambio stato dell'app
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      const status = nextAppState === 'active' ? 'online' : 'offline';
      await updateOnlineStatus(status);
    };

    // Imposta stato iniziale
    updateOnlineStatus('online');

    // Aggiungi listener per il cambio di stato dell'app
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Cleanup
    return () => {
      isUnmounting = true;
      subscription.remove();
      if (!isUnmounting) {
        updateOnlineStatus('offline');
      }
    };
  }, [currentUser]);
}
