import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, getDocs, startAfter, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './useAuth';

export interface User {
  uid: string;
  displayName: string;
  photoURL: string;
  status: 'online' | 'offline';
  lastSeen: Date;
  isAnonymous: boolean;
  email?: string;
  phoneNumber?: string;
}

export function useUsers(isAnonymous: boolean = false) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
  const { currentUser } = useAuth();
  const USERS_PER_PAGE = 10;

  const loadUsers = async (lastDocument?: QueryDocumentSnapshot) => {
    try {
      setLoading(true);
      setError(null);

      let userQuery = query(
        collection(db, 'users'),
        where('isAnonymous', '==', isAnonymous),
        where('uid', '!=', currentUser?.uid || ''),
        orderBy('uid'),
        orderBy('lastSeen', 'desc'),
        limit(USERS_PER_PAGE)
      );

      if (lastDocument) {
        userQuery = query(userQuery, startAfter(lastDocument));
      }

      console.log('Executing query:', { isAnonymous, currentUserId: currentUser?.uid });
      const snapshot = await getDocs(userQuery);
      
      if (snapshot.empty && !lastDocument) {
        console.log('No users found');
        setUsers([]);
        return;
      }

      const newUsers = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          uid: doc.id,
          displayName: data.displayName || 'Utente',
          photoURL: data.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.displayName || 'U')}&background=random`,
          status: data.status || 'offline',
          lastSeen: data.lastSeen?.toDate() || new Date(),
          isAnonymous: data.isAnonymous || false,
          email: data.email,
          phoneNumber: data.phoneNumber
        } as User;
      });

      console.log('Users loaded:', newUsers.length);
      setUsers(prev => lastDocument ? [...prev, ...newUsers] : newUsers);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Errore nel caricamento degli utenti. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (lastDoc && !loading) {
      loadUsers(lastDoc);
    }
  };

  const searchUsers = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      loadUsers();
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const userQuery = query(
        collection(db, 'users'),
        where('isAnonymous', '==', isAnonymous),
        where('displayName', '>=', searchQuery),
        where('displayName', '<=', searchQuery + '\uf8ff'),
        limit(10)
      );

      const snapshot = await getDocs(userQuery);
      const searchResults = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          uid: doc.id,
          displayName: data.displayName || 'Utente',
          photoURL: data.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.displayName || 'U')}&background=random`,
          status: data.status || 'offline',
          lastSeen: data.lastSeen?.toDate() || new Date(),
          isAnonymous: data.isAnonymous || false,
          email: data.email,
          phoneNumber: data.phoneNumber
        } as User;
      });

      setUsers(searchResults);
      setLastDoc(null);
    } catch (err) {
      console.error('Error searching users:', err);
      setError('Errore nella ricerca degli utenti. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  const refreshUsers = () => {
    setLastDoc(null);
    loadUsers();
  };

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    console.log('Loading users with params:', { isAnonymous, currentUserId: currentUser.uid });
    loadUsers();
  }, [currentUser, isAnonymous]);

  return {
    users,
    loading,
    error,
    hasMore: !!lastDoc,
    loadMore,
    searchUsers,
    refreshUsers
  };
}
