import { useEffect, useState } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './useAuth';

export type OnlineUser = {
  uid: string;
  displayName: string;
  photoURL: string | null;
  status: 'online' | 'offline';
  isAnonymous: boolean;
  lastSeen: Date | null;
  email?: string;
  phoneNumber?: string;
};

export function useOnlineUsers() { // Rimuovi isAnonymous dal parametro
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    // Query per tutti gli utenti
    const usersQuery = query(
      collection(db, 'users'),
    );

    // Ascolta i cambiamenti degli utenti in tempo reale
    const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
      const users = snapshot.docs
        .map(doc => ({
          uid: doc.id,
          ...doc.data()
        }))
        .filter(user => user.uid !== currentUser.uid);

      setOnlineUsers(users as OnlineUser[]); // Cast a OnlineUser[]
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  return { onlineUsers, loading };
}