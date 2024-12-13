import { useState, useEffect } from 'react';
import { User as FirebaseUser, onIdTokenChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User } from '../types/auth';
import { AppState } from 'react-native';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
    const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    let isMounted = true;
    
      const fetchUserData = async (firebaseUser: FirebaseUser) => {
      try {
        if (!firebaseUser?.uid) {
          console.warn('fetchUserData: No UID available');
          return;
        }

        const userRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userRef);

        if (!isMounted) return;

          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            // Aggiorna lo stato online
          await updateDoc(userRef, {
                status: 'online',
                lastSeen: serverTimestamp(),
                });
            setUser(userData);

            } else {
            // Se non esiste un doc, crealo con le info dell'utente firebase
             const newUser = {
                  uid: firebaseUser.uid,
                  email: firebaseUser.email,
                  displayName: firebaseUser.displayName || 'Guest',
                  photoURL: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=Guest&background=random`,
                  createdAt: serverTimestamp(),
                  lastLoginAt: serverTimestamp(),
                  isAnonymous: firebaseUser.isAnonymous,
                  status: 'online',
                  lastSeen: serverTimestamp()
               };

              await setDoc(userRef, newUser);
              setUser(newUser);

           }
         } catch (error) {
              console.error('Error fetching user data:', error);
              if (isMounted) setUser(null);
         }
      };

    const handleAuthStateChanged = async (firebaseUser: FirebaseUser | null) => {
        try {
           if (firebaseUser) {
                await fetchUserData(firebaseUser);
            } else {
                if (isMounted) setUser(null);
            }
            } catch (error) {
              console.error('Auth state change error:', error);
              if (isMounted) setUser(null);
            } finally {
               if (isMounted) setLoading(false);
            }
    };


    const handleAppStateChange = async (nextAppState:string) => {
      if (appState === 'active' && nextAppState !== 'active' && user?.uid) {
        const userRef = doc(db, 'users', user.uid);
            try {
                  await updateDoc(userRef, {
                    status: 'offline',
                    lastSeen: serverTimestamp(),
                  });
                  console.log('User set offline on background or closed app');
                } catch (e) {
                   console.log('Error setting user offline',e);
                }
        }
      setAppState(nextAppState);
     };

    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
    const unsubscribe = onIdTokenChanged(auth, handleAuthStateChanged);

     return () => {
       isMounted = false;
       appStateSubscription.remove();
      if (user?.uid) {
          const userRef = doc(db, 'users', user.uid);
          updateDoc(userRef, {
            status: 'offline',
            lastSeen: serverTimestamp(),
           }).catch(console.error);
          }
          unsubscribe();
      };
  }, []);

  return { user, loading };
};