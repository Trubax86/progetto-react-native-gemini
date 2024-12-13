import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

// Definisci il tipo per i dati utente
export interface UserData {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  // Aggiungi altri campi necessari
}

// Definisci il tipo per il contesto
interface UserContextType {
  user: UserData | null;
  updateUser: (userData: Partial<UserData>) => void;
}

// Crea il contesto
const UserContext = createContext<UserContextType>({
  user: null,
  updateUser: () => {},
});

// Provider del contesto
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    // Imposta il listener solo se l'utente è autenticato
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    // Crea il listener per gli aggiornamenti del documento utente
    const userDocRef = doc(db, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        const userData = doc.data() as UserData;
        setUser({
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          email: currentUser.email,
          photoURL: currentUser.photoURL,
          ...userData
        });
      }
    });

    // Pulisci il listener quando il componente viene smontato
    return () => unsubscribe();
  }, []);

  // Metodo per aggiornare parzialmente i dati utente
  const updateUser = (userData: Partial<UserData>) => {
    setUser(prev => prev ? { ...prev, ...userData } : null);
  };

  return (
    <UserContext.Provider value={{ user, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook personalizzato per utilizzare il contesto
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser deve essere utilizzato all\'interno di un UserProvider');
  }
  return context;
};
