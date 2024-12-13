import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { auth } from '../config/firebase';

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Controlla immediatamente lo stato corrente
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
      setLoading(false);
    }

    const unsubscribe = auth.onAuthStateChanged(
      (user) => {
        setUser(user);
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error('Auth state error:', error);
        setError(error);
        setLoading(false);
      }
    );

    // Se non c'è un utente corrente, aspetta il callback di onAuthStateChanged
    if (!currentUser) {
      const timeout = setTimeout(() => {
        setLoading(false);
      }, 1000); // Timeout di sicurezza dopo 1 secondo

      return () => {
        clearTimeout(timeout);
        unsubscribe();
      };
    }

    return unsubscribe;
  }, []);

  return { user, loading, error };
}
