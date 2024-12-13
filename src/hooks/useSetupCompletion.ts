import { auth, db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

export const useSetupCompletion = () => {
  const completeSetup = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return false;

      // Forza un reload dell'utente
      await user.reload();
      
      // Verifica il documento utente
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists() && userDoc.data()?.setupCompleted) {
        // Forza un refresh della pagina per aggiornare la navigazione
        window.location.reload();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error completing setup:', error);
      return false;
    }
  };

  return { completeSetup };
};
