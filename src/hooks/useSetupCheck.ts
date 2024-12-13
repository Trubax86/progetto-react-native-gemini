import { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

export function useSetupCheck() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [setupType, setSetupType] = useState<'anonymous' | 'regular' | null>(null);

  useEffect(() => {
    const checkSetupStatus = async () => {
      const user = auth.currentUser;
      
      if (!user) {
        setLoading(false);
        setNeedsSetup(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const isAnonymous = user.isAnonymous;
        
        // Controlla se il setup è necessario
        const setupNeeded = !userDoc.exists() || !userDoc.data()?.setupCompleted;
        setNeedsSetup(setupNeeded);
        
        if (setupNeeded) {
          // Imposta il tipo di setup
          setSetupType(isAnonymous ? 'anonymous' : 'regular');
          
          // Naviga al setup appropriato se non ci siamo già
          if (isAnonymous) {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Main', params: { screen: 'AnonymousSetup' } }],
            });
          } else {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Main', params: { screen: 'Setup' } }],
            });
          }
        } else {
          // Se il setup è completato, vai alla schermata principale
          navigation.reset({
            index: 0,
            routes: [{ name: 'Main', params: { screen: 'MainTabs' } }],
          });
        }
      } catch (error) {
        console.error('Errore nel controllo setup:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSetupStatus();
  }, [navigation]);

  return { loading, needsSetup, setupType };
}
