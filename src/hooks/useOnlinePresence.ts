import { useEffect, useRef } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './useAuth';
import { AppState, AppStateStatus } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

export function useOnlinePresence() {
  const { currentUser } = useAuth();
  const activityTimeoutRef = useRef<NodeJS.Timeout>();
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (!currentUser) return;

    const userDocRef = doc(db, 'users', currentUser.uid);

    const updateOnlineStatus = async (status: 'online' | 'offline') => {
      try {
        await updateDoc(userDocRef, {
          status,
          lastSeen: serverTimestamp()
        });
      } catch (error) {
        console.error('Error updating online status:', error);
      }
    };

    const checkActivity = () => {
      // Pulisci il timeout esistente
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }

      // Imposta lo stato su online
      updateOnlineStatus('online');

      // Imposta un nuovo timeout per lo stato offline
      activityTimeoutRef.current = setTimeout(() => {
        updateOnlineStatus('offline');
      }, 120000); // 2 minuti di inattività
    };

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        checkActivity();
      } else if (nextAppState === 'background' || nextAppState === 'inactive') {
        if (activityTimeoutRef.current) {
          clearTimeout(activityTimeoutRef.current);
        }
        updateOnlineStatus('offline');
      }
    };

    const handleConnectivityChange = async (state: { isConnected: boolean | null }) => {
      if (state.isConnected) {
        checkActivity();
      } else {
        if (activityTimeoutRef.current) {
          clearTimeout(activityTimeoutRef.current);
        }
        await updateOnlineStatus('offline');
      }
    };

    const init = async () => {
      if (isInitializedRef.current) return;
      
      // Controlla lo stato iniziale della connessione
      const netInfo = await NetInfo.fetch();
      if (netInfo.isConnected) {
        checkActivity();
      }
      
      isInitializedRef.current = true;
    };

    // Inizializza
    init();

    // Sottoscrivi ai cambiamenti di stato dell'app
    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    // Sottoscrivi ai cambiamenti di connettività
    const netInfoSubscription = NetInfo.addEventListener(handleConnectivityChange);

    // Cleanup
    return () => {
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }
      appStateSubscription.remove();
      netInfoSubscription();
      updateOnlineStatus('offline');
    };
  }, [currentUser]);
}
