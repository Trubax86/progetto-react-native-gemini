import { useEffect } from 'react';
import { doc, updateDoc, onDisconnect, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './useAuth';

export const useOnlineStatus = () => {
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    const setupOnlineStatus = async () => {
      try {
        const userRef = doc(db, 'users', currentUser.uid);

        // Imposta lo stato online quando l'utente si connette
        await updateDoc(userRef, {
          status: 'online',
          lastSeen: serverTimestamp()
        });

        // Imposta lo stato offline quando l'utente si disconnette
        await onDisconnect(userRef).update({
          status: 'offline',
          lastSeen: serverTimestamp()
        });
      } catch (error) {
        console.error('Errore nel setup dello stato online:', error);
      }
    };

    setupOnlineStatus();
  }, [currentUser]);
};
